import React from 'react';
import { 
  FileText, 
  Sparkles, 
  MessageSquareQuote, 
  StickyNote, 
  BrainCircuit, 
  Bookmark,
  CheckCircle2
} from 'lucide-react';
import type { ActionType } from '../../types';

interface ActionButtonsProps {
  activeAction: ActionType | null;
  onSelectAction: (action: ActionType) => void;
}

interface ActionMeta {
  type: ActionType;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const ACTIONS: ActionMeta[] = [
  {
    type: 'summarize',
    label: 'Summarize',
    icon: <FileText size={15} />,
    description: 'Generates a structured executive summary of the active webpage.',
  },
  {
    type: 'explain',
    label: 'Explain',
    icon: <Sparkles size={15} />,
    description: 'Breaks down complex concepts and terminology in plain language.',
  },
  {
    type: 'ask',
    label: 'Ask',
    icon: <MessageSquareQuote size={15} />,
    description: 'Ask contextual questions directly against this page content.',
  },
  {
    type: 'notes',
    label: 'Notes',
    icon: <StickyNote size={15} />,
    description: 'Extracts key takeaways and structured markdown notes.',
  },
  {
    type: 'quiz',
    label: 'Quiz',
    icon: <BrainCircuit size={15} />,
    description: 'Generates an interactive retention quiz from page concepts.',
  },
  {
    type: 'save',
    label: 'Save',
    icon: <Bookmark size={15} />,
    description: 'Saves page context into OMNI semantic memory for future recall.',
  },
];

export const ActionButtons: React.FC<ActionButtonsProps> = ({ activeAction, onSelectAction }) => {
  const selectedMeta = ACTIONS.find((a) => a.type === activeAction);

  return (
    <section className="actions-section" aria-label="AI Actions">
      <div className="section-label">AI Actions</div>
      <div className="action-grid" role="group" aria-label="AI action buttons">
        {ACTIONS.map((action) => {
          const isActive = activeAction === action.type;
          return (
            <button
              key={action.type}
              type="button"
              className={`action-btn ${isActive ? 'active' : ''}`}
              onClick={() => onSelectAction(action.type)}
              title={action.description}
              aria-pressed={isActive}
            >
              <div className="action-icon-wrap">{action.icon}</div>
              <span>{action.label}</span>
            </button>
          );
        })}
      </div>

      {selectedMeta && (
        <div className="action-feedback-banner" role="status">
          <CheckCircle2 size={16} className="feedback-icon" />
          <div className="feedback-text-content">
            <span className="feedback-title">{selectedMeta.label} Selected</span>
            <span className="feedback-desc">
              {selectedMeta.description} (AI action pipeline activates in Phase 3)
            </span>
          </div>
        </div>
      )}
    </section>
  );
};
