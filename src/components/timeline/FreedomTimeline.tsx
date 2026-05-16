import type { TimelineEntry, Goal, Portfolio } from '../../types';
import {
  buildFreedomTimeline,
  freedomYear,
  monthlyDividends,
  totalMonthlyCosts,
} from '../../utils/calculations';
import { formatEuro } from '../../utils/formatting';
import { CURRENT_YEAR } from '../../constants/defaultData';

interface FreedomTimelineProps {
  portfolio: Portfolio;
  goals: Goal[];
}

function EntryCard({ entry }: { entry: TimelineEntry }) {
  const yearLabel = entry.isCurrentYear ? 'Heute' : String(entry.year);

  return (
    <li className="relative pl-12">
      {/* Year circle */}
      <div
        className={`absolute left-0 top-1 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
          entry.isFreedomYear
            ? 'bg-accent border-accent text-surface'
            : entry.isCurrentYear
            ? 'bg-surface-3 border-accent text-accent'
            : entry.isPastYear
            ? 'bg-surface-2 border-white/10 text-white/35'
            : 'bg-surface-2 border-white/20 text-white/70'
        }`}
        aria-hidden="true"
      >
        {entry.isCurrentYear ? '●' : String(entry.year).slice(-2)}
      </div>

      <div className={`rounded-2xl p-4 ${
        entry.isFreedomYear ? 'bg-surface-1 border border-accent/30' :
        entry.isPastYear    ? 'bg-surface-1/60' :
        'bg-surface-1'
      }`}>
        <div className="flex items-center gap-2 mb-3">
          <h2 className={`font-bold text-base ${
            entry.isFreedomYear ? 'text-accent' :
            entry.isPastYear    ? 'text-white/45' :
            'text-white'
          }`}>
            {yearLabel}
          </h2>
          {entry.isFreedomYear && (
            <span className="text-xs bg-accent/15 text-accent px-2 py-0.5 rounded-full font-semibold">
              🏆 Vollständige Freiheit
            </span>
          )}
          {entry.isPastYear && (
            <span className="text-xs text-white/25 ml-1">Rückblick</span>
          )}
          <span className="text-xs text-white/30 ml-auto tabular-nums">
            {formatEuro(entry.projectedMonthly)} / Mo.
          </span>
        </div>

        {entry.newGoals.length > 0 ? (
          <ul className="space-y-1.5" role="list">
            {entry.newGoals.map((goal) => (
              <li key={goal.id} className="flex items-center gap-2 text-sm">
                <span className={`text-xs font-bold flex-shrink-0 ${entry.isPastYear ? 'text-white/35' : 'text-accent'}`}>
                  ✓
                </span>
                <span className="text-lg flex-shrink-0" aria-hidden="true">{goal.emoji}</span>
                <span className={`flex-1 min-w-0 truncate ${entry.isPastYear ? 'text-white/45' : 'text-white/90'}`}>
                  {goal.name}
                </span>
                <span className="text-xs text-white/40 flex-shrink-0 tabular-nums">
                  {formatEuro(goal.monthlyAmount)} / Mo.
                </span>
              </li>
            ))}
          </ul>
        ) : entry.isFreedomYear ? (
          <p className="text-sm text-white/45">Alle Ziele vollständig gedeckt.</p>
        ) : null}
      </div>
    </li>
  );
}

export function FreedomTimeline({ portfolio, goals }: FreedomTimelineProps) {
  // buildFreedomTimeline returns chronological order: past → current → future
  const allEntries = buildFreedomTimeline(goals, portfolio);
  const total = totalMonthlyCosts(goals);
  const fyear = freedomYear(portfolio, goals);

  const beyondHorizonIds = new Set(allEntries.flatMap((e) => e.newGoals.map((g) => g.id)));
  const beyondHorizonGoals = goals.filter((g) => !beyondHorizonIds.has(g.id));

  // Reverse for display: future at top, past at bottom
  const displayEntries = [...allEntries].reverse();

  const nextFutureEntry = allEntries.find((e) => !e.isCurrentYear && !e.isPastYear);
  const nextGoal = nextFutureEntry?.newGoals[0];

  return (
    <main className="max-w-4xl mx-auto px-4 py-6">
      <div className="mb-5">
        <h1 className="text-lg font-bold text-white">Freedom Timeline</h1>
        <p className="text-sm text-white/45 mt-1">
          Welche Ziele dein Portfolio wann übernimmt – Vergangenheit und Zukunft.
        </p>
      </div>

      {/* Summary banner */}
      <div className="bg-surface-1 rounded-2xl p-4 mb-6 border border-accent/15">
        {fyear != null ? (
          <p className="text-sm text-white/80">
            Vollständige Freiheit voraussichtlich{' '}
            <span className="text-accent font-bold">{fyear}</span>
            {fyear > CURRENT_YEAR ? ` (in ${fyear - CURRENT_YEAR} Jahren)` : ' – bereits erreicht!'}
          </p>
        ) : (
          <p className="text-sm text-white/80">
            Vollständige Freiheit{' '}
            <span className="text-white/45">nicht im aktuellen Horizont erreichbar.</span>
          </p>
        )}
        {nextGoal && nextFutureEntry && (
          <p className="text-xs text-white/45 mt-1">
            Nächster Meilenstein:{' '}
            <span className="text-gold">{nextGoal.emoji} {nextGoal.name}</span>
            {' '}in {nextFutureEntry.year}
          </p>
        )}
        <p className="text-xs text-white/30 mt-2">
          {formatEuro(monthlyDividends(portfolio))} / Mo. Dividenden · {formatEuro(total)} Gesamtkosten
        </p>
      </div>

      {/* Timeline – future first, past at bottom */}
      {displayEntries.length === 0 ? (
        <div className="bg-surface-1 rounded-2xl p-8 text-center">
          <p className="text-white/45 text-sm">Keine Ziele im Horizont erreichbar.</p>
          <p className="text-xs text-white/30 mt-2">Erhöhe deine Sparrate oder passe den Anlagehorizont an.</p>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-white/8" aria-hidden="true" />
          <ol className="space-y-5" aria-label="Freedom Timeline">
            {displayEntries.map((entry) => (
              <EntryCard key={entry.year} entry={entry} />
            ))}
          </ol>
        </div>
      )}

      {/* Beyond horizon */}
      {beyondHorizonGoals.length > 0 && (
        <div className="mt-8 pt-6 border-t border-white/5">
          <h2 className="text-xs text-white/45 font-medium uppercase tracking-wider mb-3">
            Außerhalb des Horizonts
          </h2>
          <ul className="space-y-2" role="list">
            {beyondHorizonGoals.map((goal) => (
              <li key={goal.id} className="bg-surface-1 rounded-xl px-4 py-3 flex items-center gap-3 opacity-50">
                <span className="text-xl flex-shrink-0" aria-hidden="true">{goal.emoji}</span>
                <span className="text-sm text-white/60 flex-1">{goal.name}</span>
                <span className="text-xs text-white/45 tabular-nums">{formatEuro(goal.monthlyAmount)} / Mo.</span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-white/30 mt-3">
            Anlagehorizont oder Sparrate erhöhen, um diese Ziele zu erreichen.
          </p>
        </div>
      )}
    </main>
  );
}
