import type { ReactNode } from 'react';

interface IconPickerProps<T extends string> {
  /** Legend, e.g. "Kategorie". The selected option's name follows it. */
  label: string;
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  getLabel: (value: T) => string;
  renderIcon: (value: T) => ReactNode;
}

/** Compact icon-only grid (7 columns). The selected name is shown in the
 *  legend, so labels don't have to repeat under every icon. */
export function IconPicker<T extends string>({ label, options, value, onChange, getLabel, renderIcon }: IconPickerProps<T>) {
  return (
    <fieldset>
      <legend className="mb-1 text-xs text-white/70">
        {label}: <span className="text-white">{getLabel(value)}</span>
      </legend>
      <div className="grid grid-cols-7 gap-1 rounded-xl border border-white/10 bg-surface-2 p-1.5">
        {options.map((o) => {
          const active = o === value;
          return (
            <button
              key={o}
              type="button"
              onClick={() => onChange(o)}
              aria-pressed={active}
              aria-label={getLabel(o)}
              title={getLabel(o)}
              className={`flex aspect-square items-center justify-center rounded-lg transition-colors ${
                active ? 'bg-accent/20 text-accent ring-1 ring-accent' : 'text-white/50 hover:bg-white/10 hover:text-white'
              }`}
            >
              {renderIcon(o)}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
