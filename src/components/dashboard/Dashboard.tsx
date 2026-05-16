import type { DisplayFilter, FilterMode, Goal, Portfolio } from '../../types';
import {
  applyDisplayFilter,
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
  displayFilter: DisplayFilter;
  onFilterChange: (mode: FilterMode) => void;
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

export function Dashboard({ portfolio, goals, displayFilter, onFilterChange }: DashboardProps) {
  const monthly = monthlyDividends(portfolio);
  const total = totalMonthlyCosts(goals);
  const covPct = coveragePercent(monthly, total);
  const missing = Math.max(0, total - monthly);
  const freeDays = freeDaysPerMonth(monthly, total);

  // Coverage allocation is always ascending-by-amount (cheapest covered first)
  const allResults = computeGoalResults(goals, monthly, portfolio);
  // Display is filtered/sorted per user selection
  const displayResults = applyDisplayFilter(allResults, displayFilter);

  const coveredAll = allResults.filter((g) => g.status === 'covered');
  // Next goal: first not-yet-covered in allocation order (ascending amount)
  const nextGoal = allResults
    .slice()
    .sort((a, b) => a.monthlyAmount - b.monthlyAmount)
    .find((g) => g.status !== 'covered');

  const showCoveredSection =
    coveredAll.length > 0 &&
    displayFilter.mode !== 'covered'; // redundant when filter already shows only covered

  return (
    <main className="max-w-4xl mx-auto px-4 py-6 space-y-4">

      {/* 1. Hero metrics – carousel on mobile, grid on desktop */}
      <div
        role="group"
        aria-label="Kennzahlen"
        className="flex gap-3 overflow-x-auto snap-x snap-mandatory scroll-pl-4 -mx-4 px-4 pb-1
                   sm:grid sm:grid-cols-3 sm:gap-3 sm:overflow-visible sm:mx-0 sm:px-0 sm:pb-0 sm:scroll-pl-0"
      >
        {[
          { label: 'Monatliche Dividenden', value: formatEuro(monthly),    sub: 'Passives Einkommen',          accent: 'green' as const },
          { label: 'Deckungsgrad',          value: formatPercent(covPct),  sub: `von ${formatEuro(total)} mtl.`, accent: 'gold'  as const },
          { label: 'Noch fehlend',          value: formatEuro(missing),    sub: 'bis zur vollen Freiheit',     accent: 'blue'  as const },
        ].map((m) => (
          <div
            key={m.label}
            className="flex-none w-[82vw] snap-start sm:w-full sm:flex-auto"
          >
            <MetricCard {...m} />
          </div>
        ))}
      </div>

      {/* 2. Overall progress */}
      <section className="bg-surface-1 rounded-2xl p-5" aria-labelledby="overall-progress-title">
        <div className="flex justify-between items-center mb-3">
          <h2 id="overall-progress-title" className="text-xs text-white/65 font-medium uppercase tracking-wider">
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
          {coveredAll.length} von {goals.length} Zielen vollständig erreicht
        </p>
      </section>

      {/* 3. Next milestone */}
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

      {/* 4. Covered goals quick-view */}
      {showCoveredSection && (
        <section aria-labelledby="covered-goals-title">
          <h2 id="covered-goals-title" className="text-xs text-white/65 font-medium uppercase tracking-wider mb-2 px-1">
            Bereits erreicht ✅
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {coveredAll.map((g) => (
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
