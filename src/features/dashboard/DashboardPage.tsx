import { FormEvent, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowUpRight, CalendarClock, CheckCircle2, CreditCard, HeartPulse, MessageSquareText, PiggyBank, Plus, Receipt, Send, TrendingUp, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { api } from '../../api/client';
import { Button } from '../../components/ui/Button';
import { Card, StaticCard } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Page } from '../../components/ui/Page';
import { Skeleton } from '../../components/ui/Skeleton';
import { useToast } from '../../components/ui/Toast';
import { renewalIcons, savingsIdeas, spendingSeries } from '../../data/mockData';
import { getCategorySpend } from '../../lib/categories';
import { currency, shortDate } from '../../lib/format';

export function DashboardPage() {
  const { showToast } = useToast();
  const [suggestion, setSuggestion] = useState('');
  const [suggestionError, setSuggestionError] = useState('');
  const [showSuggestionConfirmation, setShowSuggestionConfirmation] = useState(false);
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: api.dashboard
  });
  const { data: subscriptions = [] } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: api.subscriptions
  });
  const suggestionMutation = useMutation({
    mutationFn: api.createUserSuggestion,
    onSuccess: () => {
      setSuggestion('');
      setSuggestionError('');
      setShowSuggestionConfirmation(true);
      showToast({
        tone: 'success',
        title: 'Suggestion sent',
        message: 'Thanks for helping improve the product.'
      });
    },
    onError: (err) => {
      const message = err instanceof Error ? err.message : 'Could not send your suggestion.';
      setSuggestionError(message);
      showToast({ tone: 'error', title: 'Suggestion failed', message });
    }
  });
  const categorySpend = getCategorySpend(subscriptions);

  function submitSuggestion(event: FormEvent) {
    event.preventDefault();
    const message = suggestion.trim();
    if (message.length < 5) {
      setSuggestionError('Write at least 5 characters.');
      return;
    }

    setSuggestionError('');
    suggestionMutation.mutate(message);
  }

  if (error) {
    return (
      <Page title="Dashboard" eyebrow="Family subscription command center">
        <StaticCard>
          <p className="font-semibold text-[var(--danger)]">{error instanceof Error ? error.message : 'Could not load dashboard data.'}</p>
        </StaticCard>
      </Page>
    );
  }

  if (isLoading || !data) {
    return (
      <Page title="Dashboard" eyebrow="Family subscription command center">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </Page>
    );
  }

  return (
    <Page title="Dashboard" eyebrow="Family subscription command center">
      {data.subscriptionCount === 0 && (
        <EmptyState
          icon={Receipt}
          title="Start by adding subscriptions"
          message="Your dashboard will fill with totals, renewal alerts, category spending, and AI recommendations after the first subscription is saved."
          action={<Link to="/subscriptions" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-4 text-sm font-semibold text-[var(--accent-contrast)] shadow-sm transition hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"><Plus size={16} /> Add Subscription</Link>}
        />
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard icon={CreditCard} label="Total Monthly Cost" value={currency.format(data.totalMonthlySubscriptionCost)} detail="Calculated by backend" />
        <MetricCard icon={CalendarClock} label="Active Subscriptions" value={String(data.subscriptionCount)} detail={`${data.upcomingRenewalsInNext7Days} renew within 7 days`} />
        <MetricCard icon={TrendingUp} label="Yearly Cost" value={currency.format(data.totalYearlySubscriptionCost)} detail="Projected annual spend" />
        <MetricCard icon={HeartPulse} label="Health Score" value={`${data.financialHealth.score}/100`} detail={data.financialHealth.status} />
        <MetricCard icon={PiggyBank} label="Potential Savings" value={currency.format(data.financialHealth.potentialMonthlySavings)} detail={data.financialHealth.status} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(340px,0.8fr)]">
        <StaticCard className="min-h-[360px] overflow-hidden">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">Monthly Spending Overview</h2>
              <p className="text-sm text-[var(--muted)]">Subscription cost trend across the year</p>
            </div>
            <span className="hidden rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-bold text-[var(--accent)] sm:inline-flex">Live forecast</span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={spendingSeries} margin={{ top: 10, right: 18, left: -16, bottom: 0 }}>
              <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: 'var(--muted)', fontSize: 12 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: 'var(--muted)', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text)' }} formatter={(value) => currency.format(Number(value))} />
              <Line type="monotone" dataKey="amount" stroke="var(--accent)" strokeWidth={3} dot={{ r: 4, fill: 'var(--accent)' }} activeDot={{ r: 7 }} isAnimationActive animationDuration={1200} />
            </LineChart>
          </ResponsiveContainer>
        </StaticCard>

        <StaticCard className="overflow-hidden">
          <h2 className="text-lg font-bold">Top Categories</h2>
          <p className="mb-4 text-sm text-[var(--muted)]">Where recurring spend clusters</p>
          {categorySpend.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={210}>
                <PieChart>
                  <Pie data={categorySpend} dataKey="value" nameKey="name" innerRadius={58} outerRadius={88} paddingAngle={4} animationDuration={900}>
                    {categorySpend.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text)' }} formatter={(value) => currency.format(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid gap-2">
                {categorySpend.map((item) => (
                  <div key={item.name} className="flex items-center justify-between gap-3 text-sm">
                    <span className="flex min-w-0 items-center gap-2 text-[var(--muted)]"><span className="size-2.5 shrink-0 rounded-full" style={{ background: item.fill }} /><span className="truncate">{item.name}</span> <span className="text-xs">({item.count})</span></span>
                    <strong>{currency.format(item.value)}</strong>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <EmptyState icon={Receipt} title="No categories yet" message="Category totals appear after you add subscriptions." />
          )}
        </StaticCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(340px,0.85fr)]">
        <StaticCard>
          <h2 className="text-lg font-bold">Upcoming Renewals</h2>
          <div className="mt-4 grid gap-3">
            {data.upcomingRenewals.slice(0, 4).map((item, index) => {
              const Icon = renewalIcons[item.name] ?? CreditCard;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.06 }}
                  className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3"
                >
                  <span className="grid size-11 place-items-center rounded-lg bg-[var(--card)] text-[var(--accent)]"><Icon size={19} /></span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-[var(--muted)]">Renews {shortDate.format(new Date(item.renewalDate))}</p>
                  </div>
                  <strong>{currency.format(item.cost)}</strong>
                </motion.div>
              );
            })}
            {data.upcomingRenewals.length === 0 && <EmptyState icon={CalendarClock} title="No renewals due soon" message="Renewals inside the next 7 days will appear here." />}
          </div>
        </StaticCard>

        <StaticCard className="overflow-hidden">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--accent)]">Potential Savings</p>
              <h2 className="mt-2 text-4xl font-black">{currency.format(data.financialHealth.potentialMonthlySavings)}</h2>
            </div>
            <PiggyBank className="text-[var(--accent)]" size={32} />
          </div>
          <div className="mt-5 grid gap-3">
            {savingsIdeas.map((idea) => (
              <div key={idea} className="rounded-lg bg-[var(--surface-muted)] px-3 py-2 text-sm text-[var(--muted)]">{idea}</div>
            ))}
            <div className="rounded-lg bg-[var(--surface-muted)] px-3 py-2 text-sm text-[var(--muted)]">{data.financialHealth.recommendation}</div>
          </div>
          <Button className="mt-5 w-full">
            View Recommendations <ArrowUpRight size={16} />
          </Button>
        </StaticCard>
      </div>

      <StaticCard>
        <div>
          <div>
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]"><MessageSquareText size={18} /></span>
              <h2 className="text-lg font-bold">Product Suggestions</h2>
            </div>
            <p className="mt-2 text-sm text-[var(--muted)]">Share recommendations for improving FamilyBudget AI.</p>
          </div>
        </div>
        <form className="mt-5 grid gap-3" onSubmit={submitSuggestion}>
          <label className="grid gap-1.5 text-sm font-semibold text-[var(--muted)]">
            Suggestion
            <textarea
              className="form-field min-h-28 resize-y"
              value={suggestion}
              onChange={(event) => setSuggestion(event.target.value)}
              maxLength={2000}
              placeholder="Tell us what would make this product better."
              disabled={suggestionMutation.isPending}
              required
              aria-invalid={Boolean(suggestionError)}
            />
          </label>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className={suggestionError ? 'text-sm font-semibold text-[var(--danger)]' : 'text-sm text-[var(--muted)]'} role={suggestionError ? 'alert' : undefined}>
              {suggestionError || `${suggestion.length}/2000 characters`}
            </p>
            <Button className="sm:w-auto" disabled={suggestionMutation.isPending}>
              <Send size={16} />
              {suggestionMutation.isPending ? 'Sending...' : 'Send Suggestion'}
            </Button>
          </div>
        </form>
      </StaticCard>

      {showSuggestionConfirmation && (
        <div className="fixed inset-0 z-[90] grid place-items-center bg-black/45 px-4" role="dialog" aria-modal="true" aria-labelledby="suggestion-confirmation-title">
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="w-full max-w-md rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--shadow)]"
          >
            <div className="flex items-start gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-[var(--success-soft)] text-[var(--success)]">
                <CheckCircle2 size={22} />
              </span>
              <div className="min-w-0 flex-1">
                <h2 id="suggestion-confirmation-title" className="text-lg font-bold">Suggestion received</h2>
                <p className="mt-1 text-sm text-[var(--muted)]">Thank you. Your suggestion has been saved and will be reviewed.</p>
              </div>
              <button
                type="button"
                className="rounded-md p-1 text-[var(--muted)] hover:bg-[var(--surface-muted)]"
                onClick={() => setShowSuggestionConfirmation(false)}
                aria-label="Close confirmation"
              >
                <X size={18} />
              </button>
            </div>
            <Button className="mt-5 w-full" onClick={() => setShowSuggestionConfirmation(false)}>
              Done
            </Button>
          </motion.div>
        </div>
      )}
    </Page>
  );
}

function MetricCard({ icon: Icon, label, value, detail }: { icon: typeof CreditCard; label: string; value: string; detail: string }) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <span className="grid size-11 place-items-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]"><Icon size={20} /></span>
        <ArrowUpRight size={18} className="text-[var(--muted)]" />
      </div>
      <p className="mt-5 text-sm font-medium text-[var(--muted)]">{label}</p>
      <h2 className="mt-1 text-3xl font-black tracking-normal">{value}</h2>
      <p className="mt-2 text-sm text-[var(--muted)]">{detail}</p>
    </Card>
  );
}
