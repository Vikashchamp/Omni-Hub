# OMNI HUB

> **AI-powered intelligence layer for the web.**
>
> OMNI HUB does not replace the web. It makes the web intelligent.

---

## What Is This?

OMNI HUB is a Chrome extension + web application + AI backend that sits alongside your normal browsing and gives you superpowers:

- **Understand any page instantly** — summarize, explain, ask questions
- **Extract what matters** — pull structured data, generate notes, create quizzes
- **Build persistent memory** — save content once, find it semantically forever

---

## Repository Structure

```
omni-hub/
├── apps/
│   ├── extension/      # Chrome Manifest V3 extension (React + TypeScript)
│   └── web/            # OMNI HUB web application (React + Vite + Tailwind)
├── backend/            # FastAPI backend (Python)
├── database/           # SQL migrations and schema
└── docs/               # Architecture documentation
```

---

## Documentation

| Document | Description |
|----------|-------------|
| [Product Spec](docs/product-spec.md) | Vision, user journeys, AI actions, MVP scope |
| [Architecture](docs/architecture.md) | System design, component overview, security |
| [API Spec](docs/api-spec.md) | All backend endpoints, request/response schemas |
| [Database Schema](docs/database-schema.md) | Tables, indexes, RLS policies, migrations |
| [Extension Architecture](docs/extension-architecture.md) | MV3 design, context detectors, communication |
| [AI Architecture](docs/ai-architecture.md) | Gemini models, prompts, RAG pipeline |
| [Development Plan](docs/development-plan.md) | Full monorepo structure, phases, setup guide |

---

## Technology Stack

| Layer | Stack |
|-------|-------|
| Extension | React, TypeScript, Chrome MV3, Vite |
| Web App | React, TypeScript, Vite, Tailwind CSS |
| Backend | Python, FastAPI, Pydantic |
| AI | Gemini 2.0 Flash + gemini-embedding-2 |
| Database | Supabase PostgreSQL + pgvector |
| Auth | Supabase Auth (JWT) |

---

## MVP Progression

1. **Webpage → OMNI → Summarize** ← Core loop
2. **Webpage → OMNI → Ask** ← Contextual Q&A
3. **Webpage → OMNI → Save** ← Memory pipeline
4. **Saved content → Memory → Ask** ← Semantic recall
5. **YouTube support**
6. **PDF support**
7. **GitHub support**
8. **OMNI HUB dashboard**

---

## Status

> **📋 Phase 1: Project Foundation complete.**
>
> Repository layout, root configuration (`.gitignore`, `.env.example`), and package placeholders established. Implementation of application features begins in Phase 2.
>
> See [development-plan.md](docs/development-plan.md) for setup instructions and phase breakdown.

---

## Security

- All Gemini API keys are **server-side only** — never in the extension or browser
- All endpoints require a valid Supabase JWT
- Database Row-Level Security (RLS) ensures users can only access their own data
- No remote code execution in the extension (strict MV3 CSP)
