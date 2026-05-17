import { type ReactNode, useRef, useState } from 'react';

export interface AchievedItem {
  id: string;
  title: string;
  icon: ReactNode;
}

interface AchievedCarouselProps {
  heading: string;
  items: AchievedItem[];
  ariaLabel?: string;
}

function chunks<T>(arr: T[], n: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += n) result.push(arr.slice(i, i + n));
  return result;
}

export function AchievedCarousel({ heading, items, ariaLabel }: AchievedCarouselProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const slides = chunks(items, 2);

  function handleScroll() {
    const el = scrollRef.current;
    if (!el || el.offsetWidth === 0) return;
    setActiveIdx(Math.round(el.scrollLeft / el.offsetWidth));
  }

  if (items.length === 0) return null;

  return (
    <div>
      <h3 className="text-sm font-semibold text-white mb-2 px-1">{heading}</h3>
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto no-scrollbar snap-x snap-mandatory"
        role="list"
        aria-label={ariaLabel ?? heading}
      >
        {slides.map((pair, slideIdx) => (
          <div
            key={slideIdx}
            className="flex-shrink-0 w-full snap-center grid grid-cols-2 gap-3 px-0.5 py-0.5"
            aria-hidden={slideIdx !== activeIdx}
          >
            {pair.map((item) => (
              <div
                key={item.id}
                role="listitem"
                aria-label={item.title}
                className="bg-surface-2 rounded-2xl p-3 flex flex-col items-center gap-1.5 text-center"
              >
                <span className="text-accent">{item.icon}</span>
                <p className="text-white/80 font-medium text-xs leading-tight">{item.title}</p>
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
