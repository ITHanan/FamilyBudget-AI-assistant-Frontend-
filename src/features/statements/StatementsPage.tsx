import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChangeEvent, useMemo, useState } from 'react';
import { AlertCircle, BadgeCheck, FileText, Filter, Plus, ReceiptText, Search, Sparkles, Upload } from 'lucide-react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { api, BankStatementDto, BankTransactionDto } from '../../api/client';
import { Button } from '../../components/ui/Button';
import { StaticCard } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Page } from '../../components/ui/Page';
import { Skeleton } from '../../components/ui/Skeleton';
import { useToast } from '../../components/ui/Toast';
import { transactionCategories } from '../../lib/categories';
import { cn, currency, shortDate } from '../../lib/format';

const categoryPalette = ['#2563eb', '#14b8a6', '#f59e0b', '#ef4444', '#8b5cf6', '#22c55e', '#f472b6', '#64748b'];

export function StatementsPage() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [selectedStatementId, setSelectedStatementId] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [needsReviewOnly, setNeedsReviewOnly] = useState(false);

  const statementsQuery = useQuery({ queryKey: ['bank-statements'], queryFn: api.bankStatements });
  const statements = statementsQuery.data ?? [];
  const activeStatement = statements.find((item) => item.id === selectedStatementId) ?? statements[0] ?? null;
  const activeStatementId = activeStatement?.id ?? null;

  const transactionsQuery = useQuery({
    queryKey: ['bank-statement-transactions', activeStatementId],
    queryFn: () => api.bankStatementTransactions(activeStatementId!),
    enabled: activeStatementId !== null
  });

  const summaryQuery = useQuery({ queryKey: ['transaction-summary'], queryFn: api.transactionSummary });
  const recurringQuery = useQuery({ queryKey: ['recurring-candidates'], queryFn: api.recurringCandidates });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => api.uploadBankStatement(file),
    onSuccess: async (result) => {
      setSelectedFile(null);
      setSelectedStatementId(result.statementId);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['bank-statements'] }),
        queryClient.invalidateQueries({ queryKey: ['bank-statement-transactions'] }),
        queryClient.invalidateQueries({ queryKey: ['transaction-summary'] }),
        queryClient.invalidateQueries({ queryKey: ['recurring-candidates'] })
      ]);
      showToast({
        tone: 'success',
        title: 'Statement imported',
        message: `${result.transactionCount} transactions, ${result.needsReviewCount} need review.`
      });
    },
    onError: (error) => {
      showToast({ tone: 'error', title: 'Import failed', message: error instanceof Error ? error.message : 'Could not import PDF.' });
    }
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, category, rememberRule }: { id: number; category: string; rememberRule: boolean }) =>
      api.updateTransactionCategory(id, category, rememberRule),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['bank-statement-transactions'] }),
        queryClient.invalidateQueries({ queryKey: ['transaction-summary'] })
      ]);
      showToast({ tone: 'success', title: 'Category updated' });
    }
  });

  const transactions = transactionsQuery.data ?? [];
  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const matchesSearch = `${transaction.description} ${transaction.category}`.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === 'All' || transaction.category === categoryFilter;
      const matchesReview = !needsReviewOnly || transaction.needsReview;
      return matchesSearch && matchesCategory && matchesReview;
    });
  }, [transactions, search, categoryFilter, needsReviewOnly]);

  function chooseFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
  }

  function importSelectedFile() {
    if (!selectedFile) return;
    uploadMutation.mutate(selectedFile);
  }

  return (
    <Page title="Statements" eyebrow="Bank PDF import">
      <div className="grid gap-6 xl:grid-cols-[minmax(320px,0.65fr)_minmax(0,1.35fr)]">
        <div className="grid content-start gap-6">
          <StaticCard>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold">Upload bank statement</h2>
                <p className="mt-1 text-sm text-[var(--muted)]">PDFs are read immediately. The original file is not stored.</p>
              </div>
              <Upload className="text-[var(--accent)]" size={24} />
            </div>
            <label className="mt-5 grid cursor-pointer gap-2 rounded-lg border border-dashed border-[var(--border)] bg-[var(--surface-muted)] p-4 text-center hover:bg-[var(--surface-hover)]">
              <input className="sr-only" type="file" accept="application/pdf,.pdf" onChange={chooseFile} />
              <FileText className="mx-auto text-[var(--accent)]" size={28} />
              <span className="text-sm font-bold">{selectedFile ? selectedFile.name : 'Choose PDF file'}</span>
              <span className="text-xs text-[var(--muted)]">Max 10 MB</span>
            </label>
            <Button className="mt-4 w-full" disabled={!selectedFile || uploadMutation.isPending} onClick={importSelectedFile}>
              {uploadMutation.isPending ? 'Importing...' : 'Import transactions'}
            </Button>
            {uploadMutation.isPending && (
              <div className="mt-4 grid gap-2 text-sm text-[var(--muted)]">
                <p>Reading statement...</p>
                <p>Extracting transactions...</p>
                <p>Categorizing spending...</p>
              </div>
            )}
          </StaticCard>

          <StaticCard>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold">Imported Statements</h2>
              <span className="rounded-full bg-[var(--accent-soft)] px-2 py-1 text-xs font-bold text-[var(--accent)]">{statements.length}</span>
            </div>
            {statementsQuery.isLoading ? (
              <div className="grid gap-3">{Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} className="h-16" />)}</div>
            ) : statements.length === 0 ? (
              <EmptyState icon={ReceiptText} title="No statements imported" message="Upload a bank PDF to start reviewing transactions and summaries." />
            ) : (
              <div className="grid gap-2">
                {statements.map((statement) => (
                  <StatementButton key={statement.id} statement={statement} active={activeStatementId === statement.id} onClick={() => setSelectedStatementId(statement.id)} />
                ))}
              </div>
            )}
          </StaticCard>

          <SummaryPanel summary={summaryQuery.data} loading={summaryQuery.isLoading} />
        </div>

        <div className="grid content-start gap-6">
          <TransactionsPanel
            transactions={filteredTransactions}
            allTransactions={transactions}
            loading={transactionsQuery.isLoading}
            search={search}
            setSearch={setSearch}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            needsReviewOnly={needsReviewOnly}
            setNeedsReviewOnly={setNeedsReviewOnly}
            updateCategory={(transaction, category, rememberRule) => updateCategoryMutation.mutate({ id: transaction.id, category, rememberRule })}
            updating={updateCategoryMutation.isPending}
            activeStatement={activeStatement}
          />

          <RecurringPanel candidates={recurringQuery.data ?? []} loading={recurringQuery.isLoading} />

          <StaticCard>
            <div className="flex items-start gap-3">
              <Sparkles className="text-[var(--accent)]" size={22} />
              <div>
                <h2 className="text-lg font-bold">AI analysis ready</h2>
                <p className="mt-1 text-sm text-[var(--muted)]">Use the assistant to ask about imported summaries. The AI should receive calculated totals and categories, not the original PDF.</p>
              </div>
            </div>
          </StaticCard>
        </div>
      </div>
    </Page>
  );
}

