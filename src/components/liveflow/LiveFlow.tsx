import { memo, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { Goal, Portfolio } from '../../types';
import {
  calculateAnnualDividends,
  calculateDividendRatePerMinute,
  calculateDividendRatePerHour,
  calculateDividendRatePerDay,
  calculateDividendRatePerWeek,
  calculateEarnedTodaySoFar,
  calculateEarnedThisWeekSoFar,
  calculateEarnedThisMonthSoFar,
  calculateEarnedThisYearSoFar,
  calculateDayProgress,
  calculateWeekProgress,
  calculateMonthProgress,
  calculateYearProgress,
  formatCurrencyForSmallAmounts,
  calculateFinancedTime,
  formatFreedomTime,
  getNextGoalCoverage,
  type FreedomTimeUnit,
} from '../../utils/liveFlowCalculations';
import { computeGoalResults, totalMonthlyCosts } from '../../utils/calculations';
import { formatEuro } from '../../utils/formatting';
import { PageHeader } from '../layout/PageHeader';
import { ProgressBar } from '../dashboard/ProgressBar';
import { CategoryIcon } from '../goals/CategoryIcon';

interface LiveFlowProps {
  portfolio: Portfolio;
  goals: Goal[];
}

// SVG ring: r=10 in 28×28 viewBox, C=2π×10≈62.83
const RING_CIRC = 2 * Math.PI * 10;

interface RateCard {
  id: string;
  label: string;
  getValue: (m: number) => number;
  small: boolean;
}

const RATE_CARDS: RateCard[] = [
  { id: 'minute', label: 'Minute', getValue: (m) => calculateDividendRatePerMinute(m), small: true  },
  { id: 'hour',   label: 'Stunde', getValue: (m) => calculateDividendRatePerHour(m),   small: true  },
  { id: 'day',    label: 'Tag',    getValue: (m) => calculateDividendRatePerDay(m),    small: false },
  { id: 'week',   label: 'Woche',  getValue: (m) => calculateDividendRatePerWeek(m),   small: false },
  { id: 'month',  label: 'Monat',  getValue: (m) => m,                                 small: false },
  { id: 'year',   label: 'Jahr',   getValue: (m) => calculateAnnualDividends(m),       small: false },
];

const UNIT_OPTIONS: { id: FreedomTimeUnit; label: string }[] = [
  { id: 'days',    label: 'Tage'    },
  { id: 'hours',   label: 'Stunden' },
  { id: 'minutes', label: 'Minuten' },
];

const LIVEFLOW_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
    <polyline points="2 12 6 8 10 16 14 4 18 12 22 12"/>
  </svg>
);

const LIVE_BADGE = (
  <div className="flex items-center gap-1.5 bg-accent/15 border border-accent/35 rounded-full px-2.5 py-1" aria-hidden="true">
    <span className="w-1.5 h-1.5 rounded-full bg-accent motion-safe:animate-pulse" />
    <span className="text-xs text-accent font-bold uppercase tracking-wide">Live</span>
  </div>
);

const CHECK_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-accent" aria-hidden="true">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

function formatTime(date: Date): string {
  return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
}

interface MiniHeroProps {
  label: ReactNode;
  value: number;
  progressPct: number;
  progressAriaLabel: string;
}

const MiniHeroTile = memo(function MiniHeroTile({ label, value, progressPct, progressAriaLabel }: MiniHeroProps) {
  return (
    <div className="bg-accent-muted border border-accent/20 rounded-2xl p-4">
      <p className="text-sm font-bold text-white mb-2 min-h-10 leading-5">{label}</p>
      <p className="text-base font-bold text-accent tabular-nums leading-none whitespace-nowrap" aria-live="off">
        {formatEuro(value)}
      </p>
      <div className="mt-3">
        <div
          role="progressbar"
          aria-label={progressAriaLabel}
          aria-valuenow={progressPct}
          aria-valuemin={0}
          aria-valuemax={100}
          className="h-1 bg-white/10 rounded-full overflow-hidden"
        >
          <div
            className="h-full bg-accent rounded-full motion-safe:transition-[width] motion-safe:duration-[2000ms] motion-safe:ease-linear"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>
    </div>
  );
});

