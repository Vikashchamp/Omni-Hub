/**
 * OMNI HUB — Content Script
 * Responsible for context detection and webpage content extraction.
 */

function extractVisibleText(): string {
  try {
    // Clone body or main content element to avoid altering the live page
    const targetElement =
      document.querySelector('article') ||
      document.querySelector('main') ||
      document.querySelector('[role="main"]') ||
      document.body;

    if (!targetElement) {
      return '';
    }

    const clone = targetElement.cloneNode(true) as HTMLElement;

    // Elements to strip out: scripts, styles, metadata, navigation, ads, footers
    const elementsToRemove = [
      'script',
      'style',
      'noscript',
      'iframe',
      'svg',
      'canvas',
      'nav',
      'footer',
      'header',
      'aside',
      '[aria-hidden="true"]',
      '.ads',
      '.advertisement',
      '.cookie-banner',
      '#cookie-notice',
    ];

    elementsToRemove.forEach((selector) => {
      clone.querySelectorAll(selector).forEach((el) => el.remove());
    });

    // Extract text representation
    const rawText = clone.innerText || clone.textContent || '';

    // Normalization:
    // 1. Convert carriage returns
    // 2. Collapse repeated spaces and tabs
    // 3. Remove excess blank lines (max 2 consecutive newlines)
    // 4. Trim leading/trailing whitespace
    const normalized = rawText
      .replace(/\r\n/g, '\n')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n\s*\n\s*\n+/g, '\n\n')
      .trim();

    // Impose safe upper bound: 50,000 characters (~12,000 tokens)
    const MAX_CHARS = 50_000;
    if (normalized.length > MAX_CHARS) {
      return normalized.slice(0, MAX_CHARS) + '\n\n[Content truncated for analysis]';
    }

    return normalized;
  } catch (err) {
    console.warn('[OMNI HUB] Content extraction encountered an error:', err);
    return (document.body?.innerText || '').slice(0, 50_000).trim();
  }
}

// Listen for messages from the side panel or background service worker
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request?.type === 'EXTRACT_PAGE_CONTENT') {
    const title = document.title || 'Untitled Page';
    const url = window.location.href;
    const content = extractVisibleText();

    sendResponse({
      success: true,
      title,
      url,
      content,
      charCount: content.length,
    });
    return true;
  }

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

console.log('[OMNI HUB] Content script initialized on:', window.location.hostname);
