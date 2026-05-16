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
  calculateDayProgress,
  formatCurrencyForSmallAmounts,
} from '../../utils/liveFlowCalculations';
import { formatEuro } from '../../utils/formatting';
import { PageHeader } from '../layout/PageHeader';

interface LiveFlowProps {
  portfolio: Portfolio;
}

interface RateCard {
  id: string;
  label: string;
  getValue: (m: number) => number;
  small: boolean;
}

const RATE_CARDS: RateCard[] = [
  { id: 'minute', label: 'Pro Minute', getValue: (m) => calculateDividendRatePerMinute(m), small: true  },
  { id: 'hour',   label: 'Pro Stunde', getValue: (m) => calculateDividendRatePerHour(m),   small: true  },
  { id: 'day',    label: 'Pro Tag',    getValue: (m) => calculateDividendRatePerDay(m),    small: false },
  { id: 'week',   label: 'Pro Woche',  getValue: (m) => calculateDividendRatePerWeek(m),   small: false },
];

const LIVEFLOW_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
    <polyline points="2 12 6 8 10 16 14 4 18 12 22 12"/>
  </svg>
);

const LIVE_BADGE = (
  <div className="flex items-center gap-1.5" aria-hidden="true">
    <span className="w-1.5 h-1.5 rounded-full bg-accent motion-safe:animate-pulse" />
    <span className="text-xs text-accent/70 font-medium uppercase tracking-wide">Live</span>
  </div>
);

function formatTime(date: Date): string {
  return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
}

function mondayLabel(now: Date): string {
  const dayOfWeek = now.getDay();
  const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysSinceMonday);
  return monday.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' });
}

function monthLabel(now: Date): string {
  return `1. ${now.toLocaleDateString('de-DE', { month: 'long' })}`;
}

export function LiveFlow({ portfolio }: LiveFlowProps) {
  const monthly = portfolio.monthlyIncome;
  const annual  = calculateAnnualDividends(monthly);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 10_000);
    return () => clearInterval(id);
  }, []);

  const earnedToday = calculateEarnedTodaySoFar(monthly, now);
  const earnedWeek  = calculateEarnedThisWeekSoFar(monthly, now);
  const earnedMonth = calculateEarnedThisMonthSoFar(monthly, now);
  const dayProgress = calculateDayProgress(now);
  const progressPct = Math.round(dayProgress * 100);

  return (
    <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">

      <PageHeader icon={LIVEFLOW_ICON} title="Live Flow" right={LIVE_BADGE} />

      {/* ── Hero: Heute verdient ── */}
      <section
        aria-labelledby="lf-hero-heading"
        className="rounded-2xl p-6 border border-accent/20 bg-accent-muted"
      >
        <p className="text-xs font-semibold text-accent uppercase tracking-wider mb-4">Heute</p>

        <p
          id="lf-hero-heading"
          className="text-5xl font-bold text-accent tabular-nums leading-none"
          aria-live="off"
          aria-atomic="true"
        >
          {formatEuro(earnedToday)}
        </p>
        <p className="text-white/70 text-sm mt-2">Seit Tagesbeginn verdient</p>
        <p className="text-white/50 text-xs mt-0.5">
          Basierend auf {formatEuro(monthly)} monatlichen Dividenden
        </p>

        {/* Day progress bar */}
        <div className="mt-5 space-y-1.5">
          <div className="flex justify-between items-baseline text-xs text-white/60">
            <span>Tagesfortschritt</span>
            <span>{progressPct}&thinsp;%</span>
          </div>
          <div
            role="progressbar"
            aria-label={`Tagesfortschritt: ${progressPct} von 100 Prozent`}
            aria-valuenow={progressPct}
            aria-valuemin={0}
            aria-valuemax={100}
            className="h-1.5 bg-white/10 rounded-full overflow-hidden"
          >
            <div
              className="h-full bg-accent rounded-full motion-safe:transition-[width] motion-safe:duration-[2000ms] motion-safe:ease-linear"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </section>

      {/* ── Pro Monat / Pro Jahr – static rates ── */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-surface-1 rounded-2xl p-5 border border-white/5">
          <p className="text-sm font-semibold text-white mb-2">Pro Monat</p>
          <p className="text-accent font-bold text-2xl tabular-nums">{formatEuro(monthly)}</p>
        </div>
        <div className="bg-surface-1 rounded-2xl p-5 border border-white/5">
          <p className="text-sm font-semibold text-white mb-2">Pro Jahr</p>
          <p className="text-accent font-bold text-2xl tabular-nums">{formatEuro(annual)}</p>
        </div>
      </div>

      {/* ── Cashflow-Raten ── */}
      <section aria-labelledby="lf-rates-heading">
        <h2
          id="lf-rates-heading"
          className="text-sm font-semibold text-white mb-3"
        >
          Cashflow-Raten
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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

      {/* ── Diese Woche / Dieser Monat – running totals ── */}
      <section aria-label="Laufende Woche und laufender Monat">
        <h2 className="text-sm font-semibold text-white mb-3">Bisher verdient</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-surface-1 rounded-2xl p-4 border border-white/5">
            <p className="text-xs text-white/60 mb-2">Diese Woche</p>
            <p className="text-accent font-bold text-base tabular-nums" aria-live="off">
              {formatEuro(earnedWeek)}
            </p>
            <p className="text-white/50 text-xs mt-1.5">Seit {mondayLabel(now)}</p>
          </div>
          <div className="bg-surface-1 rounded-2xl p-4 border border-white/5">
            <p className="text-xs text-white/60 mb-2">Dieser Monat</p>
            <p className="text-accent font-bold text-base tabular-nums" aria-live="off">
              {formatEuro(earnedMonth)}
            </p>
            <p className="text-white/50 text-xs mt-1.5">Seit {monthLabel(now)}</p>
          </div>
        </div>
      </section>

      <p className="text-center text-xs text-white/50 pb-2">
        Zuletzt aktualisiert:&nbsp;{formatTime(now)}
      </p>

    </main>
  );
}
