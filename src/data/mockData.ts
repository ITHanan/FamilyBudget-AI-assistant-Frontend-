import { BarChart3, BookOpen, CalendarDays, FileText, Film, Music, Shield, Sparkles, Wallet } from 'lucide-react';

export type SubscriptionStatus = 'Active' | 'Trial' | 'Paused';

export interface Subscription {
  id: number;
  name: string;
  cost: number;
  frequency: 'Monthly' | 'Yearly';
  renewalDate: string;
  category: string;
  status: SubscriptionStatus;
  color: string;
}

export const subscriptions: Subscription[] = [
  { id: 1, name: 'Netflix', cost: 159, frequency: 'Monthly', renewalDate: '2026-07-02', category: 'Streaming', status: 'Active', color: '#ef4444' },
  { id: 2, name: 'Spotify Family', cost: 199, frequency: 'Monthly', renewalDate: '2026-07-06', category: 'Streaming', status: 'Active', color: '#22c55e' },
  { id: 3, name: 'Disney+', cost: 119, frequency: 'Monthly', renewalDate: '2026-07-09', category: 'Streaming', status: 'Trial', color: '#38bdf8' },
  { id: 4, name: 'Microsoft 365', cost: 949, frequency: 'Yearly', renewalDate: '2026-07-14', category: 'Productivity', status: 'Active', color: '#6366f1' },
  { id: 5, name: 'Duolingo Super', cost: 95, frequency: 'Monthly', renewalDate: '2026-07-20', category: 'Education', status: 'Active', color: '#84cc16' },
  { id: 6, name: 'iCloud+', cost: 39, frequency: 'Monthly', renewalDate: '2026-07-22', category: 'Utilities', status: 'Active', color: '#0ea5e9' },
  { id: 7, name: 'Canva Pro', cost: 120, frequency: 'Monthly', renewalDate: '2026-07-27', category: 'Productivity', status: 'Paused', color: '#a855f7' }
];

export const spendingSeries = [
  { month: 'Jan', amount: 812 },
  { month: 'Feb', amount: 879 },
  { month: 'Mar', amount: 904 },
  { month: 'Apr', amount: 936 },
  { month: 'May', amount: 918 },
  { month: 'Jun', amount: 982 },
  { month: 'Jul', amount: 1046 },
  { month: 'Aug', amount: 1018 },
  { month: 'Sep', amount: 1088 },
  { month: 'Oct', amount: 1124 },
  { month: 'Nov', amount: 1096 },
  { month: 'Dec', amount: 1168 }
];

export const categoryBreakdown = [
  { name: 'Streaming', value: 477, fill: '#8b5cf6' },
  { name: 'Productivity', value: 199, fill: '#14b8a6' },
  { name: 'Utilities', value: 139, fill: '#38bdf8' },
  { name: 'Education', value: 95, fill: '#f59e0b' },
  { name: 'Other', value: 72, fill: '#f472b6' }
];

export const savingsIdeas = [
  'Cancel Canva Pro while paused to save SEK 120/month.',
  'Move Microsoft 365 to annual family billing and save SEK 276/year.',
  'Review duplicate streaming services after summer holidays.'
];

export const chatPresets = [
  'What subscriptions do I have?',
  'How much do I spend each month?',
  'Which subscriptions renew soon?',
  'How can I save money?'
];

export const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: BarChart3 },
  { label: 'Subscriptions', href: '/subscriptions', icon: Wallet },
  { label: 'Statements', href: '/statements', icon: FileText },
  { label: 'AI Assistant', href: '/assistant', icon: Sparkles },
  { label: 'Analytics', href: '/analytics', icon: BarChart3 },
  { label: 'Calendar', href: '/calendar', icon: CalendarDays },
  { label: 'Settings', href: '/settings', icon: Shield },
  { label: 'Profile', href: '/profile', icon: BookOpen }
];

export const renewalIcons: Record<string, typeof Film> = {
  Netflix: Film,
  'Spotify Family': Music,
  'Disney+': Film,
  'Microsoft 365': Wallet
};
