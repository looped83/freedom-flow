import { useState } from 'react';
import type { Portfolio } from '../../types';
import { formatEuro } from '../../utils/formatting';
import { annualDividends, monthlyDividends } from '../../utils/calculations';

interface FieldConfig {
  id: keyof Portfolio;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  description: string;
}

const FIELDS: FieldConfig[] = [
  {
    id: 'value',
    label: 'Portfolio-Wert',
    unit: '€',
    min: 0,
    max: 10_000_000,
    step: 100,
    description: 'Aktueller Gesamtwert deines Portfolios',
  },
  {
    id: 'dividendYield',
    label: 'Dividendenrendite',
    unit: '%',
    min: 0,
    max: 20,
    step: 0.1,
    description: 'Durchschnittliche Dividendenrendite deines Portfolios',
  },
  {
    id: 'monthlySavings',
    label: 'Monatliche Sparrate',
    unit: '€',
    min: 0,
    max: 50_000,
    step: 50,
    description: 'Betrag, den du monatlich investierst',
  },
  {
    id: 'dividendGrowth',
    label: 'Dividendenwachstum',
    unit: '%',
    min: 0,
    max: 30,
    step: 0.5,
    description: 'Erwartetes jährliches Wachstum der Dividenden',
  },
  {
    id: 'priceReturn',
    label: 'Kursrendite',
    unit: '%',
    min: 0,
    max: 30,
    step: 0.5,
    description: 'Erwartete jährliche Kursrendite',
  },
  {
    id: 'horizonYears',
    label: 'Anlagehorizont',
    unit: 'Jahre',
    min: 1,
    max: 40,
    step: 1,
    description: 'Wie viele Jahre planst du zu investieren?',
  },
];

interface PortfolioFormProps {
  portfolio: Portfolio;
  onSave: (p: Portfolio) => void;
}

export function PortfolioForm({ portfolio, onSave }: PortfolioFormProps) {
  const [form, setForm] = useState<Portfolio>({ ...portfolio });
  const [saved, setSaved] = useState(false);

  function handleChange(field: keyof Portfolio, raw: string) {
    const value = parseFloat(raw);
    if (!isNaN(value)) {
      setForm((prev) => ({ ...prev, [field]: value }));
    }
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
      <div className="mb-6">
        <h1 className="text-lg font-bold text-white">Portfolio-Einstellungen</h1>
        <p className="text-sm text-white/65 mt-1">
          Passe deine Werte an, um die Projektion zu aktualisieren.
        </p>
      </div>

      {/* Live preview */}
      <div className="bg-surface-1 rounded-2xl p-5 mb-6 grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-white/65 mb-1">Jährliche Dividenden</p>
          <p className="text-xl font-bold text-accent">{formatEuro(annual)}</p>
        </div>
        <div>
          <p className="text-xs text-white/65 mb-1">Monatliche Dividenden</p>
          <p className="text-xl font-bold text-gold">{formatEuro(monthly)}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" aria-label="Portfolio-Daten bearbeiten">
        {FIELDS.map((f) => (
          <div key={f.id}>
            <div className="flex justify-between items-baseline mb-1">
              <label htmlFor={`portfolio-${f.id}`} className="text-sm text-white/80 font-medium">
                {f.label}
              </label>
              <span className="text-sm font-bold text-white tabular-nums">
                {f.unit === '€' ? formatEuro(form[f.id]) : `${form[f.id]} ${f.unit}`}
              </span>
            </div>
            <input
              id={`portfolio-${f.id}`}
              type="range"
              min={f.min}
              max={f.max}
              step={f.step}
              value={form[f.id]}
              onChange={(e) => handleChange(f.id, e.target.value)}
              aria-describedby={`portfolio-${f.id}-desc`}
              className="w-full accent-accent h-2 rounded-full cursor-pointer"
            />
            <p id={`portfolio-${f.id}-desc`} className="text-xs text-white/60 mt-1">
              {f.description}
            </p>
          </div>
        ))}

        <button
          type="submit"
          className="w-full bg-accent text-surface font-semibold py-3 rounded-xl hover:bg-accent-dim transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent mt-4 text-sm"
        >
          {saved ? '✓ Gespeichert' : 'Änderungen speichern'}
        </button>
      </form>
    </main>
  );
}
