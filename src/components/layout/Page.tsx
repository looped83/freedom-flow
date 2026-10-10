import type { ReactNode } from 'react';

interface PageProps {
  icon: ReactNode;
  title: string;
  /** Element on the right of the title (badge, action…). */
  right?: ReactNode;
  children: ReactNode;
}

/** Page frame shared by all tabs: width, gutters, vertical rhythm, title. */
export function Page({ icon, title, right, children }: PageProps) {
  return (
    <main className="mx-auto max-w-4xl space-y-4 px-4 pb-6 pt-4 sm:pt-6">
      <header className="flex min-h-8 items-center justify-between gap-3">
        <h1 className="flex items-center gap-2.5 text-xl font-bold text-white">
          <span className="text-accent" aria-hidden="true">{icon}</span>
          {title}
        </h1>
        {right}
      </header>
      {children}
    </main>
  );
}
