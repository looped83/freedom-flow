import type { Milestone, MilestoneResult, ProjectionInput } from '../types';
import { AUTO_EXPENSES_MS_ID, CURRENT_YEAR } from '../constants/defaultData';
import { MAX_YEARS, projectMonthlyDividendsAtYear, projectMonthlyDividendsYearsAgo } from './calculations';

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

/** Re-align the auto-managed "Alle Ausgaben / Monat" milestone with the
 *  current expense total. Returns the same array if nothing changed (or the
 *  user deleted that milestone). */
export function syncAutoMilestone(milestones: Milestone[], total: number): Milestone[] {
  const idx = milestones.findIndex((m) => m.id === AUTO_EXPENSES_MS_ID);
  const ms = milestones[idx];
  if (!ms || ms.type !== 'dividend' || ms.dividendTarget === total) return milestones;
  const out = milestones.slice();
  out[idx] = { ...ms, dividendTarget: total };
  return out;
}

function computeMilestoneResult(milestone: Milestone, p: ProjectionInput): MilestoneResult {
  if (milestone.type === 'dividend') {
    const target = milestone.dividendTarget ?? 0;
    const current = p.monthlyIncome;
    const achieved = target > 0 && meetsTarget(current, target);
    const progress = target > 0 ? Math.min(100, (current / target) * 100) : 0;
    return {
      ...milestone,
      status: achieved ? 'achieved' : 'open',
      progressPercent: progress,
      missingMonthly: Math.max(0, target - current),
      achievedYear: milestoneAchievedYear(milestone, p),
    };
  }
  const target = milestone.dateTarget ? parseIsoDate(milestone.dateTarget) : null;
  if (!target) {
    return {
      ...milestone,
      status: 'open',
      progressPercent: 0,
      missingMonthly: 0,
      achievedYear: null,
    };
  }
  const achieved = target.getTime() <= startOfToday().getTime();
  return {
    ...milestone,
    status: achieved ? 'achieved' : 'open',
    progressPercent: achieved ? 100 : 0,
    missingMonthly: 0,
    achievedYear: milestoneAchievedYear(milestone, p),
  };
}

export function computeMilestoneResults(milestones: Milestone[], p: ProjectionInput): MilestoneResult[] {
  return milestones.map((m) => computeMilestoneResult(m, p));
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

/**
 * Calendar year in which a milestone is (or was) reached, or null if not within
 * `horizonYears` ahead / `MAX_YEARS` behind today.
 *
 *  - dividend milestones, currently achieved: walk the compound model backwards
 *    and place the milestone in the first past year where projected income drops
 *    below the target (the year the threshold was crossed).
 *  - dividend milestones, not yet achieved: first future year where projected
 *    income meets the target.
 *  - date milestones: the calendar year of the target date.
 */
function milestoneAchievedYear(milestone: Milestone, p: ProjectionInput): number | null {
  if (milestone.type === 'dividend') {
    const target = milestone.dividendTarget ?? 0;
    if (target <= 0) return null;
    if (meetsTarget(p.monthlyIncome, target)) {
      // Already achieved — find when it was first reached by reversing growth.
      for (let y = 1; y <= MAX_YEARS; y++) {
        if (!meetsTarget(projectMonthlyDividendsYearsAgo(p, y), target)) {
          return CURRENT_YEAR - (y - 1);
        }
      }
      // Has been achieved for longer than the lookback window — clamp.
      return CURRENT_YEAR - MAX_YEARS;
    }
    for (let y = 1; y <= p.horizonYears; y++) {
      if (meetsTarget(projectMonthlyDividendsAtYear(p, y), target)) return CURRENT_YEAR + y;
    }
    return null;
  }
  if (!milestone.dateTarget) return null;
  const d = parseIsoDate(milestone.dateTarget);
  return d ? d.getFullYear() : null;
}

