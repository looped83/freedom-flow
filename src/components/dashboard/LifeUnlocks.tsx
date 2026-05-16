import { useRef, useState } from 'react';
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

function AchievedCarousel({ achieved }: { achieved: Unlock[] }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  function handleScroll() {
    const el = scrollRef.current;
    if (!el || el.offsetWidth === 0) return;
    setActiveIdx(Math.round(el.scrollLeft / el.offsetWidth));
  }

  return (
    <div>
      <p className="text-xs text-white/30 mb-2 px-1">Erreicht</p>
      <div className="bg-surface-1 rounded-2xl overflow-hidden">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto no-scrollbar snap-x snap-mandatory"
          role="list"
          aria-label="Erreichte Meilensteine"
        >
          {achieved.map((unlock, i) => (
            <div
              key={unlock.id}
              role="listitem"
              aria-label={unlock.title}
              aria-hidden={i !== activeIdx}
              className="flex-shrink-0 w-full snap-center px-5 pt-5 pb-4 flex flex-col items-center gap-2 text-center"
            >
              <span className="text-4xl" aria-hidden="true">{unlock.emoji}</span>
              <p className="text-white font-semibold text-sm">{unlock.title}</p>
              <span className="text-xs text-accent font-semibold bg-accent/10 px-3 py-0.5 rounded-full">
                ✓ Erreicht
              </span>
            </div>
          ))}
        </div>

        {achieved.length > 1 && (
          <div className="flex justify-center gap-1.5 pb-3" aria-hidden="true">
            {achieved.map((_, i) => (
              <div
                key={i}
                className={`rounded-full transition-all duration-200 ${
                  i === activeIdx ? 'w-4 h-1.5 bg-accent' : 'w-1.5 h-1.5 bg-white/20'
                }`}
              />
            ))}
          </div>
        )}
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

      {achieved.length > 0 && <AchievedCarousel achieved={achieved} />}
    </section>
  );
}
