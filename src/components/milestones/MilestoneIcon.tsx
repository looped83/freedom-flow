import type { MilestoneIcon as MilestoneIconName } from '../../types';

const PATHS: Record<MilestoneIconName, React.ReactNode> = {
  trophy: (
    <>
      <path d="M8 21h8"/>
      <path d="M12 17v4"/>
      <path d="M7 4h10v5a5 5 0 0 1-10 0V4z"/>
      <path d="M17 5h3v2a3 3 0 0 1-3 3"/>
      <path d="M7 5H4v2a3 3 0 0 0 3 3"/>
    </>
  ),
  star: (
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  ),
  flag: (
    <>
      <path d="M4 22V4"/>
      <path d="M4 4h12l-2 4 2 4H4"/>
    </>
  ),
  rocket: (
    <>
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
      <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22 22 0 0 1-4 2z"/>
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/>
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
    </>
  ),
  mountain: (
    <>
      <path d="M3 20l5.5-9 4 6 3.5-5 5 8z"/>
      <circle cx="17" cy="6" r="2"/>
    </>
  ),
  crown: (
    <>
      <path d="M3 7l4 6 5-8 5 8 4-6v11H3z"/>
      <line x1="3" y1="22" x2="21" y2="22"/>
    </>
  ),
  gem: (
    <>
      <path d="M6 3h12l4 6-10 13L2 9z"/>
      <path d="M11 3 8 9l4 13 4-13-3-6"/>
      <path d="M2 9h20"/>
    </>
  ),
  medal: (
    <>
      <path d="M7 3h10l-2 8H9z"/>
      <circle cx="12" cy="16" r="5"/>
      <path d="M10 16l2 2 4-4"/>
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="10"/>
      <circle cx="12" cy="12" r="6"/>
      <circle cx="12" cy="12" r="2"/>
    </>
  ),
  home: (
    <>
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/>
      <path d="M9 21V12h6v9"/>
    </>
  ),
  palm: (
    <>
      <path d="M12 22V11"/>
      <path d="M12 11c-3-1-7-1-9 1 1-4 5-6 9-5"/>
      <path d="M12 11c3-1 7-1 9 1-1-4-5-6-9-5"/>
      <path d="M12 11c-1-3-1-7 1-9-4 1-6 5-5 9"/>
      <circle cx="12" cy="10" r="1.2"/>
    </>
  ),
  car: (
    <>
      <path d="M5 11l2-5h10l2 5"/>
      <rect x="1" y="11" width="22" height="6" rx="2"/>
      <circle cx="7" cy="17" r="2"/>
      <circle cx="17" cy="17" r="2"/>
    </>
  ),
  gift: (
    <>
      <polyline points="20 12 20 22 4 22 4 12"/>
      <rect x="2" y="7" width="20" height="5"/>
      <line x1="12" y1="22" x2="12" y2="7"/>
      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
      <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
    </>
  ),
  heart: (
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  ),
  calendar: (
    <>
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
    </>
  ),
};

export const MILESTONE_ICONS: MilestoneIconName[] = [
  'trophy', 'star', 'flag', 'rocket', 'mountain', 'crown',
  'gem', 'medal', 'target', 'home', 'palm', 'car',
  'gift', 'heart', 'calendar',
];

export const ICON_LABELS: Record<MilestoneIconName, string> = {
  trophy: 'Pokal',
  star: 'Stern',
  flag: 'Flagge',
  rocket: 'Rakete',
  mountain: 'Gipfel',
  crown: 'Krone',
  gem: 'Edelstein',
  medal: 'Medaille',
  target: 'Ziel',
  home: 'Zuhause',
  palm: 'Palme',
  car: 'Auto',
  gift: 'Geschenk',
  heart: 'Herz',
  calendar: 'Kalender',
};

interface MilestoneIconProps {
  icon: MilestoneIconName;
  className?: string;
}

export function MilestoneIcon({ icon, className = 'w-5 h-5' }: MilestoneIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {PATHS[icon]}
    </svg>
  );
}
