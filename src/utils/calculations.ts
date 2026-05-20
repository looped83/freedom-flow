import type {
  Goal,
  GoalResult,
  GoalStatus,
  Portfolio,
  TimelineEntry,
} from '../types';
import { CURRENT_YEAR } from '../constants/defaultData';

const MAX_FUTURE_YEARS = 50;
const MAX_PAST_YEARS = 50;

export function totalMonthlyCosts(goals: Goal[]): number {
  let sum = 0;
  for (const g of goals) sum += g.monthlyAmount;
  return sum;
}

export function freedomPercent(monthly: number, total: number): number {
  if (total <= 0) return 100;
  return Math.min(100, (monthly / total) * 100);
}

export function missingForFreedom(monthly: number, total: number): number {
  return Math.max(0, total - monthly);
}

function goalStatus(pct: number): GoalStatus {
  if (pct >= 100) return 'covered';
  if (pct > 0) return 'partial';
  return 'open';
}

/** Sort goals ascending by amount (cheap → expensive). Coverage allocates in
 *  this order so the most goals possible are fully covered. */
function byAmountAsc(goals: Goal[]): Goal[] {
  return [...goals].sort((a, b) => a.monthlyAmount - b.monthlyAmount);
}

/** Compound projection: existing dividends grow at `dividendGrowth` %/year;
 *  ongoing savings contribute at the current `dividendYield`. */
export function projectMonthlyDividendsAtYear(portfolio: Portfolio, years: number): number {
  const g = portfolio.dividendGrowth / 100;
  const monthlySavingsDividends = portfolio.monthlySavings * (portfolio.dividendYield / 100);
  const existingFV = portfolio.monthlyIncome * Math.pow(1 + g, years);
  const savingsFV =
    g > 0
      ? monthlySavingsDividends * ((Math.pow(1 + g, years) - 1) / g)
      : monthlySavingsDividends * years;
  return existingFV + savingsFV;
}

/** Reverse the compound model to estimate monthly dividend income
 *  `yearsAgo` years back, accounting for both dividend growth and the ongoing
 *  contribution of monthly savings. Floor at 0. */
export function projectMonthlyDividendsYearsAgo(portfolio: Portfolio, yearsAgo: number): number {
  const g = portfolio.dividendGrowth / 100;
  const monthlySavingsDividends = portfolio.monthlySavings * (portfolio.dividendYield / 100);
  if (g > 0) {
    const growth = Math.pow(1 + g, yearsAgo);
    return Math.max(0, (portfolio.monthlyIncome - monthlySavingsDividends * (growth - 1) / g) / growth);
  }
  return Math.max(0, portfolio.monthlyIncome - monthlySavingsDividends * yearsAgo);
}

/**
 * Compute coverage for each goal.
 *
 * Allocation always proceeds ascending by amount (cheapest first). For each
 * year 0..MAX_FUTURE_YEARS we replay the allocation against the projected
 * monthly income and record the first year a goal becomes fully covered.
 *
 * Complexity: O(N log N + Y · N) where Y = MAX_FUTURE_YEARS.
 * Results come back in the caller's `goals` order.
 */
export function computeGoalResults(
  goals: Goal[],
  monthly: number,
  portfolio: Portfolio,
): GoalResult[] {
  if (goals.length === 0) return [];

  const sorted = byAmountAsc(goals);
  const coveredAmount = new Map<string, number>();
  const coveragePct = new Map<string, number>();
  const achievedYear = new Map<string, number>();

  // Year 0 — actual coverage and percentages.
  let rem = monthly;
  for (const goal of sorted) {
    const covered = Math.min(rem, goal.monthlyAmount);
    rem = Math.max(0, rem - goal.monthlyAmount);
    const pct = goal.monthlyAmount > 0 ? (covered / goal.monthlyAmount) * 100 : 0;
    coveredAmount.set(goal.id, covered);
    coveragePct.set(goal.id, pct);
    if (pct >= 100) achievedYear.set(goal.id, CURRENT_YEAR);
  }

  // Future years — find the first year each still-uncovered goal is fully met.
  if (achievedYear.size < sorted.length) {
    for (let y = 1; y <= MAX_FUTURE_YEARS; y++) {
      let proj = projectMonthlyDividendsAtYear(portfolio, y);
      let outstanding = false;
      for (const goal of sorted) {
        const fits = proj >= goal.monthlyAmount;
        proj = Math.max(0, proj - goal.monthlyAmount);
        if (fits && !achievedYear.has(goal.id)) achievedYear.set(goal.id, CURRENT_YEAR + y);
        if (!achievedYear.has(goal.id)) outstanding = true;
      }
      if (!outstanding) break;
    }
  }

  return goals.map((g) => {
    const covered = coveredAmount.get(g.id) ?? 0;
    const pct = coveragePct.get(g.id) ?? 0;
    return {
      ...g,
      status: goalStatus(pct),
      coveredAmount: covered,
      coveragePercent: pct,
      achievedYear: achievedYear.get(g.id) ?? null,
    };
  });
}

