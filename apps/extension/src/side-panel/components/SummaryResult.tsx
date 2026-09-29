import React, { useState } from 'react';
import { Sparkles, Copy, Check, X } from 'lucide-react';

interface SummaryResultProps {
  summary: string;
  title: string;
  onDismiss: () => void;
}

export const SummaryResult: React.FC<SummaryResultProps> = ({ summary, title, onDismiss }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn('Failed to copy summary to clipboard:', err);
    }
  };

  return (
    <section className="summary-result-card" aria-label="Generated Page Summary">
      <div className="summary-header">
        <div className="summary-title-group">
          <Sparkles size={14} className="summary-icon-sparkle" />
          <span className="summary-title-text">Summary</span>
        </div>
        <div className="summary-actions">
          <button
            type="button"
            className="summary-btn"
            onClick={handleCopy}
            title={copied ? 'Copied to clipboard' : 'Copy summary'}
            aria-label="Copy summary"
          >
            {copied ? <Check size={13} color="var(--omni-success)" /> : <Copy size={13} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            type="button"
            className="summary-btn-close"
            onClick={onDismiss}
            title="Dismiss summary"
            aria-label="Dismiss summary"
          >
            <X size={13} />
          </button>
        </div>
      </div>

      <div className="summary-page-title" title={title}>
        {title}
      </div>

      <div className="summary-body">
        {summary.split('\n').map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) {
            return <div key={idx} className="summary-spacer" />;
          }

          // Render bullet points
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            return (
              <div key={idx} className="summary-bullet-item">
                <span className="bullet-dot" />
                <span>{trimmed.slice(2)}</span>
              </div>
            );
          }

          // Render subheadings (### or ##)
          if (trimmed.startsWith('#')) {
            const headingText = trimmed.replace(/^#+\s*/, '');
            return (
              <div key={idx} className="summary-heading">
                {headingText}
              </div>
            );
          }

          return (
            <p key={idx} className="summary-paragraph">
              {line}
            </p>
          );
        })}
      </div>
    </section>
  );
};
