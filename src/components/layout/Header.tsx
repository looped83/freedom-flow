import { IconWave } from '../ui/Icons';

export function Header() {
  return (
    <header className="sticky top-0 z-10 hidden border-b border-white/5 bg-surface/80 backdrop-blur-md sm:block">
      <div className="mx-auto flex h-14 max-w-4xl items-center gap-2 px-4">
        <IconWave className="w-5 h-5 text-accent" />
        <span className="font-semibold tracking-tight text-white">Freedom Flow</span>
      </div>
    </header>
  );
}
