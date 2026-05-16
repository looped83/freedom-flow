import { useRef, useState } from 'react';
import type { GoalCategory, Unlock, UnlockType } from '../../types';
import { ProgressBar } from './ProgressBar';
import { CategoryIcon } from '../goals/CategoryIcon';

interface LifeUnlocksProps {
  unlocks: Unlock[];
}

function barColor(progressPct: number): string {
  if (progressPct >= 80) return 'bg-accent';
  if (progressPct >= 40) return 'bg-gold';
  return 'bg-white/30';
}

function UnlockIcon({ type, iconCategory, className = 'w-5 h-5' }: { type: UnlockType; iconCategory?: GoalCategory; className?: string }) {
  if (type === 'goal' && iconCategory) {
    return <CategoryIcon category={iconCategory} className={className} />;
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {type === 'income' && (
        <>
          <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
          <polyline points="16 7 22 7 22 13"/>
        </>
      )}
      {type === 'freedom' && (
        <>
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 9.9-1"/>
        </>
      )}
      {type === 'lifetime' && (
        <>
          <circle cx="12" cy="12" r="4"/>
          <line x1="12" y1="2" x2="12" y2="4"/>
          <line x1="12" y1="20" x2="12" y2="22"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          <line x1="2" y1="12" x2="4" y2="12"/>
          <line x1="20" y1="12" x2="22" y2="12"/>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </>
      )}
      {type === 'goal' && (
        <>
          <circle cx="12" cy="12" r="10"/>
          <circle cx="12" cy="12" r="6"/>
          <circle cx="12" cy="12" r="2"/>
        </>
      )}
    </svg>
  );
}

function UnlockCard({ unlock }: { unlock: Unlock }) {
  return (
    <div className="bg-surface-2 rounded-2xl p-4 flex gap-3 items-start">
      <span className="flex-shrink-0 mt-0.5 text-white/60">
        <UnlockIcon type={unlock.type} iconCategory={unlock.iconCategory} />
      </span>
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
                <span className="text-white/60">
                  <UnlockIcon type={unlock.type} iconCategory={unlock.iconCategory} className="w-7 h-7" />
                </span>
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
