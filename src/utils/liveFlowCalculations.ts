function sanitize(value: number): number {
  if (!Number.isFinite(value) || value < 0) return 0;
  return value;
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

export function formatCurrencyForSmallAmounts(value: number): string {
  const v = sanitize(Number.isFinite(value) ? value : 0);
  const idx = v >= 1 ? 0 : v >= 0.01 ? 1 : 2;
  return eurFmt[idx].format(v);
}
