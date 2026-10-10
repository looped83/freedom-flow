import { useState, type ReactNode } from 'react';
import { IconClose } from './Icons';

interface ConfirmButtonProps {
  /** Idle content (text or icon). */
  children: ReactNode;
  /** Accessible name of the idle button, required when `children` is an icon. */
  ariaLabel?: string;
  confirmLabel: string;
  onConfirm: () => void;
  className?: string;
}

/** Two-step destructive action: first tap arms, second tap confirms.
 *  Replaces native confirm() dialogs and per-row confirm states. */
export function ConfirmButton({ children, ariaLabel, confirmLabel, onConfirm, className = '' }: ConfirmButtonProps) {
  const [armed, setArmed] = useState(false);

  if (!armed) {
    return (
      <button
        type="button"
        onClick={() => setArmed(true)}
        aria-label={ariaLabel}
        className={`rounded-lg px-3 py-2 text-sm text-white/50 transition-colors hover:text-red-400 ${className}`}
      >
        {children}
      </button>
    );
  }

  return (
    <span className="inline-flex items-center gap-1">
      <button
        type="button"
        onClick={onConfirm}
        autoFocus
        className="rounded-lg bg-red-500 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-400"
      >
        {confirmLabel}
      </button>
      <button
        type="button"
        onClick={() => setArmed(false)}
        aria-label="Abbrechen"
        className="rounded-lg p-2 text-white/50 transition-colors hover:text-white"
      >
        <IconClose className="w-4 h-4" />
      </button>
    </span>
  );
}
