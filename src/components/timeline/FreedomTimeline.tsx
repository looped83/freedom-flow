import { Fragment } from 'react';
import type { TimelineEntry, Goal, Portfolio } from '../../types';
import {
  buildFreedomTimeline,
  freedomYear,
  monthlyDividends,
  totalMonthlyCosts,
} from '../../utils/calculations';
import { formatEuro } from '../../utils/formatting';
import { CURRENT_YEAR } from '../../constants/defaultData';
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
  if (entry.isCurrentYear) {
    return (
      <div
        className="absolute left-0 top-1.5 w-14 h-7 rounded-lg flex items-center justify-center text-xs font-bold border-2 bg-surface-3 border-accent text-accent"
        aria-hidden="true"
      >
        Heute
      </div>
    );
  }
  return (
    <div
      className={`absolute left-0 top-1.5 w-14 h-7 rounded-lg flex items-center justify-center text-xs font-bold border-2 ${
        entry.isFreedomYear
          ? 'bg-accent border-accent text-surface'
          : 'bg-surface-2 border-white/20 text-white/70'
      }`}
      aria-hidden="true"
    >
      {entry.year}
    </div>
  );
}

function EntryCard({ entry }: { entry: TimelineEntry }) {
  const goalsLabel = entry.isPastYear ? 'Erreichte Ziele' : 'Offene Ziele';

  return (
    <li
      className="relative pl-16"
      aria-label={entry.isCurrentYear ? 'Heute' : `Jahr ${entry.year}`}
    >
      <YearBadge entry={entry} />

      <div className={`bg-surface-1 rounded-2xl p-4 ${entry.isFreedomYear ? 'border border-accent/30' : ''}`}>
        <div className="flex items-center justify-between mb-3">
          <div>
            {entry.isFreedomYear && (
              <span className="text-xs bg-accent/15 text-accent px-2 py-0.5 rounded-full font-semibold">
                🏆 Vollständige Freiheit
              </span>
            )}
          </div>
          <span className="text-xs text-white/50 tabular-nums ml-auto">
            {formatEuro(entry.projectedMonthly)} / Mo.
          </span>
        </div>

        {entry.newGoals.length > 0 ? (
          <>
            {!entry.isCurrentYear && (
              <p className="text-sm font-semibold text-white mb-2">{goalsLabel}</p>
            )}
            <ul className="space-y-1.5" role="list">
              {entry.newGoals.map((goal) => (
                <li key={goal.id} className="flex items-center gap-2 text-sm">
                  <span className="text-xs font-bold flex-shrink-0 text-accent">✓</span>
                  <span className="text-lg flex-shrink-0" aria-hidden="true">{goal.emoji}</span>
                  <span className="flex-1 min-w-0 truncate text-white/90">{goal.name}</span>
                  <span className="text-xs text-white/50 flex-shrink-0 tabular-nums">
                    {formatEuro(goal.monthlyAmount)} / Mo.
                  </span>
                </li>
              ))}
            </ul>
          </>
        ) : entry.isFreedomYear ? (
          <p className="text-sm text-white/50">Alle Ziele vollständig gedeckt.</p>
        ) : null}
      </div>
    </li>
  );
}

function TimelineSeparator({ label }: { label: string }) {
  return (
    <li className="relative pl-16" aria-hidden="true">
      <div className="flex items-center gap-3 py-1">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-xs text-white/40 font-medium uppercase tracking-wider px-1">{label}</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>
    </li>
  );
}

export function FreedomTimeline({ portfolio, goals }: FreedomTimelineProps) {
  const allEntries = buildFreedomTimeline(goals, portfolio);
  const total = totalMonthlyCosts(goals);
  const fyear = freedomYear(portfolio, goals);

  const beyondHorizonIds = new Set(allEntries.flatMap((e) => e.newGoals.map((g) => g.id)));
  const beyondHorizonGoals = goals.filter((g) => !beyondHorizonIds.has(g.id));

  const displayEntries = [...allEntries].reverse();

  const nextFutureEntry = allEntries.find((e) => !e.isCurrentYear && !e.isPastYear);
  const nextGoal = nextFutureEntry?.newGoals[0];

  return (
    <main className="max-w-4xl mx-auto px-4 py-6">

      <PageHeader icon={TIMELINE_ICON} title="Timeline" />

      {/* Summary banner – hero style */}
      <section
        className="rounded-2xl p-5 mb-6 bg-accent-muted border border-accent/20"
        aria-label="Timeline-Zusammenfassung"
      >
        {fyear != null ? (
          <p className="text-sm text-white/80">
            Vollständige Freiheit voraussichtlich{' '}
            <span className="text-accent font-bold">{fyear}</span>
            {fyear > CURRENT_YEAR ? ` (in ${fyear - CURRENT_YEAR} Jahren)` : ' – bereits erreicht!'}
          </p>
        ) : (
          <p className="text-sm text-white/80">
            Vollständige Freiheit{' '}
            <span className="text-white/50">nicht im aktuellen Horizont erreichbar.</span>
          </p>
        )}
        {nextGoal && nextFutureEntry && (
          <p className="text-xs text-white/60 mt-1.5">
            Nächster Meilenstein:{' '}
            <span className="text-gold">{nextGoal.emoji} {nextGoal.name}</span>
            {' '}in {nextFutureEntry.year}
          </p>
        )}
        <p className="text-xs text-white/50 mt-2">
          {formatEuro(monthlyDividends(portfolio))} / Mo. Dividenden · {formatEuro(total)} Gesamtkosten
        </p>
      </section>

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
              const showSeparator =
                entry.isPastYear && (idx === 0 || !displayEntries[idx - 1].isPastYear);
              return (
                <Fragment key={entry.year}>
                  {showSeparator && <TimelineSeparator label="Rückblick" />}
                  <EntryCard entry={entry} />
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
                <span className="text-xl flex-shrink-0" aria-hidden="true">{goal.emoji}</span>
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
