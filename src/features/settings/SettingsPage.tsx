import { Bell, Lock, User } from 'lucide-react';
import { Page } from '../../components/ui/Page';
import { StaticCard } from '../../components/ui/Card';
import { ThemeSwitcher } from '../../components/ui/ThemeSwitcher';

export function SettingsPage({ profileMode = false }: { profileMode?: boolean }) {
  return (
    <Page title={profileMode ? 'Profile' : 'Settings'} eyebrow="Account preferences">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <StaticCard>
          <SectionTitle icon={User} title="Profile" />
          <div className="mt-4 grid gap-4">
            <label className="grid gap-1.5 text-sm font-semibold text-[var(--muted)]">Name<input className="form-field" defaultValue="Ithan Eriksson" /></label>
            <label className="grid gap-1.5 text-sm font-semibold text-[var(--muted)]">Email<input className="form-field" defaultValue="ithan@example.com" /></label>
          </div>
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
