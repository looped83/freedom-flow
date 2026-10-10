import type { ReactNode } from 'react';

export interface SegmentOption<T extends string> {
  id: T;
  label: ReactNode;
  /** Accessible name when the visible label is not self-explanatory. */
  ariaLabel?: string;
}

interface SegmentedControlProps<T extends string> {
  options: readonly SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
}

export function SegmentedControl<T extends string>({ options, value, onChange, ariaLabel }: SegmentedControlProps<T>) {
  return (
    <div role="group" aria-label={ariaLabel} className="flex flex-shrink-0 rounded-lg overflow-hidden border border-white/10">
      {options.map((o) => {
        const active = o.id === value;
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            aria-pressed={active}
            aria-label={o.ariaLabel}
            className={`focus-inset text-xs px-3 py-1.5 whitespace-nowrap transition-colors ${
              active ? 'bg-accent/20 text-accent font-semibold' : 'text-white/50 hover:text-white'
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export type SortDir = 'asc' | 'desc';
export interface SortState<T extends string> {
  type: T;
  dir: SortDir;
}

interface SortControlProps<T extends string> {
  options: readonly { id: T; label: string; defaultDir: SortDir }[];
  value: SortState<T>;
  onChange: (value: SortState<T>) => void;
}

/** Segmented control where tapping the active option flips its direction. */
export function SortControl<T extends string>({ options, value, onChange }: SortControlProps<T>) {
  return (
    <SegmentedControl
      ariaLabel="Sortierung"
      value={value.type}
      options={options.map((o) => {
        if (o.id !== value.type) return { id: o.id, label: o.label };
        const asc = value.dir === 'asc';
        return {
          id: o.id,
          label: `${o.label} ${asc ? '↑' : '↓'}`,
          ariaLabel: `${o.label}, ${asc ? 'aufsteigend' : 'absteigend'}`,
        };
      })}
      onChange={(type) => {
        const opt = options.find((o) => o.id === type);
        onChange(type === value.type
          ? { type, dir: value.dir === 'asc' ? 'desc' : 'asc' }
          : { type, dir: opt?.defaultDir ?? 'asc' });
      }}
    />
  );
}
