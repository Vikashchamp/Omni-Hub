# OMNI HUB — System Architecture

> **Version:** 0.1 (MVP)
> **Last Updated:** 2026-09-29
> **Status:** Pre-implementation

---

## 1. Architecture Overview

OMNI HUB follows a **thin-client, thick-backend** model. The Chrome extension and web application are both lightweight clients that authenticate against a central FastAPI backend. The backend is the only component that ever holds API keys or talks to Gemini.

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER'S BROWSER                           │
│                                                                 │
│   ┌──────────────────┐         ┌──────────────────────────┐    │
│   │  Chrome Extension │         │    OMNI HUB Web App      │    │
│   │  (Side Panel)     │         │    (React + Vite)        │    │
│   │                   │         │                          │    │
│   │  Content Script   │         │    Dashboard             │    │
│   │  Background SW    │         │    Saved Content         │    │
│   │  Side Panel UI    │         │    Memory Q&A            │    │
│   └────────┬──────────┘         └────────────┬─────────────┘   │
│            │ HTTPS + JWT                      │ HTTPS + JWT      │
└────────────┼──────────────────────────────────┼─────────────────┘
             │                                  │
             ▼                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                      FASTAPI BACKEND                            │
│                                                                 │
│   ┌─────────────┐   ┌─────────────┐   ┌─────────────────────┐  │
│   │  Auth Layer │   │  AI Router  │   │  Memory Service     │  │
│   │  (JWT verify│   │  (Actions)  │   │  (Chunk+Embed+Store) │  │
│   └─────────────┘   └──────┬──────┘   └─────────┬───────────┘  │
│                            │                     │              │
│                    ┌───────▼──────┐              │              │
│                    │ Gemini API   │              │              │
│                    │ (server-side)│              │              │
│                    └──────────────┘              │              │
│                                                  │              │
└──────────────────────────────────────────────────┼─────────────┘
                                                   │
                                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                        SUPABASE                                 │
│                                                                 │
│   ┌──────────────┐   ┌──────────────┐   ┌───────────────────┐  │
│   │  Auth        │   │  PostgreSQL  │   │  pgvector         │  │
│   │  (JWT issuer)│   │  (main DB)   │   │  (embeddings)     │  │
│   └──────────────┘   └──────────────┘   └───────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Architectural Principles

| Principle | How It Applies |
|-----------|---------------|
| **Security first** | API keys never leave the backend. All requests authenticated. |
| **Thin clients** | Extension and web app contain no business logic — only UI. |
| **Single backend** | One FastAPI service handles all clients. No microservices yet. |
| **Supabase for persistence** | PostgreSQL for structured data, pgvector for semantic search. |
| **Stateless API** | Backend is stateless; all session state from JWT. |
| **RLS enforced** | Database-level row security — data isolation is guaranteed. |
| **Context-agnostic AI** | AI actions work the same regardless of content source. |
| **MVP simplicity** | No message queues, no caches, no service mesh in v1. |

---

## 3. Component Architecture

### 3.1 Chrome Extension Architecture

The extension is composed of four distinct layers:

```
Extension
├── manifest.json              # MV3 manifest
├── background/
│   └── service-worker.ts      # Background SW (tab events, auth token management)
├── content-scripts/
│   ├── extractor.ts           # Context detection + DOM/content extraction
│   └── injectors/
│       ├── generic.ts
│       ├── youtube.ts
│       ├── pdf.ts
│       └── github.ts
├── side-panel/
│   ├── index.html
│   └── App.tsx                # Side panel React UI
└── shared/
    ├── api.ts                 # Backend API client (fetch + auth headers)
    ├── auth.ts                # Supabase Auth helpers
    └── types.ts               # Shared TypeScript types
```

**Data Flow (Extension):**
```
User clicks action
      │
      ▼
Content Script extracts page content
      │
      ▼
Side Panel sends { content, action, url } to Backend API
      │        with Authorization: Bearer <JWT>
      ▼
Backend processes → returns result
      │
      ▼
Side Panel renders result
```

### 3.2 Web Application Architecture

```
web/
├── src/
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Projects.tsx
│   │   ├── SavedContent.tsx
│   │   ├── Memory.tsx
│   │   └── History.tsx
│   ├── components/
│   │   ├── layout/
│   │   ├── memory/
│   │   └── content/
│   ├── hooks/
│   │   ├── useMemory.ts
│   │   └── useContent.ts
│   ├── lib/
│   │   ├── api.ts             # Backend API client
│   │   └── supabase.ts        # Supabase client (auth only)
│   └── types/
│       └── index.ts
```

### 3.3 Backend Architecture

```
backend/
├── app/
│   ├── main.py                # FastAPI app entry point
│   ├── config.py              # Settings (env vars via pydantic-settings)
│   ├── dependencies.py        # Auth dependency injection
│   ├── routers/
│   │   ├── ai.py              # /ai/* endpoints
│   │   ├── memory.py          # /memory/* endpoints
│   │   └── content.py         # /content/* endpoints
│   ├── services/
│   │   ├── gemini.py          # Gemini API wrapper
│   │   ├── memory.py          # Chunking + embedding + vector storage
│   │   └── extractor.py       # Server-side content helpers
│   ├── models/
│   │   └── schemas.py         # Pydantic request/response models
│   └── db/
│       └── supabase.py        # Supabase client wrapper
```

---

## 4. Authentication Architecture

OMNI HUB uses **Supabase Auth** as the identity provider.

```
User signs up / logs in
        │
        ▼
  Supabase Auth issues JWT
        │
        ├──► Extension stores JWT in chrome.storage.local
        │
        └──► Web App stores JWT in memory / localStorage
                      │
                      ▼
           Every API call includes:
           Authorization: Bearer <JWT>
                      │
                      ▼
           Backend verifies JWT via Supabase public key
                      │
                      ▼
           Extracts user_id from JWT claims
                      │
                      ▼
           All DB queries scoped to user_id
```

**Key decisions:**
- Backend **never** issues its own tokens — it only validates Supabase JWTs
- Row-Level Security (RLS) in Supabase is a second layer of defense
- The extension uses `chrome.storage.local` (not `sessionStorage`) for token persistence across browser sessions

---

## 5. Content Extraction Architecture

Context detection is done in the extension's content script:

```
Tab URL / DOM signals
        │
        ▼
   Context Detector
        │
   ┌────┴──────────────────────────────┐
   │                                   │
   ▼                                   ▼
YouTube?                           GitHub?
  │                                   │
  ▼                                   ▼
Extract transcript              Extract README +
via yt-transcript or             file tree via
YouTube Data API                 GitHub REST API
                                          │
                    ┌─────────────────────┘
                    │
                    ▼
              Generic Webpage?          PDF?
                    │                    │
                    ▼                    ▼
             DOM text              PDF text layer
             extraction            extraction
```

All extracted content is normalized into a single `PageContext` object before being sent to the backend.

---

## 6. Memory Pipeline Architecture

### 6.1 Save Flow

```
User clicks "Save to OMNI"
        │
        ▼
Extension → POST /memory/save
   { content, url, title, context_type }
        │
        ▼
Backend: Chunking Service
   content → overlapping chunks (512 tokens, 50 token overlap)
        │
        ▼
Backend: Embedding Service
   chunk → gemini-embedding-2 → vector[EMBEDDING_DIMENSIONS] (default: 1536)
        │
        ▼
Backend: Storage
   INSERT INTO memory_chunks
   (user_id, saved_item_id, chunk_text, embedding, metadata)
```

### 6.2 Recall Flow

```
User asks question in web app / extension
        │
        ▼
POST /memory/ask { question }
        │
        ▼
Backend: Embed question
   question → gemini-embedding-2 → vector[EMBEDDING_DIMENSIONS] (default: 1536)
        │
        ▼
Backend: Vector Search
   SELECT chunks ORDER BY embedding <=> question_vector LIMIT 10
        │
        ▼
Backend: RAG Assembly
   top_chunks + original_question → Gemini prompt
        │
        ▼
Backend: Gemini generates grounded answer
   with source citations (url, title)
        │
        ▼
Client receives { answer, sources[] }
```

---

## 7. Security Architecture

### 7.1 Threat Model

| Threat | Mitigation |
|--------|-----------|
| API key exposure | Keys stored only in backend env vars, never sent to client |
| Unauthorized access | JWT required on all backend endpoints |
| Cross-user data access | RLS in Supabase + user_id scoping in all queries |
| Extension content injection | CSP headers, no eval, no remote scripts |
| CORS abuse | Backend CORS restricted to known origins |
| Prompt injection | System prompts separate from user content; content sanitized |

### 7.2 API Key Management

```
Environment Variables (backend only):
  GEMINI_API_KEY=...
  SUPABASE_SERVICE_ROLE_KEY=...  ← never exposed to clients
  SUPABASE_JWT_SECRET=...        ← used only for verification

Client-side has:
  SUPABASE_URL=...               ← public (safe)
  SUPABASE_ANON_KEY=...          ← public (safe, RLS enforced)
```

---

## 8. Scalability Considerations (Future, not MVP)

The MVP is designed as a single-process FastAPI app. The following scaling paths are available without architectural rewrites:

- **Horizontal scaling:** FastAPI is stateless → add more instances behind a load balancer
- **Async embedding:** Move chunk+embed to a background queue (Celery/ARQ) when needed
- **Caching:** Add Redis for frequently requested summaries (by URL hash)
- **Read replicas:** Supabase supports read replicas for vector search at scale
- **Edge functions:** Move auth verification to Supabase Edge Functions if needed
- **Multi-model:** AI router already abstracted — swap Gemini model versions easily

---

## 9. Monorepo Structure

```
omni-hub/
├── .github/
│   └── workflows/
│       ├── backend-ci.yml
│       └── extension-ci.yml
├── extension/                 # Chrome MV3 extension
├── web/                       # OMNI HUB web application
├── backend/                   # FastAPI backend
├── database/                  # Migrations + schema
├── docs/                      # This documentation
├── .env.example               # Template for all env vars
├── .gitignore
└── README.md
```

See `docs/development-plan.md` for detailed directory contents.
