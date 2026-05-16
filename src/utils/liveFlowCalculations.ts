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

/**
 * Format a currency value with adaptive decimal places so small amounts
 * never display as 0,00 €.
 *   ≥ 1      → 2 decimals  (e.g. 26,56 €)
 *   0.01–1   → 3 decimals  (e.g. 0,137 €)
 *   < 0.01   → 4 decimals  (e.g. 0,0184 €)
 */
export function formatCurrencyForSmallAmounts(value: number): string {
  const v = sanitize(Number.isFinite(value) ? value : 0);
  const decimals = v >= 1 ? 2 : v >= 0.01 ? 3 : 4;
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(v);
}
