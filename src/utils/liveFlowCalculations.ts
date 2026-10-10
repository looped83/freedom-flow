const MS_PER_YEAR = 365.25 * 86_400_000;

function sanitize(value: number): number {
  return Number.isFinite(value) && value > 0 ? value : 0;
}

export function calculateAnnualDividends(monthlyDividends: number): number {
  return sanitize(monthlyDividends) * 12;
}

export interface PeriodStat {
  /** Expected dividends for the whole period. */
  total: number;
  /** Elapsed share of the period, 0–1. */
  progress: number;
  /** Dividends "earned" so far = total × progress. */
  earned: number;
}

export type PeriodId = 'day' | 'week' | 'month' | 'year';

/**
 * Dividends earned so far in the calendar day, week (Mon–Sun), month and
 * year containing `now`. Each period uses its natural rate (annual / 365,
 * / 52, / 12, annual), so `earned` never exceeds `total`.
 */
export function calculatePeriodStats(monthlyDividends: number, now: Date): Record<PeriodId, PeriodStat> {
  const annual = calculateAnnualDividends(monthlyDividends);
  const y = now.getFullYear();
  const m = now.getMonth();
  const d = now.getDate();
  const sinceMonday = (now.getDay() + 6) % 7;
  const t = now.getTime();

  const stat = (total: number, start: Date, end: Date): PeriodStat => {
    const progress = Math.min(1, Math.max(0, (t - start.getTime()) / (end.getTime() - start.getTime())));
    return { total, progress, earned: total * progress };
  };

  return {
    day:   stat(annual / 365, new Date(y, m, d),               new Date(y, m, d + 1)),
    week:  stat(annual / 52,  new Date(y, m, d - sinceMonday), new Date(y, m, d - sinceMonday + 7)),
    month: stat(annual / 12,  new Date(y, m, 1),               new Date(y, m + 1, 1)),
    year:  stat(annual,       new Date(y, 0, 1),               new Date(y + 1, 0, 1)),
  };
}

/** Lifetime total: recorded base plus the annual rate since Jan 1 of `startYear`. */
export function calculateLifetimeDividends(
  baseDividends: number,
  startYear: number,
  monthlyDividends: number,
  now: Date,
): number {
  const yearsElapsed = Math.max(0, (now.getTime() - new Date(startYear, 0, 1).getTime()) / MS_PER_YEAR);
  return sanitize(baseDividends) + calculateAnnualDividends(monthlyDividends) * yearsElapsed;
}
