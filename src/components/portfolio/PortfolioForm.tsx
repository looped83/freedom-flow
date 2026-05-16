import { useState } from 'react';
import type { Portfolio } from '../../types';
import { formatEuro, parseGerman } from '../../utils/formatting';
import { annualDividends, monthlyDividends } from '../../utils/calculations';

const deDE = (decimals: number) =>
  new Intl.NumberFormat('de-DE', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

function formatFieldValue(value: number, unit: string): string {
  if (unit === '€') return deDE(0).format(value);
  if (unit === '%') return deDE(1).format(value);
  return String(value);
}

interface NumberFieldProps {
  fieldId: string;
  label: string;
  value: number;
  unit: '€' | '%' | 'Jahre';
  min: number;
  max: number;
  step: number;
  description: string;
  onChange: (v: number) => void;
}

function NumberField({ fieldId, label, value, unit, min, max, step, description, onChange }: NumberFieldProps) {
  const [raw, setRaw] = useState('');
  const [focused, setFocused] = useState(false);

  function handleFocus() {
    setFocused(true);
    setRaw(String(value).replace('.', ','));
  }

  function commit(input: string) {
    setFocused(false);
    const parsed = parseGerman(input);
    if (!isNaN(parsed) && parsed >= min && parsed <= max) {
      const snapped = Math.round(parsed / step) * step;
      onChange(parseFloat(snapped.toFixed(10)));
    }
  }

  const displayValue = focused ? raw : formatFieldValue(value, unit);

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label htmlFor={`${fieldId}-slider`} className="text-sm text-white/80 font-medium">
          {label}
        </label>
        <div className="flex items-center gap-1.5">
          <input
            type="text"
            inputMode="decimal"
            value={displayValue}
            onFocus={handleFocus}
            onChange={(e) => setRaw(e.target.value)}
            onBlur={(e) => commit(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter')  e.currentTarget.blur();
              if (e.key === 'Escape') setFocused(false);
            }}
            aria-label={`${label} direkt eingeben`}
            aria-describedby={`${fieldId}-desc`}
            className="w-24 text-right text-sm font-bold text-white bg-surface-2 border border-white/10 rounded-lg px-2 py-1 focus:outline-none focus:border-accent tabular-nums"
          />
          <span className="text-sm text-white/65 w-8 flex-shrink-0">{unit}</span>
        </div>
      </div>
      <input
        id={`${fieldId}-slider`}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        aria-label={label}
        aria-describedby={`${fieldId}-desc`}
        className="w-full accent-accent h-2 rounded-full cursor-pointer"
      />
      <p id={`${fieldId}-desc`} className="text-xs text-white/60 mt-1">{description}</p>
    </div>
  );
}

interface FieldConfig {
  id: keyof Portfolio;
  label: string;
  unit: '€' | '%' | 'Jahre';
  min: number;
  max: number;
  step: number;
  description: string;
}

const FIELDS: FieldConfig[] = [
  { id: 'value',         label: 'Portfolio-Wert',      unit: '€',     min: 0, max: 2_000_000, step: 100, description: 'Aktueller Gesamtwert deines Portfolios' },
  { id: 'dividendYield', label: 'Dividendenrendite',   unit: '%',     min: 0, max:        20, step: 0.1, description: 'Durchschnittliche Dividendenrendite deines Portfolios' },
  { id: 'monthlySavings',label: 'Monatliche Sparrate', unit: '€',     min: 0, max:     5_000, step:  50, description: 'Betrag, den du monatlich investierst' },
  { id: 'dividendGrowth',label: 'Dividendenwachstum',  unit: '%',     min: 0, max:        15, step: 0.5, description: 'Erwartetes jährliches Wachstum der Dividenden' },
  { id: 'priceReturn',   label: 'Kursrendite',         unit: '%',     min: 0, max:        50, step: 0.5, description: 'Erwartete jährliche Kursrendite' },
  { id: 'horizonYears',  label: 'Anlagehorizont',      unit: 'Jahre', min: 1, max:        40, step:   1, description: 'Wie viele Jahre planst du zu investieren?' },
];

interface PortfolioFormProps {
  portfolio: Portfolio;
  onSave: (p: Portfolio) => void;
  onReset: () => void;
}

export function PortfolioForm({ portfolio, onSave, onReset }: PortfolioFormProps) {
  const [form, setForm] = useState<Portfolio>({ ...portfolio });
  const [saved, setSaved] = useState(false);

  function handleChange(field: keyof Portfolio, value: number) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    onSave(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const monthly = monthlyDividends(form);
  const annual = annualDividends(form);

  return (
    <main className="max-w-4xl mx-auto px-4 py-6">
      <div className="mb-5">
        <h1 className="text-lg font-bold text-white">Portfolio-Einstellungen</h1>
        <p className="text-sm text-white/65 mt-1">Schieberegler oder Zahl direkt eingeben.</p>
      </div>

      <div className="bg-surface-1 rounded-2xl p-5 mb-6 grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-white/65 mb-1">Jährliche Dividenden</p>
          <p className="text-xl font-bold text-accent tabular-nums">{formatEuro(annual)}</p>
        </div>
        <div>
          <p className="text-xs text-white/65 mb-1">Monatliche Dividenden</p>
          <p className="text-xl font-bold text-gold tabular-nums">{formatEuro(monthly)}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" aria-label="Portfolio-Daten bearbeiten">
        {FIELDS.map((f) => (
          <NumberField
            key={f.id}
            fieldId={`portfolio-${f.id}`}
            label={f.label}
            value={form[f.id]}
            unit={f.unit}
            min={f.min}
            max={f.max}
            step={f.step}
            description={f.description}
            onChange={(v) => handleChange(f.id, v)}
          />
        ))}

        <button
          type="submit"
          className="w-full bg-accent text-surface font-semibold py-3 rounded-xl hover:bg-accent-dim transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent text-sm"
        >
          {saved ? '✓ Gespeichert' : 'Änderungen speichern'}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-white/5">
        <button
          type="button"
          onClick={onReset}
          className="w-full text-sm text-white/45 hover:text-red-400 transition-colors py-2 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
        >
          Alle Daten zurücksetzen
        </button>
      </div>
    </main>
  );
}
