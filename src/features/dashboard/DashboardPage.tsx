import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowUpRight, CalendarClock, CreditCard, PiggyBank, TrendingUp } from 'lucide-react';
import { Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { api } from '../../api/client';
import { Button } from '../../components/ui/Button';
import { Card, StaticCard } from '../../components/ui/Card';
import { Page } from '../../components/ui/Page';
import { Skeleton } from '../../components/ui/Skeleton';
import { renewalIcons, savingsIdeas, spendingSeries } from '../../data/mockData';
import { getCategorySpend } from '../../lib/categories';
import { currency, shortDate } from '../../lib/format';

export function DashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: api.dashboard
  });
  const { data: subscriptions = [] } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: api.subscriptions
  });
  const categorySpend = getCategorySpend(subscriptions);

  if (error) {
    return (
      <Page title="Dashboard" eyebrow="Family subscription command center">
        <StaticCard>
          <p className="font-semibold text-red-600">{error instanceof Error ? error.message : 'Could not load dashboard data.'}</p>
        </StaticCard>
      </Page>
    );
  }

  if (isLoading || !data) {
    return (
      <Page title="Dashboard" eyebrow="Family subscription command center">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </Page>
    );
  }

  return (
    <Page title="Dashboard" eyebrow="Family subscription command center">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={CreditCard} label="Total Monthly Cost" value={currency.format(data.totalMonthlySubscriptionCost)} detail="Calculated by backend" />
        <MetricCard icon={CalendarClock} label="Active Subscriptions" value={String(data.subscriptionCount)} detail={`${data.upcomingRenewalsInNext7Days} renew within 7 days`} />
        <MetricCard icon={TrendingUp} label="Yearly Cost" value={currency.format(data.totalYearlySubscriptionCost)} detail="Projected annual spend" />
        <MetricCard icon={PiggyBank} label="Potential Savings" value={currency.format(data.financialHealth.potentialMonthlySavings)} detail={data.financialHealth.status} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(340px,0.8fr)]">
        <StaticCard className="min-h-[360px]">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">Monthly Spending Overview</h2>
              <p className="text-sm text-[var(--muted)]">Subscription cost trend across the year</p>
            </div>
            <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-bold text-[var(--accent)]">Live forecast</span>
          </div>
          <ResponsiveContainer width="100%" height={275}>
            <LineChart data={spendingSeries} margin={{ top: 10, right: 18, left: -16, bottom: 0 }}>
              <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: 'var(--muted)', fontSize: 12 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: 'var(--muted)', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text)' }} formatter={(value) => currency.format(Number(value))} />
              <Line type="monotone" dataKey="amount" stroke="var(--accent)" strokeWidth={3} dot={{ r: 4, fill: 'var(--accent)' }} activeDot={{ r: 7 }} isAnimationActive animationDuration={1200} />
            </LineChart>
          </ResponsiveContainer>
        </StaticCard>

        <StaticCard>
          <h2 className="text-lg font-bold">Top Categories</h2>
          <p className="mb-4 text-sm text-[var(--muted)]">Where recurring spend clusters</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={categorySpend} dataKey="value" nameKey="name" innerRadius={62} outerRadius={92} paddingAngle={4} animationDuration={900}>
                {categorySpend.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10 }} formatter={(value) => currency.format(Number(value))} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid gap-2">
            {categorySpend.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-[var(--muted)]"><span className="size-2.5 rounded-full" style={{ background: item.fill }} />{item.name} <span className="text-xs">({item.count})</span></span>
                <strong>{currency.format(item.value)}</strong>
              </div>
            ))}
            {categorySpend.length === 0 && (
              <p className="rounded-lg bg-[var(--surface-muted)] p-3 text-sm text-[var(--muted)]">Add subscriptions to see category spending.</p>
            )}
          </div>
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
            {data.upcomingRenewals.length === 0 && (
              <p className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-4 text-sm text-[var(--muted)]">No upcoming renewals yet. Add subscriptions to populate this list.</p>
            )}
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
