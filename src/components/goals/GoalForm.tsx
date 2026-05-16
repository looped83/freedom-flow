import { useState } from 'react';
import type { Goal, GoalCategory } from '../../types';

const CATEGORIES: GoalCategory[] = [
  'Wohnen', 'Kommunikation', 'Versicherungen', 'Ernährung', 'Gesundheit', 'Freizeit', 'Sonstiges',
];

// Descriptive names required for accessible labels
const EMOJI_OPTIONS: { emoji: string; name: string }[] = [
  { emoji: '🏠', name: 'Haus' },
  { emoji: '⚡', name: 'Strom' },
  { emoji: '🌐', name: 'Internet' },
  { emoji: '📺', name: 'Fernseher' },
  { emoji: '📱', name: 'Handy' },
  { emoji: '🛡️', name: 'Schutzschild' },
  { emoji: '🐕', name: 'Hund' },
  { emoji: '☁️', name: 'Cloud' },
  { emoji: '🎵', name: 'Musik' },
  { emoji: '📊', name: 'Diagramm' },
  { emoji: '🚴', name: 'Fahrrad' },
  { emoji: '💪', name: 'Fitness' },
  { emoji: '🛒', name: 'Einkaufswagen' },
  { emoji: '🧴', name: 'Drogerie' },
  { emoji: '🦴', name: 'Hundeknochen' },
  { emoji: '🩺', name: 'Arzt' },
  { emoji: '✂️', name: 'Friseur' },
  { emoji: '✈️', name: 'Flugzeug' },
  { emoji: '🎁', name: 'Geschenk' },
  { emoji: '🛋️', name: 'Sofa' },
  { emoji: '👕', name: 'Kleidung' },
  { emoji: '🎮', name: 'Gaming' },
  { emoji: '🦷', name: 'Zahnarzt' },
  { emoji: '💡', name: 'Idee' },
  { emoji: '🚗', name: 'Auto' },
  { emoji: '🍔', name: 'Essen' },
  { emoji: '🎬', name: 'Kino' },
  { emoji: '📚', name: 'Bücher' },
];

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
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedName = EMOJI_OPTIONS.find((o) => o.emoji === emoji)?.name ?? 'Emoji';

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
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    onSave({
      id: initial?.id ?? newId(),
      name: name.trim(),
      monthlyAmount: parseFloat(amount.replace(',', '.')),
      category,
      emoji,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
      noValidate
      aria-label={initial ? 'Ziel bearbeiten' : 'Neues Ziel'}
    >
      <div>
        <label htmlFor="goal-name" className="block text-xs text-white/70 mb-1">
          Name
        </label>
        <input
          id="goal-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="z. B. Fitnessstudio"
          className="w-full bg-surface-2 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/35 focus:outline-none focus:border-accent text-sm"
          aria-describedby={errors.name ? 'goal-name-error' : undefined}
          aria-invalid={!!errors.name}
        />
        {errors.name && (
          <p id="goal-name-error" role="alert" className="text-xs text-red-400 mt-1">
            {errors.name}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="goal-amount" className="block text-xs text-white/70 mb-1">
          Monatlicher Betrag (€)
        </label>
        <input
          id="goal-amount"
          type="text"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="z. B. 42,90"
          className="w-full bg-surface-2 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/35 focus:outline-none focus:border-accent text-sm"
          aria-describedby={errors.amount ? 'goal-amount-error' : undefined}
          aria-invalid={!!errors.amount}
        />
        {errors.amount && (
          <p id="goal-amount-error" role="alert" className="text-xs text-red-400 mt-1">
            {errors.amount}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="goal-category" className="block text-xs text-white/70 mb-1">
          Kategorie
        </label>
        <select
          id="goal-category"
          value={category}
          onChange={(e) => setCategory(e.target.value as GoalCategory)}
          className="w-full bg-surface-2 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-accent text-sm"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Emoji picker – toggled to keep initial DOM lean */}
      <div>
        <p className="text-xs text-white/70 mb-2" id="emoji-picker-label">
          Symbol
        </p>
        <button
          type="button"
          onClick={() => setEmojiPickerOpen((o) => !o)}
          aria-expanded={emojiPickerOpen}
          aria-controls="emoji-picker-panel"
          aria-describedby="emoji-picker-label"
          className="flex items-center gap-2 text-sm bg-surface-2 border border-white/10 rounded-lg px-3 py-2 text-white hover:border-accent/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent transition-colors"
        >
          <span aria-hidden="true">{emoji}</span>
          <span>{selectedName}</span>
          <span className="ml-auto text-white/55" aria-hidden="true">
            {emojiPickerOpen ? '▲' : '▼'}
          </span>
        </button>

        {emojiPickerOpen && (
          <div
            id="emoji-picker-panel"
            role="group"
            aria-label="Symbol auswählen"
            className="flex flex-wrap gap-2 mt-2 p-3 bg-surface-2 rounded-xl border border-white/10"
          >
            {EMOJI_OPTIONS.map(({ emoji: e, name: n }) => (
              <button
                key={e}
                type="button"
                onClick={() => {
                  setEmoji(e);
                  setEmojiPickerOpen(false);
                }}
                aria-pressed={emoji === e}
                aria-label={n}
                title={n}
                className={`text-xl p-1.5 rounded-lg transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent ${
                  emoji === e ? 'bg-accent/20 ring-1 ring-accent' : 'hover:bg-white/10'
                }`}
              >
                <span aria-hidden="true">{e}</span>
              </button>
            ))}
          </div>
        )}
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
          className="px-4 py-2 text-white/65 hover:text-white/90 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent rounded-lg text-sm"
        >
          Abbrechen
        </button>
      </div>
    </form>
  );
}