function StatementButton({ statement, active, onClick }: { statement: BankStatementDto; active: boolean; onClick: () => void }) {
  return (
    <button
      className={cn(
        'rounded-lg border p-3 text-left transition',
        active ? 'border-[var(--accent)] bg-[var(--accent-soft)]' : 'border-[var(--border)] bg-[var(--surface-muted)] hover:bg-[var(--surface-hover)]'
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-bold">{statement.originalFileName}</p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            {statement.statementPeriodStart && statement.statementPeriodEnd
              ? `${statement.statementPeriodStart} to ${statement.statementPeriodEnd}`
              : shortDate.format(new Date(statement.uploadedAt))}
          </p>
        </div>
        <span className="rounded-full bg-[var(--card)] px-2 py-1 text-xs font-bold text-[var(--muted)]">{statement.transactionCount}</span>
      </div>
      {statement.importStatus === 'Failed' && <p className="mt-2 text-xs font-semibold text-red-600">{statement.importError}</p>}
    </button>
  );
}

function SummaryPanel({ summary, loading }: { summary?: Awaited<ReturnType<typeof api.transactionSummary>>; loading: boolean }) {
  if (loading) {
    return <Skeleton className="h-72" />;
  }

  if (!summary) {
    return null;
  }

  const chartData = summary.categoryTotals.map((item, index) => ({ ...item, fill: categoryPalette[index % categoryPalette.length] }));

  return (
    <StaticCard>
      <h2 className="text-lg font-bold">Statement Summary</h2>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <SummaryMetric label="Income" value={currency.format(summary.income)} />
        <SummaryMetric label="Expenses" value={currency.format(summary.expenses)} />
        <SummaryMetric label="Net savings" value={currency.format(summary.netSavings)} />
        <SummaryMetric label="Savings rate" value={`${summary.savingsRate}%`} />
      </div>
      {chartData.length > 0 && (
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={chartData} dataKey="amount" nameKey="category" innerRadius={58} outerRadius={88} paddingAngle={4}>
              {chartData.map((entry) => <Cell key={entry.category} fill={entry.fill} />)}
            </Pie>
            <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10 }} formatter={(value) => currency.format(Number(value))} />
          </PieChart>
        </ResponsiveContainer>
      )}
      <div className="grid gap-2">
        {summary.categoryTotals.slice(0, 5).map((item) => (
          <div key={item.category} className="flex items-center justify-between rounded-lg bg-[var(--surface-muted)] px-3 py-2 text-sm">
            <span className="font-semibold">{item.category}</span>
            <span className="text-[var(--muted)]">{currency.format(item.amount)}</span>
          </div>
        ))}
      </div>
    </StaticCard>
  );
}

function SummaryMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-[var(--surface-muted)] p-3">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">{label}</p>
      <p className="mt-1 text-lg font-black">{value}</p>
    </div>
  );
}

function TransactionsPanel({
  transactions,
  allTransactions,
  loading,
  search,
  setSearch,
  categoryFilter,
  setCategoryFilter,
  needsReviewOnly,
  setNeedsReviewOnly,
  updateCategory,
  updating,
  activeStatement
}: {
  transactions: BankTransactionDto[];
  allTransactions: BankTransactionDto[];
  loading: boolean;
  search: string;
  setSearch: (value: string) => void;
  categoryFilter: string;
  setCategoryFilter: (value: string) => void;
  needsReviewOnly: boolean;
  setNeedsReviewOnly: (value: boolean) => void;
  updateCategory: (transaction: BankTransactionDto, category: string, rememberRule: boolean) => void;
  updating: boolean;
  activeStatement: BankStatementDto | null;
}) {
  return (
    <StaticCard className="overflow-hidden p-0">
      <div className="border-b border-[var(--border)] p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-bold">Review Transactions</h2>
            <p className="text-sm text-[var(--muted)]">{activeStatement ? activeStatement.originalFileName : 'Select or upload a statement'}</p>
          </div>
          <label className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-sm font-semibold text-[var(--muted)]">
            <input type="checkbox" className="size-4 accent-[var(--accent)]" checked={needsReviewOnly} onChange={(event) => setNeedsReviewOnly(event.target.checked)} />
            Needs review
          </label>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
          <label className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2">
            <Search size={17} className="text-[var(--muted)]" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search transactions" className="min-w-0 flex-1 bg-transparent text-sm outline-none" />
          </label>
          <label className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2">
            <Filter size={17} className="text-[var(--muted)]" />
            <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none">
              <option>All</option>
              {transactionCategories.map((category) => <option key={category}>{category}</option>)}
            </select>
          </label>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-3 p-4">{Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-16" />)}</div>
      ) : allTransactions.length === 0 ? (
        <div className="p-5">
          <EmptyState icon={Plus} title="No transactions yet" message="Upload a PDF statement to review extracted transactions." />
        </div>
      ) : (
        <div className="max-h-[680px] overflow-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="sticky top-0 border-b border-[var(--border)] bg-[var(--surface-muted)] text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
              <tr>
                {['Date', 'Description', 'Category', 'Amount', 'Balance', 'Recurring', 'Review'].map((header) => <th key={header} className="px-4 py-3">{header}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {transactions.map((transaction) => (
                <TransactionRow key={transaction.id} transaction={transaction} updateCategory={updateCategory} updating={updating} />
              ))}
            </tbody>
          </table>
          {transactions.length === 0 && (
            <div className="p-5">
              <EmptyState icon={Search} title="No matching transactions" message="Adjust search or filters to see more imported rows." />
            </div>
          )}
        </div>
      )}
    </StaticCard>
  );
}

