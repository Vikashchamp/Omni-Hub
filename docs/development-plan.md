# OMNI HUB — Development Plan

> **Version:** 0.1 (MVP)
> **Last Updated:** 2026-09-29
> **Target:** Hackathon-ready MVP → Scalable product

---

## 1. Complete Monorepo Structure

```
omni-hub/
│
├── .github/
│   ├── workflows/
│   │   ├── backend-ci.yml         # Test + lint backend on PR
│   │   ├── extension-ci.yml       # Build + type-check extension on PR
│   │   └── web-ci.yml             # Build + lint web app on PR
│   └── PULL_REQUEST_TEMPLATE.md
│
├── extension/                     # Chrome MV3 Extension
│   ├── public/
│   │   ├── icons/
│   │   │   ├── icon-16.png
│   │   │   ├── icon-32.png
│   │   │   ├── icon-48.png
│   │   │   └── icon-128.png
│   │   └── side-panel.html
│   ├── src/
│   │   ├── background/
│   │   │   └── service-worker.ts
│   │   ├── content-scripts/
│   │   │   ├── index.ts
│   │   │   ├── context-detector.ts
│   │   │   └── extractors/
│   │   │       ├── base.ts
│   │   │       ├── generic.ts
│   │   │       ├── youtube.ts
│   │   │       ├── pdf.ts
│   │   │       └── github.ts
│   │   ├── side-panel/
│   │   │   ├── main.tsx
│   │   │   ├── App.tsx
│   │   │   ├── components/
│   │   │   │   ├── ActionBar.tsx
│   │   │   │   ├── AskInput.tsx
│   │   │   │   ├── AuthGate.tsx
│   │   │   │   ├── ContextBadge.tsx
│   │   │   │   ├── LoadingState.tsx
│   │   │   │   ├── ResultView.tsx
│   │   │   │   └── SaveButton.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useAuth.ts
│   │   │   │   ├── useCurrentTab.ts
│   │   │   │   └── usePageContext.ts
│   │   │   └── stores/
│   │   │       └── panelStore.ts
│   │   └── shared/
│   │       ├── api-client.ts
│   │       ├── auth.ts
│   │       ├── messages.ts
│   │       ├── storage.ts
│   │       └── types.ts
│   ├── manifest.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── web/                           # OMNI HUB Web Application
│   ├── public/
│   │   ├── favicon.ico
│   │   └── og-image.png
│   ├── src/
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   │   ├── Login.tsx
│   │   │   │   └── Signup.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Projects.tsx
│   │   │   ├── ProjectDetail.tsx
│   │   │   ├── SavedContent.tsx
│   │   │   ├── Memory.tsx
│   │   │   ├── History.tsx
│   │   │   └── ItemDetail.tsx
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── AppShell.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   └── TopBar.tsx
│   │   │   ├── content/
│   │   │   │   ├── ContentCard.tsx
│   │   │   │   ├── ContentGrid.tsx
│   │   │   │   └── ContextTypeBadge.tsx
│   │   │   ├── memory/
│   │   │   │   ├── MemorySearchBar.tsx
│   │   │   │   ├── MemoryAnswer.tsx
│   │   │   │   └── SourceCard.tsx
│   │   │   └── ui/
│   │   │       ├── Button.tsx
│   │   │       ├── Input.tsx
│   │   │       ├── Modal.tsx
│   │   │       └── Spinner.tsx
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useContent.ts
│   │   │   ├── useMemory.ts
│   │   │   └── useProjects.ts
│   │   ├── lib/
│   │   │   ├── api.ts             # Backend API client
│   │   │   └── supabase.ts        # Supabase client (auth only)
│   │   ├── stores/
│   │   │   └── authStore.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   └── package.json
│
├── backend/                       # FastAPI Backend
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                # FastAPI app, CORS, router registration
│   │   ├── config.py              # Settings via pydantic-settings
│   │   ├── dependencies.py        # JWT auth dependency
│   │   ├── routers/
│   │   │   ├── __init__.py
│   │   │   ├── ai.py              # /ai/* endpoints
│   │   │   ├── memory.py          # /memory/* endpoints
│   │   │   ├── content.py         # /content/* endpoints
│   │   │   └── projects.py        # /projects/* endpoints
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── gemini.py          # Gemini API client
│   │   │   ├── ai_actions.py      # Action handlers
│   │   │   ├── memory.py          # Chunking + embedding + RAG
│   │   │   └── youtube.py         # YouTube transcript service
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   └── schemas.py         # All Pydantic request/response models
│   │   ├── db/
│   │   │   ├── __init__.py
│   │   │   └── supabase.py        # Supabase client (service role)
│   │   └── prompts/
│   │       ├── __init__.py
│   │       ├── system_prompts.py
│   │       └── user_prompts.py
│   ├── tests/
│   │   ├── __init__.py
│   │   ├── conftest.py
│   │   ├── test_ai.py
│   │   ├── test_memory.py
│   │   └── test_auth.py
│   ├── pyproject.toml             # uv project config
│   ├── uv.lock
│   └── .env.example
│
├── database/                      # Database migrations and schema
│   ├── migrations/
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_rls_policies.sql
│   │   ├── 003_functions.sql
│   │   └── 004_seed_data.sql
│   └── README.md
│
├── docs/                          # Architecture documentation
│   ├── product-spec.md
│   ├── architecture.md
│   ├── api-spec.md
│   ├── database-schema.md
│   ├── extension-architecture.md
│   ├── ai-architecture.md
│   └── development-plan.md        # ← This file
│
├── .env.example                   # All env vars documented
├── .gitignore
└── README.md
```

