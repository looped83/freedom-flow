import { useState } from 'react';
import type { Milestone, MilestoneIconName } from '../../types';
import { newId, parseGerman } from '../../utils/formatting';
import { useAmountInput } from '../../hooks/useAmountInput';
import { ICON_LABELS, MILESTONE_ICONS, MilestoneIcon } from './MilestoneIcon';

interface MilestoneFormProps {
  initial?: Milestone;
  onSave: (m: Milestone) => void;
  onCancel: () => void;
}

export function MilestoneForm({ initial, onSave, onCancel }: MilestoneFormProps) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const amount = useAmountInput(initial?.type === 'dividend' ? initial.dividendTarget : undefined);
  const [icon, setIcon] = useState<MilestoneIconName>(initial?.icon ?? 'trophy');
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = 'Titel ist erforderlich.';
    const amt = parseGerman(amount.value);
    if (isNaN(amt) || amt <= 0) e.dividendTarget = 'Bitte einen gültigen Betrag > 0 eingeben.';
    return e;
  }

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    const saved: Milestone = {
      id: initial?.id ?? newId(),
      title: title.trim(),
      icon,
      type: 'dividend',
      dividendTarget: parseGerman(amount.value),
    };
    onSave(saved);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate aria-label={initial ? 'Meilenstein bearbeiten' : 'Neuer Meilenstein'}>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="milestone-title" className="block text-xs text-white/70 mb-1">Titel</label>
          <input
            id="milestone-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="z. B. Miete gedeckt"
            className="w-full bg-surface-2 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/55 focus:outline-none focus:border-accent text-sm"
            aria-describedby={errors.title ? 'milestone-title-error' : undefined}
            aria-invalid={!!errors.title}
          />
          {errors.title && (
            <p id="milestone-title-error" role="alert" className="text-xs text-red-400 mt-1">{errors.title}</p>
          )}
        </div>

        <div>
          <label htmlFor="milestone-amount" className="block text-xs text-white/70 mb-1">
            Monatliche Dividende
          </label>
          <div className="relative">
            <input
              ref={amount.ref}
              id="milestone-amount"
              type="text"
              inputMode="decimal"
              value={amount.value}
              onChange={amount.onChange}
              placeholder="z. B. 1.500,00"
              className="w-full bg-surface-2 border border-white/10 rounded-lg px-3 py-2 pr-7 text-white placeholder-white/55 focus:outline-none focus:border-accent text-sm"
              aria-describedby={errors.dividendTarget ? 'milestone-amount-error' : undefined}
              aria-invalid={!!errors.dividendTarget}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-white/30 pointer-events-none">€</span>
          </div>
          {errors.dividendTarget && (
            <p id="milestone-amount-error" role="alert" className="text-xs text-red-400 mt-1">{errors.dividendTarget}</p>
          )}
        </div>
      </div>

      <div>
        <p className="text-xs text-white/70 mb-2">Symbol</p>
        <div
          className="grid grid-cols-5 gap-1.5 p-3 bg-surface-2 rounded-xl border border-white/10"
          role="group"
          aria-label="Symbol auswählen"
        >
          {MILESTONE_ICONS.map((ic) => (
            <button
              key={ic}
              type="button"
              onClick={() => setIcon(ic)}
              aria-pressed={icon === ic}
              aria-label={ICON_LABELS[ic]}
              className={`flex items-center justify-center p-2 rounded-lg transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent ${
                icon === ic
                  ? 'bg-accent/20 text-accent ring-1 ring-accent'
                  : 'text-white/55 hover:bg-white/10 hover:text-white/80'
              }`}
            >
              <MilestoneIcon icon={ic} className="w-5 h-5" />
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          className="flex-1 bg-accent text-surface font-semibold py-2 rounded-lg hover:bg-accent-dim transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent text-sm"
        >
          {initial ? 'Speichern' : 'Meilenstein hinzufügen'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-white/65 hover:text-white/90 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent rounded-lg text-sm"
        >
          Abbrechen
        </button>
      </div>
    </form>
  );
}
