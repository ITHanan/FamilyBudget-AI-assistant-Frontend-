import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, tokenStore } from '../api/client';
import { Button } from '../components/ui/Button';

export function RegisterPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await api.register({ username, firstName, lastName, email, password });
      tokenStore.set(response.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create your account. Check the form and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-dvh place-items-start bg-[var(--bg)] px-4 py-6 text-[var(--text)] sm:place-items-center sm:py-10">
      <form className="grid w-full max-w-xl gap-5 rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--shadow)] sm:rounded-xl sm:p-6" onSubmit={submit} aria-busy={loading}>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--accent)]">FamilyBudget AI</p>
          <h1 className="mt-2 text-2xl font-black sm:text-3xl">Create account</h1>
        </div>
        {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-600" role="alert">{error}</p>}
        <fieldset className="grid gap-5 disabled:opacity-70" disabled={loading}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5 text-sm font-semibold text-[var(--muted)]">First name<input className="form-field" value={firstName} onChange={(e) => setFirstName(e.target.value)} autoComplete="given-name" required /></label>
            <label className="grid gap-1.5 text-sm font-semibold text-[var(--muted)]">Last name<input className="form-field" value={lastName} onChange={(e) => setLastName(e.target.value)} autoComplete="family-name" required /></label>
          </div>
          <label className="grid gap-1.5 text-sm font-semibold text-[var(--muted)]">Email<input className="form-field" value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="email" required /></label>
          <label className="grid gap-1.5 text-sm font-semibold text-[var(--muted)]">Username<input className="form-field" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" minLength={3} required /></label>
          <label className="grid gap-1.5 text-sm font-semibold text-[var(--muted)]">Password<input className="form-field" value={password} onChange={(e) => setPassword(e.target.value)} type="password" autoComplete="new-password" minLength={8} required /></label>
        </fieldset>
        <Button disabled={loading} aria-live="polite">{loading ? 'Creating account...' : 'Register'}</Button>
        <p className="text-sm text-[var(--muted)]">Already registered? <Link className="font-bold text-[var(--accent)]" to="/login">Login</Link></p>
      </form>
    </main>
  );
}
