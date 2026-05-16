import type { GoalCategory } from '../../types';

type IconPath = React.ReactNode;

const PATHS: Record<GoalCategory, IconPath> = {
  Wohnen: (
    <>
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/>
      <path d="M9 21V12h6v9"/>
    </>
  ),
  Nebenkosten: (
    <polyline points="13 2 13 9 19 9 11 22 11 15 5 15 13 2"/>
  ),
  Mobilität: (
    <>
      <path d="M5 17H3a1 1 0 0 1-1-1v-4l2.7-5.4A1 1 0 0 1 5.6 6h12.8a1 1 0 0 1 .9.6L21 12v4a1 1 0 0 1-1 1h-2"/>
      <circle cx="7.5" cy="17" r="2"/>
      <circle cx="16.5" cy="17" r="2"/>
      <line x1="9.5" y1="17" x2="14.5" y2="17"/>
    </>
  ),
  Ernährung: (
    <>
      <circle cx="9" cy="21" r="1"/>
      <circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </>
  ),
  Restaurant: (
    <>
      <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
      <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
      <line x1="6" y1="1" x2="6" y2="4"/>
      <line x1="10" y1="1" x2="10" y2="4"/>
      <line x1="14" y1="1" x2="14" y2="4"/>
    </>
  ),
  Gesundheit: (
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  ),
  Medizin: (
    <>
      <path d="M10.5 20.5 3.5 13.5a5 5 0 1 1 7.07-7.07l7 7a5 5 0 1 1-7.07 7.07z"/>
      <line x1="8.5" y1="15.5" x2="15.5" y2="8.5"/>
    </>
  ),
  Sport: (
    <>
      <circle cx="6.5" cy="12" r="2.5"/>
      <circle cx="17.5" cy="12" r="2.5"/>
      <line x1="9" y1="12" x2="15" y2="12"/>
      <line x1="4" y1="10" x2="4" y2="14"/>
      <line x1="20" y1="10" x2="20" y2="14"/>
    </>
  ),
  Körperpflege: (
    <>
      <circle cx="6" cy="6" r="3"/>
      <circle cx="6" cy="18" r="3"/>
      <line x1="20" y1="4" x2="8.12" y2="15.88"/>
      <line x1="14.47" y1="14.48" x2="20" y2="20"/>
      <line x1="8.12" y1="8.12" x2="12" y2="12"/>
    </>
  ),
  Kleidung: (
    <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.57a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.57a2 2 0 0 0-1.34-2.23z"/>
  ),
  Elektronik: (
    <>
      <rect x="2" y="3" width="20" height="13" rx="2"/>
      <path d="M8 21h8M12 16v5"/>
    </>
  ),
  Haustiere: (
    <>
      <circle cx="9" cy="8" r="2"/>
      <circle cx="15" cy="8" r="2"/>
      <circle cx="5.5" cy="14" r="2"/>
      <circle cx="18.5" cy="14" r="2"/>
      <path d="M8 19c0-2.2 1.8-4 4-4s4 1.8 4 4v1H8v-1z"/>
    </>
  ),
  Freizeit: (
    <>
      <path d="M9 18V5l12-2v13"/>
      <circle cx="6" cy="18" r="3"/>
      <circle cx="18" cy="16" r="3"/>
    </>
  ),
  Gaming: (
    <>
      <rect x="2" y="7" width="20" height="12" rx="5"/>
      <path d="M6 13h4M8 11v4"/>
      <circle cx="15" cy="11" r="1"/>
      <circle cx="17" cy="13" r="1"/>
    </>
  ),
  Geschenke: (
    <>
      <polyline points="20 12 20 22 4 22 4 12"/>
      <rect x="2" y="7" width="20" height="5"/>
      <line x1="12" y1="22" x2="12" y2="7"/>
      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
      <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
    </>
  ),
  Urlaub: (
    <>
      <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21 4 19 4c-2 0-4 2-4 2l-8.2-1.8a2 2 0 0 0-1.9.6L4 6l5 2.5L11 11l-4 4 1 2 4-1 2.5 5 1.7-.9a2 2 0 0 0 .6-1.9z"/>
    </>
  ),
  Kommunikation: (
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  ),
  Streaming: (
    <>
      <circle cx="12" cy="12" r="10"/>
      <polygon points="10 8 16 12 10 16 10 8"/>
    </>
  ),
  Bildung: (
    <>
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </>
  ),
  Versicherungen: (
    <>
      <path d="M12 2L4 5v6c0 5.5 3.5 10.7 8 12 4.5-1.3 8-6.5 8-12V5L12 2z"/>
      <polyline points="9 12 11 14 15 10"/>
    </>
  ),
  Sonstiges: (
    <>
      <line x1="4" y1="21" x2="4" y2="14"/>
      <line x1="4" y1="10" x2="4" y2="3"/>
      <line x1="12" y1="21" x2="12" y2="12"/>
      <line x1="12" y1="8" x2="12" y2="3"/>
      <line x1="20" y1="21" x2="20" y2="16"/>
      <line x1="20" y1="12" x2="20" y2="3"/>
      <line x1="1" y1="14" x2="7" y2="14"/>
      <line x1="9" y1="8" x2="15" y2="8"/>
      <line x1="17" y1="16" x2="23" y2="16"/>
    </>
  ),
};

interface CategoryIconProps {
  category: GoalCategory;
  className?: string;
}

export function CategoryIcon({ category, className = 'w-5 h-5' }: CategoryIconProps) {
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
      {PATHS[category]}
    </svg>
  );
}
