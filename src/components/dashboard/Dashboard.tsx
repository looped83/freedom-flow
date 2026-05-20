import { useMemo, useState } from 'react';
import type { Goal, GoalResult, MilestoneResult, Portfolio } from '../../types';
import {
  projectMonthlyDividendsAtYear,
  totalMonthlyCosts,
} from '../../utils/calculations';
import { BONUS_GOAL_ID } from '../../constants/defaultData';
import { formatEuro, formatPercent } from '../../utils/formatting';
import {
  calculateFinancedTime,
  formatFreedomTime,
  type FreedomTimeUnit,
} from '../../utils/liveFlowCalculations';
import { PageHeader } from '../layout/PageHeader';
import { ProgressBar } from './ProgressBar';
import { FreedomHero } from './FreedomHero';
import { LifeUnlocks } from './LifeUnlocks';
import { AchievedCarousel } from './AchievedCarousel';
import { CategoryIcon } from '../goals/CategoryIcon';

const TARGET_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
    <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
  </svg>
);
const CLOCK_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const CARD_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
  </svg>
);
const CHECK_CIRCLE_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

const MAX_VISIBLE_GOALS = 5;

const FREEDOM_UNITS: { id: FreedomTimeUnit; label: string; full: string }[] = [
  { id: 'days',    label: 'Tage',  full: 'Tage'     },
  { id: 'hours',   label: 'Std.',  full: 'Stunden'  },
  { id: 'minutes', label: 'Min.',  full: 'Minuten'  },
];

interface DashboardProps {
  portfolio: Portfolio;
  goals: Goal[];
  goalResults: GoalResult[];
  milestoneResults: MilestoneResult[];
  onIncomeChange: (v: number) => void;
  onTotalChange: (v: number) => void;
  onGoalClick?: (id: string) => void;
  onMilestoneClick?: (id: string) => void;
}

const DASHBOARD_ICON = (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden="true">
    <path d="M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 0h7v7h-7v-7z"/>
  </svg>
);

