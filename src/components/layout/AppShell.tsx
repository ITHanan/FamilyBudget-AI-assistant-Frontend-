import { AnimatePresence, motion } from 'framer-motion';
import { Bell, Menu, Search, Sparkles, X } from 'lucide-react';
import { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api, tokenStore } from '../../api/client';
import { navItems } from '../../data/mockData';
import { cn } from '../../lib/format';
import { ThemeSwitcher } from '../ui/ThemeSwitcher';
import { Button } from '../ui/Button';

export function AppShell() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  function logout() {
    tokenStore.clear();
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <a className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-[var(--accent)] focus:px-4 focus:py-2 focus:text-[var(--accent-contrast)]" href="#main-content">
        Skip to content
      </a>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-[var(--border)] bg-[var(--sidebar)] px-4 py-5 lg:flex lg:flex-col">
        <SidebarContent onNavigate={() => setDrawerOpen(false)} onLogout={logout} />
      </aside>

      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.button
              aria-label="Close navigation overlay"
              className="fixed inset-0 z-40 bg-black/35 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 w-[86vw] max-w-80 border-r border-[var(--border)] bg-[var(--sidebar)] px-4 py-5 lg:hidden"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 280, damping: 28 }}
            >
              <div className="mb-4 flex items-center justify-between">
                <Brand />
                <button className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--surface-muted)]" aria-label="Close menu" onClick={() => setDrawerOpen(false)}>
                  <X size={20} />
                </button>
              </div>
              <SidebarContent onNavigate={() => setDrawerOpen(false)} onLogout={logout} hideBrand />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--bg)_86%,transparent)] px-4 py-3 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-7xl items-center gap-3">
            <button className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--surface-muted)] lg:hidden" aria-label="Open menu" onClick={() => setDrawerOpen(true)}>
              <Menu size={22} />
            </button>
            <div className="hidden min-w-0 flex-1 items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--muted)] shadow-[var(--shadow)] sm:flex">
              <Search size={18} />
              <span>Search expenses, renewals, categories...</span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Button variant="secondary" className="hidden sm:inline-flex">
                <Sparkles size={16} /> Ask AI
              </Button>
              <button className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-2 text-[var(--muted)] hover:text-[var(--text)]" aria-label="Notifications">
                <Bell size={19} />
              </button>
            </div>
          </div>
        </header>

        <main id="main-content" className="px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:pb-10">
          <Outlet />
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--border)] bg-[color-mix(in_srgb,var(--card)_92%,transparent)] px-2 py-2 backdrop-blur-xl lg:hidden" aria-label="Mobile navigation">
        <div className="grid grid-cols-5 gap-1">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const active = location.pathname.startsWith(item.href);
            return (
              <NavLink
                key={item.href}
                to={item.href}
                className={cn(
                  'grid place-items-center gap-1 rounded-lg px-1 py-2 text-[11px] font-semibold transition focus:outline-none focus:ring-2 focus:ring-[var(--ring)]',
                  active ? 'bg-[var(--accent-soft)] text-[var(--accent)]' : 'text-[var(--muted)]'
                )}
              >
                <Icon size={19} />
                <span className="truncate">{item.label.split(' ')[0]}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

function SidebarContent({ onNavigate, onLogout, hideBrand = false }: { onNavigate: () => void; onLogout: () => void; hideBrand?: boolean }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-5">
      {!hideBrand && <Brand />}
      <nav className="grid gap-1" aria-label="Main navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.href}
              to={item.href}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-[var(--ring)]',
                  isActive ? 'bg-[var(--nav-active)] text-[var(--text)]' : 'text-[var(--muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--text)]'
                )
              }
            >
              <Icon size={18} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
      <div className="mt-auto grid gap-4">
        <UserCard onLogout={onLogout} />
        <ThemeSwitcher />
      </div>
    </div>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-3 px-2">
      <span className="grid size-10 place-items-center rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] shadow-sm">
        <Sparkles size={20} />
      </span>
      <div>
        <p className="text-base font-extrabold tracking-normal">FamilyBudget AI</p>
        <p className="text-xs font-medium text-[var(--muted)]">Subscription intelligence</p>
      </div>
    </div>
  );
}

function UserCard({ onLogout }: { onLogout: () => void }) {
  const { data: user } = useQuery({ queryKey: ['me'], queryFn: api.me });
  const fullName = user ? `${user.firstName} ${user.lastName}` : 'Family member';
  const initials = user ? `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase() : 'FB';

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 shadow-[var(--shadow)]">
      <div className="flex items-center gap-3">
        <div className="grid size-10 place-items-center rounded-full bg-[var(--accent-soft)] text-sm font-bold text-[var(--accent)]">{initials}</div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold">{fullName}</p>
          <p className="truncate text-xs text-[var(--muted)]">{user ? `@${user.username}` : 'Family plan admin'}</p>
        </div>
      </div>
      <button onClick={onLogout} className="mt-3 w-full rounded-lg px-3 py-2 text-left text-xs font-semibold text-[var(--muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--text)]">
        Sign out
      </button>
    </div>
  );
}
