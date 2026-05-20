import { useCallback, useState } from 'react';
import { formatEuro } from '../../utils/formatting';
import { freedomPercent, missingForFreedom } from '../../utils/calculations';
import { useInlineNumberEdit } from '../../hooks/useInlineNumberEdit';

const WAVE_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
    <path d="M2 12c2-4 4-4 6 0s4 4 6 0 4-4 6 0"/>
  </svg>
);

interface FreedomHeroProps {
  monthly: number;
  total: number;
  minExpenses: number;
  onIncomeChange: (v: number) => void;
  onTotalChange: (v: number) => void;
}

const heroId = 'freedom-hero-heading';

export function FreedomHero({ monthly, total, minExpenses, onIncomeChange, onTotalChange }: FreedomHeroProps) {
  const [view, setView] = useState<'month' | 'year'>('month');
  const mul = view === 'year' ? 12 : 1;

  const pct     = freedomPercent(monthly, total);
  const missing = missingForFreedom(monthly, total);
  const barPct  = Math.min(pct, 100);

  const commitIncome  = useCallback((v: number) => onIncomeChange(v / mul), [onIncomeChange, mul]);
  const commitExpense = useCallback((v: number) => onTotalChange(v / mul),  [onTotalChange,  mul]);

  const income  = useInlineNumberEdit(monthly * mul, commitIncome);
  const expense = useInlineNumberEdit(total * mul,   commitExpense, { min: minExpenses * mul });

  return (
    <section className="rounded-2xl p-5 bg-accent-muted border border-accent/20" aria-labelledby={heroId}>
      <h2 id={heroId} className="sr-only">Finanzielle Freiheit</h2>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-accent/70 flex-shrink-0" aria-hidden="true">{WAVE_ICON}</span>
          <p className="text-sm font-semibold text-white">Freedom Flow</p>
        </div>
        <div className="flex rounded-lg overflow-hidden border border-white/10" role="group" aria-label="Ansicht wählen">
          {(['month', 'year'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              aria-pressed={view === v}
              className={`text-xs px-3 py-1 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent ${
                view === v ? 'bg-accent/20 text-accent font-semibold' : 'text-white/55 hover:text-white/80'
              }`}
            >
              {v === 'month' ? 'Monat' : 'Jahr'}
            </button>
          ))}
        </div>
      </div>

      {/* Big percentage */}
      <p
        className="text-5xl font-bold text-accent tabular-nums leading-none"
        aria-label={`${pct.toFixed(1)} % finanziell frei`}
      >
        {pct.toFixed(1)}&thinsp;%
      </p>
      <p className="text-xs text-white/50 mt-1.5">finanziell frei</p>

      {/* Progress bar */}
      <div className="mt-4">
        <div
          role="progressbar"
          aria-label={`Freiheitsgrad: ${Math.round(barPct)} von 100 Prozent`}
          aria-valuenow={Math.round(barPct)}
          aria-valuemin={0}
          aria-valuemax={100}
          className="h-1.5 bg-white/10 rounded-full overflow-hidden"
        >
          <div
            className="h-full bg-accent rounded-full transition-[width] duration-700"
            style={{ width: `${barPct}%` }}
          />
        </div>
      </div>

      {/* Mini tiles: Dividenden · Ausgaben · Offen */}
      <div className="mt-5 pt-4 border-t border-accent/15 grid grid-cols-3 gap-3">

        {/* Dividenden – editable */}
        <div className="bg-white/5 rounded-xl p-3">
          <p className="text-xs text-white/60 mb-1.5">Dividenden</p>
          {income.editing ? (
            <input
              ref={income.inputRef}
              type="text"
              inputMode="decimal"
              value={income.raw}
              autoFocus
              onChange={(e) => income.setRaw(e.target.value)}
              onBlur={(e) => income.commit(e.target.value)}
              onKeyDown={income.handleKeyDown}
              aria-label={view === 'month' ? 'Monatliche Dividenden eingeben' : 'Jährliche Dividenden eingeben'}
              style={{ fontSize: '16px' }}
              className="w-full font-bold text-sm text-accent tabular-nums leading-none bg-transparent border-b border-accent focus:outline-none"
            />
          ) : (
            <button
              onClick={income.startEdit}
              aria-label={`Dividenden: ${formatEuro(monthly * mul)}, tippen zum Bearbeiten`}
              className="w-full text-left text-sm font-bold text-accent tabular-nums leading-none whitespace-nowrap hover:opacity-75 transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent rounded"
            >
              {formatEuro(monthly * mul)}
            </button>
          )}
        </div>

        {/* Ausgaben – editable */}
        <div className="bg-white/5 rounded-xl p-3">
          <p className="text-xs text-white/60 mb-1.5">Ausgaben</p>
          {expense.editing ? (
            <input
              ref={expense.inputRef}
              type="text"
              inputMode="decimal"
              value={expense.raw}
              autoFocus
              onChange={(e) => expense.setRaw(e.target.value)}
              onBlur={(e) => expense.commit(e.target.value)}
              onKeyDown={expense.handleKeyDown}
              aria-label={view === 'month' ? 'Monatliche Ausgaben eingeben' : 'Jährliche Ausgaben eingeben'}
              style={{ fontSize: '16px' }}
              className="w-full font-bold text-sm text-accent tabular-nums leading-none bg-transparent border-b border-accent focus:outline-none"
            />
          ) : (
            <button
              onClick={expense.startEdit}
              aria-label={`Ausgaben: ${formatEuro(total * mul)}, tippen zum Bearbeiten`}
              className="w-full text-left text-sm font-bold text-accent tabular-nums leading-none whitespace-nowrap hover:opacity-75 transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent rounded"
            >
              {formatEuro(total * mul)}
            </button>
          )}
        </div>

        {/* Offen – display only */}
        <div className="bg-white/5 rounded-xl p-3">
          <p className="text-xs text-white/60 mb-1.5">Offen</p>
          <p className="text-sm font-bold text-accent tabular-nums leading-none whitespace-nowrap">
            {formatEuro(missing * mul)}
          </p>
        </div>

      </div>
    </section>
  );
}
