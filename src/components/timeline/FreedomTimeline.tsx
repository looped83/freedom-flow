import { Fragment, memo, useMemo, useState } from 'react';
import type { Goal, MilestoneResult, ProjectionInput, TimelineEntry } from '../../types';
import { buildFreedomTimeline, projectMonthlyDividendsForYear } from '../../utils/calculations';
import { formatMilestoneDate, milestoneSortKey } from '../../utils/milestones';
import { formatEuro } from '../../utils/formatting';
import { CURRENT_YEAR } from '../../constants/defaultData';
import { Page } from '../layout/Page';
import { Card } from '../ui/Card';
import { IconCheck, IconChevron, IconCircle, IconClock, IconTimeline } from '../ui/Icons';
import { CategoryIcon } from '../goals/CategoryIcon';
import { MilestoneIcon } from '../milestones/MilestoneIcon';

const EMPTY_MILESTONES: MilestoneResult[] = [];

const normalizeSpaces = (s: string) => s.replace(/\s+/g, ' ');

/** Target shown next to a milestone — skipped when the title already says it
 *  (e.g. "750 € / Monat"). */
function milestoneTarget(m: MilestoneResult): string | null {
  if (m.type === 'date') return m.dateTarget ? formatMilestoneDate(m.dateTarget) : null;
  if (m.dividendTarget == null) return null;
  const inTitle = normalizeSpaces(m.title).includes(normalizeSpaces(formatEuro(m.dividendTarget, 0)));
  return inTitle ? null : formatEuro(m.dividendTarget);
}