export function LiveFlow({ portfolio, goals }: LiveFlowProps) {
  const monthly = portfolio.monthlyIncome;
  const [now, setNow] = useState(() => new Date());
  const [timeUnit, setTimeUnit] = useState<FreedomTimeUnit>('days');
  const segmentRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    function tick() {
      if (!document.hidden) setNow(new Date());
    }
    const id = setInterval(tick, 10_000);
    document.addEventListener('visibilitychange', tick);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', tick);
    };
  }, []);

  // Stable: recompute only when portfolio/goals change, not on every timer tick
  const totalExpenses = useMemo(() => totalMonthlyCosts(goals), [goals]);
  const goalResults = useMemo(
    () => computeGoalResults(goals, monthly, portfolio),
    [goals, monthly, portfolio],
  );
  const nextCoverage = useMemo(() => getNextGoalCoverage(goals, monthly), [goals, monthly]);
  const nextResult = useMemo(
    () => (nextCoverage ? goalResults.find((r) => r.id === nextCoverage.goal.id) ?? null : null),
    [goalResults, nextCoverage],
  );
  const financedTime = useMemo(
    () => calculateFinancedTime(monthly, totalExpenses),
    [monthly, totalExpenses],
  );
  const allCovered = goals.length > 0 && goalResults.every((r) => r.status === 'covered');

  // Timer-dependent values
  const earnedToday   = calculateEarnedTodaySoFar(monthly, now);
  const earnedWeek    = calculateEarnedThisWeekSoFar(monthly, now);
  const earnedMonth   = calculateEarnedThisMonthSoFar(monthly, now);
  const earnedYear    = calculateEarnedThisYearSoFar(monthly, now);
  const dayProgress   = calculateDayProgress(now);
  const weekProgress  = calculateWeekProgress(now);
  const monthProgress = calculateMonthProgress(now);
  const yearProgress  = calculateYearProgress(now);
  const dayPct        = Math.round(dayProgress * 100);
  const weekPct       = Math.round(weekProgress * 100);
  const monthPct      = Math.round(monthProgress * 100);
  const yearPct       = Math.round(yearProgress * 100);

  function handleUnitKey(e: React.KeyboardEvent, currentIdx: number) {
    let next = currentIdx;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      next = (currentIdx + 1) % UNIT_OPTIONS.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      next = (currentIdx - 1 + UNIT_OPTIONS.length) % UNIT_OPTIONS.length;
    } else {
      return;
    }
    setTimeUnit(UNIT_OPTIONS[next].id);
    segmentRefs.current[next]?.focus();
  }

  const timeValue =
    timeUnit === 'days'    ? financedTime.days
    : timeUnit === 'hours' ? financedTime.hours
    :                        financedTime.minutes;

  const unitLabel =
    timeUnit === 'days' ? 'Tage' : timeUnit === 'hours' ? 'Stunden' : 'Minuten';

  const coveragePct = nextCoverage ? Math.round(nextCoverage.progress * 100) : 0;

  return (
    <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">

      <PageHeader icon={LIVEFLOW_ICON} title="Live Flow" right={LIVE_BADGE} />

      {/* ── Hero: Heute verdient ── */}
      <section
        aria-labelledby="lf-hero-heading"
        className="rounded-2xl p-6 border border-accent/20 bg-accent-muted"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white mb-2">Heute verdient</p>
            <p
              id="lf-hero-heading"
              className="text-5xl font-bold text-accent tabular-nums leading-none"
              aria-live="off"
              aria-atomic="true"
            >
              {formatEuro(earnedToday)}
            </p>
          </div>

          {/* 10-second cycle ring – purely decorative */}
          <svg
            width="32"
            height="32"
            viewBox="0 0 28 28"
            aria-hidden="true"
            className="flex-shrink-0 mt-0.5"
          >
            <circle
              cx="14" cy="14" r="10"
              fill="none"
              stroke="rgba(74,222,128,0.12)"
              strokeWidth="2"
            />
            <circle
              cx="14" cy="14" r="10"
              fill="none"
              stroke="#4ade80"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={RING_CIRC}
              transform="rotate(-90 14 14)"
              className="lf-ring-sweep"
            />
          </svg>
        </div>

        {/* Day progress */}
        <div className="mt-4 space-y-1.5">
          <p className="text-xs text-white/50">
            {dayPct}&thinsp;% des heutigen Dividenden-Tags erreicht
          </p>
          <div
            role="progressbar"
            aria-label={`Tagesfortschritt: ${dayPct} von 100 Prozent`}
            aria-valuenow={dayPct}
            aria-valuemin={0}
            aria-valuemax={100}
            className="h-1.5 bg-white/10 rounded-full overflow-hidden"
          >
            <div
              className="h-full bg-accent rounded-full motion-safe:transition-[width] motion-safe:duration-[2000ms] motion-safe:ease-linear"
              style={{ width: `${dayPct}%` }}
            />
          </div>
        </div>

        <p className="text-xs text-white/35 mt-3 leading-relaxed">
          Rechnerischer Durchschnittswert · Live berechnet alle 10 Sekunden
        </p>
      </section>

      {/* ── Freedom Counter: Zurückgekaufte Zeit ── */}
      <section
        aria-labelledby="lf-freedom-heading"
        className="bg-surface-1 rounded-2xl p-6 border border-white/5"
      >
        <h2 id="lf-freedom-heading" className="text-sm font-semibold text-white mb-4">
          Zurückgekaufte Zeit
        </h2>

        {/* Segmented control – keyboard-navigable radiogroup */}
        <div
          role="radiogroup"
          aria-label="Zeiteinheit auswählen"
          className="flex rounded-xl overflow-hidden border border-white/10 mb-5"
        >
          {UNIT_OPTIONS.map(({ id, label }, idx) => {
            const selected = timeUnit === id;
            return (
              <button
                key={id}
                ref={(el) => { segmentRefs.current[idx] = el; }}
                role="radio"
                aria-checked={selected}
                tabIndex={selected ? 0 : -1}
                onClick={() => setTimeUnit(id)}
                onKeyDown={(e) => handleUnitKey(e, idx)}
                className={`flex-1 py-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-0 ${
                  selected
                    ? 'bg-accent/20 text-accent'
                    : 'text-white/45 hover:text-white/70'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {totalExpenses > 0 ? (
          <>
            <p
              className="text-4xl font-bold text-white tabular-nums leading-none"
              aria-live="polite"
              aria-atomic="true"
            >
              {formatFreedomTime(timeValue, timeUnit)}
            </p>
            <p className="text-sm text-accent font-medium mt-2">
              {unitLabel} pro Monat zurückgekauft
            </p>
            <p className="text-xs text-white/40 mt-3 leading-relaxed">
              Basierend auf deinen monatlichen Ausgaben und Dividenden.
            </p>
          </>
        ) : (
          <p className="text-sm text-white/50 py-2">
            Füge Ausgaben im Setup hinzu, um deine zurückgekaufte Zeit zu sehen.
          </p>
        )}
      </section>

      {/* ── Live Goal Fill: Nächstes Ziel ── */}
      <section
        aria-labelledby="lf-goal-heading"
        className="bg-surface-1 rounded-2xl p-5 border border-accent/20"
      >
        <h2 id="lf-goal-heading" className="text-sm font-semibold text-white mb-3">
          Nächstes Ziel im Flow
        </h2>

        {allCovered ? (
          <div className="py-4 flex flex-col items-center gap-2">
            {CHECK_ICON}
            <p className="text-sm font-semibold text-accent">Alle Ziele erreicht</p>
            <p className="text-xs text-white/50 text-center">
              Deine Dividenden decken alle monatlichen Ausgaben.
            </p>
          </div>
        ) : goals.length === 0 ? (
          <p className="text-sm text-white/50 py-2">
            Füge Ausgaben im Setup hinzu.
          </p>
        ) : nextCoverage && nextResult ? (
          <div className="bg-surface-2 rounded-xl px-4 py-4">
            {/* Goal header row */}
            <div className="flex items-center gap-3 mb-3">
              <span className="flex-shrink-0 text-white/60" aria-hidden="true">
                <CategoryIcon category={nextCoverage.goal.category} />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {nextCoverage.goal.name}
                </p>
                <p className="text-xs text-white/50">{nextCoverage.goal.category}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-semibold text-white/80 tabular-nums">
                  {formatEuro(nextCoverage.goal.monthlyAmount)}
                </p>
                {nextResult.achievedYear != null && (
                  <p className="text-xs text-white/40">{nextResult.achievedYear}</p>
                )}
              </div>
            </div>

            {/* Progress bar */}
            <ProgressBar
              percent={coveragePct}
              label={`${nextCoverage.goal.name}: ${coveragePct} % gedeckt`}
              colorClass="bg-gold"
            />

            {/* Coverage info */}
            <div className="flex justify-between items-center mt-3">
              <p className="text-xs text-white/50 tabular-nums">
                {formatEuro(nextCoverage.coveredAmount)} / {formatEuro(nextCoverage.goal.monthlyAmount)}
              </p>
              <p className="text-xs font-bold text-gold">{coveragePct}&thinsp;%</p>
            </div>

            <p className="text-xs text-accent/70 mt-2 font-medium">
              Noch {formatEuro(nextCoverage.missingAmount)} monatliche Dividenden fehlen.
            </p>
          </div>
        ) : null}
      </section>

      {/* ── Mini-hero tiles: Woche · Monat · Jahr ── */}
      <div className="grid grid-cols-3 gap-3">
        <MiniHeroTile
          label="Diese Woche"
          value={earnedWeek}
          progressPct={weekPct}
          progressAriaLabel={`Wochenverlauf: ${weekPct} %`}
        />
        <MiniHeroTile
          label="Dieser Monat"
          value={earnedMonth}
          progressPct={monthPct}
          progressAriaLabel={`Monatsverlauf: ${monthPct} %`}
        />
        <MiniHeroTile
          label={<>Dieses<br />Jahr</>}
          value={earnedYear}
          progressPct={yearPct}
          progressAriaLabel={`Jahresverlauf: ${yearPct} %`}
        />
      </div>

      {/* ── Cashflow ── */}
      <section aria-labelledby="lf-cashflow-heading">
        <h2
          id="lf-cashflow-heading"
          className="text-sm font-semibold text-white mb-3"
        >
          Cashflow
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {RATE_CARDS.map(({ id, label, getValue, small }) => (
            <div key={id} className="bg-surface-1 rounded-2xl p-4 border border-white/5">
              <p className="text-xs text-white/60 mb-2">{label}</p>
              <p className="text-accent font-bold text-base tabular-nums">
                {small
                  ? formatCurrencyForSmallAmounts(getValue(monthly))
                  : formatEuro(getValue(monthly))
                }
              </p>
            </div>
          ))}
        </div>
      </section>

      <p className="text-center text-xs text-white/50 pb-2">
        Zuletzt aktualisiert:&nbsp;{formatTime(now)}
      </p>

    </main>
  );
}
