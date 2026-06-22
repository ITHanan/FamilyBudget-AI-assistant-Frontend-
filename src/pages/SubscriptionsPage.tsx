import { FormEvent, useEffect, useState } from 'react';
import { api, BillingFrequency, SubscriptionDto, SubscriptionRequest } from '../api/client';

const emptyForm: SubscriptionRequest = {
  name: '',
  cost: 0,
  billingFrequency: 'Monthly',
  renewalDate: new Date().toISOString().slice(0, 10),
  category: ''
};

export function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionDto[]>([]);
  const [form, setForm] = useState<SubscriptionRequest>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState('');

  async function load() {
    setSubscriptions(await api.subscriptions());
  }

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');
    try {
      if (editingId) {
        await api.updateSubscription(editingId, form);
      } else {
        await api.createSubscription(form);
      }
      setForm(emptyForm);
      setEditingId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save subscription');
    }
  }

  function edit(item: SubscriptionDto) {
    setEditingId(item.id);
    setForm({
      name: item.name,
      cost: item.cost,
      billingFrequency: item.billingFrequency,
      renewalDate: item.renewalDate,
      category: item.category
    });
  }

  async function remove(id: number) {
    await api.deleteSubscription(id);
    await load();
  }

  return (
    <section className="page two-column">
      <div>
        <h1>Subscriptions</h1>
        {error && <p className="error">{error}</p>}
        <div className="list">
          {subscriptions.map((item) => (
            <div className="row" key={item.id}>
              <div>
                <strong>{item.name}</strong>
                <span>{item.category} · {item.billingFrequency} · ${item.cost}</span>
              </div>
              <div className="row-actions">
                <button className="secondary-button" onClick={() => edit(item)}>Edit</button>
                <button className="danger-button" onClick={() => remove(item.id)}>Delete</button>
              </div>
            </div>
          ))}
          {subscriptions.length === 0 && <p>No subscriptions yet.</p>}
        </div>
      </div>
      <form className="panel" onSubmit={submit}>
        <h2>{editingId ? 'Edit subscription' : 'Add subscription'}</h2>
        <label>Name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label>
        <label>Cost<input type="number" min="0" step="0.01" value={form.cost} onChange={(e) => setForm({ ...form, cost: Number(e.target.value) })} required /></label>
        <label>
          Billing frequency
          <select value={form.billingFrequency} onChange={(e) => setForm({ ...form, billingFrequency: e.target.value as BillingFrequency })}>
            <option>Weekly</option>
            <option>Monthly</option>
            <option>Quarterly</option>
            <option>Yearly</option>
          </select>
        </label>
        <label>Renewal date<input type="date" value={form.renewalDate} onChange={(e) => setForm({ ...form, renewalDate: e.target.value })} required /></label>
        <label>Category<input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required /></label>
        <button className="button">{editingId ? 'Save changes' : 'Add subscription'}</button>
        {editingId && <button className="ghost-button" type="button" onClick={() => { setEditingId(null); setForm(emptyForm); }}>Cancel</button>}
      </form>
    </section>
  );
}
