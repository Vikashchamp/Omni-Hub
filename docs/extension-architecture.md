# OMNI HUB — Extension Architecture

> **Version:** 0.1 (MVP)
> **Platform:** Chrome Manifest V3
> **Last Updated:** 2026-09-29

---

## 1. Extension Overview

The Chrome extension is the primary entry point for OMNI HUB. It lives inside the browser, detects what the user is looking at, and provides AI-powered actions through a side panel.

The extension is built with React + TypeScript, bundled with Vite, and follows Chrome Manifest V3 constraints strictly.

---

## 2. MV3 Architecture Constraints

Manifest V3 introduces important restrictions that shape the extension architecture:

| MV3 Constraint | Impact on OMNI HUB |
|---------------|---------------------|
| No persistent background pages | Service Worker replaces background page; it can be terminated at any time |
| No remote code execution | All JS must be bundled; no eval, no dynamic imports from remote |
| Declarative net request | Cannot intercept/modify network requests programmatically (not needed for MVP) |
| Service Worker lifecycle | State must be persisted to `chrome.storage`, not in-memory |
| Side Panel API | Used instead of popup for persistent, dockable UI |

---

## 3. File Structure

```
extension/
├── manifest.json
├── public/
│   ├── icons/
│   │   ├── icon-16.png
│   │   ├── icon-32.png
│   │   ├── icon-48.png
│   │   └── icon-128.png
│   └── side-panel.html
├── src/
│   ├── background/
│   │   └── service-worker.ts      # Background service worker
│   ├── content-scripts/
│   │   ├── index.ts               # Content script entry point
│   │   ├── context-detector.ts    # Detects page context type
│   │   └── extractors/
│   │       ├── base.ts            # Base extractor interface
│   │       ├── generic.ts         # Generic webpage extractor
│   │       ├── youtube.ts         # YouTube transcript extractor
│   │       ├── pdf.ts             # PDF text extractor
│   │       └── github.ts          # GitHub repo extractor
│   ├── side-panel/
│   │   ├── main.tsx               # Side panel React entry
│   │   ├── App.tsx                # Root component
│   │   ├── components/
│   │   │   ├── ActionBar.tsx      # AI action buttons
│   │   │   ├── ResultView.tsx     # AI result display
│   │   │   ├── AskInput.tsx       # Question input
│   │   │   ├── AuthGate.tsx       # Login/signup gate
│   │   │   ├── ContextBadge.tsx   # Shows detected context type
│   │   │   └── LoadingState.tsx
│   │   ├── hooks/
│   │   │   ├── useCurrentTab.ts   # Get active tab info
│   │   │   ├── usePageContext.ts   # Get extracted page content
│   │   │   └── useAuth.ts         # Auth state from storage
│   │   └── stores/
│   │       └── panelStore.ts      # Zustand store for panel state
│   └── shared/
│       ├── api-client.ts          # Backend HTTP client
│       ├── auth.ts                # Auth token management
│       ├── storage.ts             # chrome.storage helpers
│       ├── messages.ts            # Chrome message passing types
│       └── types.ts               # Shared TS types
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## 4. Manifest V3 Configuration

```json
{
  "manifest_version": 3,
  "name": "OMNI HUB",
  "version": "0.1.0",
  "description": "AI-powered intelligence layer for the web",

  "permissions": [
    "activeTab",
    "sidePanel",
    "storage",
    "scripting"
  ],

  "host_permissions": [
    "https://*/*",
    "http://localhost/*"
  ],

  "background": {
    "service_worker": "background/service-worker.js",
    "type": "module"
  },

  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content-scripts/index.js"],
      "run_at": "document_idle"
    }
  ],

  "side_panel": {
    "default_path": "side-panel.html"
  },

  "action": {
    "default_icon": {
      "16": "icons/icon-16.png",
      "32": "icons/icon-32.png"
    },
    "default_title": "Open OMNI HUB"
  },

  "icons": {
    "16": "icons/icon-16.png",
    "48": "icons/icon-48.png",
    "128": "icons/icon-128.png"
  },

  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'"
  },

  "web_accessible_resources": [
    {
      "resources": ["icons/*"],
      "matches": ["<all_urls>"]
    }
  ]
}
```

---

## 5. Component Communication Architecture

MV3 extensions use message passing between isolated contexts. OMNI HUB has three isolated contexts:

```
┌──────────────────────────────────────────────────────────────────┐
│                      OMNI HUB Extension                          │
│                                                                  │
│  ┌─────────────────┐    Messages     ┌──────────────────────┐   │
│  │ Service Worker  │◄───────────────►│   Side Panel (React) │   │
│  │                 │                 │                      │   │
│  │ - Tab events    │    chrome.      │ - AI action buttons  │   │
│  │ - Auth tokens   │    runtime.     │ - Result display     │   │
│  │ - Side panel    │    sendMessage  │ - Ask input          │   │
│  │   lifecycle     │                 │ - Auth gate          │   │
│  └────────┬────────┘                 └──────────────────────┘   │
│           │                                      ▲              │
│           │ scripting.executeScript              │              │
│           ▼                                      │              │
│  ┌─────────────────┐                             │              │
│  │ Content Script  │─────────────────────────────┘              │
│  │                 │     chrome.runtime.sendMessage              │
│  │ - DOM access    │     (extracted content)                     │
│  │ - Context detect│                                            │
│  │ - Text extract  │                                            │
│  └─────────────────┘                                            │
│           │ Runs in page context                                 │
│           ▼                                                      │
│   ┌───────────────┐                                             │
│   │   Web Page    │                                             │
│   │   DOM/APIs    │                                             │
│   └───────────────┘                                             │
└──────────────────────────────────────────────────────────────────┘
```

---

## 6. Message Protocol

All messages between extension components follow a typed protocol:

```typescript
// shared/messages.ts

