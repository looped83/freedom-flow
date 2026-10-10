import type { ReactNode } from 'react';

/** Typography shared by every stat value (pair with a size + colour class). */
export const STAT_VALUE = 'block font-bold tabular-nums leading-none whitespace-nowrap';

interface StatTileProps {
  label: ReactNode;
  children: ReactNode;
}

/** Inset metric tile used inside cards (Hero, Live Flow, Setup). */
export function StatTile({ label, children }: StatTileProps) {
  return (
    <div className="min-w-0 rounded-xl bg-white/5 p-3">
      <p className="mb-1.5 truncate text-xs text-white/70">{label}</p>
      {children}
    </div>
  );
}
