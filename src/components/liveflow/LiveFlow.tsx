import { useEffect, useMemo, useRef, useState } from 'react';
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
  type FreedomTimeUnit,
} from '../../utils/liveFlowCalculations';
import { totalMonthlyCosts } from '../../utils/calculations';
import { formatEuro } from '../../utils/formatting';
import { PageHeader } from '../layout/PageHeader';

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

const UNIT_OPTIONS: { id: FreedomTimeUnit; label: string; full: string }[] = [
  { id: 'days',    label: 'Tage',    full: 'Tage'    },
  { id: 'hours',   label: 'Std.',    full: 'Stunden' },
  { id: 'minutes', label: 'Min.',    full: 'Minuten' },
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

function formatTime(date: Date): string {
  return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
}

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
  const financedTime = useMemo(
    () => calculateFinancedTime(monthly, totalExpenses),
    [monthly, totalExpenses],
  );

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

  return (
    <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">

      <PageHeader icon={LIVEFLOW_ICON} title="Live Flow" right={LIVE_BADGE} />

      {/* ── Hero: Heute + Woche/Monat/Jahr ── */}
      <section
        aria-labelledby="lf-hero-heading"
        className="rounded-2xl p-6 border border-accent/20 bg-accent-muted"
      >
        {/* Top: Heute verdient */}
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

        {/* Mini tiles: Woche · Monat · Jahr */}
        <div className="mt-5 pt-4 border-t border-accent/15 grid grid-cols-3 gap-3">
          {([
            { label: 'Woche', value: earnedWeek,  pct: weekPct,  aria: `Wochenverlauf: ${weekPct} %`  },
            { label: 'Monat', value: earnedMonth, pct: monthPct, aria: `Monatsverlauf: ${monthPct} %` },
            { label: 'Jahr',  value: earnedYear,  pct: yearPct,  aria: `Jahresverlauf: ${yearPct} %`  },
          ] as const).map(({ label, value, pct, aria }) => (
            <div key={label} className="bg-white/5 rounded-xl p-3">
              <p className="text-xs text-white/60 mb-1.5">{label}</p>
              <p
                className="text-sm font-bold text-accent tabular-nums leading-none whitespace-nowrap"
                aria-live="off"
              >
                {formatEuro(value)}
              </p>
              <div className="mt-2">
                <div
                  role="progressbar"
                  aria-label={aria}
                  aria-valuenow={pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  className="h-1 bg-white/10 rounded-full overflow-hidden"
                >
                  <div
                    className="h-full bg-accent rounded-full motion-safe:transition-[width] motion-safe:duration-[2000ms] motion-safe:ease-linear"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-white/35 mt-4 leading-relaxed">
          Rechnerischer Durchschnittswert · Live berechnet alle 10 Sekunden
        </p>
      </section>

      {/* ── Freedom Counter: Zurückgekaufte Zeit ── */}
      <section
        aria-labelledby="lf-freedom-heading"
        className="bg-surface-1 rounded-2xl p-5 border border-white/5"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 id="lf-freedom-heading" className="text-sm font-semibold text-white">
            Zurückgekaufte Zeit
          </h2>

          {/* Segmented control – matches Dashboard toggle style */}
          <div
            role="radiogroup"
            aria-label="Zeiteinheit auswählen"
            className="flex rounded-lg overflow-hidden border border-white/10"
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
                  className={`text-xs px-3 py-1 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent ${
                    selected
                      ? 'bg-accent/20 text-accent font-semibold'
                      : 'text-white/45 hover:text-white/70'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
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
              {UNIT_OPTIONS.find((u) => u.id === timeUnit)?.full} pro Monat zurückgekauft
            </p>
          </>
        ) : (
          <p className="text-sm text-white/50 py-2">
            Füge Ausgaben im Setup hinzu, um deine zurückgekaufte Zeit zu sehen.
          </p>
        )}
      </section>

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