type MessageType =
  | 'GET_PAGE_CONTEXT'
  | 'PAGE_CONTEXT_RESPONSE'
  | 'EXECUTE_ACTION'
  | 'ACTION_RESULT'
  | 'GET_AUTH_TOKEN'
  | 'AUTH_TOKEN_RESPONSE'
  | 'OPEN_SIDE_PANEL';

interface ExtensionMessage<T = unknown> {
  type: MessageType;
  payload?: T;
  error?: string;
}

// Example: Side Panel → Content Script
interface GetPageContextMessage {
  type: 'GET_PAGE_CONTEXT';
}

// Example: Content Script → Side Panel
interface PageContextResponse {
  type: 'PAGE_CONTEXT_RESPONSE';
  payload: PageContext;
}
```

---

## 7. Context Detection Logic

```typescript
// content-scripts/context-detector.ts

type ContextType = 'youtube' | 'pdf' | 'github' | 'generic';

function detectContext(url: string, document: Document): ContextType {
  const urlObj = new URL(url);

  if (urlObj.hostname.includes('youtube.com') && urlObj.pathname === '/watch') {
    return 'youtube';
  }

  if (urlObj.hostname === 'github.com' && urlObj.pathname.split('/').length >= 3) {
    return 'github';
  }

  if (url.toLowerCase().endsWith('.pdf') || 
      document.contentType === 'application/pdf') {
    return 'pdf';
  }

  return 'generic';
}
```

---

## 8. Content Extraction Strategy

### 8.1 Generic Webpage

```
Strategy:
1. Try to find <article> or <main> element first
2. Fall back to largest text block by character count
3. Strip nav, header, footer, aside, script, style
4. Limit to 50,000 characters (backend truncates at 100K)
5. Include: title, meta description, headings hierarchy
```

### 8.2 YouTube

```
Strategy:
1. Extract video ID from URL params (?v=...)
2. Request transcript from YouTube Data API v3
   → GET https://www.googleapis.com/youtube/v3/captions
   → But captions API requires OAuth; alternative below
3. Primary: Parse transcript from youtube.com/watch page DOM
   (ytInitialData JSON embedded in page script tags)