---

## 2. Technology Stack Summary

### Extension
| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18.x | Side panel UI |
| TypeScript | 5.x | Type safety |
| Vite | 5.x | Build tool (with CRXJS plugin) |
| Zustand | 4.x | Side panel state |
| Supabase JS | 2.x | Auth client |

### Web Application
| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18.x | UI framework |
| TypeScript | 5.x | Type safety |
| Vite | 5.x | Build tool |
| React Router | 6.x | Client-side routing |
| Tailwind CSS | 3.x | Styling |
| Zustand | 4.x | Global state |
| Supabase JS | 2.x | Auth client |

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Python | 3.12+ | Runtime |
| FastAPI | 0.115+ | Web framework |
| Pydantic | 2.x | Data validation |
| pydantic-settings | 2.x | Env var config |
| google-generativeai | Latest | Gemini API |
| supabase | 2.x | Supabase client |
| httpx | 0.27+ | Async HTTP client |
| python-jose | 3.x | JWT verification |
| uv | Latest | Package manager |

### Database
| Technology | Purpose |
|-----------|---------|
| Supabase PostgreSQL | Primary database |
| pgvector | Vector embeddings |
| Supabase Auth | User authentication |

---

## 3. Development Phases

### Phase 1: Foundation (Days 1-2)

**Goal:** Working end-to-end for "Webpage → Summarize"

- [ ] Initialize monorepo structure
- [ ] Set up Supabase project (auth, database)
- [ ] Run database migrations
- [ ] Initialize FastAPI backend with `uv`
- [ ] Implement JWT auth middleware
- [ ] Implement Gemini client wrapper
- [ ] Implement `POST /ai/summarize` endpoint
- [ ] Initialize Chrome extension with Vite + CRXJS
- [ ] Implement generic webpage content extractor
- [ ] Implement side panel UI (AuthGate + ActionBar + ResultView)
- [ ] Wire extension → backend → extension pipeline
- [ ] **Milestone:** Can install extension, sign in, open a webpage, click Summarize, see result

### Phase 2: Core AI Actions (Days 3-4)

**Goal:** All 7 AI actions working on generic webpages

- [ ] Implement `POST /ai/ask` endpoint
- [ ] Implement `POST /ai/explain` endpoint
- [ ] Implement `POST /ai/extract` endpoint
- [ ] Implement `POST /ai/notes` endpoint
- [ ] Implement `POST /ai/quiz` endpoint
- [ ] Implement all action UI components in side panel
- [ ] Add conversation history logging
- [ ] **Milestone:** All 7 actions work reliably

### Phase 3: Memory Pipeline (Days 5-6)

**Goal:** Save content and recall it semantically

- [ ] Implement chunking service
- [ ] Implement embedding service (gemini-embedding-2)
- [ ] Implement `POST /memory/save` endpoint
- [ ] Implement `POST /memory/ask` endpoint
- [ ] Implement `GET /memory/items` endpoint
- [ ] Add "Save to OMNI" button to extension
- [ ] **Milestone:** Save page → Ask question → Get grounded answer from saved content

### Phase 4: Additional Contexts (Day 7)

**Goal:** YouTube, PDF, GitHub support

- [ ] Implement YouTube transcript extractor
- [ ] Implement PDF text extractor
- [ ] Implement GitHub content extractor
- [ ] Add context detection to extension
- [ ] Update ContextBadge UI component
- [ ] Test all contexts with all actions
- [ ] **Milestone:** All 4 context types work

### Phase 5: Web Application (Days 8-9)

**Goal:** OMNI HUB web dashboard

- [ ] Initialize Vite + React + TypeScript + Tailwind web app
- [ ] Implement auth pages (login, signup)
- [ ] Implement main layout (sidebar + topbar)
- [ ] Implement Dashboard page
- [ ] Implement Saved Content page + detail view
- [ ] Implement Memory Q&A page
- [ ] Implement Conversation History page
- [ ] Implement Projects (create, assign, filter)
- [ ] **Milestone:** Full web app working with all saved data

### Phase 6: Polish (Day 10)

