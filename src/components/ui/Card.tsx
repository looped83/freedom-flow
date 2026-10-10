import { useId, type ReactNode } from 'react';

const TONES = {
  default: 'bg-surface-1 border-white/5',
  accent:  'bg-accent-muted border-accent/20',
} as const;

interface CardProps {
  title: ReactNode;
  icon: ReactNode;
  /** Control rendered on the right of the header (toggle, badge…). */
  right?: ReactNode;
  /** `accent` = hero card with green tint. */
  tone?: keyof typeof TONES;
  className?: string;
  children: ReactNode;
}

/** The one card used on every screen: surface, radius, padding and header
 *  layout are defined here and nowhere else. */
export function Card({ title, icon, right, tone = 'default', className = '', children }: CardProps) {
  const id = useId();
  return (
    <section aria-labelledby={id} className={`rounded-2xl border p-4 sm:p-5 ${TONES[tone]} ${className}`}>
      <div className="flex items-center justify-between gap-2 mb-3 min-h-7">
        <h2 id={id} className="flex items-center gap-2 min-w-0 text-sm font-semibold text-white">
          <span className="flex-shrink-0 text-accent/70" aria-hidden="true">{icon}</span>
          <span className="truncate">{title}</span>
        </h2>
        {right}
      </div>
      {children}
    </section>
  );
}
