export function Header() {
  return (
    <header className="sticky top-0 z-10 bg-surface/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center gap-2">
        <span className="text-accent text-xl" aria-hidden="true">💹</span>
        <span className="font-semibold text-white tracking-tight">Freedom Flow</span>
      </div>
    </header>
  );
}
