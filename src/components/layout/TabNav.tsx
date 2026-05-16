import type { ReactNode } from 'react';

type Tab = 'dashboard' | 'timeline' | 'setup';

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
  timeline: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
      <polyline points="16 7 22 7 22 13"/>
    </svg>
  ),
  setup: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  ),
};

const TABS: { id: Tab; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'timeline',  label: 'Timeline'  },
  { id: 'setup',     label: 'Setup'     },
];

export function TabNav({ active, onChange }: TabNavProps) {
  return (
    <nav
      aria-label="Hauptnavigation"
      className="fixed bottom-0 inset-x-0 z-20 bg-surface-1 border-t border-white/5
                 sm:static sm:border-t-0 sm:border-b sm:z-auto"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)' }}
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
                flex-1 flex flex-col items-center justify-center py-5 gap-1.5 transition-colors
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
