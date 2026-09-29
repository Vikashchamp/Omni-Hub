/**
 * OMNI HUB — Background Service Worker
 * Manages side panel behavior and extension lifecycle events.
 */

// Configure side panel to open immediately when the user clicks the toolbar icon
chrome.runtime.onInstalled.addListener(() => {
  console.log('[OMNI HUB] Background service worker initialized.');
  if (chrome.sidePanel && typeof chrome.sidePanel.setPanelBehavior === 'function') {
    chrome.sidePanel
      .setPanelBehavior({ openPanelOnActionClick: true })
      .catch((err) => console.warn('[OMNI HUB] Unable to set panel behavior:', err));
  }
});

// Explicit fallback: open side panel on toolbar action click
chrome.action.onClicked.addListener(async (tab) => {
  if (tab?.id && chrome.sidePanel && typeof chrome.sidePanel.open === 'function') {
    try {
      await chrome.sidePanel.open({ tabId: tab.id });
    } catch (err) {
      console.warn('[OMNI HUB] Error opening side panel:', err);
    }
  }
});

// Listen for lifecycle / ping messages
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === 'OMNI_PING') {
    sendResponse({ status: 'ok', time: new Date().toISOString() });
    return true;
  }
  return false;
});
