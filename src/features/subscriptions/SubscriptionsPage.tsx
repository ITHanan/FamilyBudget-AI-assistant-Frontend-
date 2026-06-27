import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { Edit3, Plus, Receipt, Trash2, X } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { api, BillingFrequency, SubscriptionDto, SubscriptionRequest } from '../../api/client';
import { Button } from '../../components/ui/Button';
import { StaticCard } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Page } from '../../components/ui/Page';
import { Skeleton } from '../../components/ui/Skeleton';
import { useToast } from '../../components/ui/Toast';
import { currency, shortDate } from '../../lib/format';

const emptyForm: SubscriptionRequest = {
  name: '',
  cost: 0,
  billingFrequency: 'Monthly',
  renewalDate: '2026-07-01',
  category: 'Streaming'
};

export function SubscriptionsPage() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<SubscriptionDto | null>(null);
  const [form, setForm] = useState<SubscriptionRequest>(emptyForm);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const subscriptionsQuery = useQuery({ queryKey: ['subscriptions'], queryFn: api.subscriptions });

  const saveMutation = useMutation({
    mutationFn: (payload: SubscriptionRequest) => (editing ? api.updateSubscription(editing.id, payload) : api.createSubscription(payload)),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['subscriptions'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })
      ]);
      setModalOpen(false);
      showToast({ tone: 'success', title: editing ? 'Subscription updated' : 'Subscription added', message: form.name });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: api.deleteSubscription,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['subscriptions'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })
      ]);
      showToast({ tone: 'success', title: 'Subscription deleted' });
    },
    onError: (error) => {
      showToast({ tone: 'error', title: 'Delete failed', message: error instanceof Error ? error.message : 'Could not delete subscription.' });
    }
  });

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setFieldErrors({});
    setModalOpen(true);
  }

  function openEdit(item: SubscriptionDto) {
    setEditing(item);
    setForm({
      name: item.name,
      cost: item.cost,
      billingFrequency: item.billingFrequency,
      renewalDate: item.renewalDate.slice(0, 10),
      category: item.category
    });
    setFieldErrors({});
    setModalOpen(true);
  }

  function validate() {
    const errors: Record<string, string> = {};
    if (!form.name.trim()) errors.name = 'Name is required.';
    if (form.cost < 0) errors.cost = 'Cost cannot be negative.';
    if (!form.renewalDate) errors.renewalDate = 'Renewal date is required.';
    if (!form.category.trim()) errors.category = 'Category is required.';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!validate()) return;
    saveMutation.mutate(form);
  }

  return (
    <Page title="Subscriptions" eyebrow="Manage recurring household costs" action={<Button onClick={openCreate}><Plus size={16} /> Add Subscription</Button>}>
      <StaticCard className="overflow-hidden p-0">
        {subscriptionsQuery.isLoading ? (
          <div className="grid gap-3 p-5">
            {Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} className="h-14" />)}
          </div>
        ) : subscriptionsQuery.error ? (
          <p className="p-5 font-semibold text-red-600">{subscriptionsQuery.error instanceof Error ? subscriptionsQuery.error.message : 'Could not load subscriptions.'}</p>
        ) : (subscriptionsQuery.data ?? []).length === 0 ? (
          <div className="p-5">
            <EmptyState icon={Receipt} title="No subscriptions yet" message="Add recurring household costs to unlock dashboard totals, renewal alerts, and AI analysis." action={<Button onClick={openCreate}><Plus size={16} /> Add Subscription</Button>} />
          </div>
        ) : (
          <>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="border-b border-[var(--border)] bg-[var(--surface-muted)] text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
                <tr>
                  {['Name', 'Cost', 'Frequency', 'Renewal Date', 'Category', 'Status', 'Actions'].map((header) => (
                    <th key={header} className="px-5 py-4 font-bold">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {(subscriptionsQuery.data ?? []).map((item) => (
                  <tr key={item.id} className="transition hover:bg-[var(--surface-muted)]">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="size-3 rounded-full bg-[var(--accent)]" />
                        <span className="font-bold">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-semibold">{currency.format(item.cost)}</td>
                    <td className="px-5 py-4 text-[var(--muted)]">{item.billingFrequency}</td>
                    <td className="px-5 py-4 text-[var(--muted)]">{shortDate.format(new Date(item.renewalDate))}</td>
                    <td className="px-5 py-4"><span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-bold text-[var(--accent)]">{item.category}</span></td>
                    <td className="px-5 py-4"><span className="rounded-full bg-emerald-500/12 px-3 py-1 text-xs font-bold text-emerald-600">Active</span></td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <Button variant="secondary" className="px-3" onClick={() => openEdit(item)} aria-label={`Edit ${item.name}`}><Edit3 size={15} /></Button>
                        <Button variant="danger" className="px-3" disabled={deleteMutation.isPending} onClick={() => deleteMutation.mutate(item.id)} aria-label={`Delete ${item.name}`}><Trash2 size={15} /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="grid gap-3 p-4 md:hidden">
            {(subscriptionsQuery.data ?? []).map((item) => (
              <div key={item.id} className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-bold">{item.name}</p>
                    <p className="mt-1 text-sm text-[var(--muted)]">{item.billingFrequency} · {shortDate.format(new Date(item.renewalDate))}</p>
                  </div>
                  <strong>{currency.format(item.cost)}</strong>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-bold text-[var(--accent)]">{item.category}</span>
                  <div className="flex gap-2">
                    <Button variant="secondary" className="px-3" onClick={() => openEdit(item)} aria-label={`Edit ${item.name}`}><Edit3 size={15} /></Button>
                    <Button variant="danger" className="px-3" disabled={deleteMutation.isPending} onClick={() => deleteMutation.mutate(item.id)} aria-label={`Delete ${item.name}`}><Trash2 size={15} /></Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          </>
        )}
      </StaticCard>

      <AnimatePresence>
        {modalOpen && (
          <>
            <motion.button className="fixed inset-0 z-40 bg-black/40" aria-label="Close subscription modal" onClick={() => setModalOpen(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
            <motion.div className="fixed inset-x-4 top-8 z-50 mx-auto max-w-lg rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-premium sm:top-16" initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 12 }}>
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-bold">{editing ? 'Edit subscription' : 'Add subscription'}</h2>
                <button className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--surface-muted)]" onClick={() => setModalOpen(false)} aria-label="Close modal"><X size={19} /></button>
              </div>
              <form onSubmit={submit} className="grid gap-4">
                {saveMutation.error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-600">{saveMutation.error instanceof Error ? saveMutation.error.message : 'Could not save subscription.'}</p>}
                <label className="grid gap-1.5 text-sm font-semibold text-[var(--muted)]">Name<input className="form-field" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required aria-invalid={Boolean(fieldErrors.name)} />{fieldErrors.name && <span className="text-xs font-semibold text-red-600">{fieldErrors.name}</span>}</label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-1.5 text-sm font-semibold text-[var(--muted)]">Cost<input className="form-field" type="number" min="0" step="0.01" value={form.cost} onChange={(event) => setForm({ ...form, cost: Number(event.target.value) })} required aria-invalid={Boolean(fieldErrors.cost)} />{fieldErrors.cost && <span className="text-xs font-semibold text-red-600">{fieldErrors.cost}</span>}</label>
                  <label className="grid gap-1.5 text-sm font-semibold text-[var(--muted)]">Frequency<select className="form-field" value={form.billingFrequency} onChange={(event) => setForm({ ...form, billingFrequency: event.target.value as BillingFrequency })}><option>Weekly</option><option>Monthly</option><option>Quarterly</option><option>Yearly</option></select></label>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-1.5 text-sm font-semibold text-[var(--muted)]">Renewal Date<input className="form-field" type="date" value={form.renewalDate} onChange={(event) => setForm({ ...form, renewalDate: event.target.value })} required aria-invalid={Boolean(fieldErrors.renewalDate)} />{fieldErrors.renewalDate && <span className="text-xs font-semibold text-red-600">{fieldErrors.renewalDate}</span>}</label>
                  <label className="grid gap-1.5 text-sm font-semibold text-[var(--muted)]">Category<input className="form-field" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} required aria-invalid={Boolean(fieldErrors.category)} />{fieldErrors.category && <span className="text-xs font-semibold text-red-600">{fieldErrors.category}</span>}</label>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={saveMutation.isPending}>{saveMutation.isPending ? 'Saving...' : editing ? 'Save changes' : 'Add subscription'}</Button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </Page>
  );
}
