import { Link } from 'react-router-dom';
import heroBackground from '../assets/familybudget-hero-bg.png';

export function LandingPage() {
  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <section className="relative grid min-h-screen overflow-hidden px-6 py-16">
        <img
          src={heroBackground}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,var(--bg)_0%,color-mix(in_srgb,var(--bg)_90%,transparent)_32%,color-mix(in_srgb,var(--bg)_42%,transparent)_62%,color-mix(in_srgb,var(--bg)_16%,transparent)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_24%,color-mix(in_srgb,var(--accent)_14%,transparent),transparent_28rem)]" />
        <div className="relative z-10 mx-auto grid min-h-[calc(100vh-8rem)] w-full max-w-7xl content-center">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--accent)]">FamilyBudget AI</p>
            <h1 className="mt-4 max-w-3xl text-5xl font-black tracking-normal text-[var(--text)] sm:text-7xl">Your family's AI finance assistant</h1>
            <p className="mt-5 max-w-2xl text-lg font-medium text-[var(--muted)]">
              Track subscriptions, understand recurring monthly and yearly costs, see renewals before they hit, and ask questions about your household spending.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[var(--accent)] px-5 text-sm font-bold text-[var(--accent-contrast)] shadow-[var(--shadow)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]" to="/dashboard">Open dashboard</Link>
              <Link className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[var(--border)] bg-[color-mix(in_srgb,var(--card)_82%,transparent)] px-5 text-sm font-bold text-[var(--text)] backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-[var(--ring)]" to="/register">Register</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
