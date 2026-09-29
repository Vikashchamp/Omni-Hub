export type ContextType = 'generic' | 'youtube' | 'pdf' | 'github';

export type ActionType = 'summarize' | 'explain' | 'ask' | 'notes' | 'quiz' | 'save';

export interface PageInfo {
  title: string;
  url: string;
  status: 'Ready' | 'Loading' | 'Unavailable';
  favIconUrl?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'omni';
  text: string;
  timestamp: string;
}
