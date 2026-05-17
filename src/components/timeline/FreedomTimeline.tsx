import { Fragment, useMemo } from 'react';
import type { TimelineEntry, Goal, Portfolio } from '../../types';
import { CategoryIcon } from '../goals/CategoryIcon';
import { buildFreedomTimeline, INCOME_THRESHOLDS } from '../../utils/calculations';
import { formatEuro } from '../../utils/formatting';
import { PageHeader } from '../layout/PageHeader';

interface FreedomTimelineProps {
  portfolio: Portfolio;
  goals: Goal[];
}

const TIMELINE_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
    <polyline points="16 7 22 7 22 13"/>
  </svg>
);

function YearBadge({ entry }: { entry: TimelineEntry }) {
  return (
    <div
      className={`absolute left-0 top-1.5 w-14 h-7 rounded-lg flex items-center justify-center text-xs font-bold border-2 ${
        entry.isCurrentYear
          ? 'bg-orange-400/10 border-orange-400/60 text-orange-400'
          : entry.isFreedomYear
          ? 'bg-accent border-accent text-surface'
          : entry.isPastYear
          ? 'bg-surface-2 border-white/15 text-white/45'
          : 'bg-surface-2 border-white/35 text-white'
      }`}
      aria-hidden="true"
    >
      {entry.year}
    </div>
  );
}

function MilestoneTile({ milestones }: { milestones: number[] }) {
  return (
    <div className="mt-2 bg-gold-muted border border-gold/20 rounded-xl px-3 py-2.5 flex flex-col gap-1.5">
      {milestones.map((t) => (
        <div key={t} className="flex items-center gap-2">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 flex-shrink-0 text-gold" aria-hidden="true">
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
            <path d="M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v8a6 6 0 0 0 12 0V2z"/>
          </svg>
          <span className="text-xs text-gold font-semibold">{formatEuro(t)} / Mo. Dividenden</span>
        </div>
      ))}
    </div>
  );
}

function GoalDot({ achieved }: { achieved: boolean }) {
  if (achieved) {
    return <span className="text-xs font-bold flex-shrink-0 text-accent">✓</span>;
  }
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75"
      strokeLinecap="round" className="w-3 h-3 flex-shrink-0 text-white/40" aria-hidden="true">
      <circle cx="8" cy="8" r="5"/>
    </svg>
  );
}

function EntryCard({ entry, isHero, milestones }: { entry: TimelineEntry; isHero?: boolean; milestones: number[] }) {
  const hasGoals = entry.newGoals.length > 0;
  const achieved = entry.isPastYear;

  return (
    <li
      className="relative pl-16"
      aria-label={entry.isCurrentYear ? `Heute (${entry.year})` : `Jahr ${entry.year}`}
    >
      <YearBadge entry={entry} />

      <div className={`rounded-2xl p-4 ${
        isHero
          ? 'bg-accent-muted border-2 border-accent/40'
          : 'bg-surface-1'
      }`}>

        {/* Dividende row */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-white">Dividende</span>
          <span className="text-sm font-bold text-orange-400 tabular-nums">
            {formatEuro(entry.projectedMonthly)} / Mo.
          </span>
        </div>

        {hasGoals ? (
          <ul className="space-y-1.5" role="list">
            {entry.newGoals.map((goal) => (
              <li key={goal.id} className="flex items-center gap-2 text-sm">
                <GoalDot achieved={achieved} />
                <span className="flex-shrink-0 text-white/60">
                  <CategoryIcon category={goal.category} className="w-4 h-4" />
                </span>
                <span className={`flex-1 min-w-0 truncate ${achieved ? 'text-white/60' : 'text-white'}`}>
                  {goal.name}
                </span>
                <span className="text-xs text-white/50 flex-shrink-0 tabular-nums">
                  {formatEuro(goal.monthlyAmount)} / Mo.
                </span>
              </li>
            ))}
          </ul>
        ) : entry.isFreedomYear ? (
          <p className="text-sm text-white/50">Alle Ziele vollständig gedeckt.</p>
        ) : null}

        {milestones.length > 0 && <MilestoneTile milestones={milestones} />}
      </div>
    </li>
  );
}

function TimelineSeparator({ label }: { label: string }) {
  return (
    <li aria-hidden="true">
      <div className="flex items-center gap-3 py-1">
        <div className="flex-1 h-px bg-white/20" />
        <span className="text-xs text-white font-bold uppercase tracking-wider">{label}</span>
        <div className="flex-1 h-px bg-white/20" />
      </div>
    </li>
  );
}

export function FreedomTimeline({ portfolio, goals }: FreedomTimelineProps) {
  const allEntries = useMemo(() => buildFreedomTimeline(goals, portfolio), [goals, portfolio]);

  const beyondHorizonGoals = useMemo(() => {
    const ids = new Set(allEntries.flatMap((e) => e.newGoals.map((g) => g.id)));
    return goals.filter((g) => !ids.has(g.id));
  }, [allEntries, goals]);

  const displayEntries = useMemo(() => [...allEntries].reverse(), [allEntries]);

  const milestonesPerYear = useMemo(() => {
    const map = new Map<number, number[]>();
    let prev = 0;
    for (const entry of allEntries) {
      const crossed = INCOME_THRESHOLDS.filter((t) => t > prev && t <= entry.projectedMonthly);
      if (crossed.length > 0) map.set(entry.year, crossed);
      prev = entry.projectedMonthly;
    }
    return map;
  }, [allEntries]);

  return (
    <main className="max-w-4xl mx-auto px-4 py-6">

      <PageHeader icon={TIMELINE_ICON} title="Timeline" />

      {displayEntries.length === 0 ? (
        <div className="bg-surface-1 rounded-2xl p-8 text-center">
          <p className="text-white/50 text-sm">Keine Ziele im Horizont erreichbar.</p>
          <p className="text-xs text-white/35 mt-2">Erhöhe deine Sparrate oder passe den Anlagehorizont an.</p>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-7 top-0 bottom-0 w-px bg-white/8" aria-hidden="true" />
          <ol className="space-y-5" aria-label="Freedom Timeline">
            {displayEntries.map((entry, idx) => {
              const isHero = idx === 0;
              const showSeparator =
                entry.isPastYear && (idx === 0 || !displayEntries[idx - 1].isPastYear);
              return (
                <Fragment key={entry.year}>
                  {showSeparator && <TimelineSeparator label="Rückblick" />}
                  <EntryCard entry={entry} isHero={isHero} milestones={milestonesPerYear.get(entry.year) ?? []} />
                </Fragment>
              );
            })}
          </ol>
        </div>
      )}

      {beyondHorizonGoals.length > 0 && (
        <section className="mt-8 bg-surface-1 rounded-2xl p-5 border border-white/5">
          <h2 className="text-sm font-semibold text-white mb-3">Außerhalb des Horizonts</h2>
          <ul className="space-y-2" role="list">
            {beyondHorizonGoals.map((goal) => (
              <li key={goal.id} className="bg-surface-2 rounded-xl px-4 py-3 flex items-center gap-3 opacity-50">
                <span className="flex-shrink-0 text-white/60">
                  <CategoryIcon category={goal.category} className="w-5 h-5" />
                </span>
                <span className="text-sm text-white/60 flex-1">{goal.name}</span>
                <span className="text-xs text-white/50 tabular-nums">{formatEuro(goal.monthlyAmount)} / Mo.</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
