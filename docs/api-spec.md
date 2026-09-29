# OMNI HUB — API Specification

> **Version:** 0.1 (MVP)
> **Base URL:** `https://api.omnihub.app` (production) | `http://localhost:8000` (local)
> **Last Updated:** 2026-09-29

---

## 1. Authentication

All endpoints except health checks require a valid Supabase JWT.

```
Authorization: Bearer <supabase_jwt_token>
Content-Type: application/json
```

The backend extracts `user_id` from the JWT claims. All data operations are scoped to that `user_id`.

---

## 2. Common Response Envelope

All responses follow this structure:

```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

Error responses:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired token"
  }
}
```

### Standard HTTP Status Codes

| Code | Meaning |
|------|---------|
| `200` | Success |
| `201` | Created |
| `400` | Bad Request (validation error) |
| `401` | Unauthorized (missing/invalid JWT) |
| `403` | Forbidden (resource belongs to another user) |
| `404` | Not Found |
| `422` | Unprocessable Entity (Pydantic validation failure) |
| `429` | Rate Limited |
| `500` | Internal Server Error |

---

## 3. Health Check

### `GET /health`

No authentication required.

**Response:**
```json
{
  "status": "ok",
  "version": "0.1.0"
}
```

---

## 4. AI Actions — `/ai`

These endpoints accept page content from the extension or web app and return AI-generated responses.

---

### `POST /ai/summarize`

Summarize the content of a page.

**Request Body:**
```json
{
  "content": "string",         // Extracted page text (required)
  "url": "string",             // Page URL (required)
  "title": "string",           // Page title (required)
  "context_type": "generic | youtube | pdf | github",
  "options": {
    "length": "short | medium | long",   // default: "medium"
    "format": "bullets | paragraph"      // default: "bullets"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": "string",
    "key_points": ["string"],
    "word_count_original": 1240,
    "model_used": "gemini-3.8-flash"
  }
}
```

---

### `POST /ai/explain`

Explain the page content in plain language.

**Request Body:**
```json
{
  "content": "string",
  "url": "string",
  "title": "string",
  "context_type": "generic | youtube | pdf | github",
  "options": {
    "level": "beginner | intermediate | expert"  // default: "intermediate"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "explanation": "string",
    "model_used": "gemini-3.8-flash"
  }
}
```

---

### `POST /ai/ask`

Ask a question grounded in the current page content.

**Request Body:**
```json
{
  "content": "string",
  "url": "string",
  "title": "string",
  "context_type": "generic | youtube | pdf | github",
  "question": "string",        // User's question (required)
  "conversation_id": "uuid"    // Optional: for conversation continuity
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "answer": "string",
    "citations": [
      {
        "quote": "string",
        "relevance": "high | medium"
      }
    ],
    "conversation_id": "uuid",
    "model_used": "gemini-3.8-flash"
  }
}
```

---

### `POST /ai/extract`

Extract structured information from the page.

**Request Body:**
```json
{
  "content": "string",
  "url": "string",
  "title": "string",
  "context_type": "generic | youtube | pdf | github",
  "extraction_prompt": "string",   // What to extract (required)
  "output_format": "json | table | list"  // default: "list"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "extracted": "string | object",
    "format": "json | table | list",
    "model_used": "gemini-3.8-flash"
  }
}
```

---

### `POST /ai/notes`

Generate structured notes from page content.

**Request Body:**
```json
{
  "content": "string",
  "url": "string",
  "title": "string",
  "context_type": "generic | youtube | pdf | github",
  "options": {
    "style": "cornell | outline | mindmap_text"  // default: "outline"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "notes": "string",           // Markdown-formatted notes
    "sections": ["string"],      // Section headings
    "model_used": "gemini-3.8-flash"
  }
}
```

---

### `POST /ai/quiz`

Generate a quiz from page content.

**Request Body:**
```json
{
  "content": "string",
  "url": "string",
  "title": "string",
  "context_type": "generic | youtube | pdf | github",
  "options": {
    "question_count": 5,         // default: 5, max: 20
    "difficulty": "easy | medium | hard"  // default: "medium"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "quiz": [
      {
        "question": "string",
        "answer": "string",
        "explanation": "string"
      }
    ],
    "model_used": "gemini-3.8-flash"
  }
}
```

---

## 5. Memory — `/memory`

These endpoints handle saving content to and querying from the user's semantic memory.

---

### `POST /memory/save`

Save a page to the user's persistent memory.

