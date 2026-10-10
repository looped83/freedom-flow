import type { ReactNode } from 'react';

/** Shared outline icon set: 24×24 grid, 1.5 stroke, round caps. Always
 *  aria-hidden — the surrounding control provides the accessible name. */
export interface IconProps {
  className?: string;
}

export function Svg({ className = 'w-4 h-4', strokeWidth = 1.5, children }: IconProps & { strokeWidth?: number; children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

// ── Navigation / pages ──────────────────────────────────────────────────────

export function IconDashboard({ className }: IconProps) {
  return (
    <Svg className={className}>
      <rect x="3" y="3" width="7" height="7" rx="1.5"/>
      <rect x="14" y="3" width="7" height="7" rx="1.5"/>
      <rect x="3" y="14" width="7" height="7" rx="1.5"/>
      <rect x="14" y="14" width="7" height="7" rx="1.5"/>
    </Svg>
  );
}

export function IconLiveFlow({ className }: IconProps) {
  return (
    <Svg className={className}>
      <polyline points="2 12 6 8 10 16 14 4 18 12 22 12"/>
    </Svg>
  );
}

export function IconTimeline({ className }: IconProps) {
  return (
    <Svg className={className}>
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
      <polyline points="16 7 22 7 22 13"/>
    </Svg>
  );
}

export function IconSetup({ className }: IconProps) {
  return (
    <Svg className={className}>
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </Svg>
  );
}

/** Brand mark ("Freedom Flow"). */
export function IconWave({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M2 12c2-4 4-4 6 0s4 4 6 0 4-4 6 0"/>
    </Svg>
  );
}

// ── Card headers ────────────────────────────────────────────────────────────

export function IconStar({ className }: IconProps) {
  return (
    <Svg className={className}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </Svg>
  );
}

export function IconClock({ className }: IconProps) {
  return (
    <Svg className={className}>
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </Svg>
  );
}

export function IconSun({ className }: IconProps) {
  return (
    <Svg className={className}>
      <circle cx="12" cy="12" r="4"/>
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
    </Svg>
  );
}

export function IconDiamond({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M6 3h12l4 6-10 13L2 9l4-6z"/>
      <path d="M2 9h20"/>
      <path d="M8.5 3 6 9m9-6 2.5 6M12 3v6"/>
    </Svg>
  );
}

export function IconRefresh({ className }: IconProps) {
  return (
    <Svg className={className}>
      <polyline points="23 4 23 10 17 10"/>
      <polyline points="1 20 1 14 7 14"/>
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
    </Svg>
  );
}

// ── Actions / states ────────────────────────────────────────────────────────

export function IconTrash({ className }: IconProps) {
  return (
    <Svg className={className}>
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2"/>
    </Svg>
  );
}

export function IconChevron({ open, className = 'w-4 h-4' }: IconProps & { open: boolean }) {
  return (
    <Svg className={`${className} flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
      <polyline points="6 9 12 15 18 9"/>
    </Svg>
  );
}

export function IconCheck({ className = 'w-3.5 h-3.5' }: IconProps) {
  return (
    <Svg className={className} strokeWidth={2.5}>
      <polyline points="20 6 9 17 4 12"/>
    </Svg>
  );
}

export function IconCheckCircle({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </Svg>
  );
}

export function IconCircle({ className = 'w-3.5 h-3.5' }: IconProps) {
  return (
    <Svg className={className} strokeWidth={2}>
      <circle cx="12" cy="12" r="7"/>
    </Svg>
  );
}

export function IconClose({ className = 'w-3.5 h-3.5' }: IconProps) {
  return (
    <Svg className={className}>
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </Svg>
  );
}
