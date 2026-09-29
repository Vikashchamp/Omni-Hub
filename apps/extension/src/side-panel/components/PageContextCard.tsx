import React from 'react';
import { Compass, Globe } from 'lucide-react';
import type { PageInfo } from '../../types';

interface PageContextCardProps {
  pageInfo: PageInfo;
}

export const PageContextCard: React.FC<PageContextCardProps> = ({ pageInfo }) => {
  return (
    <section className="context-card" aria-label="Current Page Context">
      <div className="context-header">
        <div className="context-label-group">
          <Compass size={13} />
          <span>Current Page</span>
        </div>
        <div className="brand-status-chip" style={{ fontSize: '10px', padding: '2px 6px' }}>
          <span className="status-dot" />
          <span>{pageInfo.status}</span>
        </div>
      </div>

      <div className="context-title" title={pageInfo.title}>
        {pageInfo.title || 'Current Page'}
      </div>

      <div className="context-url-container" title={pageInfo.url}>
        <Globe size={12} color="var(--omni-text-secondary)" style={{ flexShrink: 0 }} />
        <span className="context-url-text">{pageInfo.url}</span>
      </div>
    </section>
  );
};
