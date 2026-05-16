import type { Goal, Portfolio, SortMode } from '../../types';
import {
  computeGoalResults,
  coveragePercent,
  freeDaysPerMonth,
  monthlyDividends,
  totalMonthlyCosts,
} from '../../utils/calculations';
import { formatEuro, formatPercent } from '../../utils/formatting';
import { MetricCard } from './MetricCard';
import { ProgressBar } from './ProgressBar';
import { FreedomCalendar } from './FreedomCalendar';

interface DashboardProps {
  portfolio: Portfolio;
  goals: Goal[];
  sortMode: SortMode;
  onSortChange: (mode: SortMode) => void;
}

const SORT_LABELS: Record<SortMode, string> = {
  amount: 'Betrag ↑',
  category: 'Kategorie',
  default: 'Haushaltsbuch',
};

export function Dashboard({ portfolio, goals, sortMode, onSortChange }: DashboardProps) {
  const monthly = monthlyDividends(portfolio);
  const total = totalMonthlyCosts(goals);
  const covPct = coveragePercent(monthly, total);
  const missing = Math.max(0, total - monthly);
  const freeDays = freeDaysPerMonth(monthly, total);
  const goalResults = computeGoalResults(goals, monthly, sortMode, portfolio);
  const covered = goalResults.filter((g) => g.status === 'covered');
  const nextGoal = goalResults.find((g) => g.status !== 'covered');

  return (
    <main className="max-w-4xl mx-auto px-4 py-6 space-y-4">
      <p className="text-white/65 text-sm">Dein Geld arbeitet bereits für dich. 🌱</p>

      {/* Hero metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <MetricCard
          label="Monatliche Dividenden"
          value={formatEuro(monthly)}
          sub="Passives Einkommen"
          accent="green"
        />
        <MetricCard
          label="Deckungsgrad"
          value={formatPercent(covPct)}
          sub={`von ${formatEuro(total)} monatlich`}
          accent="gold"
        />
        <MetricCard
          label="Noch fehlend"
          value={formatEuro(missing)}
          sub="bis zur vollen Freiheit"
          accent="blue"
        />
      </div>

      {/* Overall progress */}
      <section className="bg-surface-1 rounded-2xl p-5" aria-labelledby="overall-progress-title">
        <div className="flex justify-between items-center mb-3">
          <h2
            id="overall-progress-title"
            className="text-xs text-white/65 font-medium uppercase tracking-wider"
          >
            Gesamtfortschritt
          </h2>
          <span className="text-accent font-bold text-sm">{formatPercent(covPct)}</span>
        </div>
        <ProgressBar
          percent={covPct}
          label={`Gesamtdeckungsgrad: ${formatPercent(covPct)}`}
          colorClass="bg-accent"
        />
        <p className="text-xs text-white/60 mt-2">
          {covered.length} von {goals.length} Zielen vollständig erreicht
        </p>
      </section>

      {/* Next goal */}
      {nextGoal && (
        <section
          className="bg-surface-1 rounded-2xl p-5 border border-accent/20"
          aria-labelledby="next-goal-title"
        >
          <h2
            id="next-goal-title"
            className="text-xs text-white/65 font-medium uppercase tracking-wider mb-2"
          >
            Nächstes Ziel
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-2xl" aria-hidden="true">
              {nextGoal.emoji}
            </span>
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

      {/* Covered goals */}
      {covered.length > 0 && (
        <section aria-labelledby="covered-goals-title">
          <h2
            id="covered-goals-title"
            className="text-xs text-white/65 font-medium uppercase tracking-wider mb-2 px-1"
          >
            Bereits erreicht ✅
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {covered.map((g) => (
              <div
                key={g.id}
                className="bg-accent-muted border border-accent/20 rounded-xl px-3 py-2 flex items-center gap-2"
              >
                <span aria-hidden="true">{g.emoji}</span>
                <div className="min-w-0">
                  <p className="text-sm text-white font-medium truncate">{g.name}</p>
                  <p className="text-xs text-accent">{formatEuro(g.monthlyAmount)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Sort controls */}
      <div className="flex items-center gap-2 flex-wrap" role="group" aria-label="Sortieransicht wählen">
        <span className="text-xs text-white/60" aria-hidden="true">
          Ansicht:
        </span>
        {(Object.keys(SORT_LABELS) as SortMode[]).map((mode) => (
          <button
            key={mode}
            onClick={() => onSortChange(mode)}
            aria-pressed={sortMode === mode}
            className={`text-xs px-3 py-1 rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent ${
              sortMode === mode
                ? 'bg-accent text-surface font-semibold'
                : 'bg-surface-2 text-white/65 hover:text-white/90'
            }`}
          >
            {SORT_LABELS[mode]}
          </button>
        ))}
      </div>

      {/* Goal list with progress */}
      <section aria-labelledby="all-goals-title">
        <h2
          id="all-goals-title"
          className="text-xs text-white/65 font-medium uppercase tracking-wider mb-2 px-1"
        >
          Alle Ziele
        </h2>
        <ul className="space-y-2" role="list">
          {goalResults.map((g) => {
            const barColor =
              g.status === 'covered'
                ? 'bg-accent'
                : g.status === 'partial'
                  ? 'bg-gold'
                  : 'bg-white/20';
            return (
              <li key={g.id} className="bg-surface-1 rounded-xl px-4 py-3 flex items-center gap-3">
                <span className="text-xl flex-shrink-0" aria-hidden="true">
                  {g.emoji}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-sm text-white font-medium truncate pr-2">{g.name}</span>
                    <span className="text-xs text-white/65 flex-shrink-0">
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
                      g.status === 'covered'
                        ? 'text-accent'
                        : g.status === 'partial'
                          ? 'text-gold'
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
      </section>

      <FreedomCalendar freeDaysPerMonth={freeDays} />
    </main>
  );
}
