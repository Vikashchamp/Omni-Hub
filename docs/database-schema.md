# OMNI HUB — Database Schema

> **Version:** 0.1 (MVP)
> **Database:** PostgreSQL (via Supabase)
> **Extensions:** `pgvector`, `uuid-ossp`
> **Last Updated:** 2026-09-29

---

## 1. Overview

The database is hosted on Supabase PostgreSQL. It uses:
- `pgvector` for semantic embedding storage and cosine similarity search
- `uuid-ossp` for UUID primary keys
- Supabase Auth for the `auth.users` table (managed by Supabase)
- Row-Level Security (RLS) on all tables

All timestamps are stored in UTC as `timestamptz`.

---

## 2. Entity Relationship Diagram

```
auth.users (Supabase managed)
     │
     ├──────────────────────────────────────────────┐
     │                                              │
     ▼                                              ▼
  profiles                                       projects
  (user settings)                                (knowledge containers)
                                                    │
                                            ┌───────┘
                                            │
                                            ▼
                                       saved_items
                                       (saved pages)
                                            │
                              ┌─────────────┼─────────────┐
                              │             │             │
                              ▼             ▼             ▼
                        memory_chunks  conversations  item_tags
                        (embeddings)   (AI history)
                                            │
                                            ▼
                                    conversation_messages
```

---

## 3. Table Definitions

### 3.1 `profiles`

Extends `auth.users` with application-level user settings.

```sql
CREATE TABLE profiles (
  id            uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name  text,
  avatar_url    text,
  plan          text NOT NULL DEFAULT 'free',  -- 'free' | 'pro'
  settings      jsonb NOT NULL DEFAULT '{}',
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
```

**`settings` JSONB shape:**
```json
{
  "default_summary_length": "medium",
  "default_explanation_level": "intermediate",
  "auto_detect_context": true
}
```

---

### 3.2 `projects`

Containers for organizing saved content.

```sql
CREATE TABLE projects (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        text NOT NULL,
  description text,
  color       text,            -- hex color for UI
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_projects_user_id ON projects(user_id);

-- RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own projects"
  ON projects FOR ALL
  USING (auth.uid() = user_id);
```

---

### 3.3 `saved_items`

Represents a saved webpage, YouTube video, PDF, or GitHub repo.

```sql
CREATE TABLE saved_items (
  id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id       uuid REFERENCES projects(id) ON DELETE SET NULL,
  
  -- Source metadata
  url              text NOT NULL,
  title            text NOT NULL,
  context_type     text NOT NULL CHECK (context_type IN ('generic', 'youtube', 'pdf', 'github')),
  favicon_url      text,
  
  -- Content
  content_preview  text,        -- First ~500 chars for display
  content_hash     text,        -- SHA-256 of original content (dedup)
  user_note        text,        -- User's own annotation
  
  -- Status
  chunk_count      integer NOT NULL DEFAULT 0,
  is_embedded      boolean NOT NULL DEFAULT false,

  -- Timestamps
  saved_at         timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_saved_items_user_id ON saved_items(user_id);
CREATE INDEX idx_saved_items_project_id ON saved_items(project_id);
CREATE INDEX idx_saved_items_context_type ON saved_items(context_type);
CREATE INDEX idx_saved_items_content_hash ON saved_items(content_hash);

-- Full-text search index
CREATE INDEX idx_saved_items_fts ON saved_items
  USING GIN(to_tsvector('english', title || ' ' || COALESCE(content_preview, '')));

-- RLS
ALTER TABLE saved_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own saved items"
  ON saved_items FOR ALL
  USING (auth.uid() = user_id);
```

---

### 3.4 `item_tags`

Many-to-many tags for saved items.

```sql
CREATE TABLE item_tags (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  saved_item_id uuid NOT NULL REFERENCES saved_items(id) ON DELETE CASCADE,
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tag          text NOT NULL,
  
  UNIQUE(saved_item_id, tag)
);

CREATE INDEX idx_item_tags_saved_item_id ON item_tags(saved_item_id);
CREATE INDEX idx_item_tags_user_id_tag ON item_tags(user_id, tag);

-- RLS
ALTER TABLE item_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own tags"
  ON item_tags FOR ALL
  USING (auth.uid() = user_id);
```

---

### 3.5 `memory_chunks`

Stores text chunks and their vector embeddings. This is the core of the semantic memory system.

```sql
-- Requires pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE memory_chunks (
  id             uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  saved_item_id  uuid NOT NULL REFERENCES saved_items(id) ON DELETE CASCADE,
  
  -- Chunk content
  chunk_text     text NOT NULL,
  chunk_index    integer NOT NULL,     -- Position of chunk in document
  token_count    integer,
  
  -- Embedding generated by gemini-embedding-2
  -- Dimension is set by EMBEDDING_DIMENSIONS env var at deployment time.
  -- MVP default: 1536 (MRL-supported; range 128–3072).
  -- WARNING: All rows in this table MUST share the same dimension.
  --          Changing dimension requires re-embedding all chunks + ALTER TABLE.
  embedding      vector(1536),  -- adjust if EMBEDDING_DIMENSIONS != 1536
  
  -- Metadata
  metadata       jsonb NOT NULL DEFAULT '{}',
  
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_memory_chunks_user_id ON memory_chunks(user_id);
CREATE INDEX idx_memory_chunks_saved_item_id ON memory_chunks(saved_item_id);

-- IVFFlat index for approximate nearest neighbor search.
-- Create AFTER initial bulk load; tune `lists` ≈ sqrt(row_count).
-- If EMBEDDING_DIMENSIONS is changed the index must be rebuilt.
CREATE INDEX idx_memory_chunks_embedding ON memory_chunks
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- RLS
ALTER TABLE memory_chunks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own chunks"
  ON memory_chunks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Backend service role can insert chunks"
  ON memory_chunks FOR INSERT
  WITH CHECK (true);  -- Backend uses service role key

CREATE POLICY "Users can delete own chunks"
  ON memory_chunks FOR DELETE
  USING (auth.uid() = user_id);
```