export function Dashboard({ portfolio, goals, goalResults, milestoneResults, onIncomeChange, onTotalChange, onGoalClick, onMilestoneClick }: DashboardProps) {
  const [showAllGoals, setShowAllGoals] = useState(false);
  const [freedomUnit, setFreedomUnit] = useState<FreedomTimeUnit>('days');

  const monthly = portfolio.monthlyIncome;
  const projectedMonthly = useMemo(() => projectMonthlyDividendsAtYear(portfolio, 1), [portfolio]);
  const total        = useMemo(() => totalMonthlyCosts(goals), [goals]);
  const minExpenses  = useMemo(() => totalMonthlyCosts(goals.filter((g) => g.id !== BONUS_GOAL_ID)), [goals]);
  const financedTime = useMemo(() => calculateFinancedTime(monthly, total), [monthly, total]);

  const nextGoal = useMemo(() => {
    let best: GoalResult | null = null;
    for (const g of goalResults) {
      if (g.status === 'covered') continue;
      if (!best || g.monthlyAmount < best.monthlyAmount) best = g;
    }
    return best;
  }, [goalResults]);

  const { openGoals, achievedGoals } = useMemo(() => {
    const open: GoalResult[] = [];
    const done: GoalResult[] = [];
    for (const g of goalResults) {
      (g.status === 'covered' ? done : open).push(g);
    }
    open.sort((a, b) => a.monthlyAmount - b.monthlyAmount);
    done.sort((a, b) => b.monthlyAmount - a.monthlyAmount);
    return { openGoals: open, achievedGoals: done };
  }, [goalResults]);

  const visibleGoals = showAllGoals ? openGoals : openGoals.slice(0, MAX_VISIBLE_GOALS);

  const achievedCarouselItems = useMemo(() => achievedGoals.map((g) => ({
    id: g.id,
    title: g.name,
    icon: <CategoryIcon category={g.category} className="w-7 h-7" />,
  })), [achievedGoals]);

  return (
    <main className="max-w-4xl mx-auto px-4 py-6 space-y-4">

      <PageHeader icon={DASHBOARD_ICON} title="Dashboard" />

      {/* FreedomHero – ring, stats, inline income edit */}
      <FreedomHero
        monthly={monthly}
        projectedMonthly={projectedMonthly}
        total={total}
        minExpenses={minExpenses}
        onIncomeChange={onIncomeChange}
        onTotalChange={onTotalChange}
      />

      {/* Nächstes Ziel */}
      {nextGoal && (
        <section className="bg-surface-1 rounded-2xl p-5 border border-accent/20" aria-labelledby="next-goal-title">
          <h2 id="next-goal-title" className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <span className="text-accent/70 flex-shrink-0" aria-hidden="true">{TARGET_ICON}</span>
            Nächstes Ziel
          </h2>
          <button
            onClick={() => onGoalClick?.(nextGoal.id)}
            className="w-full bg-surface-2 rounded-xl px-4 py-3 flex items-center gap-3 text-left hover:bg-surface-3 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
          >
            <span className={`flex-shrink-0 ${nextGoal.id === BONUS_GOAL_ID ? 'text-orange-400' : 'text-white/60'}`} aria-hidden="true">
              <CategoryIcon category={nextGoal.category} />
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline mb-1 gap-2">
                <span className="text-sm text-white font-medium truncate pr-2 min-w-0">{nextGoal.name}</span>
                <span className="text-xs text-white/55 flex-shrink-0 tabular-nums">
                  {formatEuro(nextGoal.coveredAmount)} / {formatEuro(nextGoal.monthlyAmount)}
                </span>
              </div>
              <ProgressBar
                percent={nextGoal.coveragePercent}
                label={`${nextGoal.name}: ${formatPercent(nextGoal.coveragePercent)} gedeckt`}
                colorClass={nextGoal.status === 'partial' ? 'bg-gold' : 'bg-white/20'}
              />
            </div>
            <div className="flex-shrink-0 text-right min-w-[2.5rem]">
              <span className={`text-xs font-bold ${
                nextGoal.status === 'partial' ? 'text-gold' : 'text-white/55'
              }`}>
                {formatPercent(nextGoal.coveragePercent, 0)}
              </span>
              {nextGoal.achievedYear != null && (
                <p className="text-xs text-white/55">{nextGoal.achievedYear}</p>
              )}
            </div>
            <span className="sr-only">. In Setup öffnen.</span>
          </button>
          <p className="text-xs text-accent/70 mt-3 font-bold">
            Noch {formatEuro(nextGoal.monthlyAmount - nextGoal.coveredAmount)} bis zum nächsten Meilenstein.
          </p>
        </section>
      )}

      {/* Zurückgekaufte Zeit */}
      <section className="bg-surface-1 rounded-2xl p-5" aria-labelledby="freedom-time-title">
        <div className="flex items-center justify-between mb-4">
          <h2 id="freedom-time-title" className="text-sm font-semibold text-white flex items-center gap-2">
            <span className="text-accent/70 flex-shrink-0" aria-hidden="true">{CLOCK_ICON}</span>
            Zurückgekaufte Zeit
          </h2>
          <div
            className="flex rounded-lg overflow-hidden border border-white/10"
            role="group"
            aria-label="Zeiteinheit wählen"
          >
            {FREEDOM_UNITS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setFreedomUnit(id)}
                aria-pressed={freedomUnit === id}
                className={`text-xs px-3 py-1 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent ${
                  freedomUnit === id
                    ? 'bg-accent/20 text-accent font-semibold'
                    : 'text-white/55 hover:text-white/80'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        {total > 0 ? (
          <p className="text-white/80 text-sm">
            <span className="text-3xl text-accent font-bold tabular-nums">
              {formatFreedomTime(
                freedomUnit === 'days'    ? financedTime.days
                : freedomUnit === 'hours' ? financedTime.hours
                :                          financedTime.minutes,
                freedomUnit,
              )}
            </span>
            {' '}<span className="font-bold text-accent">{FREEDOM_UNITS.find((u) => u.id === freedomUnit)?.full}</span> pro Monat unabhängig.
          </p>
        ) : (
          <p className="text-sm text-white/50">
            Füge Ausgaben im Setup hinzu.
          </p>
        )}
      </section>

      {/* Meilensteine */}
      <section className="bg-surface-1 rounded-2xl p-5 border border-white/5">
        <LifeUnlocks milestoneResults={milestoneResults} onMilestoneClick={onMilestoneClick} />
      </section>

      {/* Ausgaben – open list + achieved carousel */}
      <section className="bg-surface-1 rounded-2xl p-5 border border-white/5 space-y-3" aria-labelledby="all-goals-title">
        <div className="flex items-center justify-between gap-2">
          <h2 id="all-goals-title" className="text-sm font-semibold text-white flex items-center gap-2">
            <span className="text-accent/70 flex-shrink-0" aria-hidden="true">{CARD_ICON}</span>
            <span>Ausgaben<span className="text-white/55 font-normal ml-1.5">({achievedGoals.length}/{goalResults.length})</span></span>
          </h2>
          {openGoals.length > MAX_VISIBLE_GOALS && (
            <button
              onClick={() => setShowAllGoals((v) => !v)}
              aria-expanded={showAllGoals}
              className={`text-xs px-3 py-1 rounded-lg border border-white/10 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent ${
                showAllGoals
                  ? 'bg-accent/20 text-accent font-semibold'
                  : 'text-white/55 hover:text-white/80'
              }`}
            >
              {showAllGoals ? '↑ Weniger' : `+${openGoals.length - MAX_VISIBLE_GOALS} weitere`}
            </button>
          )}
        </div>

        {openGoals.length === 0 ? (
          <p className="text-sm text-white/55 px-1">Alle Ausgaben gedeckt! 🎉</p>
        ) : (
          <ul className="space-y-2" role="list">
            {visibleGoals.map((g, idx) => {
              const isActive = idx === 0;
              const barColor = isActive ? 'bg-accent' : g.status === 'partial' ? 'bg-gold' : 'bg-white/20';
              const iconClass = g.id === BONUS_GOAL_ID ? 'text-orange-400' : isActive ? 'text-accent' : 'text-white/60';
              const pctClass = isActive ? 'text-accent' : g.status === 'partial' ? 'text-gold' : 'text-white/55';
              return (
                <li key={g.id}>
                  <button
                    onClick={() => onGoalClick?.(g.id)}
                    className={`w-full rounded-2xl px-4 py-3 flex items-center gap-3 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent ${
                      isActive
                        ? 'bg-accent-muted border border-accent/20 hover:bg-accent/20'
                        : 'bg-surface-2 hover:bg-surface-3'
                    }`}
                  >
                    <span className={`flex-shrink-0 ${iconClass}`} aria-hidden="true">
                      <CategoryIcon category={g.category} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1 gap-2">
                        <span className="text-sm text-white font-medium truncate pr-2 min-w-0">{g.name}</span>
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
                      <span className={`text-xs font-bold ${pctClass}`}>
                        {formatPercent(g.coveragePercent, 0)}
                      </span>
                      {g.achievedYear != null && (
                        <p className="text-xs text-white/55">{g.achievedYear}</p>
                      )}
                    </div>
                    <span className="sr-only">. In Setup öffnen.</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        <AchievedCarousel
          heading="Erreichte Ausgaben"
          headingIcon={CHECK_CIRCLE_ICON}
          items={achievedCarouselItems}
        />
      </section>
    </main>
  );
}
