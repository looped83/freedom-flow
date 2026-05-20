import type { Milestone, MilestoneResult, Portfolio } from '../types';
import { CURRENT_YEAR } from '../constants/defaultData';
import { projectMonthlyDividendsAtYear, projectMonthlyDividendsYearsAgo } from './calculations';

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const ISO_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

function parseIsoDate(iso: string): Date | null {
  const m = ISO_DATE_RE.exec(iso);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return isNaN(d.getTime()) ? null : d;
}

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Cent-precise ≥ check so 3.500,00 vs 3.499,9999 doesn't flip the achievement
 *  status to "open" because of accumulated floating-point drift. */
function meetsTarget(current: number, target: number): boolean {
  return Math.round(current * 100) >= Math.round(target * 100);
}

export function computeMilestoneResult(milestone: Milestone, portfolio: Portfolio): MilestoneResult {
  if (milestone.type === 'dividend') {
    const target = milestone.dividendTarget ?? 0;
    const current = portfolio.monthlyIncome;
    const achieved = target > 0 && meetsTarget(current, target);
    const progress = target > 0 ? Math.min(100, (current / target) * 100) : 0;
    return {
      ...milestone,
      status: achieved ? 'achieved' : 'open',
      progressPercent: progress,
      missingMonthly: Math.max(0, target - current),
      daysRemaining: null,
      achievedYear: milestoneAchievedYear(milestone, portfolio),
    };
  }
  const target = milestone.dateTarget ? parseIsoDate(milestone.dateTarget) : null;
  if (!target) {
    return {
      ...milestone,
      status: 'open',
      progressPercent: 0,
      missingMonthly: 0,
      daysRemaining: null,
      achievedYear: null,
    };
  }
  const today = startOfToday();
  const daysRemaining = Math.round((target.getTime() - today.getTime()) / MS_PER_DAY);
  const achieved = daysRemaining <= 0;
  return {
    ...milestone,
    status: achieved ? 'achieved' : 'open',
    progressPercent: achieved ? 100 : 0,
    missingMonthly: 0,
    daysRemaining,
    achievedYear: milestoneAchievedYear(milestone, portfolio),
  };
}

export function computeMilestoneResults(milestones: Milestone[], portfolio: Portfolio): MilestoneResult[] {
  return milestones.map((m) => computeMilestoneResult(m, portfolio));
}

/** Numeric key for sorting milestones by their target (€ amount or date as
 *  seconds since epoch). Returns 0 for malformed entries. */
export function milestoneSortKey(r: Milestone | MilestoneResult): number {
  if (r.type === 'dividend') return r.dividendTarget ?? 0;
  if (r.dateTarget) {
    const t = new Date(r.dateTarget).getTime();
    return isNaN(t) ? 0 : t / 1000;
  }
  return 0;
}

const dateFormatter = new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });

export function formatMilestoneDate(iso: string): string {
  const d = parseIsoDate(iso);
  return d ? dateFormatter.format(d) : iso;
}

export function formatDaysRemaining(days: number): string {
  if (days === 0) return 'Heute';
  if (days > 0) return days === 1 ? 'noch 1 Tag' : `noch ${days} Tage`;
  const abs = Math.abs(days);
  return abs === 1 ? 'vor 1 Tag' : `vor ${abs} Tagen`;
}

const MAX_LOOKAHEAD_YEARS = 50;
const MAX_LOOKBACK_YEARS = 50;

/**
 * Calendar year in which a milestone is (or was) reached, or null if not within
 * `MAX_LOOKAHEAD_YEARS` ahead / `MAX_LOOKBACK_YEARS` behind today.
 *
 *  - dividend milestones, currently achieved: walk the compound model backwards
 *    and place the milestone in the first past year where projected income drops
 *    below the target (the year the threshold was crossed).
 *  - dividend milestones, not yet achieved: first future year where projected
 *    income meets the target.
 *  - date milestones: the calendar year of the target date.
 */
export function milestoneAchievedYear(milestone: Milestone, portfolio: Portfolio): number | null {
  if (milestone.type === 'dividend') {
    const target = milestone.dividendTarget ?? 0;
    if (target <= 0) return null;
    if (meetsTarget(portfolio.monthlyIncome, target)) {
      // Already achieved — find when it was first reached by reversing growth.
      for (let y = 1; y <= MAX_LOOKBACK_YEARS; y++) {
        if (!meetsTarget(projectMonthlyDividendsYearsAgo(portfolio, y), target)) {
          return CURRENT_YEAR - (y - 1);
        }
      }
      // Has been achieved for longer than the lookback window — clamp.
      return CURRENT_YEAR - MAX_LOOKBACK_YEARS;
    }
    for (let y = 1; y <= MAX_LOOKAHEAD_YEARS; y++) {
      if (meetsTarget(projectMonthlyDividendsAtYear(portfolio, y), target)) return CURRENT_YEAR + y;
    }
    return null;
  }
  if (!milestone.dateTarget) return null;
  const d = parseIsoDate(milestone.dateTarget);
  return d ? d.getFullYear() : null;
}

