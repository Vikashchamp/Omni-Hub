import React, { useState } from 'react';
import { AlertCircle, X } from 'lucide-react';
import { Header } from './components/Header';
import { PageContextCard } from './components/PageContextCard';
import { ActionButtons } from './components/ActionButtons';
import { SummaryResult } from './components/SummaryResult';
import { ChatInput } from './components/ChatInput';
import { useActiveTab } from './hooks/useActiveTab';
import { requestPageSummary } from './services/api';
import type { ActionType, ChatMessage } from '../types';

interface SummaryData {
  summary: string;
  title: string;
  url: string;
}

export const App: React.FC = () => {
  const pageInfo = useActiveTab();
  const [activeAction, setActiveAction] = useState<ActionType | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const handleSelectAction = (action: ActionType) => {
    setActiveAction(action);
  };

  const handleSummarize = async () => {
    if (isSummarizing) return;

    setIsSummarizing(true);
    setErrorMessage(null);
    setSummaryData(null);
    setActiveAction('summarize');

    try {
      let pageTitle = pageInfo.title || 'Current Webpage';
      let pageUrl = pageInfo.url || '';
      let pageContent = '';

      // Check if running in Chrome Extension environment
      if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
        const [activeTab] = await new Promise<chrome.tabs.Tab[]>((resolve) => {
          chrome.tabs.query({ active: true, currentWindow: true }, resolve);
        });

        if (!activeTab || !activeTab.id) {
          throw new Error('No active browser tab found. Please click inside a webpage tab.');
        }

        const tabUrl = activeTab.url || '';
        if (
          tabUrl.startsWith('chrome://') ||
          tabUrl.startsWith('chrome-extension://') ||
          tabUrl.startsWith('edge://') ||
          tabUrl.startsWith('about:')
        ) {
          throw new Error(
            'OMNI cannot analyze internal browser pages. Please open any standard website (e.g. news, article, documentation) and try again.'
          );
        }

        pageTitle = activeTab.title || pageTitle;
        pageUrl = tabUrl;

        // Request content extraction from content script
        try {
          const response = await new Promise<{
            success: boolean;
            title?: string;
            url?: string;
            content?: string;
          }>((resolve, reject) => {
            chrome.tabs.sendMessage(
              activeTab.id!,
              { type: 'EXTRACT_PAGE_CONTENT' },
              (res) => {
                if (chrome.runtime.lastError) {
                  reject(new Error(chrome.runtime.lastError.message));
                } else {
                  resolve(res);
                }
              }
            );
          });

          if (response && response.content) {
            pageContent = response.content;
            if (response.title) pageTitle = response.title;
            if (response.url) pageUrl = response.url;
          }
        } catch {
          // Content script may not be present (e.g., page loaded before extension installation)
          // Attempt on-demand script injection
          if (chrome.scripting && chrome.scripting.executeScript) {
            try {
              await chrome.scripting.executeScript({
                target: { tabId: activeTab.id },
                files: ['content-scripts/index.js'],
              });

              // Retry message after injection
              const retryResponse = await new Promise<{
                success: boolean;
                title?: string;
                url?: string;
                content?: string;
              }>((resolve, reject) => {
                chrome.tabs.sendMessage(
                  activeTab.id!,
                  { type: 'EXTRACT_PAGE_CONTENT' },
                  (res) => {
                    if (chrome.runtime.lastError) {
                      reject(new Error(chrome.runtime.lastError.message));
                    } else {
                      resolve(res);
                    }
                  }
                );
              });

              if (retryResponse && retryResponse.content) {
                pageContent = retryResponse.content;
              }
            } catch {
              throw new Error(
                'Could not extract text from this page. Please refresh the browser tab and try again.'
              );
            }
          } else {
            throw new Error(
              'Could not communicate with the page. Please refresh the browser tab and try again.'
            );
          }
        }
      } else {
        // Fallback for local browser preview / development outside extension runtime
        pageContent =
          'OMNI HUB is an AI-powered intelligence layer for the web. It operates alongside normal web browsing, allowing users to understand any webpage instantly through AI-powered summaries, explanations, contextual Q&A, and persistent semantic memory.';
      }

      if (!pageContent || pageContent.trim().length < 15) {
        throw new Error(
          'This webpage does not contain enough readable text to summarize.'
        );
      }

      // Send to FastAPI backend
      const result = await requestPageSummary({
        title: pageTitle,
        url: pageUrl,
        content: pageContent,
      });

      setSummaryData({
        summary: result.summary,
        title: result.title || pageTitle,
        url: result.url || pageUrl,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setErrorMessage(msg);
    } finally {
      setIsSummarizing(false);
    }
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
      text: `OMNI Shell: Received "${text}". Contextual Q&A will be integrated in subsequent milestones. Use the Summarize button above to test live Gemini AI summarization.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg, omniReply]);
  };

  return (
    <div className="panel-container">
      <Header 
        statusText={isSummarizing ? 'Analyzing page...' : 'Ready'} 
        isLoading={isSummarizing} 
      />

      <main className="panel-content">
        <PageContextCard pageInfo={pageInfo} />

        <ActionButtons
          activeAction={activeAction}
          onSelectAction={handleSelectAction}
          onSummarize={handleSummarize}
          isSummarizing={isSummarizing}
        />

        {errorMessage && (
          <div className="error-banner" role="alert">
            <AlertCircle size={16} className="error-icon" />
            <div className="error-content">
              <span className="error-title">Summarization Error</span>
              <p className="error-message">{errorMessage}</p>
            </div>
            <button
              type="button"
              className="error-dismiss-btn"
              onClick={() => setErrorMessage(null)}
              aria-label="Dismiss error"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {summaryData && (
          <SummaryResult
            summary={summaryData.summary}
            title={summaryData.title}
            onDismiss={() => setSummaryData(null)}
          />
        )}

        {messages.length > 0 && (
          <section className="chat-section" aria-label="Activity Log">
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

      <ChatInput onSendMessage={handleSendMessage} disabled={isSummarizing} />
    </div>
  );
};

export default App;
