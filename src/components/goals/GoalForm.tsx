import { useRef, useState } from 'react';
import type { Goal, GoalCategory } from '../../types';
import { liveFormatAmount, parseGerman } from '../../utils/formatting';

const CATEGORIES: GoalCategory[] = [
  'Wohnen', 'Nebenkosten', 'Mobilität',
  'Ernährung', 'Restaurant',
  'Gesundheit', 'Sport', 'Körperpflege',
  'Kleidung', 'Haustiere', 'Freizeit', 'Urlaub',
  'Kommunikation', 'Streaming', 'Bildung',
  'Versicherungen', 'Sonstiges',
];

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

const fmt2 = new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

interface GoalFormProps {
  initial?: Goal;
  onSave: (goal: Goal) => void;
  onSaveAsDefault?: (goal: Goal) => void;
  onCancel: () => void;
}

function newId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function GoalForm({ initial, onSave, onSaveAsDefault, onCancel }: GoalFormProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [amount, setAmount] = useState(initial ? fmt2.format(initial.monthlyAmount) : '');
  const [category, setCategory] = useState<GoalCategory>(initial?.category ?? 'Sonstiges');
  const amountRef = useRef<HTMLInputElement>(null);

  function handleAmountChange(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.target;
    const cursorPos = input.selectionStart ?? input.value.length;
    const raw = input.value;
    const formatted = liveFormatAmount(raw);
    setAmount(formatted);
    // Restore cursor: count non-dot chars before cursor in old value,
    // then position after the same count in the formatted string.
    const charsBeforeCursor = raw.slice(0, cursorPos).replace(/\./g, '').length;
    requestAnimationFrame(() => {
      if (!amountRef.current) return;
      let i = 0;
      let count = 0;
      for (; i < formatted.length && count < charsBeforeCursor; i++) {
        if (formatted[i] !== '.') count++;
      }
      amountRef.current.selectionStart = i;
      amountRef.current.selectionEnd = i;
    });
  }
  const [emoji, setEmoji] = useState(initial?.emoji ?? '🎯');
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [saveAsDefault, setSaveAsDefault] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedName = EMOJI_OPTIONS.find((o) => o.emoji === emoji)?.name ?? 'Emoji';

  function validate() {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Name ist erforderlich.';
    const amt = parseGerman(amount);
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
      monthlyAmount: parseGerman(amount),
      category,
      emoji,
    };
    onSave(saved);
    if (saveAsDefault && onSaveAsDefault) onSaveAsDefault(saved);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate aria-label={initial ? 'Ziel bearbeiten' : 'Neues Ziel'}>
      <div>
        <label htmlFor="goal-name" className="block text-xs text-white/70 mb-1">Name</label>
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
          Monatlicher Betrag (€)
        </label>
        <input
          ref={amountRef}
          id="goal-amount"
          type="text"
          inputMode="decimal"
          value={amount}
          onChange={handleAmountChange}
          placeholder="z. B. 42,90"
          className="w-full bg-surface-2 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/55 focus:outline-none focus:border-accent text-sm"
          aria-describedby={errors.amount ? 'goal-amount-error' : undefined}
          aria-invalid={!!errors.amount}
        />
        {errors.amount && (
          <p id="goal-amount-error" role="alert" className="text-xs text-red-400 mt-1">{errors.amount}</p>
        )}
      </div>

      <div>
        <label htmlFor="goal-category" className="block text-xs text-white/70 mb-1">Kategorie</label>
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
        <p className="text-xs text-white/70 mb-2" id="emoji-picker-label">Symbol</p>
        <button
          type="button"
          onClick={() => setEmojiPickerOpen((o) => !o)}
          aria-label={`Symbol auswählen, aktuell: ${selectedName}`}
          aria-expanded={emojiPickerOpen}
          aria-controls="emoji-picker-panel"
          className="flex items-center gap-2 text-sm bg-surface-2 border border-white/10 rounded-lg px-3 py-2 text-white hover:border-accent/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent transition-colors"
        >
          <span aria-hidden="true">{emoji}</span>
          <span>{selectedName}</span>
          <span className="ml-auto text-white/55" aria-hidden="true">{emojiPickerOpen ? '▲' : '▼'}</span>
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
                onClick={() => { setEmoji(e); setEmojiPickerOpen(false); }}
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
