import type { Portfolio } from '../../types';
import { MAX_YEARS } from '../../utils/calculations';
import { Card } from '../ui/Card';
import { ConfirmButton } from '../ui/ConfirmButton';
import { EditableNumber } from '../ui/EditableNumber';
import { IconDiamond, IconLiveFlow, IconTimeline } from '../ui/Icons';
import { STAT_VALUE, StatTile } from '../ui/StatTile';

const MONEY = `${STAT_VALUE} text-base text-accent`;
const PLAIN = `${STAT_VALUE} text-base text-white`;

interface PortfolioFormProps {
  portfolio: Portfolio;
  onPatch: (partial: Partial<Portfolio>) => void;
  onReset: () => void;
}

export function PortfolioForm({ portfolio, onPatch, onReset }: PortfolioFormProps) {
  const set = (field: keyof Portfolio) => (value: number) => onPatch({ [field]: value });
  const monthly = portfolio.monthlyIncome;

  return (
    <div className="space-y-4">
      <Card icon={<IconLiveFlow />} title="Dividenden">
        <div className="grid grid-cols-2 gap-2">
          <StatTile label="Pro Jahr">
            <EditableNumber kind="euro" label="Jährliche Dividenden" value={monthly * 12} max={1_200_000}
              onCommit={(v) => onPatch({ monthlyIncome: v / 12 })} className={MONEY} />
          </StatTile>
          <StatTile label="Pro Monat">
            <EditableNumber kind="euro" label="Monatliche Dividenden" value={monthly} max={100_000}
              onCommit={set('monthlyIncome')} className={MONEY} />
          </StatTile>
        </div>
      </Card>

      <Card icon={<IconTimeline />} title="Prognose">
        <div className="grid grid-cols-2 gap-2">
          <StatTile label="Dividendenrendite">
            <EditableNumber kind="percent" label="Dividendenrendite" value={portfolio.dividendYield} max={20}
              onCommit={set('dividendYield')} className={PLAIN} />
          </StatTile>
          <StatTile label="Dividendenwachstum">
            <EditableNumber kind="percent" label="Dividendenwachstum" value={portfolio.dividendGrowth} max={15} step={0.5}
              onCommit={set('dividendGrowth')} className={PLAIN} />
          </StatTile>
          <StatTile label="Sparrate / Monat">
            <EditableNumber kind="euro" label="Monatliche Sparrate" value={portfolio.monthlySavings} max={100_000}
              onCommit={set('monthlySavings')} className={PLAIN} />
          </StatTile>
          <StatTile label="Horizont">
            <EditableNumber kind="integer" label="Prognose-Horizont in Jahren" value={portfolio.horizonYears} unit="Jahre"
              min={1} max={MAX_YEARS} onCommit={set('horizonYears')} className={PLAIN} />
          </StatTile>
        </div>
      </Card>

      <Card icon={<IconDiamond />} title="Lifetime-Dividenden">
        <div className="grid grid-cols-2 gap-2">
          <StatTile label="Berechnung ab">
            <EditableNumber kind="integer" label="Berechnung ab Jahr" value={portfolio.lifetimeStartYear}
              min={2000} max={2100} onCommit={set('lifetimeStartYear')} className={PLAIN} />
          </StatTile>
          <StatTile label="Erhaltene Dividende">
            <EditableNumber kind="euro" label="Erhaltene Dividende" value={portfolio.lifetimeDividends} max={100_000_000}
              onCommit={set('lifetimeDividends')} className={MONEY} />
          </StatTile>
        </div>
      </Card>

      <div className="flex justify-center pt-2">
        <ConfirmButton confirmLabel="Wirklich zurücksetzen" onConfirm={onReset}>
          Alle Daten zurücksetzen
        </ConfirmButton>
      </div>
    </div>
  );
}
