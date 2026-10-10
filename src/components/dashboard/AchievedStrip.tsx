import type { ReactNode } from 'react';
import { IconCheckCircle } from '../ui/Icons';

export interface AchievedItem {
  id: string;
  title: string;
  icon: ReactNode;
}

/** All achieved entries as one horizontally scrollable chip row. */
export function AchievedStrip({ items }: { items: AchievedItem[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-white/70">
        <IconCheckCircle className="w-3.5 h-3.5 text-accent" />
        Erreicht
        <span className="font-normal tabular-nums text-white/50">{items.length}</span>
      </h3>
      <ul className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:-mx-5 sm:px-5" aria-label="Erreicht">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex flex-shrink-0 items-center gap-1.5 rounded-full bg-accent/10 py-1 pl-2 pr-3 text-xs text-white/70"
          >
            <span className="text-accent">{item.icon}</span>
            {item.title}
          </li>
        ))}
      </ul>
    </div>
  );
}
