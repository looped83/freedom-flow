import { formatDays } from '../../utils/formatting';

interface FreedomCalendarProps {
  freeDaysPerMonth: number;
}

export function FreedomCalendar({ freeDaysPerMonth }: FreedomCalendarProps) {
  const freeDaysPerYear = Math.min(freeDaysPerMonth * 12, 365);
  const days = Array.from({ length: 30 }, (_, i) => i < freeDaysPerMonth);

  return (
    <section className="bg-surface-1 rounded-2xl p-5" aria-labelledby="freedom-cal-title">
      <h2 id="freedom-cal-title" className="text-xs text-white/50 font-medium uppercase tracking-wider mb-3">
        Freedom Calendar
      </h2>
      <p className="text-white/90 text-sm mb-1">
        Dein Portfolio bezahlt aktuell{' '}
        <span className="text-accent font-bold">{formatDays(freeDaysPerMonth)} Tage</span> pro Monat.
      </p>
      <p className="text-white/50 text-xs mb-4">
        Das entspricht <span className="text-gold font-semibold">{formatDays(freeDaysPerYear)} Tagen</span>{' '}
        finanzieller Freiheit pro Jahr.
      </p>
      <div
        role="img"
        aria-label={`${Math.round(freeDaysPerMonth)} von 30 Tagen pro Monat durch Dividenden finanziert`}
        className="grid gap-1.5"
        style={{ gridTemplateColumns: 'repeat(10, minmax(0, 1fr))' }}
      >
        {days.map((free, i) => (
          <div
            key={i}
            className={`aspect-square rounded-sm ${free ? 'bg-accent' : 'bg-white/10'}`}
          />
        ))}
      </div>
      <p className="text-xs text-white/30 mt-2">Jedes Kästchen = 1 Tag</p>
    </section>
  );
}