**Request Body:**
```json
{
  "content": "string",
  "url": "string",
  "title": "string",
  "context_type": "generic | youtube | pdf | github",
  "project_id": "uuid",          // Optional: assign to a project
  "tags": ["string"],            // Optional
  "user_note": "string"          // Optional: user's own annotation
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "saved_item_id": "uuid",
    "chunk_count": 12,
    "title": "string",
    "url": "string",
    "saved_at": "ISO8601"
  }
}
```

---

### `POST /memory/ask`

Ask a question across all saved memory.

**Request Body:**
```json
{
  "question": "string",
  "project_id": "uuid",          // Optional: scope to a project
  "limit": 10                    // Max chunks to retrieve, default: 10
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "answer": "string",
    "sources": [
      {
        "saved_item_id": "uuid",
        "title": "string",
        "url": "string",
        "relevant_chunk": "string",
        "similarity_score": 0.87
      }
    ],
    "model_used": "gemini-3.8-flash"
  }
}
```

---

### `GET /memory/items`

List all saved items for the authenticated user.

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | int | 1 | Page number |
| `limit` | int | 20 | Items per page (max 100) |
| `project_id` | uuid | — | Filter by project |
| `context_type` | string | — | Filter by context type |
| `search` | string | — | Full-text search (title/url) |

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "title": "string",
        "url": "string",
        "context_type": "string",
        "project_id": "uuid | null",
        "tags": ["string"],
        "chunk_count": 12,
        "saved_at": "ISO8601"
      }
    ],
    "total": 84,
    "page": 1,
    "limit": 20
  }
}
```

---

### `GET /memory/items/{item_id}`

Get a single saved item with its chunks.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "string",
    "url": "string",
    "context_type": "string",
    "content_preview": "string",
    "user_note": "string | null",
    "tags": ["string"],
    "project_id": "uuid | null",
    "chunk_count": 12,
    "saved_at": "ISO8601"
  }
}
```

---

### `DELETE /memory/items/{item_id}`

Delete a saved item and all its chunks/embeddings.

**Response:**
```json
{
  "success": true,
  "data": {
    "deleted_item_id": "uuid",
    "deleted_chunks": 12
  }
}
```

---

## 6. Content — `/content`

---

### `GET /content/conversations`

List AI conversation history for the user.

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | int | 1 | Page number |
| `limit` | int | 20 | Items per page |
| `context_type` | string | — | Filter by context type |

**Response:**
```json
{
  "success": true,
  "data": {
    "conversations": [
      {
        "id": "uuid",
        "title": "string",
        "url": "string",
        "context_type": "string",
        "message_count": 4,
        "last_message_at": "ISO8601",
        "created_at": "ISO8601"
      }
    ],
    "total": 24,
    "page": 1,
    "limit": 20
  }
}
```

---

### `GET /content/conversations/{conversation_id}`

Get all messages in a conversation.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "url": "string",
    "title": "string",
    "context_type": "string",
    "messages": [
      {
        "id": "uuid",
        "role": "user | assistant",
        "content": "string",
        "action_type": "ask | summarize | etc",
        "created_at": "ISO8601"
      }
    ]
  }
}
```

---

## 7. Projects — `/projects`

---

### `GET /projects`

List all projects.

**Response:**
```json
{
  "success": true,
  "data": {
    "projects": [
      {
        "id": "uuid",
        "name": "string",
        "description": "string | null",
        "item_count": 14,
        "created_at": "ISO8601"
      }
    ]
  }
}
```

---

### `POST /projects`

Create a new project.

**Request Body:**
```json
{
  "name": "string",
  "description": "string"    // Optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "string",
    "description": "string | null",
    "created_at": "ISO8601"
  }
}
```

---

### `PUT /projects/{project_id}`

Update a project.

**Request Body:**
```json
{
  "name": "string",
  "description": "string"
}
```

---

### `DELETE /projects/{project_id}`

Delete a project (does not delete saved items in it — they become unassigned).

---

## 8. Rate Limits (MVP)

| Endpoint Group | Limit |
|----------------|-------|
| `/ai/*` | 60 requests / hour / user |
| `/memory/ask` | 60 requests / hour / user |
| `/memory/save` | 100 requests / hour / user |
| All others | 300 requests / hour / user |

Rate limit headers returned:
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 43
X-RateLimit-Reset: 1727627400
```

---

## 9. Content Size Limits

| Field | Limit |
|-------|-------|
| `content` payload | 100,000 characters (~75,000 tokens) |
| `question` | 2,000 characters |
| `extraction_prompt` | 1,000 characters |
| `user_note` | 5,000 characters |
| Tags per item | 10 |
| Tag length | 50 characters |
