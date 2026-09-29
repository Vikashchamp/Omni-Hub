import React from 'react';
import { 
  FileText, 
  Sparkles, 
  MessageSquareQuote, 
  StickyNote, 
  BrainCircuit, 
  Bookmark,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import type { ActionType } from '../../types';

interface ActionButtonsProps {
  activeAction: ActionType | null;
  onSelectAction: (action: ActionType) => void;
  onSummarize: () => void;
  isSummarizing: boolean;
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

export const ActionButtons: React.FC<ActionButtonsProps> = ({ 
  activeAction, 
  onSelectAction, 
  onSummarize,
  isSummarizing 
}) => {
  const selectedMeta = ACTIONS.find((a) => a.type === activeAction && a.type !== 'summarize');

  const handleClick = (action: ActionType) => {
    if (action === 'summarize') {
      if (!isSummarizing) {
        onSummarize();
      }
    } else {
      onSelectAction(action);
    }
  };

  return (
    <section className="actions-section" aria-label="AI Actions">
      <div className="section-label">AI Actions</div>
      <div className="action-grid" role="group" aria-label="AI action buttons">
        {ACTIONS.map((action) => {
          const isSummarizeBtn = action.type === 'summarize';
          const isActive = activeAction === action.type;
          const isDisabled = isSummarizeBtn && isSummarizing;

          return (
            <button
              key={action.type}
              type="button"
              className={`action-btn ${isActive ? 'active' : ''} ${isSummarizeBtn ? 'btn-summarize' : ''}`}
              onClick={() => handleClick(action.type)}
              title={action.description}
              aria-pressed={isActive}
              disabled={isDisabled}
            >
              <div className="action-icon-wrap">
                {isSummarizeBtn && isSummarizing ? (
                  <Loader2 size={15} className="spin-animation" />
                ) : (
                  action.icon
                )}
              </div>
              <span>{isSummarizeBtn && isSummarizing ? 'Analyzing...' : action.label}</span>
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
