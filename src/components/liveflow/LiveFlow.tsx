import { useEffect, useState } from 'react';
import type { Portfolio } from '../../types';
import {
  calculateAnnualDividends,
  calculateDividendRatePerMinute,
  calculateDividendRatePerHour,
  calculateDividendRatePerDay,
  calculateDividendRatePerWeek,
  calculateEarnedTodaySoFar,
  calculateDayProgress,
  formatCurrencyForSmallAmounts,
} from '../../utils/liveFlowCalculations';
import { formatEuro } from '../../utils/formatting';

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
  { id: 'month',  label: 'Pro Monat',  getValue: (m) => m,                                 small: false },
  { id: 'year',   label: 'Pro Jahr',   getValue: (m) => calculateAnnualDividends(m),       small: false },
];

function formatTime(date: Date): string {
  return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
}

export function LiveFlow({ portfolio }: LiveFlowProps) {
  const monthly = portfolio.monthlyIncome;
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 10_000);
    return () => clearInterval(id);
  }, []);

  const earnedToday   = calculateEarnedTodaySoFar(monthly, now);
  const dayProgress   = calculateDayProgress(now);
  const progressPct   = Math.round(dayProgress * 100);

  return (
    <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">

      {/* Eyebrow row */}
      <div className="flex items-center justify-between">
        <p className="text-white/40 text-sm">Dein Portfolio arbeitet gerade für dich.</p>
        <div className="flex items-center gap-1.5" aria-hidden="true">
          <span className="w-1.5 h-1.5 rounded-full bg-accent motion-safe:animate-pulse" />
          <span className="text-[11px] text-white/30 font-medium tracking-wide uppercase">Live</span>
        </div>
      </div>

      {/* ── Hero: Seit Tagesbeginn verdient ── */}
      <section
        aria-labelledby="lf-hero-heading"
        className="bg-surface-1 rounded-2xl p-6 border border-white/5"
      >
        <p
          id="lf-hero-heading"
          className="text-xs font-medium text-white/40 uppercase tracking-wider"
        >
          Seit Tagesbeginn verdient
        </p>

        <p
          className="text-5xl font-bold text-accent tabular-nums mt-2 mb-1 leading-none"
          aria-live="off"
          aria-atomic="true"
        >
          {formatEuro(earnedToday)}
        </p>

        <p className="text-white/40 text-sm mt-3">
          Basierend auf {formatEuro(monthly)} monatlichen Dividenden.
        </p>

        {/* Day progress bar */}
        <div className="mt-5 space-y-2">
          <div className="flex justify-between items-baseline text-xs text-white/40">
            <span>Tagesfortschritt</span>
            <span>{progressPct}&thinsp;% des Tages vergangen</span>
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

        <p className="text-white/25 text-xs mt-4 leading-relaxed">
          Rechnerischer Durchschnittswert, da echte Dividenden unregelmäßig ausgeschüttet werden.
        </p>
      </section>

      {/* ── Cashflow-Raten ── */}
      <section aria-labelledby="lf-rates-heading">
        <h2
          id="lf-rates-heading"
          className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3"
        >
          Cashflow-Raten
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {RATE_CARDS.map(({ id, label, getValue, small }) => (
            <div
              key={id}
              className="bg-surface-1 rounded-xl p-4 border border-white/5"
            >
              <p className="text-xs text-white/40 mb-2">{label}</p>
              <p className="text-white font-semibold text-base tabular-nums">
                {small
                  ? formatCurrencyForSmallAmounts(getValue(monthly))
                  : formatEuro(getValue(monthly))
                }
              </p>
            </div>
          ))}
        </div>

        <p className="text-white/25 text-xs mt-3 text-center">
          Auch wenn du nichts tust, fließt dein Cashflow weiter.
        </p>
      </section>

      {/* ── Live footer ── */}
      <p className="text-center text-xs text-white/25 pb-2">
        Live berechnet&ensp;·&ensp;Zuletzt aktualisiert:&nbsp;{formatTime(now)}
      </p>

    </main>
  );
}
