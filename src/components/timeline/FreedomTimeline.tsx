import { Fragment, memo, useMemo, useState } from 'react';
import type { TimelineEntry, Goal, Milestone, MilestoneResult, Portfolio } from '../../types';
import { CategoryIcon } from '../goals/CategoryIcon';
import { MilestoneIcon } from '../milestones/MilestoneIcon';
import { buildFreedomTimeline, projectMonthlyDividendsAtYear, projectMonthlyDividendsYearsAgo } from '../../utils/calculations';
import { computeMilestoneResult, filterMilestonesByExpenses, formatMilestoneDate, milestoneAchievedYear, milestoneSortKey } from '../../utils/milestones';
import { IconChevron } from '../ui/Icons';

const BAR_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5" aria-hidden="true">
    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
  </svg>
);
import { CURRENT_YEAR } from '../../constants/defaultData';
import { formatEuro } from '../../utils/formatting';
import { PageHeader } from '../layout/PageHeader';

interface FreedomTimelineProps {
  portfolio: Portfolio;
  goals: Goal[];
  milestones: Milestone[];
}

const TIMELINE_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
    <polyline points="16 7 22 7 22 13"/>
  </svg>
);


const MilestoneTile = memo(function MilestoneTile({ milestones }: { milestones: MilestoneResult[] }) {
  return (
    <div className="mt-2 flex flex-col gap-1.5">
      {milestones.map((m) => {
        const achieved = m.status === 'achieved';
        return (
          <div
            key={m.id}
            className={`flex items-center gap-2 rounded-xl px-3 py-2 border ${
              achieved
                ? 'bg-gold-muted border-gold/20'
                : 'bg-surface-2 border-white/8 opacity-60'
            }`}
          >
            <span className={`flex-shrink-0 ${achieved ? 'text-gold' : 'text-white/55'}`}>
              <MilestoneIcon icon={m.icon} className="w-3.5 h-3.5" />
            </span>
            <span className={`text-xs font-semibold flex-1 min-w-0 truncate ${achieved ? 'text-gold' : 'text-white/50'}`}>
              {m.title}
            </span>
            <span className={`text-[10px] font-medium tabular-nums flex-shrink-0 ${achieved ? 'text-gold/80' : 'text-white/55'}`}>
              {m.type === 'dividend' && m.dividendTarget != null
                ? `${formatEuro(m.dividendTarget)} / Mo.`
                : m.dateTarget
                  ? formatMilestoneDate(m.dateTarget)
                  : ''}
            </span>
          </div>
        );
      })}
    </div>
  );
});

function GoalDot({ achieved }: { achieved: boolean }) {
  if (achieved) {
    return <span className="text-xs font-bold flex-shrink-0 text-accent">✓</span>;
  }
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75"
      strokeLinecap="round" className="w-3 h-3 flex-shrink-0 text-white/55" aria-hidden="true">
      <circle cx="8" cy="8" r="5"/>
    </svg>
  );
}

