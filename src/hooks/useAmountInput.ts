import { useRef, useState } from 'react';
import { liveFormatAmount } from '../utils/formatting';

/**
 * Controlled text input for German-formatted numbers. With `live` (default)
 * thousand separators are inserted while typing and the caret is moved so
 * the count of typed characters before it stays stable.
 */
export function useAmountInput(initial = '', { live = true }: { live?: boolean } = {}) {
  const [value, setValue] = useState(initial);
  const ref = useRef<HTMLInputElement>(null);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.target;
    if (!live) {
      setValue(input.value);
      return;
    }
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
      ref.current.setSelectionRange(i, i);
    });
  }

  return { value, setValue, ref, onChange };
}

export type AmountInput = ReturnType<typeof useAmountInput>;
