import { useState, type CSSProperties } from 'react';
import { CURRENT_YEAR } from '../../constants/defaultData';
import { freedomPercent, missingForFreedom } from '../../utils/calculations';
import { formatEuro, formatPercent } from '../../utils/formatting';
import { Card } from '../ui/Card';
import { EditableNumber } from '../ui/EditableNumber';
import { IconWave } from '../ui/Icons';
import { SegmentedControl } from '../ui/SegmentedControl';
import { STAT_VALUE, StatTile } from '../ui/StatTile';

const VIEWS = [
  { id: 'month', label: 'Monat' },
  { id: 'year',  label: 'Jahr'  },
] as const;
type View = (typeof VIEWS)[number]['id'];

const R = 80;
const CIRCUMFERENCE = 2 * Math.PI * R;
const PROJECTION_YEAR = CURRENT_YEAR + 1;
const TILE_VALUE = `${STAT_VALUE} text-sm`;

function Arc({ percent, stroke }: { percent: number; stroke: string }) {
  const style = {
    '--ring-offset': CIRCUMFERENCE * (1 - Math.min(percent, 100) / 100),
    '--ring-empty': CIRCUMFERENCE,
  } as CSSProperties;
  return (
    <circle
      cx="100" cy="100" r={R}
      fill="none" stroke={stroke} strokeWidth="14" strokeLinecap="round"
      strokeDasharray={CIRCUMFERENCE}
      transform="rotate(-90 100 100)"
      className="ring-arc"
      style={style}
    />
  );
}

interface FreedomHeroProps {
  monthly: number;
  projectedMonthly: number;
  total: number;
  minExpenses: number;
  onIncomeChange: (v: number) => void;
  onTotalChange: (v: number) => void;
}

export function FreedomHero({ monthly, projectedMonthly, total, minExpenses, onIncomeChange, onTotalChange }: FreedomHeroProps) {
  const [view, setView] = useState<View>('month');
  const mul = view === 'year' ? 12 : 1;

  const pct = freedomPercent(monthly, total);
  const projPct = freedomPercent(projectedMonthly, total);
  const showProjection = projPct > pct;
  const ringLabel = `${formatPercent(pct)} finanziell frei`
    + (showProjection ? `, Prognose ${PROJECTION_YEAR}: ${formatPercent(projPct)}` : '');

  return (
    <Card
      tone="accent"
      icon={<IconWave />}
      title="Freedom Flow"
      right={<SegmentedControl ariaLabel="Zeitraum" options={VIEWS} value={view} onChange={setView} />}
    >
      <figure className="flex flex-col items-center">
        <svg viewBox="0 0 200 200" className="h-44 w-44" role="img" aria-label={ringLabel}>
          <circle cx="100" cy="100" r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="14" />
          {showProjection && <Arc percent={projPct} stroke="rgba(74,222,128,0.25)" />}
          <Arc percent={pct} stroke="#4ade80" />
          <text x="100" y="94" textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="28" fontWeight="700">
            {formatPercent(pct)}
          </text>
          <text x="100" y="120" textAnchor="middle" dominantBaseline="middle" fill="rgba(255,255,255,0.7)" fontSize="12">
            finanziell frei
          </text>
        </svg>
        {showProjection && (
          <figcaption className="flex items-center gap-1.5 text-xs text-white/50" aria-hidden="true">
            <span className="h-2 w-2 rounded-full bg-accent/30" />
            Prognose {PROJECTION_YEAR}:
            <span className="font-semibold tabular-nums text-white/70">{formatPercent(projPct)}</span>
          </figcaption>
        )}
      </figure>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <StatTile label="Dividenden">
          <EditableNumber
            kind="euro"
            label={view === 'month' ? 'Monatliche Dividenden' : 'Jährliche Dividenden'}
            value={monthly * mul}
            onCommit={(v) => onIncomeChange(v / mul)}
            className={`${TILE_VALUE} text-accent`}
          />
        </StatTile>
        <StatTile label="Ausgaben">
          <EditableNumber
            kind="euro"
            label={view === 'month' ? 'Monatliche Ausgaben' : 'Jährliche Ausgaben'}
            value={total * mul}
            min={minExpenses * mul}
            onCommit={(v) => onTotalChange(v / mul)}
            className={`${TILE_VALUE} text-white`}
          />
        </StatTile>
        <StatTile label="Offen">
          <span className={`${TILE_VALUE} text-gold`}>{formatEuro(missingForFreedom(monthly, total) * mul)}</span>
        </StatTile>
      </div>
    </Card>
  );
}
