import { useMemo, useState } from 'react';
import type { Goal, GoalResult, Portfolio } from '../../types';
import {
  buildLifeUnlocks,
  computeGoalResults,
  freeDaysPerMonth,
  monthlyDividends,
  projectMonthlyDividendsAtYear,
  totalMonthlyCosts,
} from '../../utils/calculations';
import { formatEuro, formatPercent } from '../../utils/formatting';
import { PageHeader } from '../layout/PageHeader';
import { ProgressBar } from './ProgressBar';
import { FreedomCalendar } from './FreedomCalendar';
import { FreedomHero } from './FreedomHero';
import { LifeUnlocks } from './LifeUnlocks';
import { CategoryIcon } from '../goals/CategoryIcon';

const MAX_VISIBLE_GOALS = 5;

type GoalFilter = 'all' | 'covered' | 'open';
type SortType = 'alpha' | 'amount';
type SortDir = 'asc' | 'desc';

interface GoalSort { type: SortType; dir: SortDir }

interface DashboardProps {
  portfolio: Portfolio;
  goals: Goal[];
  onIncomeChange: (v: number) => void;
  onGoalClick?: (id: string) => void;
}

function applyFilter(results: GoalResult[], filter: GoalFilter): GoalResult[] {
  if (filter === 'covered') return results.filter((g) => g.status === 'covered');
  if (filter === 'open')    return results.filter((g) => g.status !== 'covered');
  return results;
}

function applySort(results: GoalResult[], sort: GoalSort): GoalResult[] {
  const sorted = [...results];
  if (sort.type === 'alpha') {
    sorted.sort((a, b) => a.name.localeCompare(b.name, 'de'));
    if (sort.dir === 'desc') sorted.reverse();
  } else {
    sorted.sort((a, b) => a.monthlyAmount - b.monthlyAmount);
    if (sort.dir === 'desc') sorted.reverse();
  }
  return sorted;
}

const DASHBOARD_ICON = (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden="true">
    <path d="M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 0h7v7h-7v-7z"/>
  </svg>
);