**`metadata` JSONB shape:**
```json
{
  "url": "https://...",
  "title": "Page Title",
  "context_type": "generic",
  "section": "Introduction"
}
```

---

### 3.6 `conversations`

Groups AI interactions into conversations tied to a URL/context.

```sql
CREATE TABLE conversations (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  saved_item_id uuid REFERENCES saved_items(id) ON DELETE SET NULL,
  
  -- Context
  url           text,
  title         text,
  context_type  text CHECK (context_type IN ('generic', 'youtube', 'pdf', 'github', 'memory')),
  
  -- Display
  display_title text,          -- Auto-generated from first message
  
  created_at    timestamptz NOT NULL DEFAULT now(),
  last_message_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_last_message ON conversations(user_id, last_message_at DESC);

-- RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own conversations"
  ON conversations FOR ALL
  USING (auth.uid() = user_id);
```

---

### 3.7 `conversation_messages`

Individual messages within a conversation.

```sql
CREATE TABLE conversation_messages (
  id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id  uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id          uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  role             text NOT NULL CHECK (role IN ('user', 'assistant')),
  content          text NOT NULL,
  action_type      text CHECK (action_type IN (
                     'ask', 'summarize', 'explain', 'extract',
                     'notes', 'quiz', 'memory_ask'
                   )),
  
  -- Structured data for non-text responses
  structured_data  jsonb,
  
  -- Token usage tracking
  input_tokens     integer,
  output_tokens    integer,
  
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_conv_messages_conversation_id ON conversation_messages(conversation_id);
CREATE INDEX idx_conv_messages_user_id ON conversation_messages(user_id);

-- RLS
ALTER TABLE conversation_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own messages"
  ON conversation_messages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Backend service role can insert messages"
  ON conversation_messages FOR INSERT
  WITH CHECK (true);
```

---

## 4. Database Functions

### 4.1 Vector Similarity Search

> **Note:** The `p_embedding` type must match the `EMBEDDING_DIMENSIONS` value chosen at
> deployment. The migration file parameterises this via a `\set` variable.
> Example below uses 1536 (the MVP default). Adjust if deploying with a different dimension.

```sql
CREATE OR REPLACE FUNCTION search_memory_chunks(
  p_user_id     uuid,
  p_embedding   vector(1536),   -- must match EMBEDDING_DIMENSIONS
  p_limit       integer DEFAULT 10,
  p_project_id  uuid DEFAULT NULL
)
RETURNS TABLE (
  id              uuid,
  saved_item_id   uuid,
  chunk_text      text,
  metadata        jsonb,
  similarity      float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    mc.id,
    mc.saved_item_id,
    mc.chunk_text,
    mc.metadata,
    1 - (mc.embedding <=> p_embedding) AS similarity
  FROM memory_chunks mc
  JOIN saved_items si ON si.id = mc.saved_item_id
  WHERE
    mc.user_id = p_user_id
    AND (p_project_id IS NULL OR si.project_id = p_project_id)
  ORDER BY mc.embedding <=> p_embedding
  LIMIT p_limit;
$$;
```

### 4.2 Auto-update `updated_at`

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables with updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_saved_items_updated_at
  BEFORE UPDATE ON saved_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 4.3 Auto-create Profile on Signup

```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

---

## 5. Migration Strategy

Migrations are stored in `database/migrations/` as numbered SQL files:

```
database/migrations/
├── 001_initial_schema.sql         # All tables above
├── 002_rls_policies.sql           # All RLS policies
├── 003_functions.sql              # DB functions + triggers
└── 004_seed_data.sql              # Dev/test seed data (not for production)
```

Apply via Supabase CLI:
```bash
supabase db push
```

---

## 6. Index Strategy Summary

| Table | Index | Purpose |
|-------|-------|---------|
| `projects` | `user_id` | Filter by user |
| `saved_items` | `user_id` | Filter by user |
| `saved_items` | `project_id` | Filter by project |
| `saved_items` | `context_type` | Filter by type |
| `saved_items` | `content_hash` | Deduplication |
| `saved_items` | GIN FTS | Full-text search |
| `memory_chunks` | `user_id` | Filter by user |
| `memory_chunks` | `saved_item_id` | Delete cascade |
| `memory_chunks` | IVFFlat vector | ANN search |
| `conversations` | `user_id, last_message_at` | Recent conversations |
| `conversation_messages` | `conversation_id` | Get messages |

---

## 7. Storage Limits (MVP)

| Plan | Saved Items | Memory Chunks | Conversations |
|------|------------|---------------|---------------|
| Free | 100 | 10,000 | 500 |
| Pro | Unlimited | Unlimited | Unlimited |

These limits are enforced at the application layer in the backend, not at the database level.
