import { useId, useState } from 'react';
import type { Milestone, MilestoneIconName } from '../../types';
import { formatDecimal, newId, parseGerman } from '../../utils/formatting';
import { useAmountInput } from '../../hooks/useAmountInput';
import { AmountField, FormActions, TextField } from '../ui/Form';
import { IconPicker } from '../ui/IconPicker';
import { ICON_LABELS, MILESTONE_ICONS, MilestoneIcon } from './MilestoneIcon';

interface MilestoneFormProps {
  initial?: Milestone;
  onSave: (m: Milestone) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

const iconLabel = (ic: MilestoneIconName) => ICON_LABELS[ic];

export function MilestoneForm({ initial, onSave, onCancel, onDelete }: MilestoneFormProps) {
  const id = useId();
  const [title, setTitle] = useState(initial?.title ?? '');
  const amount = useAmountInput(initial?.dividendTarget != null ? formatDecimal(initial.dividendTarget) : '');
  const [icon, setIcon] = useState<MilestoneIconName>(initial?.icon ?? 'trophy');
  const [errors, setErrors] = useState<{ title?: string; amount?: string }>({});

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const amt = parseGerman(amount.value);
    const e = {
      title: title.trim() ? undefined : 'Titel ist erforderlich.',
      amount: amt > 0 ? undefined : 'Bitte einen gültigen Betrag > 0 eingeben.',
    };
    if (e.title || e.amount) { setErrors(e); return; }
    onSave({ id: initial?.id ?? newId(), title: title.trim(), icon, type: 'dividend', dividendTarget: amt });
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4" aria-label={initial ? 'Meilenstein bearbeiten' : 'Neuer Meilenstein'}>
      <div className="grid grid-cols-2 gap-3">
        <TextField id={`${id}-title`} label="Titel" value={title} onChange={setTitle} placeholder="z. B. Miete gedeckt" error={errors.title} />
        <AmountField id={`${id}-amount`} label="Monatliche Dividende" amount={amount} placeholder="z. B. 1.500,00" error={errors.amount} />
      </div>

      <IconPicker
        label="Symbol"
        options={MILESTONE_ICONS}
        value={icon}
        onChange={setIcon}
        getLabel={iconLabel}
        renderIcon={(ic) => <MilestoneIcon icon={ic} />}
      />

      <FormActions
        submitLabel={initial ? 'Speichern' : 'Meilenstein hinzufügen'}
        onCancel={onCancel}
        onDelete={onDelete}
        deleteLabel={initial ? `${initial.title} löschen` : undefined}
      />
    </form>
  );
}
