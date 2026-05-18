import { useEffect, useMemo, useRef, useState } from 'react';
import { formatEuro } from '../../utils/formatting';
import { freedomPercent, missingForFreedom } from '../../utils/calculations';
import { useInlineNumberEdit } from '../../hooks/useInlineNumberEdit';

interface FreedomHeroProps {
  monthly: number;
  projectedMonthly: number;
  total: number;
  minExpenses: number;
  onIncomeChange: (v: number) => void;
  onTotalChange: (v: number) => void;
}

const R = 80;
const CIRCUMFERENCE = 2 * Math.PI * R;
const heroId = 'freedom-hero-heading';

export function FreedomHero({ monthly, projectedMonthly, total, minExpenses, onIncomeChange, onTotalChange }: FreedomHeroProps) {
  const [view, setView] = useState<'month' | 'year'>('month');
  const mul = view === 'year' ? 12 : 1;

  const pct = useMemo(() => freedomPercent(monthly, total), [monthly, total]);
  const projPct = useMemo(() => freedomPercent(projectedMonthly, total), [projectedMonthly, total]);
  const missing = useMemo(() => missingForFreedom(monthly, total), [monthly, total]);
  const dashOffset = useMemo(() => CIRCUMFERENCE * (1 - Math.min(pct, 100) / 100), [pct]);
  const projDashOffset = useMemo(() => CIRCUMFERENCE * (1 - Math.min(projPct, 100) / 100), [projPct]);

  const circleRef = useRef<SVGCircleElement>(null);
  const [showProjected, setShowProjected] = useState(false);
  const [reducedMotion] = useState(() =>
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  const income  = useInlineNumberEdit(monthly * mul, (v) => onIncomeChange(v / mul));
  const expense = useInlineNumberEdit(total * mul,   (v) => onTotalChange(v / mul), { min: minExpenses * mul });

  useEffect(() => {
    const el = circleRef.current;
    if (!el) return;
    if (reducedMotion) {
      el.style.strokeDashoffset = String(dashOffset);
      return;
    }
    el.style.transition = 'none';
    el.style.strokeDashoffset = String(CIRCUMFERENCE);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.transition = 'stroke-dashoffset 0.8s ease-out';
        el.style.strokeDashoffset = String(dashOffset);
      });
    });
  }, [dashOffset, reducedMotion]);

  return (
    <section className="rounded-2xl p-5 bg-accent-muted border border-accent/20" aria-labelledby={heroId}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-white">Freedom Flow</p>
        <div className="flex rounded-lg overflow-hidden border border-white/10" role="group" aria-label="Ansicht wählen">
          {(['month', 'year'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              aria-pressed={view === v}
              className={`text-xs px-3 py-1 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent ${
                view === v ? 'bg-accent/20 text-accent font-semibold' : 'text-white/45 hover:text-white/70'
              }`}
            >
              {v === 'month' ? 'Monat' : 'Jahr'}
            </button>
          ))}
        </div>
      </div>
      <h2 id={heroId} className="sr-only">Finanzielle Freiheit</h2>

      <div className="flex flex-col items-center gap-4">
        {/* SVG Ring */}
        <svg
          viewBox="0 0 200 200"
          width="200"
          height="200"
          role="img"
          aria-label={`${pct.toFixed(1)} % finanziell frei`}
        >
          {/* Track */}
          <circle cx="100" cy="100" r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="14" />
          {/* Projected year-end arc (transparent) – click/Enter to show projected % */}
          {projPct > pct && (
            <circle
              cx="100" cy="100" r={R}
              fill="none" stroke="rgba(74,222,128,0.22)" strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={projDashOffset}
              transform="rotate(-90 100 100)"
              role="button"
              tabIndex={0}
              aria-label={`Prognose anzeigen: ${projPct.toFixed(1)} % in einem Jahr`}
              aria-pressed={showProjected}
              style={{ cursor: 'pointer', outline: 'none' }}
              onClick={() => setShowProjected(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setShowProjected(true); }
              }}
            />
          )}
          {/* Current arc – click/Enter to revert to current % */}
          <circle
            ref={circleRef}
            cx="100" cy="100" r={R}
            fill="none" stroke="#4ade80" strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE}
            transform="rotate(-90 100 100)"
            role={showProjected ? 'button' : undefined}
            tabIndex={showProjected ? 0 : undefined}
            aria-label={showProjected ? `Aktuelle ${pct.toFixed(1)} % anzeigen` : undefined}
            aria-pressed={showProjected ? false : undefined}
            style={{ cursor: showProjected ? 'pointer' : 'default', outline: 'none' }}
            onClick={() => setShowProjected(false)}
            onKeyDown={showProjected ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setShowProjected(false); }
            } : undefined}
          />
          <text x="100" y="93" textAnchor="middle" dominantBaseline="middle"
            fill="white" fontSize="28" fontWeight="700" fontFamily="inherit">
            {(showProjected ? projPct : pct).toFixed(1)} %
          </text>
          <text x="100" y="117" textAnchor="middle" dominantBaseline="middle"
            fill="rgba(255,255,255,0.6)" fontSize="12" fontFamily="inherit">
            {showProjected ? 'Prognose' : 'finanziell frei'}
          </text>
        </svg>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 w-full">
          {/* Dividenden – tappable to edit */}
          <div className="text-center">
            <p className="text-xs text-white/55 mb-1">Dividenden</p>
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
                className="font-bold text-accent text-center bg-transparent border-b border-accent focus:outline-none w-full tabular-nums"
              />
            ) : (
              <button
                onClick={income.startEdit}
                aria-label={`Dividenden: ${formatEuro(monthly * mul)}, tippen zum Bearbeiten`}
                className="text-accent font-bold text-sm tabular-nums underline decoration-dotted underline-offset-2 hover:opacity-75 transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent rounded"
              >
                {formatEuro(monthly * mul)}
              </button>
            )}
          </div>

          {/* Ausgaben / Monat|Jahr – tappable to edit */}
          <div className="text-center">
            <p className="text-xs text-white/55 mb-1">Ausgaben</p>
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
                className="font-bold text-white text-center bg-transparent border-b border-white/40 focus:outline-none w-full tabular-nums"
              />
            ) : (
              <button
                onClick={expense.startEdit}
                aria-label={`Ausgaben: ${formatEuro(total * mul)}, tippen zum Bearbeiten`}
                className="text-white font-bold text-sm tabular-nums underline decoration-dotted underline-offset-2 hover:opacity-75 transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent rounded"
              >
                {formatEuro(total * mul)}
              </button>
            )}
          </div>

          <div className="text-center">
            <p className="text-xs text-white/55 mb-1">Offen</p>
            <p className="text-white/65 font-bold text-sm tabular-nums text-center">{formatEuro(missing * mul)}</p>
          </div>
        </div>

      </div>
    </section>
  );
}
