import type { ReactNode } from 'react';

interface PageHeaderProps {
  icon: ReactNode;
  title: string;
  right?: ReactNode;
}

export function PageHeader({ icon, title, right }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2.5">
        <span className="text-accent flex-shrink-0" aria-hidden="true">{icon}</span>
        <h1 className="text-2xl font-bold text-white">{title}</h1>
      </div>
      {right}
    </div>
  );
}
