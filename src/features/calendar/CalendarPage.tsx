import { useQuery } from '@tanstack/react-query';
import { api } from '../../api/client';
import { Page } from '../../components/ui/Page';
import { StaticCard } from '../../components/ui/Card';
import { currency } from '../../lib/format';

const days = Array.from({ length: 35 }, (_, index) => index + 1);

export function CalendarPage() {
  const { data: subscriptions = [] } = useQuery({ queryKey: ['subscriptions'], queryFn: api.subscriptions });

  return (
    <Page title="Calendar" eyebrow="Renewal schedule">
      <StaticCard>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-bold">July 2026</h2>
          <p className="text-sm text-[var(--muted)]">Monthly view</p>
        </div>
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => <div key={day} className="py-2">{day}</div>)}
        </div>
        <div className="mt-2 grid grid-cols-7 gap-2">
          {days.map((day) => {
            const renewals = subscriptions.filter((item) => new Date(item.renewalDate).getDate() === day);
            return (
              <div key={day} className="min-h-24 rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-2 text-left">
                <p className="text-sm font-bold">{day <= 31 ? day : ''}</p>
                <div className="mt-2 grid gap-1">
                  {day <= 31 && renewals.map((item) => (
                    <span key={item.id} className="truncate rounded-md bg-[var(--accent)] px-2 py-1 text-[10px] font-bold text-[var(--accent-contrast)]" title={`${item.name} ${currency.format(item.cost)}`}>
                      {item.name}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </StaticCard>
    </Page>
  );
}