function TransactionRow({ transaction, updateCategory, updating }: { transaction: BankTransactionDto; updateCategory: (transaction: BankTransactionDto, category: string, rememberRule: boolean) => void; updating: boolean }) {
  const [rememberRule, setRememberRule] = useState(false);

  return (
    <tr className="hover:bg-[var(--surface-muted)]">
      <td className="px-4 py-3 text-[var(--muted)]">{transaction.transactionDate}</td>
      <td className="max-w-xs px-4 py-3">
        <p className="truncate font-semibold">{transaction.description}</p>
        {transaction.isInternalTransfer && <p className="mt-1 text-xs text-[var(--muted)]">Internal transfer</p>}
      </td>
      <td className="px-4 py-3">
        <select className="form-field min-w-40" value={transaction.category} disabled={updating} onChange={(event) => updateCategory(transaction, event.target.value, rememberRule)}>
          {transactionCategories.map((category) => <option key={category}>{category}</option>)}
        </select>
        <label className="mt-1 flex items-center gap-1 text-xs text-[var(--muted)]">
          <input type="checkbox" className="size-3 accent-[var(--accent)]" checked={rememberRule} onChange={(event) => setRememberRule(event.target.checked)} />
          remember
        </label>
      </td>
      <td className={cn('px-4 py-3 font-bold', transaction.amount < 0 ? 'text-red-600' : 'text-emerald-600')}>{currency.format(transaction.amount)}</td>
      <td className="px-4 py-3 text-[var(--muted)]">{transaction.balance === null || transaction.balance === undefined ? '-' : currency.format(transaction.balance)}</td>
      <td className="px-4 py-3">{transaction.isRecurringCandidate ? <BadgeCheck className="text-[var(--accent)]" size={18} /> : <span className="text-[var(--muted)]">-</span>}</td>
      <td className="px-4 py-3">{transaction.needsReview ? <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-1 text-xs font-bold text-amber-700"><AlertCircle size={13} /> Review</span> : <span className="text-[var(--muted)]">OK</span>}</td>
    </tr>
  );
}

function RecurringPanel({ candidates, loading }: { candidates: Awaited<ReturnType<typeof api.recurringCandidates>>; loading: boolean }) {
  return (
    <StaticCard>
      <h2 className="text-lg font-bold">Possible Subscriptions</h2>
      <p className="mt-1 text-sm text-[var(--muted)]">Recurring candidates are detected from repeated merchant and amount patterns.</p>
      {loading ? (
        <div className="mt-4 grid gap-3">{Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} className="h-16" />)}</div>
      ) : candidates.length === 0 ? (
        <div className="mt-4">
          <EmptyState icon={ReceiptText} title="No recurring candidates yet" message="Import multiple months or repeated payments to detect possible subscriptions." />
        </div>
      ) : (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {candidates.slice(0, 6).map((candidate) => (
            <div key={`${candidate.merchantName}-${candidate.averageAmount}`} className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold">{candidate.merchantName}</p>
                  <p className="mt-1 text-sm text-[var(--muted)]">{candidate.billingFrequency} / {candidate.suggestedCategory}</p>
                </div>
                <strong>{currency.format(candidate.averageAmount)}</strong>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-[var(--muted)]">
                <span>{candidate.transactionCount} matches</span>
                <span>{candidate.confidence}% confidence</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </StaticCard>
  );
}
