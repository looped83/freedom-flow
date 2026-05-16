import { useState } from 'react';
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
import { LifeUnlocks } from './LifeUnlocks';

const MAX_VISIBLE_GOALS = 5;

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
  const [showAllGoals, setShowAllGoals] = useState(false);

  const monthly = monthlyDividends(portfolio);
  const total = totalMonthlyCosts(goals);
  const freeDays = freeDaysPerMonth(monthly, total);

  const allResults = computeGoalResults(goals, monthly, portfolio);
  const displayResults = applyDisplayFilter(allResults, displayFilter);

  const nextGoal = allResults
    .slice()
    .sort((a, b) => a.monthlyAmount - b.monthlyAmount)
    .find((g) => g.status !== 'covered');

  const lifeUnlocks = buildLifeUnlocks(allResults, monthly, total, freeDays);

  const visibleGoals = showAllGoals ? displayResults : displayResults.slice(0, MAX_VISIBLE_GOALS);

  return (
    <main className="max-w-4xl mx-auto px-4 py-6 space-y-4">

      {/* Page heading */}
      <div>
        <h1 className="text-lg font-bold text-white">Dashboard</h1>
        <p className="text-sm text-white/45 mt-0.5">Dein Weg zur finanziellen Freiheit.</p>
      </div>

      {/* 1. FreedomHero – SVG ring, stats, inline income edit */}
      <FreedomHero monthly={monthly} total={total} onIncomeChange={onIncomeChange} />

      {/* 2. Nächstes Ziel */}
      {nextGoal && (
        <section className="bg-surface-1 rounded-2xl p-5 border border-accent/20" aria-labelledby="next-goal-title">
          <h2 id="next-goal-title" className="text-xs text-white/55 font-medium uppercase tracking-wider mb-3">
            Nächstes Ziel
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-2xl flex-shrink-0" aria-hidden="true">{nextGoal.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold">{nextGoal.name}</p>
              <p className="text-xs text-white/55 mt-0.5">
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
          <p className="text-xs text-accent/70 mt-3">
            Noch {formatEuro(nextGoal.monthlyAmount - nextGoal.coveredAmount)} bis zum nächsten Meilenstein.
          </p>
        </section>
      )}

      {/* 3. Life Unlocks */}
      <LifeUnlocks unlocks={lifeUnlocks} />

      {/* 4. Freedom Calendar */}
      <FreedomCalendar freeDaysPerMonth={freeDays} />

      {/* 5. Filter controls */}
      <div className="flex items-center gap-2 flex-wrap" role="group" aria-label="Ansicht wählen">
        <span className="text-xs text-white/45 mr-1" aria-hidden="true">Ansicht:</span>
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
                  : 'bg-surface-2 text-white/55 hover:text-white/80'
              }`}
            >
              {fullLabel}
            </button>
          );
        })}
      </div>

      {/* 6. Goal list */}
      <section aria-labelledby="all-goals-title">
        <h2 id="all-goals-title" className="text-xs text-white/55 font-medium uppercase tracking-wider mb-2 px-1">
          {displayFilter.mode === 'covered' ? 'Erreichte Ziele' :
           displayFilter.mode === 'open'    ? 'Offene Ziele'    : 'Alle Ziele'}
          <span className="ml-2 text-white/40 font-normal normal-case">({displayResults.length})</span>
        </h2>
        {displayResults.length === 0 ? (
          <p className="text-sm text-white/45 px-1 py-4">Keine Ziele in dieser Ansicht.</p>
        ) : (
          <>
            <ul className="space-y-2" role="list">
              {visibleGoals.map((g) => {
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
                        <span className="text-xs text-white/55 flex-shrink-0 tabular-nums">
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
                      <span className={`text-xs font-bold ${
                        g.status === 'covered' ? 'text-accent'
                        : g.status === 'partial' ? 'text-gold'
                        : 'text-white/45'
                      }`}>
                        {g.status === 'covered' ? '✓' : formatPercent(g.coveragePercent, 0)}
                      </span>
                      {g.achievedYear != null && g.status !== 'covered' && (
                        <p className="text-xs text-white/40">{g.achievedYear}</p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
            {displayResults.length > MAX_VISIBLE_GOALS && (
              <button
                onClick={() => setShowAllGoals((v) => !v)}
                aria-expanded={showAllGoals}
                className="mt-2 w-full text-xs text-white/45 hover:text-white/70 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent rounded-xl py-2.5 bg-surface-1"
              >
                {showAllGoals
                  ? 'Weniger anzeigen ↑'
                  : `${displayResults.length - MAX_VISIBLE_GOALS} weitere Ziele anzeigen ↓`}
              </button>
            )}
          </>
        )}
      </section>
    </main>
  );
}
