import type { Goal, Portfolio } from '../../types';
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

export function FreedomTimeline({ portfolio, goals }: FreedomTimelineProps) {
  const entries = buildFreedomTimeline(goals, portfolio);
  const total = totalMonthlyCosts(goals);
  const fyear = freedomYear(portfolio, goals);

  // Goals that never get covered within the horizon
  const allUnlockedGoalIds = new Set(entries.flatMap((e) => e.newGoals.map((g) => g.id)));
  const beyondHorizonGoals = goals.filter((g) => !allUnlockedGoalIds.has(g.id));

  // Next milestone after today
  const nextEntry = entries.find((e) => !e.isCurrentYear);
  const nextGoal = nextEntry?.newGoals[0];

  return (
    <main className="max-w-4xl mx-auto px-4 py-6">
      {/* Title */}
      <div className="mb-6">
        <h1 className="text-lg font-bold text-white">Freedom Timeline</h1>
        <p className="text-sm text-white/55 mt-1">
          Jahr für Jahr: welche Ziele dein Portfolio neu übernimmt.
        </p>
      </div>

      {/* Summary banner */}
      <div className="bg-surface-1 rounded-2xl p-4 mb-6 border border-accent/15">
        {fyear != null ? (
          <p className="text-sm text-white/80">
            Vollständige Freiheit voraussichtlich in{' '}
            <span className="text-accent font-bold">{fyear}</span>
            {fyear > CURRENT_YEAR ? ` (in ${fyear - CURRENT_YEAR} Jahren)` : ' – bereits jetzt!'}
          </p>
        ) : (
          <p className="text-sm text-white/80">
            Vollständige Freiheit{' '}
            <span className="text-white/55">nicht im aktuellen Horizont erreichbar.</span>
          </p>
        )}
        {nextGoal && nextEntry && (
          <p className="text-xs text-white/55 mt-1">
            Nächster Meilenstein:{' '}
            <span className="text-gold">{nextGoal.emoji} {nextGoal.name}</span>
            {' '}im Jahr {nextEntry.year}
          </p>
        )}
        <p className="text-xs text-white/40 mt-2">
          Monatliche Dividenden heute: {formatEuro(monthlyDividends(portfolio))} ·{' '}
          Gesamtkosten: {formatEuro(total)}
        </p>
      </div>

      {/* Timeline */}
      {entries.length === 0 ? (
        <div className="bg-surface-1 rounded-2xl p-8 text-center">
          <p className="text-white/55 text-sm">Keine Ziele bisher im Horizont erreichbar.</p>
          <p className="text-xs text-white/40 mt-2">Erhöhe deine Sparrate oder passe den Anlagehorizont an.</p>
        </div>
      ) : (
        <div className="relative">
          {/* Vertical line */}
          <div
            className="absolute left-4 top-0 bottom-0 w-0.5 bg-white/10"
            aria-hidden="true"
          />

          <ol className="space-y-6" aria-label="Freedom Timeline">
            {entries.map((entry) => (
              <li key={entry.year} className="relative pl-12">
                {/* Year circle */}
                <div
                  className={`absolute left-0 top-1 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                    entry.isFreedomYear
                      ? 'bg-accent border-accent text-surface'
                      : entry.isCurrentYear
                      ? 'bg-surface-3 border-accent text-accent'
                      : 'bg-surface-2 border-white/20 text-white/70'
                  }`}
                  aria-hidden="true"
                >
                  {entry.isCurrentYear ? '●' : String(entry.year).slice(-2)}
                </div>

                {/* Entry content */}
                <div className={`bg-surface-1 rounded-2xl p-4 ${entry.isFreedomYear ? 'border border-accent/30' : ''}`}>
                  {/* Year label */}
                  <div className="flex items-center gap-2 mb-3">
                    <h2
                      className={`font-bold text-base ${
                        entry.isFreedomYear ? 'text-accent' : 'text-white'
                      }`}
                    >
                      {entry.isCurrentYear ? 'Heute' : entry.year}
                    </h2>
                    {entry.isFreedomYear && (
                      <span className="text-xs bg-accent/15 text-accent px-2 py-0.5 rounded-full font-semibold">
                        🏆 Vollständige finanzielle Freiheit
                      </span>
                    )}
                    <span className="text-xs text-white/40 ml-auto tabular-nums">
                      {formatEuro(entry.projectedMonthly)} / mo
                    </span>
                  </div>

                  {/* New goals */}
                  {entry.newGoals.length > 0 ? (
                    <ul className="space-y-1.5" role="list">
                      {entry.newGoals.map((goal) => (
                        <li
                          key={goal.id}
                          className="flex items-center gap-2 text-sm"
                        >
                          <span className="text-accent text-xs font-bold flex-shrink-0">✓</span>
                          <span className="text-lg flex-shrink-0" aria-hidden="true">
                            {goal.emoji}
                          </span>
                          <span className="text-white/90 flex-1 min-w-0 truncate">{goal.name}</span>
                          <span className="text-xs text-white/55 flex-shrink-0 tabular-nums">
                            {formatEuro(goal.monthlyAmount)} / mo
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : entry.isFreedomYear ? (
                    <p className="text-sm text-white/55">Alle Ziele vollständig gedeckt.</p>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Beyond horizon goals */}
      {beyondHorizonGoals.length > 0 && (
        <div className="mt-8 pt-6 border-t border-white/5">
          <h2 className="text-xs text-white/55 font-medium uppercase tracking-wider mb-3">
            Noch nicht erreichbar im Horizont
          </h2>
          <ul className="space-y-2" role="list">
            {beyondHorizonGoals.map((goal) => (
              <li
                key={goal.id}
                className="bg-surface-1 rounded-xl px-4 py-3 flex items-center gap-3 opacity-60"
              >
                <span className="text-xl flex-shrink-0" aria-hidden="true">
                  {goal.emoji}
                </span>
                <span className="text-sm text-white/70 flex-1">{goal.name}</span>
                <span className="text-xs text-white/55 tabular-nums">
                  {formatEuro(goal.monthlyAmount)} / mo
                </span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-white/40 mt-3">
            Erhöhe deinen Anlagehorizont oder die Sparrate, um diese Ziele zu erreichen.
          </p>
        </div>
      )}
    </main>
  );
}
