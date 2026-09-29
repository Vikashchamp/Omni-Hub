# OMNI HUB — AI Architecture

> **Version:** 0.1 (MVP)
> **AI Provider:** Google Gemini API
> **Last Updated:** 2026-09-29

---

## 1. AI Architecture Philosophy

OMNI HUB's AI layer follows three principles:

1. **Server-side only** — Gemini API keys never leave the backend
2. **Context-aware prompting** — Each action has a carefully designed system prompt that adapts to the page context type
3. **Structured outputs** — AI responses use Gemini's structured output feature where format matters (quiz, extract, summary), ensuring reliable parsing

---

## 2. Gemini Models Used

| Use Case | Model | Reason |
|----------|-------|--------|
| AI actions (summarize, ask, etc.) | `gemini-2.0-flash` | Fast, cost-effective, long context |
| Memory Q&A (RAG) | `gemini-2.0-flash` | Same model for consistency |
| Embeddings | `gemini-embedding-2` | Default 3072-dim; configurable 128–3072 via `output_dimensionality` |
| Complex extractions | `gemini-2.5-pro` (optional) | Higher accuracy when needed (future) |

**Context window:** `gemini-2.0-flash` supports 1M tokens — far more than any single webpage.

---

## 3. AI Service Architecture

```
backend/app/services/
├── gemini.py          # Low-level Gemini API client wrapper
├── ai_actions.py      # Action-specific AI functions
├── memory.py          # Chunking, embedding, RAG
└── prompts/
    ├── __init__.py
    ├── system_prompts.py   # All system prompt templates
    └── user_prompts.py     # User prompt builders
```

### Gemini Client Wrapper

```python
# gemini.py — responsibilities
class GeminiClient:
    - Initialize with API key from environment
    - generate_content(prompt, system, response_schema=None) → str | dict
    - embed_text(text, output_dimensionality=None) → list[float]
    #   Defaults to EMBEDDING_DIMENSIONS from config (e.g. 1536)
    #   Valid range: 128–3072 (gemini-embedding-2 MRL)
    - Handle retries with exponential backoff
    - Log token usage per request
    - Raise typed exceptions (RateLimitError, ContentFilterError, etc.)
```

---

## 4. Prompt Architecture

### 4.1 System Prompt Structure

All system prompts follow this structure:

```
[ROLE DEFINITION]
You are OMNI, an AI assistant that helps users understand web content.

[BEHAVIOR RULES]
- Ground all answers in the provided content
- Do not hallucinate facts not present in the content
- Be concise but complete
- [action-specific rules]

[CONTEXT ADAPTATION]
{context_type_specific_instructions}

[OUTPUT FORMAT]
{format_instructions}
```

### 4.2 Context-Type Adaptations

Each context type adjusts the system prompt:

| Context | System Prompt Additions |
|---------|------------------------|
| `generic` | Standard webpage instructions |
| `youtube` | "Content is a video transcript. Note it may have transcript artifacts." |
| `pdf` | "Content is extracted from a PDF. Page breaks may appear as [PAGE N]." |
| `github` | "Content includes a GitHub repository's README and file structure." |

### 4.3 Prompt Templates

#### Summarize

```
System:
  You are OMNI. Summarize the provided web content accurately and concisely.
  Return a structured summary with a brief overview and key points.
  Do not add information not present in the content.
  Length: {length} (short=3-5 points, medium=5-8 points, long=8-12 points)
  Format: {format}

User:
  Title: {title}
  URL: {url}
  Content:
  ---
  {content}
  ---
  Summarize this content.
```

#### Ask

```
System:
  You are OMNI. Answer the user's question based ONLY on the provided content.
  If the answer is not in the content, say so clearly.
  Quote relevant sections where helpful.
  Do not fabricate information.

User:
  Title: {title}
  URL: {url}
  Content:
  ---
  {content}
  ---
  Question: {question}
```

#### Memory Ask (RAG)

```
System:
  You are OMNI. Answer the user's question based on their saved knowledge base.
  The following are the most relevant excerpts from content they previously saved.
  Cite your sources by title and URL.
  If no relevant information exists, say so clearly.

User:
  Question: {question}

  Relevant saved content:
  {for each chunk:}
  ---
  Source: {title} ({url})
  {chunk_text}
  ---
```

#### Extract

