import type { ComponentType } from 'react';
import { IconDashboard, IconLiveFlow, IconSetup, IconTimeline, type IconProps } from '../ui/Icons';

export type Tab = 'dashboard' | 'liveflow' | 'timeline' | 'setup';

export const TABS: { id: Tab; label: string; Icon: ComponentType<IconProps> }[] = [
  { id: 'dashboard', label: 'Dashboard', Icon: IconDashboard },
  { id: 'liveflow',  label: 'Live Flow', Icon: IconLiveFlow  },
  { id: 'timeline',  label: 'Timeline',  Icon: IconTimeline  },
  { id: 'setup',     label: 'Setup',     Icon: IconSetup     },
];

interface TabNavProps {
  active: Tab;
  onChange: (tab: Tab) => void;
}

/** Bottom bar on mobile (h-14 + safe area), top tab row from `sm` up. */
export function TabNav({ active, onChange }: TabNavProps) {
  return (
    <nav
      aria-label="Hauptnavigation"
      className="pb-safe fixed inset-x-0 bottom-0 z-20 border-t border-white/5 bg-surface-1
                 sm:static sm:z-auto sm:border-b sm:border-t-0 sm:pb-0"
    >
      <div className="mx-auto flex max-w-4xl sm:px-4">
        {TABS.map(({ id, label, Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              aria-current={isActive ? 'page' : undefined}
              className={`focus-inset flex h-14 flex-1 flex-col items-center justify-center gap-1 transition-colors
                sm:h-auto sm:flex-none sm:border-b-2 sm:px-5 sm:py-3 ${
                isActive
                  ? 'text-accent sm:border-accent'
                  : 'text-white/50 hover:text-white sm:border-transparent'
              }`}
            >
              <Icon className="w-5 h-5 sm:hidden" />
              <span className="text-[10px] font-medium sm:text-sm">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
