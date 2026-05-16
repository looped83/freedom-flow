import type { DisplayFilter, FilterMode, Goal, Portfolio } from '../../types';
import {
  applyDisplayFilter,
  buildLifeUnlocks,
  computeGoalResults,
  freeDaysPerMonth,
  monthlyDividends,
  totalMonthlyCosts,
} from '../../utils/calculations';
import { formatEuro, formatPercent } from '../../utils/formatting';
import { ProgressBar } from './ProgressBar';
import { FreedomCalendar } from './FreedomCalendar';
import { FreedomHero } from './FreedomHero';
import { QuickIncome } from './QuickIncome';
import { LifeUnlocks } from './LifeUnlocks';

interface DashboardProps {
  portfolio: Portfolio;
  goals: Goal[];
  displayFilter: DisplayFilter;
  onFilterChange: (mode: FilterMode) => void;
  onIncomeChange: (v: number) => void;
}

const FILTER_CONFIG: { mode: FilterMode; label: string }[] = [
  { mode: 'amount',   label: 'Betrag'    },
  { mode: 'category', label: 'Kategorie' },
  { mode: 'covered',  label: 'Erreicht'  },
  { mode: 'open',     label: 'Offen'     },
];

function dirArrow(filter: DisplayFilter, mode: FilterMode): string {
  if (filter.mode !== mode) return '';
  return filter.dir === 'desc' ? ' ↓' : ' ↑';
}

export function Dashboard({ portfolio, goals, displayFilter, onFilterChange, onIncomeChange }: DashboardProps) {
  const monthly = monthlyDividends(portfolio);
  const total = totalMonthlyCosts(goals);
  const freeDays = freeDaysPerMonth(monthly, total);

  // Coverage allocation is always ascending-by-amount (cheapest covered first)
  const allResults = computeGoalResults(goals, monthly, portfolio);
  // Display is filtered/sorted per user selection
  const displayResults = applyDisplayFilter(allResults, displayFilter);

  // Next goal: first not-yet-covered in allocation order (ascending amount)
  const nextGoal = allResults
    .slice()
    .sort((a, b) => a.monthlyAmount - b.monthlyAmount)
    .find((g) => g.status !== 'covered');

  const lifeUnlocks = buildLifeUnlocks(allResults, monthly, total, freeDays);

  return (
    <main className="max-w-4xl mx-auto px-4 py-6 space-y-4">

      {/* 1. FreedomHero – SVG ring + 3 stats */}
      <FreedomHero monthly={monthly} total={total} />

      {/* 2. QuickIncome – large editable income + steppers */}
      <QuickIncome monthly={monthly} onChange={onIncomeChange} />

      {/* 3. Life Unlocks */}
      <LifeUnlocks unlocks={lifeUnlocks} />

      {/* 4. Nächstes Ziel */}
      {nextGoal && (
        <section
          className="bg-surface-1 rounded-2xl p-5 border border-accent/20"
          aria-labelledby="next-goal-title"
        >
          <h2 id="next-goal-title" className="text-xs text-white/65 font-medium uppercase tracking-wider mb-2">
            Nächstes Ziel
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-2xl flex-shrink-0" aria-hidden="true">{nextGoal.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold">{nextGoal.name}</p>
              <p className="text-xs text-white/60">
                {formatEuro(nextGoal.coveredAmount)} / {formatEuro(nextGoal.monthlyAmount)}
                {nextGoal.achievedYear != null && ` · erreichbar ${nextGoal.achievedYear}`}
              </p>
              <div className="mt-2">
                <ProgressBar
                  percent={nextGoal.coveragePercent}
                  label={`Fortschritt ${nextGoal.name}: ${formatPercent(nextGoal.coveragePercent)}`}
                  colorClass="bg-gold"
                />
              </div>
            </div>
            <span className="text-gold font-bold text-sm flex-shrink-0">
              {formatPercent(nextGoal.coveragePercent)}
            </span>
          </div>
          <p className="text-xs text-accent/80 mt-3">
            Noch {formatEuro(nextGoal.monthlyAmount - nextGoal.coveredAmount)} monatliche Dividenden
            bis zum nächsten Meilenstein.
          </p>
        </section>
      )}

      {/* 5. Filter controls */}
      <div
        className="flex items-center gap-2 flex-wrap"
        role="group"
        aria-label="Ansicht wählen"
      >
        <span className="text-xs text-white/60 mr-1" aria-hidden="true">Ansicht:</span>
        {FILTER_CONFIG.map(({ mode, label }) => {
          const active = displayFilter.mode === mode;
          const fullLabel = active ? `${label}${dirArrow(displayFilter, mode)}` : label;
          return (
            <button
              key={mode}
              onClick={() => onFilterChange(mode)}
              aria-pressed={active}
              aria-label={active ? `Sortierung: ${fullLabel}, zum Umkehren erneut klicken` : `Nach ${label} filtern`}
              className={`text-xs px-3 py-1 rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent ${
                active
                  ? 'bg-accent text-surface font-semibold'
                  : 'bg-surface-2 text-white/65 hover:text-white/90'
              }`}
            >
              {fullLabel}
            </button>
          );
        })}
      </div>

      {/* 6. Goal list */}
      <section aria-labelledby="all-goals-title">
        <h2 id="all-goals-title" className="text-xs text-white/65 font-medium uppercase tracking-wider mb-2 px-1">
          {displayFilter.mode === 'covered' ? 'Erreichte Ziele' :
           displayFilter.mode === 'open'    ? 'Offene Ziele'    : 'Alle Ziele'}
          <span className="ml-2 text-white/60 font-normal normal-case">
            ({displayResults.length})
          </span>
        </h2>
        {displayResults.length === 0 ? (
          <p className="text-sm text-white/55 px-1 py-4">Keine Ziele in dieser Ansicht.</p>
        ) : (
          <ul className="space-y-2" role="list">
            {displayResults.map((g) => {
              const barColor =
                g.status === 'covered' ? 'bg-accent'
                : g.status === 'partial' ? 'bg-gold'
                : 'bg-white/20';
              return (
                <li key={g.id} className="bg-surface-1 rounded-xl px-4 py-3 flex items-center gap-3">
                  <span className="text-xl flex-shrink-0" aria-hidden="true">{g.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-sm text-white font-medium truncate pr-2">{g.name}</span>
                      <span className="text-xs text-white/65 flex-shrink-0 tabular-nums">
                        {formatEuro(g.coveredAmount)} / {formatEuro(g.monthlyAmount)}
                      </span>
                    </div>
                    <ProgressBar
                      percent={g.coveragePercent}
                      label={`${g.name}: ${formatPercent(g.coveragePercent)} gedeckt`}
                      colorClass={barColor}
                    />
                  </div>
                  <div className="flex-shrink-0 text-right min-w-[2.5rem]">
                    <span
                      className={`text-xs font-bold ${
                        g.status === 'covered' ? 'text-accent'
                        : g.status === 'partial' ? 'text-gold'
                        : 'text-white/55'
                      }`}
                    >
                      {g.status === 'covered' ? '✓' : formatPercent(g.coveragePercent, 0)}
                    </span>
                    {g.achievedYear != null && g.status !== 'covered' && (
                      <p className="text-xs text-white/55">{g.achievedYear}</p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* 7. Freedom Calendar */}
      <FreedomCalendar freeDaysPerMonth={freeDays} />
    </main>
  );
}
