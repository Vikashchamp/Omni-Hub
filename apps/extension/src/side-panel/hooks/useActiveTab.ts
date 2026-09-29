import { useState, useEffect } from 'react';
import type { PageInfo } from '../../types';

export function useActiveTab(): PageInfo {
  const [pageInfo, setPageInfo] = useState<PageInfo>({
    title: 'Current Page',
    url: 'Detecting active page...',
    status: 'Ready',
  });

  useEffect(() => {
    // If running in Chrome Extension environment with permissions
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
      const updateTabInfo = () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs && tabs[0]) {
            const current = tabs[0];
            setPageInfo({
              title: current.title || 'Current Page',
              url: current.url || 'No URL available',
              status: 'Ready',
              favIconUrl: current.favIconUrl,
            });
          }
        });
      };

      // Initial query
      updateTabInfo();

      // Listen for tab switches or updates
      const onTabActivated = () => updateTabInfo();
      const onTabUpdated = (_tabId: number, changeInfo: chrome.tabs.TabChangeInfo) => {
        if (changeInfo.status === 'complete' || changeInfo.url) {
          updateTabInfo();
        }
      };

      chrome.tabs.onActivated.addListener(onTabActivated);
      chrome.tabs.onUpdated.addListener(onTabUpdated);

      return () => {
        chrome.tabs.onActivated.removeListener(onTabActivated);
        chrome.tabs.onUpdated.removeListener(onTabUpdated);
      };
    } else {
      // Development or non-extension preview fallback
      setPageInfo({
        title: 'Current Page',
        url: window.location.href.startsWith('http')
          ? window.location.href
          : 'https://developer.mozilla.org/en-US/docs/Web',
        status: 'Ready',
      });
    }
  }, []);

  return pageInfo;
}
