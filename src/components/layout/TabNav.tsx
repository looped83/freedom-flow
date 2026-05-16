import type { ReactNode } from 'react';

type Tab = 'dashboard' | 'goals' | 'projection' | 'portfolio';

interface TabNavProps {
  active: Tab;
  onChange: (tab: Tab) => void;
}

const ICONS: Record<Tab, ReactNode> = {
  dashboard: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden="true">
      <path d="M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 0h7v7h-7v-7z"/>
    </svg>
  ),
  goals: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="w-5 h-5" aria-hidden="true">
      <circle cx="12" cy="12" r="9"/>
      <circle cx="12" cy="12" r="5"/>
      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/>
    </svg>
  ),
  projection: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
      <polyline points="16 7 22 7 22 13"/>
    </svg>
  ),
  portfolio: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
      <rect x="2" y="7" width="20" height="14" rx="2"/>
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
    </svg>
  ),
};

// Portfolio intentionally last
const TABS: { id: Tab; label: string }[] = [
  { id: 'dashboard',  label: 'Dashboard'  },
  { id: 'goals',      label: 'Ziele'      },
  { id: 'projection', label: 'Projektion' },
  { id: 'portfolio',  label: 'Portfolio'  },
];

export function TabNav({ active, onChange }: TabNavProps) {
  return (
    <nav
      aria-label="Hauptnavigation"
      className="fixed bottom-0 inset-x-0 z-20 bg-surface-1 border-t border-white/5
                 sm:static sm:border-t-0 sm:border-b sm:z-auto"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="max-w-4xl mx-auto flex sm:px-4 sm:gap-0">
        {TABS.map((tab) => {
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`
                flex-1 flex flex-col items-center justify-center py-2.5 gap-1 transition-colors
                focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent
                sm:flex-none sm:flex-row sm:py-3 sm:px-5 sm:gap-0
                ${isActive
                  ? 'text-accent sm:border-b-2 sm:border-accent'
                  : 'text-white/50 hover:text-white/80 sm:border-b-2 sm:border-transparent'
                }
              `}
            >
              <span className="sm:hidden">{ICONS[tab.id]}</span>
              <span className="text-[10px] font-medium sm:text-sm">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export type { Tab };
