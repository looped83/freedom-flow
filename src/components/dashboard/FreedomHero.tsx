import { useEffect, useRef } from 'react';
import { formatEuro } from '../../utils/formatting';
import { freedomPercent, missingForFreedom } from '../../utils/calculations';

interface FreedomHeroProps {
  monthly: number;
  total: number;
}

function motivationalText(pct: number): string {
  if (pct >= 100) return 'Dein Portfolio deckt dein gesamtes Leben. Vollständige finanzielle Freiheit.';
  if (pct >= 75) return `Dein Portfolio übernimmt ${pct.toFixed(1)} % deines Lebens.`;
  if (pct >= 50) return `Mehr als die Hälfte deines Lebens gehört dir – ${pct.toFixed(1)} % finanziell frei.`;
  if (pct >= 25) return `Du hast bereits ${pct.toFixed(1)} % deines Lebens finanziell zurückgekauft.`;
  return 'Dein Portfolio übernimmt Stück für Stück dein Leben.';
}

const R = 80;
const CIRCUMFERENCE = 2 * Math.PI * R;
const heroId = 'freedom-hero-heading';

export function FreedomHero({ monthly, total }: FreedomHeroProps) {
  const pct = freedomPercent(monthly, total);
  const missing = missingForFreedom(monthly, total);
  const dashOffset = CIRCUMFERENCE * (1 - Math.min(pct, 100) / 100);

  const circleRef = useRef<SVGCircleElement>(null);
  const reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    const el = circleRef.current;
    if (!el) return;
    if (reducedMotion) {
      el.style.strokeDashoffset = String(dashOffset);
      return;
    }
    // Animate from full offset to current
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
    <section
      className="bg-surface-1 rounded-2xl p-5"
      aria-labelledby={heroId}
    >
      <h2 id={heroId} className="sr-only">Finanzielle Freiheit</h2>

      {/* SVG Ring */}
      <div className="flex flex-col items-center gap-4">
        <svg
          viewBox="0 0 200 200"
          width="200"
          height="200"
          role="img"
          aria-label={`${pct.toFixed(1)} % finanziell frei`}
        >
          {/* Track */}
          <circle
            cx="100"
            cy="100"
            r={R}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="14"
          />
          {/* Progress */}
          <circle
            ref={circleRef}
            cx="100"
            cy="100"
            r={R}
            fill="none"
            stroke="#4ade80"
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE}
            transform="rotate(-90 100 100)"
          />
          {/* Center text */}
          <text
            x="100"
            y="93"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="white"
            fontSize="28"
            fontWeight="700"
            fontFamily="inherit"
          >
            {pct.toFixed(1)} %
          </text>
          <text
            x="100"
            y="117"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="rgba(255,255,255,0.6)"
            fontSize="12"
            fontFamily="inherit"
          >
            finanziell frei
          </text>
        </svg>

        {/* Motivational copy */}
        <p className="text-sm text-white/75 text-center max-w-xs">
          {motivationalText(pct)}
        </p>

        {/* 3-column stats */}
        <div className="grid grid-cols-3 gap-3 w-full mt-1">
          <div className="text-center">
            <p className="text-xs text-white/55 mb-1">Dividenden</p>
            <p className="text-accent font-bold text-sm tabular-nums">{formatEuro(monthly)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-white/55 mb-1">Kosten</p>
            <p className="text-white font-bold text-sm tabular-nums">{formatEuro(total)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-white/55 mb-1">Noch fehlt</p>
            <p className="text-white/65 font-bold text-sm tabular-nums">{formatEuro(missing)}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
