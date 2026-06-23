import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, tokenStore } from '../api/client';
import { Button } from '../components/ui/Button';

export function RegisterPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await api.register({ username, firstName, lastName, password });
      tokenStore.set(response.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[var(--bg)] px-4 py-10 text-[var(--text)]">
      <form className="grid w-full max-w-xl gap-5 rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--shadow)]" onSubmit={submit}>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--accent)]">FamilyBudget AI</p>
          <h1 className="mt-2 text-3xl font-black">Create account</h1>
        </div>
        {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-600">{error}</p>}
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1.5 text-sm font-semibold text-[var(--muted)]">First name<input className="form-field" value={firstName} onChange={(e) => setFirstName(e.target.value)} autoComplete="given-name" required /></label>
          <label className="grid gap-1.5 text-sm font-semibold text-[var(--muted)]">Last name<input className="form-field" value={lastName} onChange={(e) => setLastName(e.target.value)} autoComplete="family-name" required /></label>
        </div>
        <label className="grid gap-1.5 text-sm font-semibold text-[var(--muted)]">Username<input className="form-field" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" minLength={3} required /></label>
        <label className="grid gap-1.5 text-sm font-semibold text-[var(--muted)]">Password<input className="form-field" value={password} onChange={(e) => setPassword(e.target.value)} type="password" minLength={8} required /></label>
        <Button disabled={loading}>{loading ? 'Creating...' : 'Register'}</Button>
        <p className="text-sm text-[var(--muted)]">Already registered? <Link className="font-bold text-[var(--accent)]" to="/login">Login</Link></p>
      </form>
    </main>
  );
}