```
System:
  You are OMNI. Extract specific information from web content as requested.
  Return ONLY the extracted information in the requested format.
  Do not add commentary unless asked.

User:
  Title: {title}
  Content:
  ---
  {content}
  ---
  Extract: {extraction_prompt}
  Output format: {output_format}
```

#### Quiz

```
System:
  You are OMNI. Generate a quiz from the provided content.
  Questions should test understanding of key concepts.
  Each question must have a clear, correct answer derivable from the content.
  Difficulty: {difficulty}

User:
  Title: {title}
  Content:
  ---
  {content}
  ---
  Generate {question_count} quiz questions.
```

---

## 5. Structured Output Schemas

Gemini structured outputs ensure reliable, parseable AI responses.

### 5.1 Summary Schema

```python
class SummaryResponse(BaseModel):
    overview: str           # 1-2 sentence overview
    key_points: list[str]   # Bullet points
    main_topic: str         # One-word or short phrase
```

### 5.2 Quiz Schema

```python
class QuizQuestion(BaseModel):
    question: str
    answer: str
    explanation: str

class QuizResponse(BaseModel):
    questions: list[QuizQuestion]
    difficulty: str
    topic: str
```

### 5.3 Extract Schema

```python
class ExtractResponse(BaseModel):
    extracted_data: str | list | dict   # Flexible based on prompt
    format_used: str
    confidence: str   # "high" | "medium" | "low"
```

### 5.4 Notes Schema

```python
class NotesResponse(BaseModel):
    title: str
    sections: list[NotesSection]

class NotesSection(BaseModel):
    heading: str
    content: str
    subsections: list[NotesSection] | None
```

> **Free-form actions** (Ask, Explain, Memory Ask): These return plain text — structured output is not appropriate as the answer format varies too much.

---

## 6. Memory Pipeline — AI Details

### 6.1 Chunking Strategy

```
Input text
     │
     ▼
Clean text (remove excessive whitespace, HTML artifacts)
     │
     ▼
Split by paragraph boundaries (prefer natural breaks)
     │
     ▼
Enforce max chunk size: 512 tokens
Enforce min chunk size: 100 tokens
Overlap: 50 tokens (slide window backward to include context)
     │
     ▼
Chunks: [c1, c2, c3, ... cN]
```

**Why 512 tokens?**
- `gemini-embedding-2` supports long inputs, but smaller chunks give more precise retrieval granularity
- 512 tokens balances context richness against retrieval precision
- Smaller chunks = more specific, higher-relevance matches

**Why 50 token overlap?**
- Prevents splitting ideas across chunk boundaries
- A question about a concept at the end of chunk N will still find it in chunk N+1's overlap

### 6.2 Embedding Details

```python
# Using gemini-embedding-2 via the Gemini API
# output_dimensionality is read from EMBEDDING_DIMENSIONS env var (default: 1536)

# For storing document chunks:
result = client.models.embed_content(
    model="gemini-embedding-2",
    contents=chunk_text,
    config={
        "task_type": "RETRIEVAL_DOCUMENT",
        "output_dimensionality": settings.EMBEDDING_DIMENSIONS,  # e.g. 1536
    }
)
embedding = result.embeddings[0].values  # list[float]

# For embedding a search query:
result = client.models.embed_content(
    model="gemini-embedding-2",
    contents=user_question,
    config={
        "task_type": "RETRIEVAL_QUERY",
        "output_dimensionality": settings.EMBEDDING_DIMENSIONS,
    }
)
query_embedding = result.embeddings[0].values
```

**Task types matter:**
- `RETRIEVAL_DOCUMENT`: Optimized for documents being stored (chunks)
- `RETRIEVAL_QUERY`: Optimized for search queries (user questions)

**Configurable dimensionality (`output_dimensionality`):**

`gemini-embedding-2` uses **Matryoshka Representation Learning (MRL)**, which nests semantic information so that any prefix of the full 3072-dimensional vector retains high utility. This means the dimension can be reduced at inference time without retraining.

| Dimension | Storage per chunk | Recommended for |
|-----------|------------------|-----------------|
| 768 | ~3 KB | Constrained storage, acceptable accuracy |
| **1536** | ~6 KB | **MVP default — good balance** |
| 3072 | ~12 KB | Maximum accuracy, higher storage cost |

The active dimension is controlled by a single environment variable (`EMBEDDING_DIMENSIONS`). **All chunks in a database must use the same dimension.** Changing the dimension requires re-embedding all stored chunks and altering the pgvector column.

