import { memo, useState } from 'react';
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
      <div className="flex items-center justify-between mb-4">
        <h2 id="freedom-cal-title" className="text-sm font-semibold text-white">
          Freedom Kalender
        </h2>
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

      {view === 'month' ? (
        <MonthView filledCount={filledMonth} freeDaysPerMonth={freeDaysPerMonth} />
      ) : (
        <YearView filledCount={filledYear} freeDaysPerYear={freeDaysPerYear} />
      )}
    </section>
  );
}

const MonthView = memo(function MonthView({ filledCount, freeDaysPerMonth }: { filledCount: number; freeDaysPerMonth: number }) {
  return (
    <div>
      <p className="text-white/80 text-sm mb-4">
        <span className="text-accent font-bold">{formatDays(freeDaysPerMonth)} Tage</span>
        {' '}pro Monat durch Dividenden finanziert.
      </p>
      {/* 10 cols × 3 rows = 30 dots; larger on mobile */}
      <div
        role="img"
        aria-label={`${filledCount} von 30 Tagen pro Monat frei`}
        className="grid gap-2"
        style={{ gridTemplateColumns: 'repeat(10, minmax(0, 1fr))' }}
      >
        {Array.from({ length: 30 }, (_, i) => (
          <div
            key={i}
            className={`aspect-square rounded-full ${i < filledCount ? 'bg-accent' : 'bg-white/20'}`}
          />
        ))}
      </div>
    </div>
  );
});

const YearView  = memo(function YearView({ filledCount, freeDaysPerYear }: { filledCount: number; freeDaysPerYear: number }) {
  return (
    <div>
      <p className="text-white/80 text-sm mb-4">
        <span className="text-gold font-bold">{formatDays(freeDaysPerYear)} Tage</span>
        {' '}finanzieller Freiheit pro Jahr.
      </p>
      {/* 26 cols × 14 rows ≈ 365; reasonable size on mobile */}
      <div
        role="img"
        aria-label={`${filledCount} von 365 Tagen pro Jahr frei`}
        className="grid gap-1"
        style={{ gridTemplateColumns: 'repeat(26, minmax(0, 1fr))' }}
      >
        {Array.from({ length: 365 }, (_, i) => (
          <div
            key={i}
            className={`aspect-square rounded-sm ${i < filledCount ? 'bg-gold' : 'bg-white/20'}`}
          />
        ))}
      </div>
    </div>
  );
});