4. Fallback: Use third-party transcript fetch endpoint on backend
5. Include: video title, channel, description, duration
```

> **Note:** YouTube transcript extraction is fragile due to YouTube's changing page structure. The backend will have a dedicated YouTube transcript service as a fallback.

### 8.3 PDF

```
Strategy:
1. Check if running in Chrome's native PDF viewer
2. If yes: content script cannot read PDF DOM directly
3. Use scripting.executeScript to inject pdf.js
4. Extract text layer from PDF using pdf.js
5. Concatenate all pages
6. Include: page count, estimated reading time
```

### 8.4 GitHub

```
Strategy:
1. Extract owner/repo from URL path
2. Use GitHub REST API (via backend proxy to avoid rate limits):
   - GET /repos/{owner}/{repo}              → repo metadata
   - GET /repos/{owner}/{repo}/readme        → README content
   - GET /repos/{owner}/{repo}/git/trees/HEAD?recursive=1 → file tree
3. Limit file tree to top 200 files
4. Include: primary language, stars, description, topics
```

---

## 9. Authentication Flow in Extension

```
1. User opens side panel
        │
        ▼
   AuthGate component checks chrome.storage.local for JWT
        │
   ┌────┴─────────────────────────────────────┐
   │ Token found + not expired?               │
   │                                          │
   ▼ Yes                                      ▼ No
   Show main panel UI                Show login screen
        │                                     │
        │                            User logs in via
        │                            web app or popup
        │                                     │
        │                            Store JWT in
        │                            chrome.storage.local
        │                                     │
        └─────────────────────────────────────┘
                        │
                        ▼
              All API calls include:
              Authorization: Bearer <JWT>
```

**Token Refresh:**
- Supabase JWTs expire after 1 hour by default
- Service Worker monitors token expiry and refreshes proactively
- Supabase JS SDK handles refresh via `onAuthStateChange`

---

## 10. Side Panel UI States

```
┌─────────────────────┐
│  NOT AUTHENTICATED  │
│  ─────────────────  │
│  [Sign In to OMNI]  │
│  [Create Account]   │
└─────────────────────┘

┌─────────────────────┐
│  AUTHENTICATED      │
│  ─────────────────  │
│  Context: [YouTube] │  ← ContextBadge
│  Title: "How to..." │
│                     │
│  [Summarize]        │  ← ActionBar
│  [Explain]          │
│  [Ask] _________    │  ← AskInput
│  [Extract]          │
│  [Notes]  [Quiz]    │
│  [Save to OMNI]     │
│                     │
│  ─────────────────  │
│  RESULT AREA        │  ← ResultView
│  (AI response here) │
└─────────────────────┘

┌─────────────────────┐
│  LOADING            │
│  ─────────────────  │
│  [Animated spinner] │
│  "Summarizing..."   │
└─────────────────────┘
```

---

## 11. State Management

The side panel uses **Zustand** for local state management:

```typescript
interface PanelStore {
  // Current page
  pageContext: PageContext | null;
  contextType: ContextType;

  // Auth
  user: User | null;
  isAuthenticated: boolean;

  // UI state
  currentAction: ActionType | null;
  isLoading: boolean;
  result: ActionResult | null;
  error: string | null;

  // Actions
  setPageContext: (ctx: PageContext) => void;
  executeAction: (action: ActionType, options?: ActionOptions) => Promise<void>;
  clearResult: () => void;
}
```

---

## 12. Build Configuration

```
// vite.config.ts — key points

Multiple entry points:
- background/service-worker.ts  → background/service-worker.js
- content-scripts/index.ts      → content-scripts/index.js
- side-panel/main.tsx           → side-panel/[hash].js

Build output: extension/dist/

No code splitting (all chunks inline for MV3 compatibility)
Source maps: disabled in production (security)
```

---

## 13. Extension Permissions Justification

| Permission | Why Needed |
|-----------|-----------|
| `activeTab` | Read the current tab's URL and title |
| `sidePanel` | Register and control the side panel |
| `storage` | Persist auth token and user preferences |
| `scripting` | Execute content scripts on demand in the active tab |
| `host_permissions: https://*/*` | Content scripts can run on all HTTPS sites |
