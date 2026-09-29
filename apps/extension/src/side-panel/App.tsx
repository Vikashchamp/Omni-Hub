import React, { useState } from 'react';
import { Header } from './components/Header';
import { PageContextCard } from './components/PageContextCard';
import { ActionButtons } from './components/ActionButtons';
import { ChatInput } from './components/ChatInput';
import { useActiveTab } from './hooks/useActiveTab';
import type { ActionType, ChatMessage } from '../types';

export const App: React.FC = () => {
  const pageInfo = useActiveTab();
  const [activeAction, setActiveAction] = useState<ActionType | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const handleSelectAction = (action: ActionType) => {
    setActiveAction(action);
  };

  const handleSendMessage = (text: string) => {
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const omniReply: ChatMessage = {
      id: (Date.now() + 1).toString(),
      sender: 'omni',
      text: `OMNI Shell received: "${text}". Full Gemini AI intelligence will process this query in Phase 3.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg, omniReply]);
  };

  return (
    <div className="panel-container">
      <Header />

      <main className="panel-content">
        <PageContextCard pageInfo={pageInfo} />

        <ActionButtons
          activeAction={activeAction}
          onSelectAction={handleSelectAction}
        />

        {messages.length > 0 && (
          <section className="chat-section" aria-label="Conversation Preview">
            <div className="section-label">Shell Activity</div>
            <div className="messages-list">
              {messages.map((msg) => (
                <div key={msg.id} className={`message-item ${msg.sender}`}>
                  <div className="message-bubble">{msg.text}</div>
                  <span className="message-meta">{msg.timestamp}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <ChatInput onSendMessage={handleSendMessage} />
    </div>
  );
};

export default App;
