import React, { useState } from 'react';
import { ArrowUp } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disabled = false }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed || disabled) return;
    onSendMessage(trimmed);
    setQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <footer className="chat-input-bar">
      <form onSubmit={handleSubmit} className="chat-input-box">
        <input
          type="text"
          className="chat-input-field"
          placeholder="Ask OMNI anything..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          aria-label="Ask OMNI anything"
        />
        <button
          type="submit"
          className="chat-send-btn"
          disabled={!query.trim() || disabled}
          aria-label="Send query"
        >
          <ArrowUp size={15} />
        </button>
      </form>
    </footer>
  );
};
