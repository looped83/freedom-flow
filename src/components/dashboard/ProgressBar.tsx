interface ProgressBarProps {
  percent: number;
  label: string;
  colorClass?: string;
}

export function ProgressBar({ percent, label, colorClass = 'bg-accent' }: ProgressBarProps) {
  const clamped = Math.min(Math.max(percent, 0), 100);
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className="w-full bg-white/10 rounded-full h-1.5"
    >
      <div
        className={`h-1.5 rounded-full transition-all duration-500 ${colorClass}`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
