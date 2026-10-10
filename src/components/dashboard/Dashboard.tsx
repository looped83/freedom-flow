import { useMemo, useState, type ReactNode } from 'react';
import type { GoalResult, MilestoneResult, ProjectionInput } from '../../types';
import { BONUS_GOAL_ID } from '../../constants/defaultData';
import { calculateFinancedTime, projectMonthlyDividendsAtYear } from '../../utils/calculations';
import { milestoneSortKey } from '../../utils/milestones';
import { formatNumber, formatPercent, formatProgressStatus } from '../../utils/formatting';
import { Page } from '../layout/Page';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';
import { SegmentedControl } from '../ui/SegmentedControl';
import { IconClock, IconDashboard, IconStar } from '../ui/Icons';
import { CategoryIcon } from '../goals/CategoryIcon';
import { MilestoneIcon } from '../milestones/MilestoneIcon';
import { FreedomHero } from './FreedomHero';
import { AchievedStrip } from './AchievedStrip';

export type SetupTarget = 'goal' | 'milestone';

/** Goals and milestones mapped to one shape so a single list renders both. */
interface ProgressItem {
  id: string;
  title: string;
  icon: ReactNode;
  percent: number;
  missing: number;
  full: number;
  year: number | null;
  achieved: boolean;
  sortKey: number;
  bonus?: boolean;
}

const VIEWS = [
  { id: 'goal',      label: 'Ausgaben'     },
  { id: 'milestone', label: 'Meilensteine' },
] as const;

const MAX_VISIBLE = 4;

function goalItem(g: GoalResult): ProgressItem {
  return {
    id: g.id,
    title: g.name,
    icon: <CategoryIcon category={g.category} className="w-4 h-4" />,
    percent: g.coveragePercent,
    missing: g.monthlyAmount - g.coveredAmount,
    full: g.monthlyAmount,
    year: g.achievedYear,
    achieved: g.status === 'covered',
    sortKey: g.monthlyAmount,
    bonus: g.id === BONUS_GOAL_ID,
  };
}

function milestoneItem(m: MilestoneResult): ProgressItem {
  return {
    id: m.id,
    title: m.title,
    icon: <MilestoneIcon icon={m.icon} className="w-4 h-4" />,
    percent: m.progressPercent,
    missing: m.missingMonthly,
    full: m.dividendTarget ?? 0,
    year: m.achievedYear,
    achieved: m.status === 'achieved',
    sortKey: milestoneSortKey(m),
  };
}

// Next entry = accent, partially covered = gold, untouched = neutral.
const TONE = {
  next:    { pct: 'text-accent',   bar: 'bg-accent',   icon: 'text-accent'   },
  partial: { pct: 'text-gold',     bar: 'bg-gold',     icon: 'text-white/50' },
  open:    { pct: 'text-white/50', bar: 'bg-white/20', icon: 'text-white/50' },
} as const;