const EntryCard = memo(function EntryCard({ entry, isHero, milestones }: { entry: TimelineEntry; isHero?: boolean; milestones: MilestoneResult[] }) {
  const collapsible = !entry.isPastYear && !entry.isCurrentYear;
  const [collapsed, setCollapsed] = useState(collapsible);

  const hasGoals = entry.newGoals.length > 0;
  const achieved = entry.isPastYear;
  const hasContent = hasGoals || entry.isFreedomYear || milestones.length > 0;
  const isInteractive = collapsible && hasContent;

  const yearColor = entry.isCurrentYear
    ? 'text-orange-400'
    : entry.isFreedomYear
    ? 'text-accent'
    : entry.isPastYear
    ? 'text-white/55'
    : 'text-white';

  return (
    <li
      className="relative"
      aria-label={entry.isCurrentYear ? `Heute (${entry.year})` : `Jahr ${entry.year}`}
    >
      <div
        className={`rounded-2xl p-4 relative ${isHero ? 'bg-accent-muted border-2 border-accent/40' : entry.isCurrentYear ? 'bg-surface-1 border border-accent/20' : 'bg-surface-1'} ${isInteractive ? 'cursor-pointer select-none' : ''}`}
        onClick={isInteractive ? () => setCollapsed((c) => !c) : undefined}
        role={isInteractive ? 'button' : undefined}
        tabIndex={isInteractive ? 0 : undefined}
        onKeyDown={isInteractive ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setCollapsed((c) => !c); } } : undefined}
        aria-expanded={isInteractive ? !collapsed : undefined}
        aria-label={isInteractive ? (collapsed ? `${entry.year} ausklappen` : `${entry.year} einklappen`) : undefined}
      >
        <div className={`flex items-center gap-2 ${hasContent && !collapsed ? 'mb-2' : ''}`}>
          <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-md border flex-shrink-0 ${yearColor} ${
            entry.isCurrentYear ? 'border-orange-400/40 bg-orange-400/10'
            : entry.isFreedomYear ? 'border-accent/40 bg-accent/10'
            : entry.isPastYear  ? 'border-white/15 bg-white/5'
            : 'border-white/20 bg-white/5'
          }`}>
            {entry.year}
          </span>
          <span className="text-xs font-bold text-white flex-1 flex items-center gap-1.5">
            <span className="text-accent/70 flex-shrink-0" aria-hidden="true">{BAR_ICON}</span>
            Dividenden
          </span>
          <span className="text-sm font-bold text-green-400 tabular-nums">
            {formatEuro(entry.projectedMonthly)} / Mo.
          </span>
          {isInteractive && <IconChevron open={!collapsed} />}
        </div>

        {!collapsed && (
          <>
            {milestones.length > 0 && <MilestoneTile milestones={milestones} />}

            {hasGoals ? (
              <ul className={`space-y-1.5 ${milestones.length > 0 ? 'mt-2' : ''}`} role="list">
                {entry.newGoals.map((goal) => (
                  <li key={goal.id} className="flex items-center gap-2 text-sm">
                    <GoalDot achieved={achieved} />
                    <span className="flex-shrink-0 text-white/60">
                      <CategoryIcon category={goal.category} className="w-4 h-4" />
                    </span>
                    <span className={`flex-1 min-w-0 truncate ${achieved ? 'text-white/60' : 'text-white'}`}>
                      {goal.name}
                    </span>
                    <span className="text-xs text-white/50 flex-shrink-0 tabular-nums">
                      {formatEuro(goal.monthlyAmount)} / Mo.
                    </span>
                  </li>
                ))}
              </ul>
            ) : entry.isFreedomYear ? (
              <p className="text-sm text-white/50">Alle Ziele vollständig gedeckt.</p>
            ) : null}
          </>
        )}
      </div>
    </li>
  );
});

function TimelineSeparator({ label }: { label: string }) {
  return (
    <li role="separator" aria-label={label}>
      <div className="flex items-center gap-3 py-1">
        <div className="flex-1 h-px bg-white/20" aria-hidden="true" />
        <span className="text-xs text-white font-bold uppercase tracking-wider" aria-hidden="true">{label}</span>
        <div className="flex-1 h-px bg-white/20" aria-hidden="true" />
      </div>
    </li>
  );
}

export function FreedomTimeline({ portfolio, goals, milestones }: FreedomTimelineProps) {
  const baseEntries = useMemo(() => buildFreedomTimeline(goals, portfolio), [goals, portfolio]);

  const visibleMilestones = useMemo(
    () => filterMilestonesByExpenses(milestones, goals),
    [milestones, goals],
  );

  const beyondHorizonGoals = useMemo(() => {
    const ids = new Set(baseEntries.flatMap((e) => e.newGoals.map((g) => g.id)));
    return goals.filter((g) => !ids.has(g.id));
  }, [baseEntries, goals]);

  // Map each milestone to its calendar year (or null = beyond horizon / unreachable)
  const milestonesByYear = useMemo(() => {
    const map = new Map<number, MilestoneResult[]>();
    const beyond: MilestoneResult[] = [];
    for (const m of visibleMilestones) {
      const year = milestoneAchievedYear(m, portfolio);
      const result = computeMilestoneResult(m, portfolio);
      if (year == null) {
        beyond.push(result);
        continue;
      }
      const list = map.get(year) ?? [];
      list.push(result);
      map.set(year, list);
    }
    // Sort each year's milestones for stable display
    for (const list of map.values()) {
      list.sort((a, b) => milestoneSortKey(b) - milestoneSortKey(a));
    }
    return { map, beyond };
  }, [visibleMilestones, portfolio]);

  // Merge milestone-only years into the timeline so milestones always have a card.
  const allEntries = useMemo(() => {
    const entryByYear = new Map<number, TimelineEntry>(
      baseEntries.map((e) => [
        e.year,
        e.newGoals.length > 1
          ? { ...e, newGoals: [...e.newGoals].sort((a, b) => b.monthlyAmount - a.monthlyAmount) }
          : e,
      ]),
    );
    for (const year of milestonesByYear.map.keys()) {
      if (entryByYear.has(year)) continue;
      const delta = year - CURRENT_YEAR;
      const projMonthly = delta === 0
        ? portfolio.monthlyIncome
        : delta > 0
          ? projectMonthlyDividendsAtYear(portfolio, delta)
          : projectMonthlyDividendsYearsAgo(portfolio, -delta);
      entryByYear.set(year, {
        year,
        projectedMonthly: projMonthly,
        newGoals: [],
        isCurrentYear: year === CURRENT_YEAR,
        isFreedomYear: false,
        isPastYear: year < CURRENT_YEAR,
      });
    }
    return [...entryByYear.values()].sort((a, b) => a.year - b.year);
  }, [baseEntries, milestonesByYear, portfolio]);

  const displayEntries = useMemo(() => [...allEntries].reverse(), [allEntries]);

  return (
    <main className="max-w-4xl mx-auto px-4 py-6">

      <PageHeader icon={TIMELINE_ICON} title="Timeline" />

      {displayEntries.length === 0 ? (
        <div className="bg-surface-1 rounded-2xl p-8 text-center">
          <p className="text-white/50 text-sm">Keine Ziele im Horizont erreichbar.</p>
          <p className="text-xs text-white/55 mt-2">Erhöhe deine Sparrate oder passe den Anlagehorizont an.</p>
        </div>
      ) : (
        <div className="relative">
          <ol className="space-y-2" aria-label="Freedom Timeline">
            {displayEntries.map((entry, idx) => {
              const isHero = idx === 0;
              const showSeparator =
                entry.isPastYear && (idx === 0 || !displayEntries[idx - 1].isPastYear);
              return (
                <Fragment key={entry.year}>
                  {showSeparator && <TimelineSeparator label="Rückblick" />}
                  <EntryCard entry={entry} isHero={isHero} milestones={milestonesByYear.map.get(entry.year) ?? []} />
                </Fragment>
              );
            })}
          </ol>
        </div>
      )}

      {(beyondHorizonGoals.length > 0 || milestonesByYear.beyond.length > 0) && (
        <section className="mt-8 bg-surface-1 rounded-2xl p-5 border border-white/5">
          <h2 className="text-sm font-semibold text-white mb-3">Außerhalb des Horizonts</h2>
          <ul className="space-y-2" role="list">
            {beyondHorizonGoals.map((goal) => (
              <li key={goal.id} className="bg-surface-2 rounded-xl px-4 py-3 flex items-center gap-3 opacity-50">
                <span className="flex-shrink-0 text-white/60">
                  <CategoryIcon category={goal.category} className="w-5 h-5" />
                </span>
                <span className="text-sm text-white/60 flex-1">{goal.name}</span>
                <span className="text-xs text-white/50 tabular-nums">{formatEuro(goal.monthlyAmount)} / Mo.</span>
              </li>
            ))}
            {milestonesByYear.beyond.map((m) => (
              <li key={m.id} className="bg-surface-2 rounded-xl px-4 py-3 flex items-center gap-3 opacity-50">
                <span className="flex-shrink-0 text-gold">
                  <MilestoneIcon icon={m.icon} className="w-5 h-5" />
                </span>
                <span className="text-sm text-white/60 flex-1 truncate">{m.title}</span>
                <span className="text-xs text-white/50 tabular-nums flex-shrink-0">
                  {m.type === 'dividend' && m.dividendTarget != null
                    ? `${formatEuro(m.dividendTarget)} / Mo.`
                    : ''}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
