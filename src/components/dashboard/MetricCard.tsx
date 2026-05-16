interface MetricCardProps {
  label: string;
  value: string;
  sub?: string;
  accent?: 'green' | 'gold' | 'blue';
}

const accentClasses = {
  green: 'text-accent',
  gold: 'text-gold',
  blue: 'text-blue-accent',
};

export function MetricCard({ label, value, sub, accent = 'green' }: MetricCardProps) {
  return (
    <div className="bg-surface-1 rounded-2xl p-5 flex flex-col gap-1">
      <p className="text-xs text-white/65 font-medium uppercase tracking-wider">{label}</p>
      <p className={`text-3xl font-bold tabular-nums ${accentClasses[accent]}`}>{value}</p>
      {sub && <p className="text-sm text-white/65">{sub}</p>}
    </div>
  );
}
