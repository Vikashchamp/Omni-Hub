# OMNI HUB — Chrome Extension (`apps/extension`)

> **Browser Extension Entry Point for OMNI HUB**  
> Manifest V3 · TypeScript · React · Side Panel

---

## Overview

The Chrome extension is the primary user touchpoint for OMNI HUB. It injects context-aware scripts into active browser tabs and surfaces AI capabilities through a dedicated Chrome Side Panel interface.

## Planned Architecture

```
apps/extension/
├── manifest.json              # Chrome Manifest V3 configuration
├── background/
│   └── service-worker.ts      # Tab events, auth token management, messaging
├── content-scripts/
│   ├── extractor.ts           # Context detection + DOM/content extraction
│   └── injectors/             # Context-specific extractors
│       ├── generic.ts         # Generic web articles / blog posts
│       ├── youtube.ts         # YouTube transcripts & metadata
│       ├── pdf.ts             # PDF document extraction
│       └── github.ts          # GitHub repo / README / code extraction
├── side-panel/
│   ├── index.html             # Side panel HTML root
│   └── App.tsx                # Side panel React UI & chat interface
└── shared/
    ├── api.ts                 # Backend API client
    ├── auth.ts                # Supabase Auth session bridge
    └── types.ts               # Shared TypeScript definitions
```

## Relevant Documentation

- **Extension Architecture:** [`docs/extension-architecture.md`](../../docs/extension-architecture.md)
- **Product Specification:** [`docs/product-spec.md`](../../docs/product-spec.md)
- **API Specification:** [`docs/api-spec.md`](../../docs/api-spec.md)

## Status

- **Phase 1 (Current):** Project foundation established. Application logic, packaging, and dependencies will be configured in subsequent phases.