/**
 * Build the year-by-year goal unlock timeline (past → current → future).
 * The display layer reverses this for "future at top" rendering.
 */
export function buildFreedomTimeline(goals: Goal[], portfolio: Portfolio): TimelineEntry[] {
  if (goals.length === 0) return [];

  const sortedGoals = byAmountAsc(goals);
  const totalGoals = sortedGoals.length;
  const pastMonthly = (yearsAgo: number) => projectMonthlyDividendsYearsAgo(portfolio, yearsAgo);

  function unlockedIds(monthly: number): Set<string> {
    const unlocked = new Set<string>();
    let rem = monthly;
    for (const goal of sortedGoals) {
      if (rem < goal.monthlyAmount) break;
      unlocked.add(goal.id);
      rem -= goal.monthlyAmount;
    }
    return unlocked;
  }

  function newGoalsBetween(yearUnlocked: Set<string>, prevUnlocked: Set<string>): Goal[] {
    if (yearUnlocked.size === prevUnlocked.size) return [];
    const newOnes: Goal[] = [];
    for (const goal of sortedGoals) {
      if (yearUnlocked.has(goal.id) && !prevUnlocked.has(goal.id)) newOnes.push(goal);
    }
    return newOnes;
  }

  // --- Retrospective: walk back until income is below the cheapest goal. ---
  const cheapest = sortedGoals[0].monthlyAmount;
  let effectivePast = 0;
  for (let y = 1; y <= MAX_PAST_YEARS; y++) {
    if (pastMonthly(y) < cheapest) break;
    effectivePast = y;
  }

  const pastEntries: TimelineEntry[] = [];
  // Start from the OLDEST past year (largest y) walking forward.
  // Seed `prevUnlocked` with the year before that (effectivePast + 1).
  let prevUnlocked = unlockedIds(pastMonthly(effectivePast + 1));
  for (let y = effectivePast; y >= 1; y--) {
    const monthly = pastMonthly(y);
    const yearUnlocked = unlockedIds(monthly);
    const newGoals = newGoalsBetween(yearUnlocked, prevUnlocked);
    const isFreedomY = yearUnlocked.size === totalGoals;
    if (newGoals.length > 0 || isFreedomY) {
      pastEntries.push({
        year: CURRENT_YEAR - y,
        projectedMonthly: monthly,
        newGoals,
        isCurrentYear: false,
        isFreedomYear: isFreedomY,
        isPastYear: true,
      });
    }
    prevUnlocked = yearUnlocked;
  }

  // --- Current year: compare against the most recent past year. ---
  const year0Unlocked = unlockedIds(portfolio.monthlyIncome);
  const year0New = newGoalsBetween(year0Unlocked, prevUnlocked);
  const isFreedomYear0 = year0Unlocked.size === totalGoals;
  const currentEntry: TimelineEntry | null =
    year0New.length > 0 || isFreedomYear0
      ? {
          year: CURRENT_YEAR,
          projectedMonthly: portfolio.monthlyIncome,
          newGoals: year0New,
          isCurrentYear: true,
          isFreedomYear: isFreedomYear0,
          isPastYear: false,
        }
      : null;

  if (isFreedomYear0) {
    return currentEntry ? [...pastEntries, currentEntry] : pastEntries;
  }

  // --- Future years. ---
  const futureEntries: TimelineEntry[] = [];
  let runningUnlocked = year0Unlocked;
  for (let y = 1; y <= portfolio.horizonYears; y++) {
    const projMonthly = projectMonthlyDividendsAtYear(portfolio, y);
    const yearUnlocked = unlockedIds(projMonthly);
    const yearNew = newGoalsBetween(yearUnlocked, runningUnlocked);
    const isFreedomY = yearUnlocked.size === totalGoals;

    if (yearNew.length > 0 || isFreedomY) {
      futureEntries.push({
        year: CURRENT_YEAR + y,
        projectedMonthly: projMonthly,
        newGoals: yearNew,
        isCurrentYear: false,
        isFreedomYear: isFreedomY,
        isPastYear: false,
      });
    }

    runningUnlocked = yearUnlocked;
    if (isFreedomY) break;
  }

  return [
    ...pastEntries,
    ...(currentEntry ? [currentEntry] : []),
    ...futureEntries,
  ];
}
