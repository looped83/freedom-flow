type Tab = 'dashboard' | 'goals' | 'portfolio' | 'projection';

interface TabNavProps {
  active: Tab;
  onChange: (tab: Tab) => void;
}

const TABS: { id: Tab; label: string; emoji: string }[] = [
  { id: 'dashboard', label: 'Dashboard', emoji: '📊' },
  { id: 'goals', label: 'Ziele', emoji: '🎯' },
  { id: 'portfolio', label: 'Portfolio', emoji: '💼' },
  { id: 'projection', label: 'Projektion', emoji: '📈' },
];

export function TabNav({ active, onChange }: TabNavProps) {
  return (
    <nav aria-label="Hauptnavigation" className="bg-surface-1 border-b border-white/5">
      <div className="max-w-4xl mx-auto px-2 flex gap-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            aria-current={active === tab.id ? 'page' : undefined}
            className={`flex items-center gap-1.5 px-3 py-3 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent rounded-t ${
              active === tab.id
                ? 'text-accent border-b-2 border-accent'
                : 'text-white/60 hover:text-white/90 border-b-2 border-transparent'
            }`}
          >
            <span aria-hidden="true">{tab.emoji}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

export type { Tab };
