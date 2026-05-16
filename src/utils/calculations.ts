import type {
  DisplayFilter,
  Goal,
  GoalResult,
  GoalStatus,
  Portfolio,
  ProjectionYear,
} from '../types';
import { CATEGORY_ORDER, CURRENT_YEAR } from '../constants/defaultData';

export function annualDividends(portfolio: Portfolio): number {
  return portfolio.value * (portfolio.dividendYield / 100);
}

export function monthlyDividends(portfolio: Portfolio): number {
  return annualDividends(portfolio) / 12;
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
function projectMonthlyDividendsAtYear(portfolio: Portfolio, years: number): number {
  const g = portfolio.dividendGrowth / 100;
  const baseMonthly = monthlyDividends(portfolio);
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

/**
 * Sort and optionally filter goal results for display purposes.
 * Does not affect coverage allocation.
 */
export function applyDisplayFilter(results: GoalResult[], filter: DisplayFilter): GoalResult[] {
  let out = [...results];

  if (filter.mode === 'covered') {
    out = out.filter((r) => r.status === 'covered');
  } else if (filter.mode === 'open') {
    out = out.filter((r) => r.status !== 'covered');
  }

  const sign = filter.dir === 'asc' ? 1 : -1;

  if (filter.mode === 'category') {
    out.sort((a, b) => {
      const catDiff =
        ((CATEGORY_ORDER[a.category] ?? 99) - (CATEGORY_ORDER[b.category] ?? 99)) * sign;
      return catDiff !== 0 ? catDiff : (a.monthlyAmount - b.monthlyAmount) * sign;
    });
  } else {
    out.sort((a, b) => (a.monthlyAmount - b.monthlyAmount) * sign);
  }

  return out;
}

export function buildProjection(portfolio: Portfolio, goals: Goal[]): ProjectionYear[] {
  const total = totalMonthlyCosts(goals);
  const results: ProjectionYear[] = [];
  let pv = portfolio.value;
  const baseMonthly = monthlyDividends(portfolio);

  for (let y = 0; y <= portfolio.horizonYears; y++) {
    const projMonthly = y === 0 ? baseMonthly : projectMonthlyDividendsAtYear(portfolio, y);
    const covPct = coveragePercent(projMonthly, total);
    const freeDays = freeDaysPerMonth(projMonthly, total);

    const sorted = byAmountAsc(goals);
    let rem = projMonthly;
    let covGoals = 0;
    for (const g of sorted) {
      if (rem >= g.monthlyAmount) { covGoals++; rem -= g.monthlyAmount; }
      else break;
    }

    if (y > 0) {
      pv = (pv + portfolio.monthlySavings * 12) * (1 + portfolio.priceReturn / 100);
    }

    results.push({
      year: CURRENT_YEAR + y,
      portfolioValue: pv,
      annualDividends: projMonthly * 12,
      monthlyDividends: projMonthly,
      coveragePercent: covPct,
      coveredGoals: covGoals,
      freeDaysPerMonth: freeDays,
    });
  }

  return results;
}

export function freedomYear(portfolio: Portfolio, goals: Goal[]): number | null {
  const total = totalMonthlyCosts(goals);
  for (let y = 0; y <= 50; y++) {
    const proj = y === 0 ? monthlyDividends(portfolio) : projectMonthlyDividendsAtYear(portfolio, y);
    if (proj >= total) return CURRENT_YEAR + y;
  }
  return null;
}