function ProgressRow({ item, next, onClick }: { item: ProgressItem; next: boolean; onClick: () => void }) {
  const tone = TONE[next ? 'next' : item.percent > 0 ? 'partial' : 'open'];
  const pct = formatPercent(item.percent, 0);
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
        next ? 'border border-accent/20 bg-accent-muted hover:bg-accent/20' : 'bg-white/5 hover:bg-white/10'
      }`}
    >
      <span className={`flex-shrink-0 ${item.bonus ? 'text-gold' : tone.icon}`} aria-hidden="true">{item.icon}</span>
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-2">
          <span className="truncate text-sm font-medium text-white">{item.title}</span>
          <span className={`flex-shrink-0 text-xs font-bold tabular-nums ${tone.pct}`}>{pct}</span>
        </span>
        <span className="mb-1.5 mt-0.5 block truncate text-xs text-white/50">
          {formatProgressStatus({ achieved: false, missing: item.missing, full: item.full, year: item.year })}
        </span>
        <ProgressBar percent={item.percent} label={`${item.title}: ${pct}`} colorClass={tone.bar} />
      </span>
      <span className="sr-only">, in Setup öffnen</span>
    </button>
  );
}

function ProgressList({ items, emptyText, doneText, onOpen }: {
  items: ProgressItem[];
  emptyText: string;
  doneText: string;
  onOpen: (id: string) => void;
}) {
  const [showAll, setShowAll] = useState(false);

  const { open, achieved } = useMemo(() => {
    const open: ProgressItem[] = [];
    const achieved: ProgressItem[] = [];
    for (const item of items) (item.achieved ? achieved : open).push(item);
    open.sort((a, b) => a.sortKey - b.sortKey);       // allocation order: next one first
    achieved.sort((a, b) => b.sortKey - a.sortKey);   // biggest win first
    return { open, achieved };
  }, [items]);

  const visible = showAll ? open : open.slice(0, MAX_VISIBLE);
  const hidden = open.length - MAX_VISIBLE;

  return (
    <div className="space-y-3">
      {open.length === 0 ? (
        <p className="px-1 text-sm text-white/50">{items.length === 0 ? emptyText : doneText}</p>
      ) : (
        <ul className="space-y-2">
          {visible.map((item, idx) => (
            <li key={item.id}>
              <ProgressRow item={item} next={idx === 0} onClick={() => onOpen(item.id)} />
            </li>
          ))}
        </ul>
      )}
      {hidden > 0 && (
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          aria-expanded={showAll}
          className="w-full rounded-lg border border-white/10 py-1.5 text-xs text-white/50 transition-colors hover:text-white"
        >
          {showAll ? 'Weniger anzeigen' : `${hidden} weitere anzeigen`}
        </button>
      )}
      <AchievedStrip items={achieved} />
    </div>
  );
}

interface DashboardProps {
  projection: ProjectionInput;
  totalExpenses: number;
  goalResults: GoalResult[];
  milestoneResults: MilestoneResult[];
  onIncomeChange: (v: number) => void;
  onTotalChange: (v: number) => void;
  onOpen: (target: SetupTarget, id: string) => void;
}

export function Dashboard({ projection, totalExpenses, goalResults, milestoneResults, onIncomeChange, onTotalChange, onOpen }: DashboardProps) {
  const [view, setView] = useState<SetupTarget>('goal');
  const monthly = projection.monthlyIncome;

  const projectedMonthly = useMemo(() => projectMonthlyDividendsAtYear(projection, 1), [projection]);
  const minExpenses = useMemo(
    () => goalResults.reduce((s, g) => (g.id === BONUS_GOAL_ID ? s : s + g.monthlyAmount), 0),
    [goalResults],
  );
  const goalItems = useMemo(() => goalResults.map(goalItem), [goalResults]);
  const milestoneItems = useMemo(() => milestoneResults.map(milestoneItem), [milestoneResults]);
  const time = calculateFinancedTime(monthly, totalExpenses);

  return (
    <Page icon={<IconDashboard className="w-5 h-5" />} title="Dashboard">
      <FreedomHero
        monthly={monthly}
        projectedMonthly={projectedMonthly}
        total={totalExpenses}
        minExpenses={minExpenses}
        onIncomeChange={onIncomeChange}
        onTotalChange={onTotalChange}
      />

      <Card
        icon={<IconStar />}
        title="Ziele"
        right={<SegmentedControl ariaLabel="Ziele anzeigen" options={VIEWS} value={view} onChange={setView} />}
      >
        {view === 'goal' ? (
          <ProgressList
            key="goal"
            items={goalItems}
            emptyText="Noch keine Ausgaben. Lege sie unter Setup › Ausgaben an."
            doneText="Alle Ausgaben gedeckt! 🎉"
            onOpen={(id) => onOpen('goal', id)}
          />
        ) : (
          <ProgressList
            key="milestone"
            items={milestoneItems}
            emptyText="Noch keine Meilensteine. Lege sie unter Setup › Meilensteine an."
            doneText="Alle Meilensteine erreicht! 🎉"
            onOpen={(id) => onOpen('milestone', id)}
          />
        )}
      </Card>

      <Card icon={<IconClock />} title="Zurückgekaufte Zeit">
        {totalExpenses > 0 ? (
          <p className="text-sm text-white/70">
            <span className="text-2xl font-bold tabular-nums text-accent">{formatNumber(time.days, 1)} Tage</span>
            {' '}pro Monat unabhängig
            <span className="mt-1 block text-xs tabular-nums text-white/50">
              = {formatNumber(time.hours)} Stunden · {formatNumber(time.minutes)} Minuten
            </span>
          </p>
        ) : (
          <p className="text-sm text-white/50">Füge Ausgaben im Setup hinzu.</p>
        )}
      </Card>
    </Page>
  );
}
