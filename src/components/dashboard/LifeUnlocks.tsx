import { useState } from 'react';
import type { Unlock } from '../../types';
import { ProgressBar } from './ProgressBar';

interface LifeUnlocksProps {
  unlocks: Unlock[];
}

function barColor(progressPct: number): string {
  if (progressPct >= 80) return 'bg-accent';
  if (progressPct >= 40) return 'bg-gold';
  return 'bg-white/30';
}

function UnlockCard({ unlock }: { unlock: Unlock }) {
  return (
    <div className="bg-surface-2 rounded-2xl p-4 flex gap-3 items-start">
      <span className="text-2xl flex-shrink-0 mt-0.5" aria-hidden="true">{unlock.emoji}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2 mb-0.5">
          <p className="text-white font-semibold text-sm leading-tight">{unlock.title}</p>
          <span className="text-xs text-white/45 flex-shrink-0 tabular-nums">
            {unlock.progressPct.toFixed(0)} %
          </span>
        </div>
        <p className="text-xs text-white/45 mb-2">{unlock.subtitle}</p>
        <ProgressBar
          percent={unlock.progressPct}
          label={`${unlock.title}: ${unlock.progressPct.toFixed(0)} % erreicht`}
          colorClass={barColor(unlock.progressPct)}
        />
      </div>
    </div>
  );
}

export function LifeUnlocks({ unlocks }: LifeUnlocksProps) {
  const [showAll, setShowAll] = useState(false);

  const achieved = unlocks.filter((u) => u.achieved);
  const notAchieved = unlocks.filter((u) => !u.achieved);
  const visibleCards = showAll ? notAchieved : notAchieved.slice(0, 3);

  return (
    <section aria-label="Life Unlocks" className="space-y-3">
      <h2 className="text-xs text-white/55 font-medium uppercase tracking-wider px-1">
        Life Unlocks
      </h2>

      {visibleCards.length > 0 ? (
        <div className="space-y-2.5">
          {visibleCards.map((unlock) => (
            <UnlockCard key={unlock.id} unlock={unlock} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-white/55 px-1">Alle Meilensteine erreicht! 🎉</p>
      )}

      {notAchieved.length > 3 && (
        <button
          onClick={() => setShowAll((v) => !v)}
          aria-expanded={showAll}
          className="text-xs text-white/45 hover:text-white/70 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent rounded px-1 py-0.5"
        >
          {showAll ? 'Weniger ↑' : `+${notAchieved.length - 3} weitere anzeigen`}
        </button>
      )}

      {/* Achieved – compact emoji row with tooltip-style labels */}
      {achieved.length > 0 && (
        <div className="pt-1">
          <p className="text-xs text-white/30 mb-1.5 px-1">Erreicht</p>
          <div className="flex flex-wrap gap-1.5">
            {achieved.map((unlock) => (
              <span
                key={unlock.id}
                title={unlock.title}
                aria-label={unlock.title}
                className="flex items-center gap-1 bg-accent/10 border border-accent/15 rounded-full px-2 py-0.5"
              >
                <span className="text-sm" aria-hidden="true">{unlock.emoji}</span>
                <span className="text-xs text-white/50 font-medium">{unlock.title}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
