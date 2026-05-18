import { useEffect, useState } from 'react';
import type { Portfolio } from '../../types';
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
  calculateLifetimeDividends,
  formatCurrencyForSmallAmounts,
} from '../../utils/liveFlowCalculations';
import { formatEuro } from '../../utils/formatting';
import { PageHeader } from '../layout/PageHeader';

interface LiveFlowProps {
  portfolio: Portfolio;
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

export function LiveFlow({ portfolio }: LiveFlowProps) {
  const monthly = portfolio.monthlyIncome;
  const [now, setNow] = useState(() => new Date());

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

  const dailyRate = calculateDividendRatePerDay(monthly);

  // The sole changing value each tick — everything else is derived from this
  // so all displayed numbers cross cent boundaries on the exact same render.
  const earnedToday = calculateEarnedTodaySoFar(monthly, now);

  // Midnight baseline: constant throughout the day, recomputed only when `now`
  // crosses into a new date (which also updates `now` via the tick).
  const startOfDay   = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekBase     = calculateEarnedThisWeekSoFar(monthly, startOfDay);
  const monthBase    = calculateEarnedThisMonthSoFar(monthly, startOfDay);
  const yearBase     = calculateEarnedThisYearSoFar(monthly, startOfDay);
  const lifetimeBase = calculateLifetimeDividends(
    portfolio.lifetimeDividends,
    portfolio.lifetimeStartYear,
    monthly,
    startOfDay,
  );

  // All share earnedToday as their variable delta → always change together
  const earnedWeek    = weekBase    + earnedToday;
  const earnedMonth   = monthBase   + earnedToday;
  const earnedYear    = yearBase    + earnedToday;
  const lifetimeTotal = lifetimeBase + earnedToday;
  const dayProgress   = calculateDayProgress(now);
  const weekProgress  = calculateWeekProgress(now);
  const monthProgress = calculateMonthProgress(now);
  const yearProgress  = calculateYearProgress(now);
  const dayPct        = Math.round(dayProgress * 100);
  const weekPct       = Math.round(weekProgress * 100);
  const monthPct      = Math.round(monthProgress * 100);
  const yearPct       = Math.round(yearProgress * 100);

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
            von {formatEuro(dailyRate)} erwartet heute
          </p>
          <div className="flex items-center gap-2">
            <div
              role="progressbar"
              aria-label={`Tagesfortschritt: ${dayPct} von 100 Prozent`}
              aria-valuenow={dayPct}
              aria-valuemin={0}
              aria-valuemax={100}
              className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden"
            >
              <div
                className="h-full bg-accent rounded-full motion-safe:transition-[width] motion-safe:duration-[2000ms] motion-safe:ease-linear"
                style={{ width: `${dayPct}%` }}
              />
            </div>
            <span className="text-xs font-bold text-accent flex-shrink-0 tabular-nums">
              {dayPct}&thinsp;%
            </span>
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
      </section>

      {/* ── Lifetime Dividenden ── */}
      <section
        aria-labelledby="lf-lifetime-heading"
        className="rounded-2xl p-6 border border-accent/20 bg-accent-muted"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-accent/70 flex-shrink-0" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                  <path d="M6 3h12l4 6-10 13L2 9l4-6z"/>
                  <path d="M2 9h20"/>
                  <path d="M8.5 3 6 9m9-6 2.5 6M12 3v6"/>
                </svg>
              </span>
              <p className="text-sm font-bold text-white">Lifetime Dividenden</p>
            </div>
            <p
              id="lf-lifetime-heading"
              className="text-5xl font-bold text-accent tabular-nums leading-none"
              aria-live="off"
              aria-atomic="true"
            >
              {formatEuro(lifetimeTotal)}
            </p>
            <p className="text-xs text-white/50 mt-2">Seit 2012</p>
          </div>

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
