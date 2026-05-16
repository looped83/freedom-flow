interface HeaderProps {
  onReset: () => void;
}

export function Header({ onReset }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-surface/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-accent text-xl" aria-hidden="true">💹</span>
          <span className="font-semibold text-white tracking-tight">Freedom Flow</span>
        </div>
        <button
          onClick={onReset}
          className="text-xs text-white/60 hover:text-white/90 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent rounded px-2 py-1"
          aria-label="Zurücksetzen auf Beispieldaten 2026"
        >
          Reset
        </button>
      </div>
    </header>
  );
}
