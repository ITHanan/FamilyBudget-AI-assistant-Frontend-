import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, tokenStore } from '../api/client';
import { Button } from '../components/ui/Button';

export function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await api.login(username, password);
      tokenStore.set(response.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign you in. Check your username and password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-dvh place-items-start bg-[var(--bg)] px-4 py-6 text-[var(--text)] sm:place-items-center sm:py-10">
      <form className="grid w-full max-w-md gap-5 rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--shadow)] sm:rounded-xl sm:p-6" onSubmit={submit} aria-busy={loading}>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--accent)]">FamilyBudget AI</p>
          <h1 className="mt-2 text-2xl font-black sm:text-3xl">Welcome back</h1>
        </div>
        {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-600" role="alert">{error}</p>}
        <fieldset className="grid gap-5 disabled:opacity-70" disabled={loading}>
          <label className="grid gap-1.5 text-sm font-semibold text-[var(--muted)]">Username<input className="form-field" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" required /></label>
          <label className="grid gap-1.5 text-sm font-semibold text-[var(--muted)]">Password<input className="form-field" value={password} onChange={(e) => setPassword(e.target.value)} type="password" autoComplete="current-password" required /></label>
        </fieldset>
        <Button disabled={loading} aria-live="polite">{loading ? 'Signing in...' : 'Login'}</Button>
        <p className="text-sm text-[var(--muted)]">Need an account? <Link className="font-bold text-[var(--accent)]" to="/register">Register</Link></p>
      </form>
    </main>
  );
}
