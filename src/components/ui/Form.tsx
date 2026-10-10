import type { ReactNode } from 'react';
import type { AmountInput } from '../../hooks/useAmountInput';
import { ConfirmButton } from './ConfirmButton';
import { IconTrash } from './Icons';

const INPUT_CLASS =
  'w-full rounded-lg border border-white/10 bg-surface-2 px-3 py-2 text-sm text-white placeholder-white/50 ' +
  'focus:border-accent focus:outline-none aria-[invalid=true]:border-red-400';

interface FieldProps {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
}

function Field({ id, label, error, children }: FieldProps) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="mb-1 block text-xs text-white/70">{label}</label>
      {children}
      {error && <p id={`${id}-error`} role="alert" className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}

function a11y(id: string, error?: string) {
  return { id, 'aria-invalid': !!error, 'aria-describedby': error ? `${id}-error` : undefined };
}

interface TextFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
}

export function TextField({ id, label, value, onChange, placeholder, error }: TextFieldProps) {
  return (
    <Field id={id} label={label} error={error}>
      <input
        {...a11y(id, error)}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={INPUT_CLASS}
      />
    </Field>
  );
}

interface AmountFieldProps {
  id: string;
  label: string;
  amount: AmountInput;
  placeholder?: string;
  error?: string;
}

export function AmountField({ id, label, amount, placeholder, error }: AmountFieldProps) {
  return (
    <Field id={id} label={label} error={error}>
      <div className="relative">
        <input
          {...a11y(id, error)}
          ref={amount.ref}
          type="text"
          inputMode="decimal"
          value={amount.value}
          onChange={amount.onChange}
          placeholder={placeholder}
          className={`${INPUT_CLASS} pr-7`}
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-white/50">€</span>
      </div>
    </Field>
  );
}

interface FormActionsProps {
  submitLabel: string;
  onCancel: () => void;
  /** Shown only when editing an existing entry. */
  onDelete?: () => void;
  deleteLabel?: string;
}

export function FormActions({ submitLabel, onCancel, onDelete, deleteLabel }: FormActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="submit"
        className="flex-1 rounded-lg bg-accent py-2 text-sm font-semibold text-surface transition-colors hover:bg-accent-dim"
      >
        {submitLabel}
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="rounded-lg px-3 py-2 text-sm text-white/70 transition-colors hover:text-white"
      >
        Abbrechen
      </button>
      {onDelete && (
        <ConfirmButton ariaLabel={deleteLabel} confirmLabel="Löschen" onConfirm={onDelete} className="px-2">
          <IconTrash />
        </ConfirmButton>
      )}
    </div>
  );
}
