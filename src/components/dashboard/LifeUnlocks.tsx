import { useMemo, useState } from 'react';
import type { MilestoneResult } from '../../types';
import { ProgressBar } from './ProgressBar';
import { AchievedCarousel } from './AchievedCarousel';
import { MilestoneIcon } from '../milestones/MilestoneIcon';
import { formatDaysRemaining, formatMilestoneDate, milestoneSortKey } from '../../utils/milestones';
import { formatEuro } from '../../utils/formatting';

const FLAG_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>
  </svg>
);
const AWARD_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
    <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
  </svg>
);

interface LifeUnlocksProps {
  milestoneResults: MilestoneResult[];
}

function barColor(progressPct: number): string {
  if (progressPct >= 80) return 'bg-accent';
  if (progressPct >= 40) return 'bg-gold';
  return 'bg-white/30';
}

function subtitle(r: MilestoneResult): string {
  if (r.status === 'achieved') return 'Erreicht!';
  if (r.type === 'dividend') return `Noch ${formatEuro(r.missingMonthly)} / Monat`;
  if (r.dateTarget) {
    const datePart = formatMilestoneDate(r.dateTarget);
    if (r.daysRemaining == null) return datePart;
    return `${datePart} · ${formatDaysRemaining(r.daysRemaining)}`;
  }
  return '';
}

function MilestoneCard({ result, active }: { result: MilestoneResult; active?: boolean }) {
  return (
    <div className={`rounded-2xl p-4 flex gap-3 items-start ${active ? 'bg-accent-muted border border-accent/20' : 'bg-surface-2'}`}>
      <span className={`flex-shrink-0 mt-0.5 ${active ? 'text-accent' : 'text-white/60'}`}>
        <MilestoneIcon icon={result.icon} />
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-0.5">
          <p className="text-white font-semibold text-sm leading-tight truncate">{result.title}</p>
          <div className="flex-shrink-0 text-right">
            <span className={`text-xs font-bold tabular-nums ${active ? 'text-accent' : 'text-gold'}`}>
              {result.progressPercent.toFixed(0)} %
            </span>
            {result.achievedYear != null && (
              <p className="text-xs text-white/55">{result.achievedYear}</p>
            )}
          </div>
        </div>
        <p className="text-xs text-white/50 mb-2 truncate">{subtitle(result)}</p>
        <ProgressBar
          percent={result.progressPercent}
          label={`${result.title}: ${result.progressPercent.toFixed(0)} % erreicht`}
          colorClass={active ? 'bg-accent' : barColor(result.progressPercent)}
        />
      </div>
    </div>
  );
}

export function LifeUnlocks({ milestoneResults }: LifeUnlocksProps) {
  const [showAll, setShowAll] = useState(false);

  const { achieved, notAchieved } = useMemo(() => {
    const achieved: MilestoneResult[] = [];
    const notAchieved: MilestoneResult[] = [];
    for (const r of milestoneResults) {
      (r.status === 'achieved' ? achieved : notAchieved).push(r);
    }
    achieved.sort((a, b) => milestoneSortKey(b) - milestoneSortKey(a));
    notAchieved.sort((a, b) => milestoneSortKey(a) - milestoneSortKey(b));
    return { achieved, notAchieved };
  }, [milestoneResults]);
  const visibleCards = showAll ? notAchieved : notAchieved.slice(0, 3);

  const carouselItems = useMemo(() => achieved.map((m) => ({
    id: m.id,
    title: m.title,
    icon: <MilestoneIcon icon={m.icon} className="w-7 h-7" />,
  })), [achieved]);

  if (milestoneResults.length === 0) {
    return (
      <section aria-label="Meilensteine" className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <span className="text-accent/70 flex-shrink-0" aria-hidden="true">{FLAG_ICON}</span>
            Meilensteine
          </h2>
        </div>
        <p className="text-sm text-white/55 px-1">
          Noch keine Meilensteine. Lege deine ersten in Setup → Meilensteine an.
        </p>
      </section>
    );
  }

  return (
    <section aria-label="Meilensteine" className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
          <span className="text-accent/70 flex-shrink-0" aria-hidden="true">{FLAG_ICON}</span>
          <span>Meilensteine<span className="text-white/55 font-normal ml-1.5">({achieved.length}/{milestoneResults.length})</span></span>
        </h2>
        {notAchieved.length > 3 && (
          <button
            onClick={() => setShowAll((v) => !v)}
            aria-expanded={showAll}
            className={`text-xs px-3 py-1 rounded-lg border border-white/10 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent ${
              showAll
                ? 'bg-accent/20 text-accent font-semibold'
                : 'text-white/55 hover:text-white/80'
            }`}
          >
            {showAll ? '↑ Weniger' : `+${notAchieved.length - 3} weitere`}
          </button>
        )}
      </div>

      {visibleCards.length > 0 ? (
        <div className="space-y-2">
          {visibleCards.map((r, idx) => (
            <MilestoneCard key={r.id} result={r} active={idx === 0} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-white/55 px-1">Alle Meilensteine erreicht! 🎉</p>
      )}

      <AchievedCarousel
        heading="Erreichte Meilensteine"
        headingIcon={AWARD_ICON}
        items={carouselItems}
      />
    </section>
  );
}
