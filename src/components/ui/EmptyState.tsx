import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

export function EmptyState({ icon: Icon, title, message, action }: { icon: LucideIcon; title: string; message: string; action?: ReactNode }) {
  return (
    <div className="grid place-items-center rounded-lg border border-dashed border-[var(--border)] bg-[var(--surface-muted)] px-4 py-10 text-center">
      <div className="grid max-w-sm place-items-center gap-3">
        <span className="grid size-12 place-items-center rounded-lg bg-[var(--card)] text-[var(--accent)] shadow-[var(--shadow)]">
          <Icon size={22} />
        </span>
        <div>
          <h2 className="text-base font-bold">{title}</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">{message}</p>
        </div>
        {action}
      </div>
    </div>
  );
}
