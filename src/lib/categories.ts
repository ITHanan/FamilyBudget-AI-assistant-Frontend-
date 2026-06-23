import { SubscriptionDto } from '../api/client';

const palette = ['#8b5cf6', '#14b8a6', '#38bdf8', '#f59e0b', '#f472b6', '#22c55e', '#ef4444'];

export interface CategorySpend {
  name: string;
  value: number;
  count: number;
  fill: string;
}

export function monthlyCost(cost: number, frequency: SubscriptionDto['billingFrequency']) {
  switch (frequency) {
    case 'Weekly':
      return (cost * 52) / 12;
    case 'Quarterly':
      return cost / 3;
    case 'Yearly':
      return cost / 12;
    case 'Monthly':
    default:
      return cost;
  }
}

export function getCategorySpend(subscriptions: SubscriptionDto[]): CategorySpend[] {
  const totals = subscriptions.reduce<Record<string, CategorySpend>>((acc, item) => {
    const name = item.category?.trim() || 'Other';
    const index = Object.keys(acc).length;
    acc[name] ??= { name, value: 0, count: 0, fill: palette[index % palette.length] };
    acc[name].value += monthlyCost(item.cost, item.billingFrequency);
    acc[name].count += 1;
    return acc;
  }, {});

  return Object.values(totals)
    .map((item) => ({ ...item, value: Math.round(item.value * 100) / 100 }))
    .sort((a, b) => b.value - a.value);
}
