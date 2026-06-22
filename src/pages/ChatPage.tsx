import { FormEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, ConversationDto, ConversationListDto, MessageDto } from '../api/client';

export function ChatPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const conversationId = Number(id);
  const [conversations, setConversations] = useState<ConversationListDto[]>([]);
  const [conversation, setConversation] = useState<ConversationDto | null>(null);
  const [messages, setMessages] = useState<MessageDto[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    const [all, current] = await Promise.all([
      api.conversations(),
      api.conversation(conversationId)
    ]);
    setConversations(all);
    setConversation(current);
    setMessages(current.messages);
  }

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, [conversationId]);

  async function newChat() {
    const created = await api.createConversation();
    navigate(`/assistant/chat/${created.id}`);
  }

  async function send(event: FormEvent) {
    event.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    setError('');
    const content = input.trim();
    setInput('');

    try {
      const response = await api.sendMessage(conversationId, content);
      setMessages((current) => [...current, response.userMessage, response.assistantMessage]);
      setConversations(await api.conversations());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Message failed');
      setInput(content);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="chat-layout">
      <aside className="chat-sidebar">
        <button className="button full" onClick={newChat}>New Chat</button>
        {conversations.map((item) => (
          <button
            className={item.id === conversationId ? 'chat-link active' : 'chat-link'}
            key={item.id}
            onClick={() => navigate(`/assistant/chat/${item.id}`)}
          >
            {item.title}
          </button>
        ))}
      </aside>
      <main className="chat-main">
        <header className="chat-header">
          <h1>{conversation?.title ?? 'Chat'}</h1>
        </header>
        <div className="messages">
          {messages.map((message) => (
            <div className={`message ${message.role}`} key={message.id || `${message.role}-${message.createdAt}`}>
              <p>{message.content}</p>
            </div>
          ))}
          {loading && <div className="message assistant"><p>Thinking...</p></div>}
        </div>
        {error && <p className="error">{error}</p>}
        <form className="chat-input" onSubmit={send}>
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about your subscriptions" />
          <button className="button" disabled={loading}>Send</button>
        </form>
      </main>
    </section>
  );
}