export function Dashboard({ portfolio, goals, onIncomeChange, onGoalClick }: DashboardProps) {
  const [showAllGoals, setShowAllGoals] = useState(false);
  const [goalFilter, setGoalFilter] = useState<GoalFilter>('all');
  const [goalSort, setGoalSort] = useState<GoalSort>({ type: 'amount', dir: 'desc' });

  const monthly = useMemo(() => monthlyDividends(portfolio), [portfolio]);
  const projectedMonthly = useMemo(() => projectMonthlyDividendsAtYear(portfolio, 1), [portfolio]);
  const total   = useMemo(() => totalMonthlyCosts(goals), [goals]);
  const freeDays = useMemo(() => freeDaysPerMonth(monthly, total), [monthly, total]);

  const allResults = useMemo(
    () => computeGoalResults(goals, monthly, portfolio),
    [goals, monthly, portfolio],
  );

  const nextGoal = useMemo(
    () => [...allResults].sort((a, b) => a.monthlyAmount - b.monthlyAmount).find((g) => g.status !== 'covered'),
    [allResults],
  );

  const lifeUnlocks = useMemo(
    () => buildLifeUnlocks(allResults, monthly, total, freeDays),
    [allResults, monthly, total, freeDays],
  );

  const displayResults = useMemo(
    () => applySort(applyFilter(allResults, goalFilter), goalSort),
    [allResults, goalFilter, goalSort],
  );

  const visibleGoals = showAllGoals ? displayResults : displayResults.slice(0, MAX_VISIBLE_GOALS);

  const goalsTitle =
    goalFilter === 'covered' ? 'Erreichte Ausgaben'
    : goalFilter === 'open'  ? 'Offene Ausgaben'
    : 'Monatliche Ausgaben';

  function handleSortChange(type: SortType) {
    setGoalSort((prev) => {
      if (prev.type === type) return { type, dir: prev.dir === 'asc' ? 'desc' : 'asc' };
      return { type, dir: type === 'amount' ? 'desc' : 'asc' };
    });
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-6 space-y-4">

      <PageHeader icon={DASHBOARD_ICON} title="Dashboard" />

      {/* FreedomHero – ring, stats, inline income edit */}
      <FreedomHero monthly={monthly} projectedMonthly={projectedMonthly} total={total} onIncomeChange={onIncomeChange} />

      {/* Nächstes Ziel */}
      {nextGoal && (
        <section className="bg-surface-1 rounded-2xl p-5 border border-accent/20" aria-labelledby="next-goal-title">
          <h2 id="next-goal-title" className="text-sm font-semibold text-white mb-3">
            Nächstes Ziel
          </h2>
          <div className="flex items-center gap-3">
            <span className="flex-shrink-0 text-white/60">
              <CategoryIcon category={nextGoal.category} className="w-7 h-7" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold">{nextGoal.name}</p>
              <p className="text-xs text-white/55 mt-0.5">
                {formatEuro(nextGoal.coveredAmount)} / {formatEuro(nextGoal.monthlyAmount)}
                {nextGoal.achievedYear != null && ` · erreichbar ${nextGoal.achievedYear}`}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1">
                  <ProgressBar
                    percent={nextGoal.coveragePercent}
                    label={`Fortschritt ${nextGoal.name}: ${formatPercent(nextGoal.coveragePercent)}`}
                    colorClass="bg-gold"
                  />
                </div>
                <span className="text-gold font-bold text-xs flex-shrink-0">
                  {formatPercent(nextGoal.coveragePercent)}
                </span>
              </div>
            </div>
          </div>
          <p className="text-xs text-accent/70 mt-3 font-bold">
            Noch {formatEuro(nextGoal.monthlyAmount - nextGoal.coveredAmount)} bis zum nächsten Meilenstein.
          </p>
        </section>
      )}

      {/* Freedom Calendar */}
      <FreedomCalendar freeDaysPerMonth={freeDays} />

      {/* Meilensteine */}
      <section className="bg-surface-1 rounded-2xl p-5 border border-white/5">
        <LifeUnlocks unlocks={lifeUnlocks} />
      </section>

      {/* Alle Ziele – separate tile */}
      <section className="bg-surface-1 rounded-2xl p-5 border border-white/5 space-y-3" aria-labelledby="all-goals-title">
        <div className="flex items-center justify-between gap-2">
          <h2 id="all-goals-title" className="text-sm font-semibold text-white">
            {goalsTitle}
            <span className="text-white/40 font-normal ml-1.5">({displayResults.length})</span>
          </h2>
          {/* Sort control */}
          <div className="flex rounded-lg overflow-hidden border border-white/10" role="group" aria-label="Sortierung">
            <button
              onClick={() => handleSortChange('alpha')}
              aria-pressed={goalSort.type === 'alpha'}
              className={`text-xs px-3 py-1 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent ${
                goalSort.type === 'alpha' ? 'bg-accent/20 text-accent font-semibold' : 'text-white/45 hover:text-white/70'
              }`}
            >
              {goalSort.type === 'alpha' ? (goalSort.dir === 'asc' ? 'A–Z' : 'Z–A') : 'A–Z'}
            </button>
            <button
              onClick={() => handleSortChange('amount')}
              aria-pressed={goalSort.type === 'amount'}
              className={`text-xs px-3 py-1 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent ${
                goalSort.type === 'amount' ? 'bg-accent/20 text-accent font-semibold' : 'text-white/45 hover:text-white/70'
              }`}
            >
              {goalSort.type === 'amount' ? (goalSort.dir === 'desc' ? '↓ €' : '↑ €') : '↓↑ €'}
            </button>
          </div>
        </div>

        {/* Filter control */}
        <div className="flex rounded-lg overflow-hidden border border-white/10 w-fit" role="group" aria-label="Ziele filtern">
          {([
            { id: 'all',     label: 'Alle'    },
            { id: 'covered', label: 'Erreicht' },
            { id: 'open',    label: 'Offen'   },
          ] as { id: GoalFilter; label: string }[]).map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setGoalFilter(id)}
              aria-pressed={goalFilter === id}
              className={`text-xs px-3 py-1 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent ${
                goalFilter === id ? 'bg-accent/20 text-accent font-semibold' : 'text-white/45 hover:text-white/70'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {displayResults.length === 0 ? (
          <p className="text-sm text-white/50 py-2">Keine Ziele in dieser Ansicht.</p>
        ) : (
          <>
            <ul className="space-y-2" role="list">
              {visibleGoals.map((g) => {
                const barColor =
                  g.status === 'covered' ? 'bg-accent'
                  : g.status === 'partial' ? 'bg-gold'
                  : 'bg-white/20';
                return (
                  <li key={g.id}>
                    <button
                      onClick={() => onGoalClick?.(g.id)}
                      className="w-full bg-surface-2 rounded-xl px-4 py-3 flex items-center gap-3 text-left hover:bg-surface-3 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
                      aria-label={`${g.name} in Setup öffnen`}
                    >
                      <span className="flex-shrink-0 text-white/60">
                        <CategoryIcon category={g.category} />
                      </span>
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
                    </button>
                  </li>
                );
              })}
            </ul>

            {displayResults.length > MAX_VISIBLE_GOALS && (
              <button
                onClick={() => setShowAllGoals((v) => !v)}
                aria-expanded={showAllGoals}
                className="w-full py-2.5 rounded-xl border border-white/10 text-sm text-white/55 hover:text-white/80 hover:border-white/20 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
              >
                {showAllGoals
                  ? '↑ Weniger anzeigen'
                  : `↓ ${displayResults.length - MAX_VISIBLE_GOALS} weitere Ziele`}
              </button>
            )}
          </>
        )}
      </section>
    </main>
  );
}
