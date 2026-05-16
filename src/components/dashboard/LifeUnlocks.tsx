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
      <span className="text-3xl flex-shrink-0" aria-hidden="true">
        {unlock.emoji}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-white font-semibold text-sm leading-tight mb-1">{unlock.title}</p>
        <p className="text-xs text-white/55 mb-2">{unlock.subtitle}</p>
        <ProgressBar
          percent={unlock.progressPct}
          label={`${unlock.title}: ${unlock.progressPct.toFixed(0)} % erreicht`}
          colorClass={barColor(unlock.progressPct)}
        />
      </div>
      <span className="text-xs text-white/55 flex-shrink-0 tabular-nums font-medium">
        {unlock.progressPct.toFixed(0)} %
      </span>
    </div>
  );
}

function AchievedBadge({ unlock }: { unlock: Unlock }) {
  return (
    <div className="flex items-center gap-1.5 bg-surface-2 rounded-full px-3 py-1.5 border border-accent/20">
      <span className="text-sm" aria-hidden="true">
        {unlock.emoji}
      </span>
      <span className="text-xs text-white/75 font-medium whitespace-nowrap">{unlock.title}</span>
    </div>
  );
}

export function LifeUnlocks({ unlocks }: LifeUnlocksProps) {
  const [showAll, setShowAll] = useState(false);

  const achieved = unlocks.filter((u) => u.achieved);
  const notAchieved = unlocks.filter((u) => !u.achieved);

  // When collapsed: show next 3 not-yet-achieved (already sorted by progressPct desc)
  const visibleCards = showAll ? notAchieved : notAchieved.slice(0, 3);

  return (
    <section aria-label="Life Unlocks" className="space-y-4">
      <h2 className="text-xs text-white/55 font-medium uppercase tracking-wider px-1">
        Life Unlocks
      </h2>

      {/* Upcoming unlock cards */}
      {visibleCards.length > 0 ? (
        <div className="space-y-3">
          {visibleCards.map((unlock) => (
            <UnlockCard key={unlock.id} unlock={unlock} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-white/55 px-1">Alle Meilensteine erreicht! 🎉</p>
      )}

      {/* Toggle button */}
      {notAchieved.length > 3 && (
        <button
          onClick={() => setShowAll((v) => !v)}
          aria-expanded={showAll}
          className="text-xs text-white/55 hover:text-white/80 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent rounded px-2 py-1"
        >
          {showAll
            ? 'Weniger anzeigen ↑'
            : `Alle ${notAchieved.length} Unlocks anzeigen ↓`}
        </button>
      )}

      {/* Achieved badges */}
      {achieved.length > 0 && (
        <div>
          <p className="text-xs text-white/40 mb-2 px-1">Bereits erreicht</p>
          <div className="flex flex-wrap gap-2">
            {achieved.map((unlock) => (
              <AchievedBadge key={unlock.id} unlock={unlock} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
