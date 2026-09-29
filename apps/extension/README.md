# OMNI HUB — Chrome Extension (`apps/extension`)

> **Browser Extension Entry Point for OMNI HUB**  
> Manifest V3 · TypeScript · React · Side Panel · Chrome MV3

---

## Overview

The Chrome extension is the primary user touchpoint for OMNI HUB. It injects context-aware scripts into active browser tabs and surfaces AI capabilities through a dedicated Chrome Side Panel interface.

In **Phase 3A**, the extension connects the live **Summarize** pipeline:
1. User opens any webpage and triggers OMNI side panel.
2. User clicks **Summarize**.
3. Content script extracts and normalizes the page title, URL, and visible body text.
4. Side panel dispatches `POST /api/v1/ai/summarize` to the local FastAPI backend.
5. Gemini 3.8 Flash summarizes the content server-side.
6. The side panel renders a structured, readable summary with a one-click copy button.

---

## Architecture & File Structure

```
apps/extension/
├── public/
│   ├── icons/                 # Extension icons (16, 32, 48, 128 px)
│   └── manifest.json          # Chrome MV3 manifest definition
├── src/
│   ├── background/
│   │   └── service-worker.ts  # Side panel behavior & action listeners
│   ├── content-scripts/
│   │   └── index.ts           # Webpage text extraction & message listener
│   ├── side-panel/
│   │   ├── components/
│   │   │   ├── ActionButtons.tsx  # Interactive AI action grid
│   │   │   ├── ChatInput.tsx      # Query input bar
│   │   │   ├── Header.tsx         # Brand header & live status indicator
│   │   │   ├── PageContextCard.tsx# Active page context (Title, URL, Status)
│   │   │   └── SummaryResult.tsx  # Formatted AI summary with copy/dismiss
│   │   ├── hooks/
│   │   │   └── useActiveTab.ts    # Reactive active tab tracker
│   │   ├── services/
│   │   │   └── api.ts             # Configurable backend API client
│   │   ├── App.tsx                # Main side panel container
│   │   ├── index.css              # Dark mode design system & tokens
│   │   └── main.tsx               # React root entry
│   └── types/
│       └── index.ts               # Shared TypeScript types
├── side-panel.html            # Extension HTML entry
├── tsconfig.json
└── vite.config.ts             # Multi-entry MV3 bundler configuration
```

---

## Build & Development

### 1. Install Dependencies

```bash
cd apps/extension
npm install
```

### 2. Build for Production

```bash
npm run build
```

This compiles TypeScript, bundles React and the content/background scripts, and outputs the unpackaged extension into:
`apps/extension/dist/`

### 3. Development Watch Mode

```bash
npm run dev
```

Rebuilds `dist/` continuously as source files change.

---

## Loading the Extension into Google Chrome

1. Open Google Chrome and navigate to:
   ```text
   chrome://extensions
   ```
2. Enable **Developer mode** using the toggle switch in the top-right corner.
3. Click the **Load unpacked** button.
4. Select the build directory:
   ```text
   omni-hub/apps/extension/dist
   ```
5. Pin **OMNI HUB** to your Chrome toolbar.
6. Click the OMNI HUB icon to open the side panel alongside any webpage.
7. Click **Summarize** while the FastAPI backend is running to generate a real-time summary.

> [!NOTE]
> When you make changes and rebuild with `npm run build`, click the **Reload** (circular arrow) icon on the OMNI HUB extension card in `chrome://extensions` to apply updates.
