# OMNI HUB — Backend Service (`backend`)

> **Secure AI Intelligence & Data API**  
> Python 3.11+ · FastAPI · Google GenAI SDK · Supabase / pgvector

---

## Overview

The backend service is the secure core of OMNI HUB. It mediates all interactions with Gemini AI models, handles embeddings generation via `gemini-embedding-2`, runs vector similarity queries, and validates authentication tokens from Supabase. No AI API keys are ever exposed to client applications.

## Planned Architecture

```
backend/
├── app/
│   ├── main.py                # FastAPI entry point, middleware, lifecycle
│   ├── config.py              # Pydantic Settings & environment validation
│   ├── dependencies.py        # Supabase JWT auth verification & dependencies
│   ├── routers/
│   │   ├── ai.py              # /api/v1/ai/* (summarize, explain, ask, etc.)
│   │   ├── memory.py          # /api/v1/memory/* (semantic search, index)
│   │   └── content.py         # /api/v1/content/* (save, retrieve items)
│   ├── services/
│   │   ├── gemini.py          # Gemini AI generation & prompt formatting
│   │   ├── memory.py          # Chunking, gemini-embedding-2 vectors & RAG
│   │   └── extractor.py       # Server-side HTML/text parsing utilities
│   ├── models/
│   │   └── schemas.py         # Pydantic models for requests and responses
│   └── db/
│       └── supabase.py        # Supabase PostgREST & pgvector client wrapper
├── tests/                     # Unit and integration test suite
├── pyproject.toml             # Project metadata and dependencies
└── requirements.txt           # Frozen requirements
```

## Relevant Documentation

- **AI Architecture:** [`docs/ai-architecture.md`](../docs/ai-architecture.md)
- **API Specification:** [`docs/api-spec.md`](../docs/api-spec.md)
- **System Architecture:** [`docs/architecture.md`](../docs/architecture.md)
- **Database Schema:** [`docs/database-schema.md`](../docs/database-schema.md)

## Status

- **Phase 1 (Current):** Project foundation established. Implementation of endpoints, services, and packages will begin in Phase 2.
