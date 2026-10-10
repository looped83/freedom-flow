import { useEffect, useRef, useState } from 'react';
import { formatDecimal, formatEuro, formatNumber, formatPercent, parseGerman } from '../../utils/formatting';
import { useAmountInput } from '../../hooks/useAmountInput';

const KINDS = {
  euro:    { display: (v: number) => formatEuro(v),        edit: formatDecimal,                    step: 0.01, inputMode: 'decimal' },
  percent: { display: (v: number) => formatPercent(v),     edit: (v: number) => formatNumber(v, 1), step: 0.1,  inputMode: 'decimal' },
  integer: { display: (v: number) => String(Math.round(v)), edit: (v: number) => String(Math.round(v)), step: 1, inputMode: 'numeric' },
} as const;

interface EditableNumberProps {
  value: number;
  onCommit: (value: number) => void;
  kind: keyof typeof KINDS;
  /** Accessible name, e.g. "Monatliche Dividenden". */
  label: string;
  min?: number;
  max?: number;
  /** Committed values snap to this increment (default per kind). */
  step?: number;
  /** Shown after the value, e.g. "Jahre". */
  unit?: string;
  /** Size + colour of the value text. */
  className?: string;
}

/**
 * Tap-to-edit number. Shows the formatted value with a dotted underline as
 * edit affordance; tapping swaps in a text input. Enter/blur commits (snapped
 * and clamped to min/max), Escape or invalid input keeps the old value.
 */
export function EditableNumber({
  value, onCommit, kind, label, min = 0, max = Number.MAX_SAFE_INTEGER, step, unit, className = '',
}: EditableNumberProps) {
  const cfg = KINDS[kind];
  const input = useAmountInput('', { live: kind === 'euro' });
  const [editing, setEditing] = useState(false);
  const cancelled = useRef(false);
  const display = unit ? `${cfg.display(value)} ${unit}` : cfg.display(value);

  useEffect(() => {
    const el = input.ref.current;
    if (!editing || !el) return;
    el.focus();
    el.setSelectionRange(el.value.length, el.value.length);
  }, [editing, input.ref]);

  function start() {
    cancelled.current = false;
    input.setValue(cfg.edit(value));
    setEditing(true);
  }

  function commit() {
    setEditing(false);
    if (cancelled.current) return;
    const parsed = parseGerman(input.value);
    if (Number.isNaN(parsed)) return;
    const s = step ?? cfg.step;
    const next = parseFloat(Math.min(max, Math.max(min, Math.round(parsed / s) * s)).toFixed(10));
    if (next !== value) onCommit(next);
  }

  if (!editing) {
    return (
      <button
        type="button"
        onClick={start}
        aria-label={`${label}: ${display}, bearbeiten`}
        className={`rounded-sm text-left tabular-nums underline decoration-dotted decoration-white/30 underline-offset-4 transition-colors hover:decoration-white/70 ${className}`}
      >
        {display}
      </button>
    );
  }

  return (
    <input
      ref={input.ref}
      type="text"
      inputMode={cfg.inputMode}
      enterKeyHint="done"
      value={input.value}
      onChange={input.onChange}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') e.currentTarget.blur();
        else if (e.key === 'Escape') { cancelled.current = true; e.currentTarget.blur(); }
      }}
      aria-label={label}
      className={`w-full min-w-0 bg-transparent tabular-nums border-b border-accent focus:outline-none ${className}`}
    />
  );
}
