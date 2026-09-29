import React from 'react';

interface HeaderProps {
  statusText?: string;
  isLoading?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ 
  statusText = 'Ready', 
  isLoading = false 
}) => {
  return (
    <header className="brand-header">
      <div className="brand-meta">
        <div className="brand-logo-mark" aria-hidden="true">
          <div className="brand-logo-spark" />
        </div>
        <div className="brand-titles">
          <div className="brand-title-row">
            <span className="brand-title">OMNI HUB</span>
            <span className="brand-version-badge">v0.1.0</span>
          </div>
          <span className="brand-tagline">Make the web intelligent.</span>
        </div>
      </div>
      <div className={`brand-status-chip ${isLoading ? 'loading' : ''}`}>
        <span className={`status-dot ${isLoading ? 'loading' : ''}`} />
        <span>{statusText}</span>
      </div>
    </header>
  );
};
