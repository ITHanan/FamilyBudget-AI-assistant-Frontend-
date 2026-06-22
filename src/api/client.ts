const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000';

export type BillingFrequency = 'Weekly' | 'Monthly' | 'Quarterly' | 'Yearly';

export interface UserDto {
  id: number;
  email: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: UserDto;
}

export interface SubscriptionDto {
  id: number;
  name: string;
  cost: number;
  billingFrequency: BillingFrequency;
  renewalDate: string;
  category: string;
  createdAt: string;
}

export interface SubscriptionRequest {
  name: string;
  cost: number;
  billingFrequency: BillingFrequency;
  renewalDate: string;
  category: string;
}

export interface DashboardSummary {
  totalMonthlySubscriptionCost: number;
  totalYearlySubscriptionCost: number;
  upcomingRenewalsInNext7Days: number;
  subscriptionCount: number;
  upcomingRenewals: SubscriptionDto[];
  financialHealth: FinancialHealthDto;
}

export interface FinancialHealthDto {
  score: number;
  status: string;
  potentialMonthlySavings: number;
  recommendation: string;
}

export interface ConversationListDto {
  id: number;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface MessageDto {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface ConversationDto extends ConversationListDto {
  messages: MessageDto[];
}

export interface SendMessageResponse {
  userMessage: MessageDto;
  assistantMessage: MessageDto;
}

export interface NotificationDto {
  id: number;
  subscriptionId: number;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export const tokenStore = {
  get: () => localStorage.getItem('familybudgetai_token'),
  set: (token: string) => localStorage.setItem('familybudgetai_token', token),
  clear: () => localStorage.removeItem('familybudgetai_token')
};

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = tokenStore.get();
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers
  });

  if (response.status === 401) {
    tokenStore.clear();
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const body = await response.json();
      message = body.message ?? message;
    } catch {
      // Keep default error message.
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const api = {
  register: (email: string, password: string) =>
    request<AuthResponse>('/api/auth/register', { method: 'POST', body: JSON.stringify({ email, password }) }),
  login: (email: string, password: string) =>
    request<AuthResponse>('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  me: () => request<UserDto>('/api/auth/me'),
  subscriptions: () => request<SubscriptionDto[]>('/api/subscriptions'),
  subscription: (id: number) => request<SubscriptionDto>(`/api/subscriptions/${id}`),
  createSubscription: (payload: SubscriptionRequest) =>
    request<SubscriptionDto>('/api/subscriptions', { method: 'POST', body: JSON.stringify(payload) }),
  updateSubscription: (id: number, payload: SubscriptionRequest) =>
    request<SubscriptionDto>(`/api/subscriptions/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteSubscription: (id: number) => request<void>(`/api/subscriptions/${id}`, { method: 'DELETE' }),
  dashboard: () => request<DashboardSummary>('/api/dashboard/summary'),
  conversations: () => request<ConversationListDto[]>('/api/ai/conversations'),
  createConversation: (title?: string) =>
    request<ConversationDto>('/api/ai/conversations', { method: 'POST', body: JSON.stringify({ title }) }),
  conversation: (id: number) => request<ConversationDto>(`/api/ai/conversations/${id}`),
  sendMessage: (id: number, content: string) =>
    request<SendMessageResponse>(`/api/ai/conversations/${id}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content })
    }),
  deleteConversation: (id: number) => request<void>(`/api/ai/conversations/${id}`, { method: 'DELETE' }),
  notifications: () => request<NotificationDto[]>('/api/notifications'),
  markNotificationRead: (id: number) => request<void>(`/api/notifications/mark-read/${id}`, { method: 'POST' })
};
