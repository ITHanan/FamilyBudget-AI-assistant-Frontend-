import { useEffect, useState } from 'react';
import { api, DashboardSummary } from '../api/client';

const money = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'SEK' });

export function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.dashboard().then(setSummary).catch((err) => setError(err.message));
  }, []);

  if (error) return <p className="error">{error}</p>;
  if (!summary) return <p>Loading dashboard...</p>;

  return (
    <section className="page">
      <h1>Dashboard</h1>
      <div className="metric-grid">
        <article className="metric"><span>Monthly cost</span><strong>{money.format(summary.totalMonthlySubscriptionCost)}</strong></article>
        <article className="metric"><span>Yearly cost</span><strong>{money.format(summary.totalYearlySubscriptionCost)}</strong></article>
        <article className="metric"><span>Subscriptions</span><strong>{summary.subscriptionCount}</strong></article>
        <article className="metric"><span>Renewals in 7 days</span><strong>{summary.upcomingRenewalsInNext7Days}</strong></article>
      </div>
      <article className="financial-health-card">
        <div>
          <span className="eyebrow">Financial Health</span>
          <h2>Score: {summary.financialHealth.score}/100</h2>
          <p className="health-status">Status: {summary.financialHealth.status}</p>
        </div>
        <div className="health-details">
          <div>
            <span>Potential Savings</span>
            <strong>{money.format(summary.financialHealth.potentialMonthlySavings)}/month</strong>
          </div>
          <div>
            <span>Recommendation</span>
            <p>{summary.financialHealth.recommendation}</p>
          </div>
        </div>
      </article>
      <h2>Upcoming renewals</h2>
      <div className="list">
        {summary.upcomingRenewals.length === 0 && <p>No renewals in the next 7 days.</p>}
        {summary.upcomingRenewals.map((item) => (
          <div className="row" key={item.id}>
            <div><strong>{item.name}</strong><span>{item.category}</span></div>
            <div>{item.renewalDate}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
