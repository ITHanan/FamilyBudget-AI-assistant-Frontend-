const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5001';

export type BillingFrequency = 'Weekly' | 'Monthly' | 'Quarterly' | 'Yearly';

export interface UserDto {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
}

export interface RegisterRequest {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  expiresAt: string;
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

export interface BankStatementDto {
  id: number;
  originalFileName: string;
  bankName?: string | null;
  statementPeriodStart?: string | null;
  statementPeriodEnd?: string | null;
  uploadedAt: string;
  importedAt?: string | null;
  transactionCount: number;
  importStatus: string;
  importError?: string | null;
}

export interface BankTransactionDto {
  id: number;
  bankStatementId: number;
  transactionDate: string;
  description: string;
  amount: number;
  balance?: number | null;
  currency: string;
  category: string;
  rawText: string;
  isIncome: boolean;
  isInternalTransfer: boolean;
  isRecurringCandidate: boolean;
  needsReview: boolean;
  createdAt: string;
}

export interface BankStatementImportResultDto {
  statementId: number;
  transactionCount: number;
  needsReviewCount: number;
  recurringCandidateCount: number;
}

export interface CategoryTotalDto {
  category: string;
  amount: number;
  count: number;
}

export interface TransactionSummaryDto {
  income: number;
  expenses: number;
  netSavings: number;
  savingsRate: number;
  categoryTotals: CategoryTotalDto[];
  largestTransactions: BankTransactionDto[];
  recurringPaymentTotal: number;
}

export interface RecurringPaymentCandidateDto {
  merchantName: string;
  averageAmount: number;
  billingFrequency: string;
  confidence: number;
  firstSeenDate: string;
  lastSeenDate: string;
  suggestedCategory: string;
  transactionCount: number;
}

export interface UserSuggestionDto {
  id: number;
  message: string;
  recipientEmail: string;
  createdAt: string;
}

export const tokenStore = {
  get: () => {
    const expiresAt = localStorage.getItem('familybudgetai_token_expires_at');
    if (expiresAt && Date.parse(expiresAt) <= Date.now()) {
      tokenStore.clear();
      return null;
    }

    return localStorage.getItem('familybudgetai_token');
  },
  set: (token: string, expiresAt: string) => {
    localStorage.setItem('familybudgetai_token', token);
    localStorage.setItem('familybudgetai_token_expires_at', expiresAt);
  },
  clear: () => {
    localStorage.removeItem('familybudgetai_token');
    localStorage.removeItem('familybudgetai_token_expires_at');
  }
};

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = tokenStore.get();
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers
    });
  } catch {
    throw new Error(`Could not reach the backend at ${API_BASE_URL}. Start the API and try again.`);
  }

  if (response.status === 401) {
    tokenStore.clear();
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    if (response.status === 429) {
      message = 'Too many attempts. Wait a minute and try again.';
    }
    try {
      const body = await response.json();
      if (body.errors && typeof body.errors === 'object') {
        const validationMessages = Object.values(body.errors).flat();
        if (validationMessages.length > 0) {
          message = String(validationMessages[0]);
        }
      } else if (typeof body.detail === 'string') {
        message = body.detail;
      } else if (typeof body.message === 'string') {
        message = body.message;
      } else if (typeof body.title === 'string') {
        message = body.title;
      }
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

async function upload<T>(path: string, formData: FormData): Promise<T> {
  const token = tokenStore.get();
  const headers = new Headers();

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers,
      body: formData
    });
  } catch {
    throw new Error(`Could not reach the backend at ${API_BASE_URL}. Start the API and try again.`);
  }

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const body = await response.json();
      if (typeof body.detail === 'string') message = body.detail;
      else if (typeof body.message === 'string') message = body.message;
      else if (typeof body.title === 'string') message = body.title;
    } catch {
      // Keep default error message.
    }
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export const api = {
  register: (payload: RegisterRequest) =>
    request<AuthResponse>('/api/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (username: string, password: string) =>
    request<AuthResponse>('/api/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
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
  markNotificationRead: (id: number) => request<void>(`/api/notifications/mark-read/${id}`, { method: 'POST' }),
  bankStatements: () => request<BankStatementDto[]>('/api/bank-statements'),
  uploadBankStatement: (file: File) => {
    const formData = new FormData();
    formData.set('file', file);
    return upload<BankStatementImportResultDto>('/api/bank-statements/upload', formData);
  },
  bankStatementTransactions: (statementId: number) => request<BankTransactionDto[]>(`/api/bank-statements/${statementId}/transactions`),
  updateTransactionCategory: (id: number, category: string, rememberRule: boolean) =>
    request<BankTransactionDto>(`/api/transactions/${id}/category`, {
      method: 'PUT',
      body: JSON.stringify({ category, rememberRule })
    }),
  transactionSummary: () => request<TransactionSummaryDto>('/api/transactions/summary'),
  recurringCandidates: () => request<RecurringPaymentCandidateDto[]>('/api/transactions/recurring-candidates'),
  createUserSuggestion: (message: string) =>
    request<UserSuggestionDto>('/api/user-suggestions', {
      method: 'POST',
      body: JSON.stringify({ message })
    })
};
