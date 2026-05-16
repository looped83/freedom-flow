import { useState } from 'react';
import { formatDays } from '../../utils/formatting';

interface FreedomCalendarProps {
  freeDaysPerMonth: number;
}

type CalendarView = 'month' | 'year';

export function FreedomCalendar({ freeDaysPerMonth }: FreedomCalendarProps) {
  const [view, setView] = useState<CalendarView>('month');

  const freeDaysPerYear = Math.min(freeDaysPerMonth * 12, 365);
  const filledMonth = Math.round(freeDaysPerMonth);
  const filledYear = Math.round(freeDaysPerYear);

  return (
    <section className="bg-surface-1 rounded-2xl p-5" aria-labelledby="freedom-cal-title">
      {/* Header with toggle */}
      <div className="flex items-center justify-between mb-3">
        <h2 id="freedom-cal-title" className="text-xs text-white/55 font-medium uppercase tracking-wider">
          Freedom Calendar
        </h2>
        <div
          className="flex rounded-lg overflow-hidden border border-white/10"
          role="group"
          aria-label="Ansicht wählen"
        >
          {(['month', 'year'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              aria-pressed={view === v}
              className={`text-xs px-2.5 py-1 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent ${
                view === v ? 'bg-accent/20 text-accent font-semibold' : 'text-white/45 hover:text-white/70'
              }`}
            >
              {v === 'month' ? 'Monat' : 'Jahr'}
            </button>
          ))}
        </div>
      </div>

      {view === 'month' ? (
        <MonthView filledCount={filledMonth} freeDaysPerMonth={freeDaysPerMonth} />
      ) : (
        <YearView filledCount={filledYear} freeDaysPerYear={freeDaysPerYear} />
      )}
    </section>
  );
}

function MonthView({ filledCount, freeDaysPerMonth }: { filledCount: number; freeDaysPerMonth: number }) {
  return (
    <div>
      <p className="text-white/80 text-sm mb-3">
        <span className="text-accent font-bold">{formatDays(freeDaysPerMonth)} Tage</span>
        {' '}pro Monat durch Dividenden finanziert.
      </p>
      <div
        role="img"
        aria-label={`${filledCount} von 30 Tagen pro Monat frei`}
        className="grid gap-1"
        style={{ gridTemplateColumns: 'repeat(15, minmax(0, 1fr))' }}
      >
        {Array.from({ length: 30 }, (_, i) => (
          <div
            key={i}
            className={`aspect-square rounded-full ${i < filledCount ? 'bg-accent' : 'bg-white/8'}`}
          />
        ))}
      </div>
      <p className="text-xs text-white/35 mt-2">1 Punkt = 1 Tag</p>
    </div>
  );
}

function YearView({ filledCount, freeDaysPerYear }: { filledCount: number; freeDaysPerYear: number }) {
  const totalDays = 365;
  return (
    <div>
      <p className="text-white/80 text-sm mb-3">
        <span className="text-gold font-bold">{formatDays(freeDaysPerYear)} Tage</span>
        {' '}finanzieller Freiheit pro Jahr.
      </p>
      {/* 5 rows × 73 cols = 365 */}
      <div
        role="img"
        aria-label={`${filledCount} von 365 Tagen pro Jahr frei`}
        className="grid gap-0.5"
        style={{ gridTemplateColumns: 'repeat(73, minmax(0, 1fr))' }}
      >
        {Array.from({ length: totalDays }, (_, i) => (
          <div
            key={i}
            className={`aspect-square rounded-sm ${i < filledCount ? 'bg-gold' : 'bg-white/8'}`}
          />
        ))}
      </div>
      <p className="text-xs text-white/35 mt-2">1 Punkt = 1 Tag</p>
    </div>
  );
}
