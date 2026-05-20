import { useRef, useState } from 'react';
import type { Portfolio } from '../../types';
import { liveFormatAmount, parseGerman } from '../../utils/formatting';

const fmtInt = new Intl.NumberFormat('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
const fmtDec = new Intl.NumberFormat('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

function formatDisplay(value: number, unit: string): string {
  if (unit === '€') return fmtInt.format(value);
  if (unit === '%') return fmtDec.format(value);
  return String(value);
}

interface TileFieldProps {
  fieldId: string;
  label: string;
  value: number;
  unit: '€' | '%' | 'Jahr';
  min: number;
  max: number;
  step: number;
  valueClass: string;
  onChange: (v: number) => void;
}

function TileField({ fieldId, label, value, unit, min, max, step, valueClass, onChange }: TileFieldProps) {
  const [raw, setRaw] = useState('');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const display = focused ? raw : formatDisplay(value, unit);

  function handleFocus() {
    setFocused(true);
    setRaw(formatDisplay(value, unit));
    requestAnimationFrame(() => inputRef.current?.select());
  }

  function commit(input: string) {
    setFocused(false);
    const parsed = parseGerman(input);
    if (!isNaN(parsed) && parsed >= min && parsed <= max) {
      const snapped = Math.round(parsed / step) * step;
      onChange(parseFloat(snapped.toFixed(10)));
    }
  }

  return (
    <div className="bg-surface-1 rounded-2xl p-4">
      <p className="text-xs text-white/55 mb-2">{label}</p>
      <div className="flex items-baseline gap-1.5">
        <input
          id={`${fieldId}-input`}
          ref={inputRef}
          type="text"
          inputMode={unit === 'Jahr' ? 'numeric' : 'decimal'}
          style={{ fontSize: '16px' }}
          value={display}
          onFocus={handleFocus}
          onChange={(e) => setRaw(unit === '€' ? liveFormatAmount(e.target.value) : e.target.value)}
          onBlur={(e) => commit(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.currentTarget.blur();
            if (e.key === 'Escape') setFocused(false);
          }}
          aria-label={`${label} eingeben`}
          className={`flex-1 min-w-0 bg-transparent font-bold text-xl tabular-nums text-right focus:outline-none border-b border-transparent focus:border-accent transition-colors ${valueClass}`}
        />
        {unit !== 'Jahr' && <span className="text-sm text-white/55 flex-shrink-0">{unit}</span>}
      </div>
    </div>
  );
}

interface PortfolioFormProps {
  portfolio: Portfolio;
  onSave: (p: Portfolio) => void;
  onReset: () => void;
}

export function PortfolioForm({ portfolio, onSave, onReset }: PortfolioFormProps) {
  function handleChange(field: keyof Portfolio, value: number) {
    onSave({ ...portfolio, [field]: value });
  }

  const monthly = portfolio.monthlyIncome;
  const annual = monthly * 12;

  return (
    <section className="max-w-4xl mx-auto px-4 py-6" aria-labelledby="portfolio-form-heading">
      <div className="mb-5">
        <h2 id="portfolio-form-heading" className="text-lg font-bold text-white">Dividenden</h2>
        <p className="text-sm text-white/65 mt-1">Zahl antippen zum Bearbeiten.</p>
      </div>

      <h3 className="text-sm font-semibold text-white mb-3">Details</h3>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <TileField
          fieldId="portfolio-annualIncome"
          label="Jährliche Dividenden"
          value={annual}
          unit="€"
          min={0} max={120_000} step={1}
          valueClass="text-accent"
          onChange={(v) => handleChange('monthlyIncome', v / 12)}
        />
        <TileField
          fieldId="portfolio-monthlyIncome"
          label="Monatliche Dividenden"
          value={monthly}
          unit="€"
          min={0} max={10_000} step={1}
          valueClass="text-accent"
          onChange={(v) => handleChange('monthlyIncome', v)}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <TileField
          fieldId="portfolio-dividendYield"
          label="Dividendenrendite"
          value={portfolio.dividendYield}
          unit="%"
          min={0} max={20} step={0.1}
          valueClass="text-accent"
          onChange={(v) => handleChange('dividendYield', v)}
        />
        <TileField
          fieldId="portfolio-dividendGrowth"
          label="Dividendenwachstum"
          value={portfolio.dividendGrowth}
          unit="%"
          min={0} max={15} step={0.5}
          valueClass="text-accent"
          onChange={(v) => handleChange('dividendGrowth', v)}
        />
      </div>

      <div className="pt-4 border-t border-white/5 space-y-3">
        <h3 className="text-sm font-semibold text-white mb-3">Lifetime-Dividenden</h3>
        <div className="grid grid-cols-2 gap-3">
          <TileField
            fieldId="portfolio-lifetimeStartYear"
            label="Berechnung ab"
            value={portfolio.lifetimeStartYear}
            unit="Jahr"
            min={2000} max={2040} step={1}
            valueClass="text-accent"
            onChange={(v) => handleChange('lifetimeStartYear', v)}
          />
          <TileField
            fieldId="portfolio-lifetimeDividends"
            label="Erhaltene Dividende"
            value={portfolio.lifetimeDividends}
            unit="€"
            min={0} max={1_000_000} step={1}
            valueClass="text-accent"
            onChange={(v) => handleChange('lifetimeDividends', v)}
          />
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-white/5">
        <button
          type="button"
          onClick={onReset}
          className="w-full text-sm text-white/55 hover:text-red-400 transition-colors py-2 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
        >
          Alle Daten zurücksetzen
        </button>
      </div>
    </section>
  );
}
