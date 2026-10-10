interface ProgressBarProps {
  percent: number;
  label: string;
  colorClass?: string;
  thin?: boolean;
}

/** Fill is scaled with `transform` (GPU-composited) instead of animating
 *  `width`, so value changes never trigger layout. */
export function ProgressBar({ percent, label, colorClass = 'bg-accent', thin = false }: ProgressBarProps) {
  const clamped = Math.min(Math.max(percent, 0), 100);
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={`w-full overflow-hidden rounded-full bg-white/10 ${thin ? 'h-1' : 'h-1.5'}`}
    >
      <div
        className={`h-full w-full origin-left rounded-full transition-transform duration-500 ${colorClass}`}
        style={{ transform: `scaleX(${clamped / 100})` }}
      />
    </div>
  );
}
