import { useState } from 'react';
import type { Goal, GoalCategory } from '../../types';

const CATEGORIES: GoalCategory[] = [
  'Wohnen', 'Kommunikation', 'Versicherungen', 'Ernährung', 'Gesundheit', 'Freizeit', 'Sonstiges',
];

const EMOJIS = ['🏠','⚡','🌐','📺','📱','🛡️','🐕','☁️','🎵','📊','🚴','💪','🛒','🧴','🦴','🩺','✂️','✈️','🎁','🛋️','👕','🎮','🦷','💡','🚗','🍔','🎬','📚'];

interface GoalFormProps {
  initial?: Goal;
  onSave: (goal: Goal) => void;
  onCancel: () => void;
}

function newId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function GoalForm({ initial, onSave, onCancel }: GoalFormProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [amount, setAmount] = useState(initial ? String(initial.monthlyAmount) : '');
  const [category, setCategory] = useState<GoalCategory>(initial?.category ?? 'Sonstiges');
  const [emoji, setEmoji] = useState(initial?.emoji ?? '🎯');
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Name ist erforderlich.';
    const amt = parseFloat(amount.replace(',', '.'));
    if (isNaN(amt) || amt <= 0) e.amount = 'Bitte einen gültigen Betrag > 0 eingeben.';
    return e;
  }

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    onSave({
      id: initial?.id ?? newId(),
      name: name.trim(),
      monthlyAmount: parseFloat(amount.replace(',', '.')),
      category,
      emoji,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate aria-label={initial ? 'Ziel bearbeiten' : 'Neues Ziel'}>
      <div>
        <label htmlFor="goal-name" className="block text-xs text-white/50 mb-1">Name</label>
        <input
          id="goal-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="z. B. Fitnessstudio"
          className="w-full bg-surface-2 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:border-accent text-sm"
          aria-describedby={errors.name ? 'goal-name-error' : undefined}
          aria-invalid={!!errors.name}
        />
        {errors.name && <p id="goal-name-error" role="alert" className="text-xs text-red-400 mt-1">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="goal-amount" className="block text-xs text-white/50 mb-1">Monatlicher Betrag (€)</label>
        <input
          id="goal-amount"
          type="text"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="z. B. 42,90"
          className="w-full bg-surface-2 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:border-accent text-sm"
          aria-describedby={errors.amount ? 'goal-amount-error' : undefined}
          aria-invalid={!!errors.amount}
        />
        {errors.amount && <p id="goal-amount-error" role="alert" className="text-xs text-red-400 mt-1">{errors.amount}</p>}
      </div>

      <div>
        <label htmlFor="goal-category" className="block text-xs text-white/50 mb-1">Kategorie</label>
        <select
          id="goal-category"
          value={category}
          onChange={(e) => setCategory(e.target.value as GoalCategory)}
          className="w-full bg-surface-2 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-accent text-sm"
        >
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div>
        <p className="text-xs text-white/50 mb-2">Emoji</p>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Emoji auswählen">
          {EMOJIS.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => setEmoji(e)}
              aria-pressed={emoji === e}
              aria-label={e}
              className={`text-xl p-1.5 rounded-lg transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent ${
                emoji === e ? 'bg-accent/20 ring-1 ring-accent' : 'hover:bg-white/10'
              }`}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

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
          className="px-4 py-2 text-white/50 hover:text-white/80 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent rounded-lg text-sm"
        >
          Abbrechen
        </button>
      </div>
    </form>
  );
}
