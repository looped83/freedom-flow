import type {
  Goal,
  GoalResult,
  GoalStatus,
  Portfolio,
  TimelineEntry,
} from '../types';
import { CURRENT_YEAR } from '../constants/defaultData';

export function annualDividends(portfolio: Portfolio): number {
  return portfolio.monthlyIncome * 12;
}

export function monthlyDividends(portfolio: Portfolio): number {
  return portfolio.monthlyIncome;
}

export function totalMonthlyCosts(goals: Goal[]): number {
  return goals.reduce((sum, g) => sum + g.monthlyAmount, 0);
}

export function coveragePercent(monthly: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min((monthly / total) * 100, 100);
}

export function freeDaysPerMonth(monthly: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min((monthly / total) * 30, 30);
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

// Internal: sort goals ascending by amount (cheap → expensive).
// Coverage always allocates in this order so the most goals get fully covered.
function byAmountAsc(goals: Goal[]): Goal[] {
  return [...goals].sort((a, b) => a.monthlyAmount - b.monthlyAmount);
}

// Compound projection: dividends grow at dividendGrowth % per year,
// new savings contribute at the current dividend yield.
export function projectMonthlyDividendsAtYear(portfolio: Portfolio, years: number): number {
  const g = portfolio.dividendGrowth / 100;
  const baseMonthly = portfolio.monthlyIncome;
  const annualSavingsDividends = portfolio.monthlySavings * 12 * (portfolio.dividendYield / 100);

  const existingFV = baseMonthly * Math.pow(1 + g, years);
  const savingsFV =
    g > 0
      ? (annualSavingsDividends / 12) * ((Math.pow(1 + g, years) - 1) / g)
      : (annualSavingsDividends / 12) * years;

  return existingFV + savingsFV;
}

/**
 * Compute coverage for each goal.
 * Allocation is always ascending by amount (cheapest covered first).
 * Results are returned in the original `goals` array order
 * so the caller can apply any display filter independently.
 */
export function computeGoalResults(
  goals: Goal[],
  monthly: number,
  portfolio: Portfolio,
): GoalResult[] {
  const allocationOrder = byAmountAsc(goals);
  let remaining = monthly;

  const resultMap = new Map<string, GoalResult>();

  for (const goal of allocationOrder) {
    const covered = Math.min(remaining, goal.monthlyAmount);
    remaining = Math.max(0, remaining - goal.monthlyAmount);
    const pct = goal.monthlyAmount > 0 ? (covered / goal.monthlyAmount) * 100 : 0;

    let achievedYear: number | null = null;
    if (pct >= 100) {
      achievedYear = CURRENT_YEAR;
    } else {
      for (let y = 1; y <= 50; y++) {
        const projMonthly = projectMonthlyDividendsAtYear(portfolio, y);
        const projOrder = byAmountAsc(goals);
        let rem = projMonthly;
        for (const g of projOrder) {
          const c = Math.min(rem, g.monthlyAmount);
          rem = Math.max(0, rem - g.monthlyAmount);
          if (g.id === goal.id && c >= g.monthlyAmount) {
            achievedYear = CURRENT_YEAR + y;
            break;
          }
        }
        if (achievedYear !== null) break;
      }
    }

    resultMap.set(goal.id, {
      ...goal,
      status: goalStatus(pct),
      coveredAmount: covered,
      coveragePercent: pct,
      achievedYear,
    });
  }

  // Preserve original order; filter out any orphan ids (safety)
  return goals.map((g) => resultMap.get(g.id)).filter((r): r is GoalResult => r != null);
}


export function freedomYear(portfolio: Portfolio, goals: Goal[]): number | null {
  const total = totalMonthlyCosts(goals);
  for (let y = 0; y <= 50; y++) {
    const proj = y === 0 ? monthlyDividends(portfolio) : projectMonthlyDividendsAtYear(portfolio, y);
    if (proj >= total) return CURRENT_YEAR + y;
  }
  return null;
}

/**
 * Build year-by-year goal unlock timeline including retrospective past entries.
 * Returns chronological entries (past → current → future).
 * The display layer reverses this for "future at top" rendering.
 */
export function buildFreedomTimeline(goals: Goal[], portfolio: Portfolio): TimelineEntry[] {
  const sortedGoals = byAmountAsc(goals);
  const g = portfolio.dividendGrowth / 100;

  function getUnlockedIds(monthly: number): Set<string> {
    const unlocked = new Set<string>();
    let rem = monthly;
    for (const goal of sortedGoals) {
      if (rem >= goal.monthlyAmount) {
        unlocked.add(goal.id);
        rem -= goal.monthlyAmount;
      } else {
        break;
      }
    }
    return unlocked;
  }

  // Estimate income Y years in the past by reversing the full compound model
  // (accounts for both dividend growth AND savings contributions)
  function pastMonthly(yearsAgo: number): number {
    const growth = Math.pow(1 + g, yearsAgo);
    const S = portfolio.monthlySavings * (portfolio.dividendYield / 100); // monthly dividend from savings
    if (g > 0) {
      return Math.max(0, (portfolio.monthlyIncome - S * (growth - 1) / g) / growth);
    }
    return Math.max(0, portfolio.monthlyIncome - S * yearsAgo);
  }

  // --- Retrospective: go back until income falls below the cheapest goal ---
  const pastEntries: TimelineEntry[] = [];
  const cheapestGoalAmount = sortedGoals.length > 0 ? sortedGoals[0].monthlyAmount : 0;
  const MAX_PAST = 50;
  // Find how far back we need to go: stop when income would be below cheapest goal
  let effectivePast = MAX_PAST;
  for (let y = 1; y <= MAX_PAST; y++) {
    if (pastMonthly(y) < cheapestGoalAmount) { effectivePast = y - 1; break; }
  }
  for (let y = effectivePast; y >= 1; y--) {
    const monthly = pastMonthly(y);
    const prevMonthly = pastMonthly(y + 1);
    const yearUnlocked = getUnlockedIds(monthly);
    const prevUnlocked = getUnlockedIds(prevMonthly);
    const newGoals = sortedGoals.filter((goal) => yearUnlocked.has(goal.id) && !prevUnlocked.has(goal.id));
    const isFreedomY = yearUnlocked.size === goals.length;
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
  }

  // --- Current year ---
  const year0Monthly = portfolio.monthlyIncome;
  const year0Unlocked = getUnlockedIds(year0Monthly);
  // For current year: show goals newly covered vs one step back in past
  const prevUnlockedForYear0 = getUnlockedIds(pastMonthly(1));
  const year0New = sortedGoals.filter((goal) => year0Unlocked.has(goal.id) && !prevUnlockedForYear0.has(goal.id));
  const isFreedomYear0 = year0Unlocked.size === goals.length;

  const currentEntry: TimelineEntry | null =
    year0New.length > 0 || isFreedomYear0
      ? { year: CURRENT_YEAR, projectedMonthly: year0Monthly, newGoals: year0New, isCurrentYear: true, isFreedomYear: isFreedomYear0, isPastYear: false }
      : null;

  if (isFreedomYear0) return [...pastEntries, ...(currentEntry ? [currentEntry] : [])];

  // Track what's covered now to find future NEW unlocks
  const alreadyUnlocked = new Set<string>(year0Unlocked);

  // --- Future years ---
  const futureEntries: TimelineEntry[] = [];
  for (let y = 1; y <= portfolio.horizonYears; y++) {
    const projMonthly = projectMonthlyDividendsAtYear(portfolio, y);
    const yearUnlocked = getUnlockedIds(projMonthly);
    const yearNew = sortedGoals.filter((goal) => yearUnlocked.has(goal.id) && !alreadyUnlocked.has(goal.id));
    const isFreedomY = yearUnlocked.size === goals.length;

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

    yearNew.forEach((goal) => alreadyUnlocked.add(goal.id));
    if (isFreedomY) break;
  }

  return [...pastEntries, ...(currentEntry ? [currentEntry] : []), ...futureEntries];
}
