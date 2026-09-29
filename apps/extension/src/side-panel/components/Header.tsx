import React from 'react';

export const Header: React.FC = () => {
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
      <div className="brand-status-chip">
        <span className="status-dot" />
        <span>Ready</span>
      </div>
    </header>
  );
};
