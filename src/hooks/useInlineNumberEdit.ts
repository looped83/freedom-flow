import { useRef, useState } from 'react';
import { formatDecimal, liveFormatAmount, parseGerman } from '../utils/formatting';

/**
 * Click-to-edit inline numeric field. The display is a plain button; once
 * activated it swaps to a text input pre-filled with the current value
 * formatted to two German decimal places. Commits on blur (or Enter) and
 * reverts on Escape. The commit callback receives a German-parsed number;
 * invalid or negative input is silently rejected (or clamped to `min`).
 */
export function useInlineNumberEdit(
  currentValue: number,
  onCommit: (v: number) => void,
  { min }: { min?: number } = {},
) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(false);
  const [raw, setRaw] = useState('');

  function startEdit() {
    setRaw(formatDecimal(currentValue));
    setEditing(true);
    requestAnimationFrame(() => inputRef.current?.select());
  }

  function handleChange(value: string) {
    setRaw(liveFormatAmount(value));
  }

  function commit(value: string) {
    const parsed = parseGerman(value);
    let effective: number | null = null;
    if (!isNaN(parsed) && parsed >= 0) {
      effective = min != null ? Math.max(min, parsed) : parsed;
    } else if (min != null) {
      effective = min;
    }
    if (effective != null) onCommit(effective);
    setEditing(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') e.currentTarget.blur();
    else if (e.key === 'Escape') setEditing(false);
  }

  return { editing, raw, setRaw: handleChange, inputRef, startEdit, commit, handleKeyDown };
}

