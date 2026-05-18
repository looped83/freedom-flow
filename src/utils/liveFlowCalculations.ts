import type { Goal } from '../types';

function sanitize(value: number): number {
  if (!Number.isFinite(value) || value < 0) return 0;
  return value;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function calculateAnnualDividends(monthlyDividends: number): number {
  return sanitize(monthlyDividends) * 12;
}

export function calculateDividendRatePerMinute(monthlyDividends: number): number {
  return calculateAnnualDividends(monthlyDividends) / 525_600;
}

export function calculateDividendRatePerHour(monthlyDividends: number): number {
  return calculateAnnualDividends(monthlyDividends) / 8_760;
}

export function calculateDividendRatePerDay(monthlyDividends: number): number {
  return calculateAnnualDividends(monthlyDividends) / 365;
}

export function calculateDividendRatePerWeek(monthlyDividends: number): number {
  return calculateAnnualDividends(monthlyDividends) / 52;
}

export function calculateEarnedTodaySoFar(monthlyDividends: number, now: Date): number {
  const daily = calculateDividendRatePerDay(monthlyDividends);
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const secondsElapsed = (now.getTime() - startOfDay.getTime()) / 1000;
  return daily * (secondsElapsed / 86_400);
}

export function calculateDayProgress(now: Date): number {
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const secondsElapsed = (now.getTime() - startOfDay.getTime()) / 1000;
  return Math.min(secondsElapsed / 86_400, 1);
}

export function calculateWeekProgress(now: Date): number {
  const dayOfWeek = now.getDay();
  const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  return Math.min((daysSinceMonday + calculateDayProgress(now)) / 7, 1);
}

export function calculateMonthProgress(now: Date): number {
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  return Math.min((now.getDate() - 1 + calculateDayProgress(now)) / daysInMonth, 1);
}

export function calculateEarnedThisWeekSoFar(monthlyDividends: number, now: Date): number {
  const daily = calculateDividendRatePerDay(monthlyDividends);
  const dayOfWeek = now.getDay(); // 0 = Sun
  const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysSinceMonday);
  const secondsElapsed = (now.getTime() - startOfWeek.getTime()) / 1000;
  return daily * (secondsElapsed / 86_400);
}

export function calculateEarnedThisMonthSoFar(monthlyDividends: number, now: Date): number {
  const daily = calculateDividendRatePerDay(monthlyDividends);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const secondsElapsed = (now.getTime() - startOfMonth.getTime()) / 1000;
  return daily * (secondsElapsed / 86_400);
}

export function calculateEarnedThisYearSoFar(monthlyDividends: number, now: Date): number {
  const daily = calculateDividendRatePerDay(monthlyDividends);
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const secondsElapsed = (now.getTime() - startOfYear.getTime()) / 1000;
  return daily * (secondsElapsed / 86_400);
}

export function calculateYearProgress(now: Date): number {
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const startOfNextYear = new Date(now.getFullYear() + 1, 0, 1);
  const totalSeconds = (startOfNextYear.getTime() - startOfYear.getTime()) / 1000;
  const elapsedSeconds = (now.getTime() - startOfYear.getTime()) / 1000;
  return Math.min(elapsedSeconds / totalSeconds, 1);
}

/**
 * Format a currency value with adaptive decimal places so small amounts
 * never display as 0,00 €.
 *   ≥ 1      → 2 decimals  (e.g. 26,56 €)
 *   0.01–1   → 3 decimals  (e.g. 0,137 €)
 *   < 0.01   → 4 decimals  (e.g. 0,0184 €)
 *
 * Formatters are constructed once at module load — creating an
 * `Intl.NumberFormat` is expensive, so reuse matters in the LiveFlow tick.
 */
const eurFmt = [2, 3, 4].map((d) =>
  new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  }),
);

const DAYS_PER_MONTH = 30;

export type FreedomTimeUnit = 'days' | 'hours' | 'minutes';

export interface FinancedTime {
  days: number;
  hours: number;
  minutes: number;
}

export function calculateFinancedTime(
  monthlyDividends: number,
  totalMonthlyExpenses: number,
): FinancedTime {
  const m = sanitize(monthlyDividends);
  if (totalMonthlyExpenses <= 0 || m <= 0) return { days: 0, hours: 0, minutes: 0 };
  const ratio = m / totalMonthlyExpenses;
  const days = ratio * DAYS_PER_MONTH;
  return { days, hours: days * 24, minutes: days * 24 * 60 };
}

const fmtTimeDec = new Intl.NumberFormat('de-DE', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const fmtTimeInt = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 });

export function formatFreedomTime(value: number, unit: FreedomTimeUnit): string {
  return unit === 'minutes'
    ? fmtTimeInt.format(Math.round(Math.max(0, value)))
    : fmtTimeDec.format(Math.max(0, value));
}

export interface NextGoalCoverage {
  goal: Goal;
  progress: number;
  coveredAmount: number;
  missingAmount: number;
}

export function getNextGoalCoverage(
  goals: Goal[],
  monthlyDividends: number,
): NextGoalCoverage | null {
  if (goals.length === 0) return null;
  const sorted = [...goals].sort((a, b) => a.monthlyAmount - b.monthlyAmount);
  let rem = sanitize(monthlyDividends);

  for (const goal of sorted) {
    if (rem >= goal.monthlyAmount) {
      rem -= goal.monthlyAmount;
    } else {
      const covered = Math.max(0, rem);
      const progress = goal.monthlyAmount > 0
        ? clamp(covered / goal.monthlyAmount, 0, 1)
        : 0;
      return {
        goal,
        progress,
        coveredAmount: covered,
        missingAmount: goal.monthlyAmount - covered,
      };
    }
  }
  return null;
}

export function calculateElapsedYears(startYear: number, now: Date): number {
  const startOfStartYear = new Date(startYear, 0, 1);
  const secondsElapsed = (now.getTime() - startOfStartYear.getTime()) / 1000;
  return Math.max(0, secondsElapsed / (365.25 * 86_400));
}

export function calculateLifetimeDividends(
  baseDividends: number,
  startYear: number,
  monthlyDividends: number,
  now: Date,
): number {
  const annual = calculateAnnualDividends(monthlyDividends);
  const yearsElapsed = calculateElapsedYears(startYear, now);
  return sanitize(baseDividends) + annual * yearsElapsed;
}

export function formatCurrencyForSmallAmounts(value: number): string {
  const v = sanitize(Number.isFinite(value) ? value : 0);
  const idx = v >= 1 ? 0 : v >= 0.01 ? 1 : 2;
  return eurFmt[idx].format(v);
}
