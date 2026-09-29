# OMNI HUB — Web Application (`apps/web`)

> **Personal Intelligence Dashboard & Workspace**  
> React · TypeScript · Vite · Supabase Auth

---

## Overview

The OMNI HUB web application is the central command center for users to view, manage, and interact with their saved web knowledge, memory chunks, and AI conversation history.

## Planned Architecture

```
apps/web/
├── index.html
├── src/
│   ├── pages/
│   │   ├── Dashboard.tsx      # Overview, activity, recent items
│   │   ├── Projects.tsx       # Knowledge containers / research collections
│   │   ├── SavedContent.tsx   # Library of captured webpages, videos, PDFs
│   │   ├── Memory.tsx         # Semantic memory explorer & chunk inspector
│   │   └── History.tsx        # Past AI chats & syntheses
│   ├── components/
│   │   ├── layout/            # Sidebar, navigation, shell
│   │   ├── memory/            # Memory search, chunk cards
│   │   └── content/           # Content previews, tag managers
│   ├── hooks/
│   │   ├── useMemory.ts       # Hook for semantic memory operations
│   │   └── useContent.ts      # Hook for content management
│   ├── lib/
│   │   ├── api.ts             # Backend FastAPI client
│   │   └── supabase.ts        # Supabase client (auth only)
│   └── types/
│       └── index.ts           # Frontend TypeScript type declarations
```

## Relevant Documentation

- **System Architecture:** [`docs/architecture.md`](../../docs/architecture.md)
- **Product Specification:** [`docs/product-spec.md`](../../docs/product-spec.md)
- **API Specification:** [`docs/api-spec.md`](../../docs/api-spec.md)

## Status

- **Phase 1 (Current):** Project foundation established. Application logic, packaging, and dependencies will be configured in subsequent phases.
