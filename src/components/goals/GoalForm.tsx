import { useId, useState } from 'react';
import type { Goal, GoalCategory } from '../../types';
import { GOAL_CATEGORIES } from '../../constants/defaultData';
import { formatDecimal, newId, parseGerman } from '../../utils/formatting';
import { useAmountInput } from '../../hooks/useAmountInput';
import { AmountField, FormActions, TextField } from '../ui/Form';
import { IconPicker } from '../ui/IconPicker';
import { CategoryIcon } from './CategoryIcon';

interface GoalFormProps {
  initial?: Goal;
  onSave: (goal: Goal) => void;
  onSaveAsDefault?: (goal: Goal) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

const categoryLabel = (c: GoalCategory) => c;

export function GoalForm({ initial, onSave, onSaveAsDefault, onCancel, onDelete }: GoalFormProps) {
  const id = useId();
  const [name, setName] = useState(initial?.name ?? '');
  const amount = useAmountInput(initial ? formatDecimal(initial.monthlyAmount) : '');
  const [category, setCategory] = useState<GoalCategory>(initial?.category ?? 'Sonstiges');
  const [saveAsDefault, setSaveAsDefault] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; amount?: string }>({});

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const amt = parseGerman(amount.value);
    const e = {
      name: name.trim() ? undefined : 'Titel ist erforderlich.',
      amount: amt > 0 ? undefined : 'Bitte einen gültigen Betrag > 0 eingeben.',
    };
    if (e.name || e.amount) { setErrors(e); return; }
    const saved: Goal = { id: initial?.id ?? newId(), name: name.trim(), monthlyAmount: amt, category };
    onSave(saved);
    if (saveAsDefault) onSaveAsDefault?.(saved);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4" aria-label={initial ? 'Ausgabe bearbeiten' : 'Neue Ausgabe'}>
      <div className="grid grid-cols-2 gap-3">
        <TextField id={`${id}-name`} label="Titel" value={name} onChange={setName} placeholder="z. B. Fitnessstudio" error={errors.name} />
        <AmountField id={`${id}-amount`} label="Monatlicher Betrag" amount={amount} placeholder="z. B. 42,90" error={errors.amount} />
      </div>

      <IconPicker
        label="Kategorie"
        options={GOAL_CATEGORIES}
        value={category}
        onChange={setCategory}
        getLabel={categoryLabel}
        renderIcon={(c) => <CategoryIcon category={c} />}
      />

      {initial && onSaveAsDefault && (
        <label className="flex cursor-pointer select-none items-center gap-2.5 text-sm text-white/70">
          <input
            type="checkbox"
            checked={saveAsDefault}
            onChange={(e) => setSaveAsDefault(e.target.checked)}
            className="h-4 w-4 rounded accent-accent"
          />
          Als Standard hinterlegen
        </label>
      )}

      <FormActions
        submitLabel={initial ? 'Speichern' : 'Ausgabe hinzufügen'}
        onCancel={onCancel}
        onDelete={onDelete}
        deleteLabel={initial ? `${initial.name} löschen` : undefined}
      />
    </form>
  );
}