> **MVP default:** `EMBEDDING_DIMENSIONS=1536`

### 6.3 Similarity Search

```sql
-- In PostgreSQL via Supabase
SELECT *, 1 - (embedding <=> query_embedding) AS similarity
FROM memory_chunks
WHERE user_id = $user_id
ORDER BY embedding <=> query_embedding  -- cosine distance
LIMIT 10;
```

**Cosine similarity threshold:** Chunks with similarity < 0.6 are excluded from RAG context to avoid noise.

### 6.4 RAG Assembly

```
Retrieved chunks (up to 10, similarity > 0.6)
     │
     ▼
Deduplicate by saved_item_id (max 3 chunks per source)
     │
     ▼
Sort by similarity descending
     │
     ▼
Build context string:
  "Source: {title} ({url})\n{chunk_text}\n---\n"
     │
     ▼
Total context: max 50,000 tokens
     │
     ▼
Assemble final prompt → Gemini → Answer
     │
     ▼
Return answer + source list to client
```

---

## 7. Content Length Handling

Gemini 2.0 Flash has a 1M token context window. However, sending 100K+ tokens per request is expensive. The backend applies smart truncation:

| Context Type | Strategy |
|-------------|----------|
| Short page (<10K chars) | Send full content |
| Medium page (10K-50K chars) | Send full content |
| Long page (50K-100K chars) | Extract most relevant sections first |
| Very long page (>100K chars) | Truncate to 100K chars with notice |

For **Ask** actions on long pages, the backend first performs a lightweight embedding search within the page content itself to find the most relevant sections — then sends those to Gemini rather than the entire page.

---

## 8. Token Usage Tracking

All AI requests log token usage to `conversation_messages`:

```python
response = gemini.generate_content(...)
await db.log_message(
    input_tokens=response.usage_metadata.prompt_token_count,
    output_tokens=response.usage_metadata.candidates_token_count,
    ...
)
```

This data will be used for:
- User quota enforcement (MVP: informal monitoring)
- Cost tracking per user (future: billing)
- Identifying expensive operations for optimization

---

## 9. Safety and Content Policy

### 9.1 Prompt Injection Defense

User-provided content (webpage text) is always separated from system instructions:

```
System Prompt (trusted):
  "You are OMNI. Ground answers in the content below."
  
User Message (untrusted):
  "CONTENT:\n---\n{page_content}\n---\n\nQUESTION: {user_question}"
```

The system prompt instructs OMNI to ignore instructions embedded in the content. Additionally:
- Webpage content is HTML-stripped before being sent to Gemini
- User questions are length-limited (2000 chars)

### 9.2 Gemini Safety Filters

Gemini's built-in safety filters run on all requests. If a request is blocked:
- Return a clear error to the client: `"Content could not be processed due to safety filters"`
- Log the blocked request (without content) for monitoring
- Do not retry blocked requests

### 9.3 System Prompt Confidentiality

System prompts are backend-only. They are never sent to the client. The client only receives the final AI response.

---

## 10. Error Handling Strategy

| Error Type | Backend Response | Client Display |
|-----------|-----------------|----------------|
| Rate limit (Gemini) | 429 + retry-after | "AI is busy, try again in X seconds" |
| Content too long | 400 + reason | "Content too long. Try selecting a section." |
| Safety filter | 400 + reason | "Content could not be processed." |
| Gemini API down | 502 | "AI service temporarily unavailable." |
| Auth expired | 401 | Redirect to login |
| Generic error | 500 | "Something went wrong. Please try again." |

---

## 11. Cost Estimation (MVP)

Using Gemini 2.0 Flash pricing:

| Operation | Avg Tokens In | Avg Tokens Out | Cost/request |
|-----------|--------------|----------------|--------------|
| Summarize | ~5,000 | ~500 | ~$0.001 |
| Ask | ~5,000 | ~300 | ~$0.0008 |
| Notes | ~5,000 | ~800 | ~$0.0013 |
| Quiz | ~5,000 | ~600 | ~$0.0011 |
| Memory Ask (RAG) | ~8,000 | ~500 | ~$0.0017 |
| Embedding (save) | ~512/chunk × N | — | ~$0.000025/chunk |

> **Note:** Gemini pricing changes frequently. Verify current pricing at [ai.google.dev/pricing](https://ai.google.dev/pricing) before launch.

Free tier users generating 100 actions/month ≈ **~$0.10-0.20/user/month** at MVP scale.
