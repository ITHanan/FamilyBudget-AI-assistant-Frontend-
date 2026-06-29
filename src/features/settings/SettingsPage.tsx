import { useQuery } from '@tanstack/react-query';
import { Bell, Lock, User } from 'lucide-react';
import { api } from '../../api/client';
import { Page } from '../../components/ui/Page';
import { StaticCard } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import { ThemeSwitcher } from '../../components/ui/ThemeSwitcher';

export function SettingsPage({ profileMode = false }: { profileMode?: boolean }) {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['current-user'],
    queryFn: api.me
  });

  const fullName = user ? `${user.firstName} ${user.lastName}`.trim() : '';

  return (
    <Page title={profileMode ? 'Profile' : 'Settings'} eyebrow="Account preferences">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <StaticCard>
          <SectionTitle icon={User} title="Profile" />
          {error ? (
            <p className="mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-600" role="alert">
              {error instanceof Error ? error.message : 'Could not load profile information.'}
            </p>
          ) : isLoading || !user ? (
            <div className="mt-4 grid gap-4">
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
            </div>
          ) : (
            <div className="mt-4 grid gap-4">
              <label className="grid gap-1.5 text-sm font-semibold text-[var(--muted)]">
                Full name
                <input className="form-field cursor-not-allowed bg-[var(--surface-muted)]" value={fullName} readOnly aria-readonly="true" />
              </label>
              <label className="grid gap-1.5 text-sm font-semibold text-[var(--muted)]">
                Email
                <input className="form-field cursor-not-allowed bg-[var(--surface-muted)]" value={user.email} readOnly aria-readonly="true" />
              </label>
            </div>
          )}
        </StaticCard>
        <StaticCard>
          <SectionTitle icon={Bell} title="Notifications" />
          <div className="mt-4 grid gap-3">
            {['Renewal reminders', 'Savings alerts', 'Weekly family digest'].map((item) => (
              <label key={item} className="flex items-center justify-between rounded-lg bg-[var(--surface-muted)] p-3 font-semibold">
                {item}
                <input type="checkbox" defaultChecked className="size-5 accent-[var(--accent)]" />
              </label>
            ))}
          </div>
        </StaticCard>
        <StaticCard>
          <SectionTitle icon={Lock} title="Security" />
          <div className="mt-4 grid gap-3 text-sm text-[var(--muted)]">
            <p>Two-factor authentication is ready for setup.</p>
            <p>Last login: June 23, 2026 at 18:45.</p>
          </div>
        </StaticCard>
        <StaticCard>
          <h2 className="text-lg font-bold">Theme</h2>
          <p className="mb-4 mt-1 text-sm text-[var(--muted)]">Switch between Modern Minimal, Dark Mode, and Soft Pastel. Your choice is stored in localStorage.</p>
          <ThemeSwitcher />
        </StaticCard>
      </div>
    </Page>
  );
}

function SectionTitle({ icon: Icon, title }: { icon: typeof User; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid size-10 place-items-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]"><Icon size={18} /></span>
      <h2 className="text-lg font-bold">{title}</h2>
    </div>
  );
}
