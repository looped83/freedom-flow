import { useState } from 'react';
import type { Goal, GoalCategory } from '../../types';
import { newId, parseGerman } from '../../utils/formatting';
import { useAmountInput } from '../../hooks/useAmountInput';
import { CategoryIcon } from './CategoryIcon';

const CATEGORIES: GoalCategory[] = [
  'Wohnen', 'Nebenkosten', 'Mobilität', 'Auto',
  'Ernährung', 'Restaurant',
  'Gesundheit', 'Sport', 'Körperpflege',
  'Kleidung', 'Elektronik', 'Haustiere', 'Freizeit', 'Gaming', 'Geschenke', 'Urlaub',
  'Kommunikation', 'Streaming', 'Bildung',
  'Versicherungen',
  'Sonstiges',
];

interface GoalFormProps {
  initial?: Goal;
  onSave: (goal: Goal) => void;
  onSaveAsDefault?: (goal: Goal) => void;
  onCancel: () => void;
}

export function GoalForm({ initial, onSave, onSaveAsDefault, onCancel }: GoalFormProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const amount = useAmountInput(initial?.monthlyAmount);
  const [category, setCategory] = useState<GoalCategory>(initial?.category ?? 'Sonstiges');
  const [saveAsDefault, setSaveAsDefault] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Titel ist erforderlich.';
    const amt = parseGerman(amount.value);
    if (isNaN(amt) || amt <= 0) e.amount = 'Bitte einen gültigen Betrag > 0 eingeben.';
    return e;
  }

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    const saved: Goal = {
      id: initial?.id ?? newId(),
      name: name.trim(),
      monthlyAmount: parseGerman(amount.value),
      category,
    };
    onSave(saved);
    if (saveAsDefault && onSaveAsDefault) onSaveAsDefault(saved);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate aria-label={initial ? 'Ziel bearbeiten' : 'Neues Ziel'}>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="goal-name" className="block text-xs text-white/70 mb-1">Titel</label>
          <input
            id="goal-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="z. B. Fitnessstudio"
            className="w-full bg-surface-2 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/55 focus:outline-none focus:border-accent text-sm"
            aria-describedby={errors.name ? 'goal-name-error' : undefined}
            aria-invalid={!!errors.name}
          />
          {errors.name && (
            <p id="goal-name-error" role="alert" className="text-xs text-red-400 mt-1">{errors.name}</p>
          )}
        </div>

        <div>
          <label htmlFor="goal-amount" className="block text-xs text-white/70 mb-1">
            Monatlicher Betrag
          </label>
          <div className="relative">
            <input
              ref={amount.ref}
              id="goal-amount"
              type="text"
              inputMode="decimal"
              value={amount.value}
              onChange={amount.onChange}
              placeholder="z. B. 42,90"
              className="w-full bg-surface-2 border border-white/10 rounded-lg px-3 py-2 pr-7 text-white placeholder-white/55 focus:outline-none focus:border-accent text-sm"
              aria-describedby={errors.amount ? 'goal-amount-error' : undefined}
              aria-invalid={!!errors.amount}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-white/30 pointer-events-none">€</span>
          </div>
          {errors.amount && (
            <p id="goal-amount-error" role="alert" className="text-xs text-red-400 mt-1">{errors.amount}</p>
          )}
        </div>
      </div>

      <div>
        <p className="text-xs text-white/70 mb-2">Symbol & Kategorie</p>
        <div
          className="grid grid-cols-3 gap-1.5 p-3 bg-surface-2 rounded-xl border border-white/10"
          role="group"
          aria-label="Kategorie auswählen"
        >
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              aria-pressed={category === cat}
              aria-label={cat}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg text-center transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent ${
                category === cat
                  ? 'bg-accent/20 text-accent ring-1 ring-accent'
                  : 'text-white/55 hover:bg-white/10 hover:text-white/80'
              }`}
            >
              <CategoryIcon category={cat} className="w-5 h-5 flex-shrink-0" />
              <span className="text-[10px] leading-tight">{cat}</span>
            </button>
          ))}
        </div>
      </div>

      {initial && onSaveAsDefault && (
        <label className="flex items-center gap-2.5 text-sm text-white/65 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={saveAsDefault}
            onChange={(e) => setSaveAsDefault(e.target.checked)}
            className="accent-accent w-4 h-4 rounded"
          />
          Als Standard hinterlegen
        </label>
      )}

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          className="flex-1 bg-accent text-surface font-semibold py-2 rounded-lg hover:bg-accent-dim transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent text-sm"
        >
          {initial ? 'Speichern' : 'Ziel hinzufügen'}
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
