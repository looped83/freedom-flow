import { useEffect, useState } from 'react';
import type { Portfolio } from '../../types';
import {
  calculateAnnualDividends,
  calculateLifetimeDividends,
  calculatePeriodStats,
} from '../../utils/liveFlowCalculations';
import { formatEuro, formatEuroAdaptive } from '../../utils/formatting';
import { Page } from '../layout/Page';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';
import { STAT_VALUE, StatTile } from '../ui/StatTile';
import { IconDiamond, IconLiveFlow, IconRefresh, IconSun } from '../ui/Icons';

const TICK_MS = 10_000;

const PERIODS = [
  { id: 'week',  label: 'Woche' },
  { id: 'month', label: 'Monat' },
  { id: 'year',  label: 'Jahr'  },
] as const;

// Average rates derived from the annual total.
const RATES = [
  { label: 'Minute', perYear: 525_600 },
  { label: 'Stunde', perYear: 8_760   },
  { label: 'Tag',    perYear: 365     },
] as const;

const LIVE_BADGE = (
  <span className="flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1" aria-hidden="true">
    <span className="h-1.5 w-1.5 rounded-full bg-accent motion-safe:animate-pulse" />
    <span className="text-xs font-bold uppercase tracking-wide text-accent">Live</span>
  </span>
);

interface LiveFlowProps {
  portfolio: Portfolio;
  /** Tab is visible — the clock only ticks while true. */
  active: boolean;
}

export function LiveFlow({ portfolio, active }: LiveFlowProps) {
  const [now, setNow] = useState(() => new Date());

  // Tick only while this tab is shown and the document is visible; catch up
  // immediately when either becomes true again.
  useEffect(() => {
    if (!active) return;
    const tick = () => { if (!document.hidden) setNow(new Date()); };
    tick();
    const id = setInterval(tick, TICK_MS);
    document.addEventListener('visibilitychange', tick);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [active]);

  const monthly = portfolio.monthlyIncome;
  const annual = calculateAnnualDividends(monthly);
  const stats = calculatePeriodStats(monthly, now);
  const lifetime = calculateLifetimeDividends(portfolio.lifetimeDividends, portfolio.lifetimeStartYear, monthly, now);
  const dayPct = Math.round(stats.day.progress * 100);

  return (
    <Page icon={<IconLiveFlow className="w-5 h-5" />} title="Live Flow" right={LIVE_BADGE}>
      <Card tone="accent" icon={<IconSun />} title="Heute verdient">
        <p className="text-5xl font-bold leading-none tabular-nums text-accent">{formatEuro(stats.day.earned)}</p>
        <p className="mt-3 text-xs text-white/50">von {formatEuro(stats.day.total)} erwartet</p>
        <div className="mt-1.5 flex items-center gap-2">
          <ProgressBar percent={dayPct} label={`Tagesfortschritt: ${dayPct} %`} />
          <span className="flex-shrink-0 text-xs font-bold tabular-nums text-accent">{dayPct} %</span>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {PERIODS.map(({ id, label }) => {
            const s = stats[id];
            const pct = Math.round(s.progress * 100);
            return (
              <StatTile key={id} label={label}>
                <span className={`${STAT_VALUE} text-sm text-accent`}>{formatEuro(s.earned)}</span>
                <span className="mt-1 block truncate text-xs tabular-nums text-white/50">von {formatEuro(s.total, 0)}</span>
                <div className="mt-2">
                  <ProgressBar thin percent={pct} label={`${label}: ${pct} %`} />
                </div>
              </StatTile>
            );
          })}
        </div>
      </Card>

      <Card icon={<IconDiamond />} title="Lifetime-Dividenden">
        <p className="text-3xl font-bold leading-none tabular-nums text-accent">{formatEuro(lifetime)}</p>
      </Card>

      <Card icon={<IconRefresh />} title="Cashflow">
        <div className="grid grid-cols-3 gap-2">
          {RATES.map(({ label, perYear }) => (
            <StatTile key={label} label={`pro ${label}`}>
              <span className={`${STAT_VALUE} text-sm text-accent`}>{formatEuroAdaptive(annual / perYear)}</span>
            </StatTile>
          ))}
        </div>
      </Card>
    </Page>
  );
}
