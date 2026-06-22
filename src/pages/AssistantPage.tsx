import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, ConversationListDto } from '../api/client';

export function AssistantPage() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<ConversationListDto[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.conversations().then(setConversations).catch((err) => setError(err.message));
  }, []);

  async function newChat() {
    const conversation = await api.createConversation();
    navigate(`/assistant/chat/${conversation.id}`);
  }

  return (
    <section className="chat-layout">
      <aside className="chat-sidebar">
        <button className="button full" onClick={newChat}>New Chat</button>
        {conversations.map((item) => (
          <button className="chat-link" key={item.id} onClick={() => navigate(`/assistant/chat/${item.id}`)}>
            {item.title}
          </button>
        ))}
      </aside>
      <main className="chat-empty">
        <h1>FamilyBudget AI Assistant</h1>
        {error ? <p className="error">{error}</p> : <p>Select a saved conversation or start a new chat.</p>}
      </main>
    </section>
  );
}
