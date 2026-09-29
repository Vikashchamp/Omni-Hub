# OMNI HUB — Database (`database`)

> **PostgreSQL Schema, Vector Extensions & Migrations**  
> Supabase · PostgreSQL · pgvector · Row Level Security (RLS)

---

## Overview

The `database/` directory manages SQL schemas, migrations, functions, and seed data for OMNI HUB. The database relies on PostgreSQL managed via Supabase, with the `pgvector` extension powering semantic memory and RAG retrieval using configurable vector dimensions (default 1536-dim via `gemini-embedding-2`).

## Planned Architecture

```
database/
├── migrations/                # Versioned SQL migration scripts
│   └── 001_initial_schema.sql # Core tables, RLS policies, pgvector indexes
├── seeds/                     # Development and testing seed data
│   └── seed.sql
└── README.md                  # Database setup and migration guide
```

## Relevant Documentation

- **Database Schema & SQL DDL:** [`docs/database-schema.md`](../docs/database-schema.md)
- **AI Architecture (Vector Search):** [`docs/ai-architecture.md`](../docs/ai-architecture.md)

## Status

- **Phase 1 (Current):** Project foundation established. Migration scripts and database provisioning will take place in future phases.
