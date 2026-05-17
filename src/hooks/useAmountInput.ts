import { useRef, useState } from 'react';
import { formatDecimal, liveFormatAmount } from '../utils/formatting';

/**
 * Hook for a German-formatted decimal input that preserves caret position
 * while inserting thousand separators on the fly.
 *
 * Initial state is the formatted value of `initial` (e.g. "42,90"). On every
 * change the visible string is reformatted and the caret is repositioned so
 * that typed-character-count stays stable.
 */
export function useAmountInput(initial?: number) {
  const [value, setValue] = useState(initial != null ? formatDecimal(initial) : '');
  const ref = useRef<HTMLInputElement>(null);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.target;
    const cursorPos = input.selectionStart ?? input.value.length;
    const raw = input.value;
    const formatted = liveFormatAmount(raw);
    setValue(formatted);

    // Count typed (non-separator) characters before the caret, then advance
    // through the formatted string skipping over inserted dots.
    const charsBeforeCursor = raw.slice(0, cursorPos).replace(/\./g, '').length;
    requestAnimationFrame(() => {
      if (!ref.current) return;
      let i = 0;
      let count = 0;
      for (; i < formatted.length && count < charsBeforeCursor; i++) {
        if (formatted[i] !== '.') count++;
      }
      ref.current.selectionStart = i;
      ref.current.selectionEnd = i;
    });
  }

  return { value, setValue, ref, onChange };
}