function MilestoneLine({ m }: { m: MilestoneResult }) {
  const achieved = m.status === 'achieved';
  const target = milestoneTarget(m);
  return (
    <li
      className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs ${
        achieved ? 'border-accent/20 bg-accent-muted text-accent' : 'border-white/10 bg-white/5 text-white/70'
      }`}
    >
      <MilestoneIcon icon={m.icon} className="w-3.5 h-3.5 flex-shrink-0" />
      <span className="min-w-0 flex-1 truncate font-semibold">{m.title}</span>
      {target && <span className="flex-shrink-0 tabular-nums">{target}</span>}
    </li>
  );
}

function GoalLine({ goal, achieved }: { goal: Goal; achieved: boolean }) {
  return (
    <li className="flex items-center gap-2 text-sm">
      <span className={achieved ? 'text-accent' : 'text-white/50'}>
        {achieved ? <IconCheck /> : <IconCircle />}
      </span>
      <CategoryIcon category={goal.category} className="w-4 h-4 flex-shrink-0 text-white/50" />
      <span className={`min-w-0 flex-1 truncate ${achieved ? 'text-white/70' : 'text-white'}`}>{goal.name}</span>
      <span className="flex-shrink-0 text-xs tabular-nums text-white/50">{formatEuro(goal.monthlyAmount)}</span>
    </li>
  );
}

const CHIP = {
  freedom: 'border-accent/40 bg-accent/15 text-accent',
  current: 'border-accent/40 text-accent',
  past:    'border-white/10 text-white/50',
  future:  'border-white/20 text-white',
} as const;

const EntryCard = memo(function EntryCard({ entry, hero, milestones }: {
  entry: TimelineEntry;
  hero: boolean;
  milestones: MilestoneResult[];
}) {
  // Only "today" and the freedom year start expanded; the rest show a count.
  const [open, setOpen] = useState(entry.isCurrentYear || entry.isFreedomYear);
  const count = entry.newGoals.length + milestones.length;
  const reached = entry.isPastYear || entry.isCurrentYear;
  const chip = CHIP[entry.isFreedomYear ? 'freedom' : entry.isCurrentYear ? 'current' : entry.isPastYear ? 'past' : 'future'];
  const meta = [
    entry.isCurrentYear ? 'Heute' : entry.isFreedomYear ? 'Finanziell frei' : null,
    !open && count > 0 ? `${count} ${count === 1 ? 'Ziel' : 'Ziele'}` : null,
  ].filter(Boolean).join(' · ');

  return (
    <li
      className={`rounded-2xl border ${
        hero ? 'border-accent/40 bg-accent-muted' : entry.isCurrentYear ? 'border-accent/20 bg-surface-1' : 'border-white/5 bg-surface-1'
      }`}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 p-4 text-left"
      >
        <span className={`flex-shrink-0 rounded-md border px-2 py-0.5 text-xs font-bold tabular-nums ${chip}`}>{entry.year}</span>
        <span className="min-w-0 flex-1 truncate text-xs text-white/50">{meta}</span>
        <span className="flex-shrink-0 text-sm font-bold tabular-nums text-accent">{formatEuro(entry.projectedMonthly)} / Mo.</span>
        <IconChevron open={open} className="w-4 h-4 text-white/50" />
      </button>

      {open && (
        <div className="animate-slide-down space-y-2 px-4 pb-4">
          {milestones.length > 0 && (
            <ul className="space-y-1.5">
              {milestones.map((m) => <MilestoneLine key={m.id} m={m} />)}
            </ul>
          )}
          {entry.newGoals.length > 0 ? (
            <ul className="space-y-1.5">
              {entry.newGoals.map((goal) => <GoalLine key={goal.id} goal={goal} achieved={reached} />)}
            </ul>
          ) : entry.isFreedomYear ? (
            <p className="text-sm text-white/50">Alle Ausgaben vollständig gedeckt.</p>
          ) : null}
        </div>
      )}
    </li>
  );
});

function TimelineSeparator({ label }: { label: string }) {
  return (
    <li role="separator" aria-label={label} className="flex items-center gap-3 py-1">
      <span className="h-px flex-1 bg-white/10" aria-hidden="true" />
      <span className="text-xs font-bold uppercase tracking-wider text-white/70" aria-hidden="true">{label}</span>
      <span className="h-px flex-1 bg-white/10" aria-hidden="true" />
    </li>
  );
}

interface FreedomTimelineProps {
  projection: ProjectionInput;
  goals: Goal[];
  visibleMilestoneResults: MilestoneResult[];
}

export function FreedomTimeline({ projection, goals, visibleMilestoneResults }: FreedomTimelineProps) {
  const baseEntries = useMemo(() => buildFreedomTimeline(goals, projection), [goals, projection]);

  const beyondHorizonGoals = useMemo(() => {
    const ids = new Set(baseEntries.flatMap((e) => e.newGoals.map((g) => g.id)));
    return goals.filter((g) => !ids.has(g.id));
  }, [baseEntries, goals]);

  // Group milestones by the year they are (or were) reached.
  const milestonesByYear = useMemo(() => {
    const map = new Map<number, MilestoneResult[]>();
    const beyond: MilestoneResult[] = [];
    for (const m of visibleMilestoneResults) {
      if (m.achievedYear == null) { beyond.push(m); continue; }
      const list = map.get(m.achievedYear);
      if (list) list.push(m);
      else map.set(m.achievedYear, [m]);
    }
    for (const list of map.values()) list.sort((a, b) => milestoneSortKey(b) - milestoneSortKey(a));
    return { map, beyond };
  }, [visibleMilestoneResults]);

  // Future at the top: merge milestone-only years in, then sort descending.
  const entries = useMemo(() => {
    const byYear = new Map<number, TimelineEntry>(
      baseEntries.map((e) => [e.year, { ...e, newGoals: [...e.newGoals].sort((a, b) => b.monthlyAmount - a.monthlyAmount) }]),
    );
    for (const year of milestonesByYear.map.keys()) {
      if (byYear.has(year)) continue;
      byYear.set(year, {
        year,
        projectedMonthly: projectMonthlyDividendsForYear(projection, year),
        newGoals: [],
        isCurrentYear: year === CURRENT_YEAR,
        isFreedomYear: false,
        isPastYear: year < CURRENT_YEAR,
      });
    }
    return [...byYear.values()].sort((a, b) => b.year - a.year);
  }, [baseEntries, milestonesByYear, projection]);

  const hasBeyond = beyondHorizonGoals.length > 0 || milestonesByYear.beyond.length > 0;

  return (
    <Page icon={<IconTimeline className="w-5 h-5" />} title="Timeline">
      {entries.length === 0 ? (
        <div className="rounded-2xl border border-white/5 bg-surface-1 p-6 text-center">
          <p className="text-sm text-white/70">Keine Ziele im Horizont erreichbar.</p>
          <p className="mt-2 text-xs text-white/50">Erhöhe Sparrate oder Prognose-Horizont unter Setup › Dividenden.</p>
        </div>
      ) : (
        <ol className="space-y-2" aria-label="Freedom Timeline">
          {entries.map((entry, idx) => (
            <Fragment key={entry.year}>
              {entry.isPastYear && (idx === 0 || !entries[idx - 1].isPastYear) && <TimelineSeparator label="Rückblick" />}
              <EntryCard
                entry={entry}
                hero={idx === 0}
                milestones={milestonesByYear.map.get(entry.year) ?? EMPTY_MILESTONES}
              />
            </Fragment>
          ))}
        </ol>
      )}

      {hasBeyond && (
        <Card icon={<IconClock />} title="Außerhalb des Horizonts">
          <ul className="space-y-1.5">
            {milestonesByYear.beyond.map((m) => <MilestoneLine key={m.id} m={m} />)}
            {beyondHorizonGoals.map((goal) => <GoalLine key={goal.id} goal={goal} achieved={false} />)}
          </ul>
        </Card>
      )}
    </Page>
  );
}
