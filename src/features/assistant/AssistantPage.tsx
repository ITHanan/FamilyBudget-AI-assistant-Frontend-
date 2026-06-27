import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { Clock, PanelLeft, Plus, Send, Sparkles } from 'lucide-react';
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { api, MessageDto } from '../../api/client';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';
import { useToast } from '../../components/ui/Toast';
import { chatPresets } from '../../data/mockData';

type DraftMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
};

const quickTopics = ['Subscription Costs', 'Saving Ideas', 'Upcoming Renewals', 'Budget Planning'];

export function AssistantPage() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [input, setInput] = useState('');
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [drafts, setDrafts] = useState<DraftMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const conversationsQuery = useQuery({ queryKey: ['ai-conversations'], queryFn: api.conversations });
  const conversationQuery = useQuery({
    queryKey: ['ai-conversation', activeConversationId],
    queryFn: () => api.conversation(activeConversationId!),
    enabled: activeConversationId !== null
  });

  useEffect(() => {
    if (!activeConversationId && conversationsQuery.data?.[0]) {
      setActiveConversationId(conversationsQuery.data[0].id);
    }
  }, [activeConversationId, conversationsQuery.data]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationQuery.data?.messages, drafts, isTyping]);

  const messages = useMemo(() => {
    const backendMessages = conversationQuery.data?.messages ?? [];
    return [...backendMessages, ...drafts];
  }, [conversationQuery.data?.messages, drafts]);

  const createConversationMutation = useMutation({
    mutationFn: api.createConversation,
    onSuccess: async (conversation) => {
      setActiveConversationId(conversation.id);
      await queryClient.invalidateQueries({ queryKey: ['ai-conversations'] });
    }
  });

  async function ensureConversation(title?: string) {
    if (activeConversationId) return activeConversationId;
    const conversation = await createConversationMutation.mutateAsync(title);
    return conversation.id;
  }

  async function send(content = input) {
    const trimmed = content.trim();
    if (!trimmed || isTyping) return;
    setInput('');
    setIsTyping(true);
    const userDraft: DraftMessage = { id: crypto.randomUUID(), role: 'user', content: trimmed, createdAt: new Date().toISOString() };
    setDrafts([userDraft]);

    try {
      const conversationId = await ensureConversation(trimmed);
      const response = await api.sendMessage(conversationId, trimmed);
      const assistantId = crypto.randomUUID();
      setDrafts([userDraft, { id: assistantId, role: 'assistant', content: '', createdAt: response.assistantMessage.createdAt }]);

      let visible = '';
      for (const chunk of response.assistantMessage.content.split(' ')) {
        visible += `${chunk} `;
        setDrafts([userDraft, { id: assistantId, role: 'assistant', content: visible.trim(), createdAt: response.assistantMessage.createdAt }]);
        await new Promise((resolve) => setTimeout(resolve, 22));
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['ai-conversations'] }),
        queryClient.invalidateQueries({ queryKey: ['ai-conversation', conversationId] })
      ]);
      setDrafts([]);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not send message.';
      showToast({ tone: 'error', title: 'Assistant unavailable', message });
      setDrafts([userDraft, { id: crypto.randomUUID(), role: 'assistant', content: message, createdAt: new Date().toISOString() }]);
    } finally {
      setIsTyping(false);
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    void send();
  }

  async function newChat() {
    setDrafts([]);
    const conversation = await createConversationMutation.mutateAsync('New chat');
    setActiveConversationId(conversation.id);
  }

  return (
    <section className="mx-auto grid h-[calc(100dvh-112px)] min-h-[620px] max-w-7xl overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow)] sm:h-[calc(100vh-128px)] lg:grid-cols-[300px_minmax(0,1fr)]">
      <aside className="hidden border-r border-[var(--border)] bg-[var(--surface-muted)] p-4 lg:flex lg:flex-col">
        <ChatSidebar
          conversations={conversationsQuery.data ?? []}
          activeConversationId={activeConversationId}
          setActiveConversationId={setActiveConversationId}
          newChat={() => void newChat()}
        />
      </aside>

      <div className="grid min-h-0 grid-rows-[auto_1fr_auto]">
        <header className="flex items-center gap-3 border-b border-[var(--border)] px-4 py-3">
          <button className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--surface-muted)] lg:hidden" aria-label="Open chat sidebar" onClick={() => setSidebarOpen(true)}>
            <PanelLeft size={20} />
          </button>
          <div className="grid size-10 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
            <Sparkles size={20} />
          </div>
          <div>
            <h1 className="text-base font-bold">FamilyBudget AI Assistant</h1>
            <p className="text-xs text-[var(--muted)]">Connected to backend conversations and subscription context</p>
          </div>
        </header>

        <div className="min-h-0 overflow-y-auto px-4 py-6 sm:px-8" aria-live="polite">
          <div className="mx-auto grid max-w-3xl gap-5">
            {conversationQuery.isLoading && activeConversationId !== null && (
              <div className="grid gap-4">
                <Skeleton className="h-20 max-w-[80%]" />
                <Skeleton className="ml-auto h-16 max-w-[72%]" />
                <Skeleton className="h-28 max-w-[86%]" />
              </div>
            )}
            {!conversationQuery.isLoading && messages.length === 0 && (
              <EmptyState
                icon={Sparkles}
                title="Ask about your subscriptions"
                message="The assistant can explain renewals, totals, saving options, and category patterns from your saved data."
                action={
                  <div className="flex flex-wrap justify-center gap-2">
                    {chatPresets.slice(0, 2).map((preset) => (
                      <button key={preset} onClick={() => void send(preset)} className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-xs font-semibold text-[var(--muted)] hover:text-[var(--text)]">
                        {preset}
                      </button>
                    ))}
                  </div>
                }
              />
            )}
            {!conversationQuery.isLoading && messages.map((message) => <MessageBubble key={`${message.role}-${message.id}-${message.createdAt}`} message={message} />)}
            {isTyping && drafts.length < 2 && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>
        </div>

        <footer className="border-t border-[var(--border)] p-4">
          <div className="mx-auto max-w-3xl">
            <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
              {chatPresets.map((preset) => (
                <button key={preset} onClick={() => void send(preset)} className="shrink-0 rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-1.5 text-xs font-semibold text-[var(--muted)] hover:text-[var(--text)]">
                  {preset}
                </button>
              ))}
            </div>
            <form onSubmit={submit} className="flex gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-2 focus-within:ring-2 focus-within:ring-[var(--ring)]">
              <label className="sr-only" htmlFor="assistant-input">Ask anything about your family expenses</label>
              <textarea
                id="assistant-input"
                rows={1}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask anything about your family expenses..."
                className="max-h-32 min-h-11 flex-1 resize-none bg-transparent px-3 py-3 text-sm outline-none placeholder:text-[var(--muted)]"
              />
              <Button type="submit" aria-label="Send message" disabled={!input.trim() || isTyping} className="self-end px-3">
                <Send size={18} />
              </Button>
            </form>
          </div>
        </footer>
      </div>

      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.button className="fixed inset-0 z-40 bg-black/35 lg:hidden" aria-label="Close chat sidebar" onClick={() => setSidebarOpen(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
            <motion.aside className="fixed inset-y-0 left-0 z-50 w-80 border-r border-[var(--border)] bg-[var(--surface-muted)] p-4 lg:hidden" initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}>
              <ChatSidebar
                conversations={conversationsQuery.data ?? []}
                activeConversationId={activeConversationId}
                setActiveConversationId={(id) => {
                  setActiveConversationId(id);
                  setSidebarOpen(false);
                }}
                newChat={() => void newChat()}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}

function ChatSidebar({
  conversations,
  activeConversationId,
  setActiveConversationId,
  newChat
}: {
  conversations: Array<{ id: number; title: string; updatedAt: string }>;
  activeConversationId: number | null;
  setActiveConversationId: (id: number) => void;
  newChat: () => void;
}) {
  return (
    <div className="flex h-full flex-col gap-4">
      <Button onClick={newChat} className="w-full"><Plus size={16} /> New Chat</Button>
      <div className="grid gap-2 overflow-y-auto pr-1">
        {conversations.map((thread) => (
          <button key={thread.id} onClick={() => setActiveConversationId(thread.id)} className={`rounded-lg px-3 py-3 text-left text-sm font-semibold transition ${activeConversationId === thread.id ? 'bg-[var(--card)] text-[var(--text)] shadow-sm' : 'text-[var(--muted)] hover:bg-[var(--card)] hover:text-[var(--text)]'}`}>
            <span className="line-clamp-2">{thread.title}</span>
          </button>
        ))}
        {conversations.length === 0 && quickTopics.map((thread) => (
          <div key={thread} className="rounded-lg px-3 py-3 text-sm font-semibold text-[var(--muted)]">{thread}</div>
        ))}
      </div>
      <div className="mt-auto rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
        <p className="text-sm font-bold">Backend context</p>
        <p className="mt-1 text-xs text-[var(--muted)]">The API answers with your saved subscriptions and calculated totals.</p>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: MessageDto | DraftMessage }) {
  const isUser = message.role === 'user';
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[86%] rounded-2xl px-4 py-3 text-sm shadow-sm ${isUser ? 'bg-[var(--accent)] text-[var(--accent-contrast)]' : 'border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text)]'}`}>
        <div className="prose prose-sm max-w-none text-inherit prose-headings:mb-2 prose-headings:text-inherit prose-p:my-1 prose-strong:text-inherit prose-ul:my-2">
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>
        <p className={`mt-2 flex items-center gap-1 text-[11px] ${isUser ? 'text-[color-mix(in_srgb,var(--accent-contrast)_78%,transparent)]' : 'text-[var(--muted)]'}`}>
          <Clock size={12} /> {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </motion.div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-1 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3">
        {[0, 1, 2].map((dot) => (
          <motion.span key={dot} className="size-2 rounded-full bg-[var(--muted)]" animate={{ opacity: [0.25, 1, 0.25] }} transition={{ repeat: Infinity, duration: 1, delay: dot * 0.15 }} />
        ))}
      </div>
    </div>
  );
}
