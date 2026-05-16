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
          <span className="text-xs text-gold font-bold flex-shrink-0 tabular-nums">
            {unlock.progressPct.toFixed(0)} %
          </span>
        </div>
        <p className="text-xs text-white/50 mb-2">{unlock.subtitle}</p>
        <ProgressBar
          percent={unlock.progressPct}
          label={`${unlock.title}: ${unlock.progressPct.toFixed(0)} % erreicht`}
          colorClass={barColor(unlock.progressPct)}
        />
      </div>
    </div>
  );
}

function chunks<T>(arr: T[], n: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += n) result.push(arr.slice(i, i + n));
  return result;
}

function AchievedCarousel({ achieved }: { achieved: Unlock[] }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const slides = chunks(achieved, 2);

  function handleScroll() {
    const el = scrollRef.current;
    if (!el || el.offsetWidth === 0) return;
    setActiveIdx(Math.round(el.scrollLeft / el.offsetWidth));
  }

  return (
    <div>
      <h3 className="text-sm font-semibold text-white mb-2 px-1">Erreichte Meilensteine</h3>
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto no-scrollbar snap-x snap-mandatory"
        role="list"
        aria-label="Erreichte Meilensteine"
      >
        {slides.map((pair, slideIdx) => (
          <div
            key={slideIdx}
            className="flex-shrink-0 w-full snap-center grid grid-cols-2 gap-3 px-0.5 py-0.5"
            aria-hidden={slideIdx !== activeIdx}
          >
            {pair.map((unlock) => (
              <div
                key={unlock.id}
                role="listitem"
                aria-label={unlock.title}
                className="bg-surface-2 rounded-2xl p-3 flex flex-col items-center gap-1.5 text-center"
              >
                <span className="text-3xl" aria-hidden="true">{unlock.emoji}</span>
                <p className="text-white/80 font-medium text-xs leading-tight">{unlock.title}</p>
                <span className="text-[10px] text-accent font-semibold bg-accent/10 px-2 py-0.5 rounded-full">
                  ✓ Erreicht
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {slides.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-2" aria-hidden="true">
          {slides.map((_, si) => (
            <div
              key={si}
              className={`rounded-full transition-all duration-200 ${
                si === activeIdx ? 'w-4 h-1.5 bg-accent' : 'w-1.5 h-1.5 bg-white/20'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function LifeUnlocks({ unlocks }: LifeUnlocksProps) {
  const [showAll, setShowAll] = useState(false);

  const achieved = unlocks.filter((u) => u.achieved);
  const notAchieved = unlocks.filter((u) => !u.achieved);
  const visibleCards = showAll ? notAchieved : notAchieved.slice(0, 3);

  return (
    <section aria-label="Meilensteine" className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-sm font-semibold text-white">Meilensteine</h2>
        {notAchieved.length > 3 && (
          <button
            onClick={() => setShowAll((v) => !v)}
            aria-expanded={showAll}
            className={`text-xs px-3 py-1 rounded-lg border border-white/10 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent ${
              showAll
                ? 'bg-accent/20 text-accent font-semibold'
                : 'text-white/45 hover:text-white/70'
            }`}
          >
            {showAll ? '↑ Weniger' : `+${notAchieved.length - 3} weitere`}
          </button>
        )}
      </div>

      {visibleCards.length > 0 ? (
        <div className="space-y-2">
          {visibleCards.map((unlock) => (
            <UnlockCard key={unlock.id} unlock={unlock} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-white/55 px-1">Alle Meilensteine erreicht! 🎉</p>
      )}

      {achieved.length > 0 && <AchievedCarousel achieved={achieved} />}
    </section>
  );
}
