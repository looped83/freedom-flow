import type { Goal, GoalResult, GoalStatus, Portfolio, ProjectionYear, SortMode } from '../types';
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

export function sortGoals(goals: Goal[], mode: SortMode): Goal[] {
  const copy = [...goals];
  if (mode === 'amount') {
    return copy.sort((a, b) => a.monthlyAmount - b.monthlyAmount);
  }
  if (mode === 'category') {
    return copy.sort((a, b) => {
      const catDiff = (CATEGORY_ORDER[a.category] ?? 99) - (CATEGORY_ORDER[b.category] ?? 99);
      return catDiff !== 0 ? catDiff : a.monthlyAmount - b.monthlyAmount;
    });
  }
  return copy;
}

// Compound projection: dividends grow at dividendGrowth % per year,
// new savings contribute at the current dividend yield.
function projectMonthlyDividendsAtYear(portfolio: Portfolio, years: number): number {
  const g = portfolio.dividendGrowth / 100;
  const baseMonthly = monthlyDividends(portfolio);
  const annualSavingsDividends = portfolio.monthlySavings * 12 * (portfolio.dividendYield / 100);

  // Future value of existing dividends growing at g
  const existingFV = baseMonthly * Math.pow(1 + g, years);

  // Future value of annuity: each year's new dividend contribution grows for remaining years
  const savingsFV = g > 0
    ? (annualSavingsDividends / 12) * ((Math.pow(1 + g, years) - 1) / g)
    : (annualSavingsDividends / 12) * years;

  return existingFV + savingsFV;
}

export function computeGoalResults(
  goals: Goal[],
  monthly: number,
  sortMode: SortMode,
  portfolio: Portfolio,
): GoalResult[] {
  const sorted = sortGoals(goals, sortMode);
  let remaining = monthly;

  return sorted.map((goal) => {
    const covered = Math.min(remaining, goal.monthlyAmount);
    remaining = Math.max(0, remaining - goal.monthlyAmount);
    const pct = goal.monthlyAmount > 0 ? (covered / goal.monthlyAmount) * 100 : 0;

    let achievedYear: number | null = null;
    if (pct >= 100) {
      achievedYear = CURRENT_YEAR;
    } else {
      for (let y = 1; y <= 50; y++) {
        const projMonthly = projectMonthlyDividendsAtYear(portfolio, y);
        const projSorted = sortGoals(goals, sortMode);
        let rem = projMonthly;
        for (const g of projSorted) {
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

    return {
      ...goal,
      status: goalStatus(pct),
      coveredAmount: covered,
      coveragePercent: pct,
      achievedYear,
    };
  });
}

export function buildProjection(portfolio: Portfolio, goals: Goal[]): ProjectionYear[] {
  const total = totalMonthlyCosts(goals);
  const results: ProjectionYear[] = [];

  let pv = portfolio.value;
  const baseMonthly = monthlyDividends(portfolio);

  for (let y = 0; y <= portfolio.horizonYears; y++) {
    const projMonthly = y === 0 ? baseMonthly : projectMonthlyDividendsAtYear(portfolio, y);
    const projAnnual = projMonthly * 12;
    const covPct = coveragePercent(projMonthly, total);
    const freeDays = freeDaysPerMonth(projMonthly, total);

    const sorted = sortGoals(goals, 'amount');
    let rem = projMonthly;
    let covGoals = 0;
    for (const g of sorted) {
      if (rem >= g.monthlyAmount) {
        covGoals++;
        rem -= g.monthlyAmount;
      } else {
        break;
      }
    }

    if (y > 0) {
      pv = (pv + portfolio.monthlySavings * 12) * (1 + portfolio.priceReturn / 100);
    }

    results.push({
      year: CURRENT_YEAR + y,
      portfolioValue: pv,
      annualDividends: projAnnual,
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
