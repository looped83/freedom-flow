import { useRef, useState } from 'react';
import { formatEuro, parseGerman } from '../../utils/formatting';

interface QuickIncomeProps {
  monthly: number;
  onChange: (v: number) => void;
}

export function QuickIncome({ monthly, onChange }: QuickIncomeProps) {
  const [editing, setEditing] = useState(false);
  const [raw, setRaw] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  function startEdit() {
    setRaw(String(Math.round(monthly)));
    setEditing(true);
    requestAnimationFrame(() => inputRef.current?.select());
  }

  function commit(value: string) {
    const parsed = parseGerman(value);
    if (!isNaN(parsed) && parsed >= 0) {
      onChange(parsed);
    }
    setEditing(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    } else if (e.key === 'Escape') {
      setEditing(false);
    }
  }

  return (
    <section className="bg-surface-1 rounded-2xl p-5" aria-labelledby="quick-income-label">
      <p
        id="quick-income-label"
        className="text-xs text-white/55 font-medium uppercase tracking-wider mb-3"
      >
        Monatliche Dividenden
      </p>

      <div className="flex items-center justify-center mb-4">
        {editing ? (
          <input
            ref={inputRef}
            type="text"
            inputMode="decimal"
            value={raw}
            autoFocus
            onChange={(e) => setRaw(e.target.value)}
            onBlur={(e) => commit(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="Monatliche Dividenden eingeben"
            className="text-4xl font-bold text-accent text-center bg-transparent border-b-2 border-accent focus:outline-none w-48 tabular-nums"
          />
        ) : (
          <button
            onClick={startEdit}
            aria-label={`Monatliche Dividenden: ${formatEuro(monthly)}, zum Bearbeiten klicken`}
            className="text-4xl font-bold text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent rounded-lg px-2 py-1 hover:bg-white/5 transition-colors tabular-nums"
          >
            {formatEuro(monthly)}
          </button>
        )}
      </div>

      <div className="flex justify-center gap-3">
        {([25, 50, 100] as const).map((delta) => (
          <button
            key={delta}
            onClick={() => onChange(monthly + delta)}
            aria-label={`+${delta} € hinzufügen`}
            className="text-sm bg-surface-2 hover:bg-surface-3 rounded-lg px-4 py-2 text-white/80 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent font-medium"
          >
            +{delta}
          </button>
        ))}
      </div>
    </section>
  );
}