**Goal:** Production-ready MVP

- [ ] Error handling throughout (all layers)
- [ ] Loading states and user feedback
- [ ] Rate limiting on backend
- [ ] Content deduplication (content_hash)
- [ ] Extension icon + branding
- [ ] README with setup instructions
- [ ] Environment variable documentation
- [ ] **Milestone:** Demo-ready, stable MVP

---

## 4. Environment Variables

### Backend (`.env`)

```bash
# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...          # Server-only, never expose
SUPABASE_JWT_SECRET=your-jwt-secret       # For JWT verification

# Gemini
GEMINI_API_KEY=AIza...
GEMINI_EMBEDDING_MODEL=gemini-embedding-2

# Embedding dimension — must match the vector() size in the DB migration.
# gemini-embedding-2 supports 128–3072 via MRL. Recommended: 768 | 1536 | 3072.
# Default for MVP: 1536. Changing this after data has been saved requires
# re-embedding all stored chunks and running ALTER TABLE on memory_chunks.
EMBEDDING_DIMENSIONS=1536

# App
APP_ENV=development                       # development | production
ALLOWED_ORIGINS=http://localhost:5173,chrome-extension://your-ext-id
```

### Extension (`.env` — Vite build time)

```bash
VITE_API_BASE_URL=http://localhost:8000   # Backend URL
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...            # Public anon key (safe)
```

### Web App (`.env` — Vite build time)

```bash
VITE_API_BASE_URL=http://localhost:8000
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

---

## 5. Development Setup

### Prerequisites
- Node.js 20+
- Python 3.12+
- `uv` (Python package manager)
- Supabase CLI
- Chrome browser

### Backend Setup
```bash
cd backend
uv sync
cp .env.example .env
# Fill in .env values
uv run fastapi dev app/main.py
```

### Extension Setup
```bash
cd extension
npm install
cp .env.example .env
# Fill in .env values
npm run dev
# Load unpacked extension from extension/dist/ in Chrome
```

### Web App Setup
```bash
cd web
npm install
cp .env.example .env
# Fill in .env values
npm run dev
```

### Database Setup
```bash
supabase init
supabase start
supabase db push  # Applies migrations
```

---

## 6. Testing Strategy

### Backend Tests
- Unit tests for all services (gemini, memory, chunking)
- Integration tests for all API endpoints
- Mock Gemini API in tests (never hit real API in CI)
- Run with: `uv run pytest`

### Extension Tests
- Unit tests for context detector
- Unit tests for extractors
- Integration tests for message passing (using Chrome test framework)
- Run with: `npm test`

### Web App Tests
- Component tests with React Testing Library
- Run with: `npm test`

### Manual E2E Testing Checklist
- [ ] Sign up new account
- [ ] Extension: Summarize a Wikipedia article
- [ ] Extension: Ask a question about a news article
- [ ] Extension: Save an article
- [ ] Web app: View saved content
- [ ] Web app: Ask a memory question, see answer with sources
- [ ] Extension: Summarize a YouTube video
- [ ] Extension: Summarize a PDF
- [ ] Extension: Summarize a GitHub repo

---

## 7. Git Workflow

```
main              ← Stable, demo-ready
  └─ develop      ← Integration branch
       ├─ feat/phase-1-foundation
       ├─ feat/phase-2-ai-actions
       ├─ feat/phase-3-memory
       ├─ feat/phase-4-contexts
       ├─ feat/phase-5-web-app
       └─ feat/phase-6-polish
```

**Commit convention:** `feat:`, `fix:`, `docs:`, `test:`, `refactor:`

---

## 8. Key Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| YouTube transcript extraction breaks | Medium | Medium | Backend fallback service; show graceful error |
| Gemini rate limits during demo | Low | High | Cache common requests by URL hash |
| PDF extraction fails for scanned PDFs | High | Low | Clearly show "text-only PDF supported" |
| Extension rejected by Chrome Web Store | Low | Medium | Follow all MV3 guidelines strictly |
| Supabase pgvector slow at scale | Low | Medium | IVFFlat index; acceptable for MVP |
| JWT token race conditions in extension | Medium | Medium | Service worker handles refresh proactively |

---

## 9. Definition of "Done" for MVP

The MVP is complete when:

1. ✅ A new user can sign up and be authenticated end-to-end
2. ✅ The extension summarizes any generic webpage correctly
3. ✅ The extension answers questions grounded in page content
4. ✅ Content can be saved and retrieved semantically from the web app
5. ✅ YouTube, PDF, and GitHub contexts all work
6. ✅ All AI API keys are exclusively server-side
7. ✅ Every endpoint requires authentication
8. ✅ The web app dashboard displays all saved content and history
9. ✅ The system can be demonstrated without errors in a 10-minute live demo
10. ✅ Setup from scratch takes less than 15 minutes with the README
