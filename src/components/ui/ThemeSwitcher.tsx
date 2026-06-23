import { Check } from 'lucide-react';
import { themes, ThemeId, useTheme } from '../../app/ThemeProvider';
import { cn } from '../../lib/format';

export function ThemeSwitcher({ compact = false }: { compact?: boolean }) {
  const { theme, setTheme } = useTheme();

  return (
    <fieldset className="grid gap-2" aria-label="Theme selection">
      {!compact && <legend className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Theme</legend>}
      {(Object.entries(themes) as Array<[ThemeId, (typeof themes)[ThemeId]]>).map(([id, item]) => (
        <button
          type="button"
          key={id}
          onClick={() => setTheme(id)}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition focus:outline-none focus:ring-2 focus:ring-[var(--ring)]',
            theme === id ? 'border-[var(--accent)] bg-[var(--accent-soft)]' : 'border-[var(--border)] hover:bg-[var(--surface-muted)]'
          )}
          aria-pressed={theme === id}
        >
          <span className="grid size-5 place-items-center rounded-full border border-[var(--accent)] text-[var(--accent)]">
            {theme === id && <Check size={13} strokeWidth={3} />}
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-[var(--text)]">{item.label}</span>
            {!compact && <span className="block truncate text-xs text-[var(--muted)]">{item.description}</span>}
          </span>
        </button>
      ))}
    </fieldset>
  );
}
