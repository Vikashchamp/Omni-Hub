/**
 * OMNI HUB — Minimal Content Script (Shell)
 * Injected into active web pages. Full context detection & extraction will be added in Phase 3.
 */

(() => {
  console.log('[OMNI HUB] Content script active on:', window.location.href);

  // Minimal message listener for tab ping / health checks
  chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
    if (request?.type === 'GET_PAGE_INFO') {
      sendResponse({
        title: document.title || 'Untitled Page',
        url: window.location.href,
        status: 'Ready',
      });
      return true;
    }
    return false;
  });
})();
