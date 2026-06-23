import { useQuery } from '@tanstack/react-query';
import { Bar, BarChart, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { api } from '../../api/client';
import { Card, StaticCard } from '../../components/ui/Card';
import { Page } from '../../components/ui/Page';
import { spendingSeries } from '../../data/mockData';
import { getCategorySpend } from '../../lib/categories';
import { currency } from '../../lib/format';

const growthData = [
  { name: 'Q1', value: 6 },
  { name: 'Q2', value: 11 },
  { name: 'Q3', value: 8 },
  { name: 'Q4', value: 14 }
];

export function AnalyticsPage() {
  const { data: subscriptions = [] } = useQuery({ queryKey: ['subscriptions'], queryFn: api.subscriptions });
  const categoryBreakdown = getCategorySpend(subscriptions);

  return (
    <Page title="Analytics" eyebrow="Spend intelligence">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card><p className="text-sm text-[var(--muted)]">Spending Trends</p><h2 className="mt-2 text-3xl font-black">+3.8%</h2><p className="mt-2 text-sm text-[var(--muted)]">Month over month</p></Card>
        <Card><p className="text-sm text-[var(--muted)]">Category Breakdown</p><h2 className="mt-2 text-3xl font-black">{categoryBreakdown.length}</h2><p className="mt-2 text-sm text-[var(--muted)]">Recurring categories</p></Card>
        <Card><p className="text-sm text-[var(--muted)]">Cost Growth</p><h2 className="mt-2 text-3xl font-black">{currency.format(86)}</h2><p className="mt-2 text-sm text-[var(--muted)]">Added since January</p></Card>
        <Card><p className="text-sm text-[var(--muted)]">Savings Opportunities</p><h2 className="mt-2 text-3xl font-black">{currency.format(327)}</h2><p className="mt-2 text-sm text-[var(--muted)]">Estimated monthly impact</p></Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <StaticCard className="min-h-[330px]">
          <h2 className="mb-4 text-lg font-bold">Line Chart</h2>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={spendingSeries} margin={{ left: -18, right: 12 }}>
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted)', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--muted)', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10 }} formatter={(value) => currency.format(Number(value))} />
              <Line type="monotone" dataKey="amount" stroke="var(--accent)" strokeWidth={3} dot={false} animationDuration={1000} />
            </LineChart>
          </ResponsiveContainer>
        </StaticCard>
        <StaticCard className="min-h-[330px]">
          <h2 className="mb-4 text-lg font-bold">Bar Chart</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={growthData}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted)', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--muted)', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10 }} formatter={(value) => `${value}%`} />
              <Bar dataKey="value" fill="var(--accent)" radius={[8, 8, 0, 0]} animationDuration={900} />
            </BarChart>
          </ResponsiveContainer>
        </StaticCard>
      </div>

      <StaticCard>
        <h2 className="mb-4 text-lg font-bold">Donut Chart</h2>
        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={categoryBreakdown} dataKey="value" innerRadius={70} outerRadius={105} paddingAngle={4}>
                {categoryBreakdown.map((entry) => <Cell key={entry.name} fill={entry.fill} />)}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10 }} formatter={(value) => currency.format(Number(value))} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid content-center gap-3">
            {categoryBreakdown.map((item) => (
              <div key={item.name} className="flex items-center justify-between rounded-lg bg-[var(--surface-muted)] p-3">
                <span className="flex items-center gap-2 font-semibold"><span className="size-3 rounded-full" style={{ background: item.fill }} />{item.name} <span className="text-xs text-[var(--muted)]">({item.count})</span></span>
                <span className="text-[var(--muted)]">{currency.format(item.value)}</span>
              </div>
            ))}
            {categoryBreakdown.length === 0 && <p className="text-sm text-[var(--muted)]">Add subscriptions to see category spending.</p>}
          </div>
        </div>
      </StaticCard>
    </Page>
  );
}
