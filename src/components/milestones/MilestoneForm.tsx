import { useState } from 'react';
import type { Milestone, MilestoneIconName, MilestoneType } from '../../types';
import { newId, parseGerman } from '../../utils/formatting';
import { useAmountInput } from '../../hooks/useAmountInput';
import { ICON_LABELS, MILESTONE_ICONS, MilestoneIcon } from './MilestoneIcon';

interface MilestoneFormProps {
  initial?: Milestone;
  onSave: (m: Milestone) => void;
  onCancel: () => void;
}

type DurationUnit = 'months' | 'years';

function dateFromDuration(value: number, unit: DurationUnit): string {
  const d = new Date();
  if (unit === 'years') d.setFullYear(d.getFullYear() + value);
  else d.setMonth(d.getMonth() + value);
  return d.toISOString().slice(0, 10);
}

function initDuration(iso: string | undefined): { value: string; unit: DurationUnit } {
  if (!iso) return { value: '', unit: 'months' };
  const target = new Date(iso);
  const today = new Date();
  const months = (target.getFullYear() - today.getFullYear()) * 12 + (target.getMonth() - today.getMonth());
  if (months > 0 && months % 12 === 0) return { value: String(months / 12), unit: 'years' };
  return { value: String(Math.max(1, months)), unit: 'months' };
}

export function MilestoneForm({ initial, onSave, onCancel }: MilestoneFormProps) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [type, setType] = useState<MilestoneType>(initial?.type ?? 'dividend');
  const amount = useAmountInput(initial?.type === 'dividend' ? initial.dividendTarget : undefined);
  const initDur = initDuration(initial?.type === 'date' ? initial.dateTarget : undefined);
  const [duration, setDuration] = useState(initDur.value);
  const [durationUnit, setDurationUnit] = useState<DurationUnit>(initDur.unit);
  const [icon, setIcon] = useState<MilestoneIconName>(initial?.icon ?? 'trophy');
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = 'Titel ist erforderlich.';
    if (type === 'dividend') {
      const amt = parseGerman(amount.value);
      if (isNaN(amt) || amt <= 0) e.dividendTarget = 'Bitte einen gültigen Betrag > 0 eingeben.';
    } else {
      const n = parseInt(duration, 10);
      if (isNaN(n) || n <= 0) e.dateTarget = 'Bitte einen Zeitraum > 0 eingeben.';
    }
    return e;
  }

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    const base = { id: initial?.id ?? newId(), title: title.trim(), icon };
    const saved: Milestone = type === 'dividend'
      ? { ...base, type: 'dividend', dividendTarget: parseGerman(amount.value) }
      : { ...base, type: 'date', dateTarget: dateFromDuration(parseInt(duration, 10), durationUnit) };
    onSave(saved);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate aria-label={initial ? 'Meilenstein bearbeiten' : 'Neuer Meilenstein'}>
      <div className={type === 'dividend' ? 'grid grid-cols-2 gap-3' : ''}>
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

        {type === 'dividend' && (
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
        )}
      </div>

      <div>
        <p className="text-xs text-white/70 mb-2">Ziel</p>
        <div className="flex rounded-lg overflow-hidden border border-white/10" role="group" aria-label="Ziel">
          <button
            type="button"
            onClick={() => setType('dividend')}
            aria-pressed={type === 'dividend'}
            className={`flex-1 text-xs px-3 py-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent ${
              type === 'dividend' ? 'bg-accent/20 text-accent font-semibold' : 'text-white/55 hover:text-white/80'
            }`}
          >
            Dividende
          </button>
          <button
            type="button"
            onClick={() => setType('date')}
            aria-pressed={type === 'date'}
            className={`flex-1 text-xs px-3 py-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent ${
              type === 'date' ? 'bg-accent/20 text-accent font-semibold' : 'text-white/55 hover:text-white/80'
            }`}
          >
            Zeit
          </button>
        </div>
      </div>

      {type === 'date' && (
        <div>
          <label htmlFor="milestone-duration" className="block text-xs text-white/70 mb-1">Zeitraum</label>
          <div className="flex gap-2">
            <input
              id="milestone-duration"
              type="number"
              inputMode="numeric"
              min="1"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="z. B. 6"
              className="flex-1 bg-surface-2 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/55 focus:outline-none focus:border-accent text-sm"
              aria-describedby={errors.dateTarget ? 'milestone-duration-error' : undefined}
              aria-invalid={!!errors.dateTarget}
            />
            <div className="flex rounded-lg overflow-hidden border border-white/10" role="group" aria-label="Einheit">
              {(['months', 'years'] as DurationUnit[]).map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setDurationUnit(u)}
                  aria-pressed={durationUnit === u}
                  className={`px-3 py-2 text-xs transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent ${
                    durationUnit === u ? 'bg-accent/20 text-accent font-semibold' : 'text-white/55 hover:text-white/80'
                  }`}
                >
                  {u === 'months' ? 'Monate' : 'Jahre'}
                </button>
              ))}
            </div>
          </div>
          {errors.dateTarget && (
            <p id="milestone-duration-error" role="alert" className="text-xs text-red-400 mt-1">{errors.dateTarget}</p>
          )}
        </div>
      )}

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
