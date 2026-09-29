# OMNI HUB — Product Specification

> **Version:** 0.1 (MVP)
> **Last Updated:** 2026-09-29
> **Status:** Pre-implementation

---

## 1. Vision

OMNI HUB is an AI-powered intelligence layer for the web.

It does **not** replace the web. It makes the web intelligent.

Users browse normally. OMNI HUB lives alongside them — understanding what they see, answering their questions, extracting what matters, and building a persistent, searchable memory of everything they choose to save.

---

## 2. Problem Statement

People consume enormous amounts of information online but retain very little. They bookmark things they never revisit. They copy-paste snippets into notes apps that become graveyards. They re-search the same questions they already researched weeks ago.

Existing AI tools require context to be manually provided every time. There is no ambient intelligence that understands where you are and what you're looking at.

OMNI HUB solves this by:
1. Meeting users where they are (in the browser, on any page)
2. Understanding the current context automatically
3. Providing AI actions without copy-paste friction
4. Building a semantic memory so knowledge accumulates over time

---

## 3. Product Components

### 3.1 Chrome Extension (Primary Entry Point)

A Manifest V3 Chrome extension that:
- Detects the current page context (generic webpage, YouTube, PDF, GitHub)
- Injects a side panel accessible from any tab
- Provides AI-powered actions contextual to the current page
- Sends content to the backend (never directly to the AI API)
- Displays results inline in the side panel

### 3.2 OMNI HUB Web Application

A React + TypeScript single-page application that:
- Provides a dashboard for saved content and memory
- Organizes saved items into projects
- Shows full AI conversation history
- Allows querying across all saved memory
- Serves as the "home base" for accumulated knowledge

### 3.3 Backend API

A FastAPI Python server that:
- Holds all AI API keys securely (never exposed to the extension or browser)
- Processes AI requests from both extension and web app
- Manages chunking, embedding, and vector storage
- Handles all Supabase database operations
- Enforces authentication via Supabase JWT verification

### 3.4 Supabase (Database + Auth)

- PostgreSQL database with pgvector extension
- Supabase Auth for user identity
- Row-level security (RLS) ensures users can only access their own data
- Storage for any uploaded files (PDFs, etc.)

---

## 4. User Personas

### Primary: Knowledge Worker / Researcher
- Uses the web constantly for research
- Wants to retain and recall information across sessions
- Values speed — can't afford friction in their workflow

### Secondary: Student
- Reads articles, academic papers, YouTube lectures
- Needs summaries and explanations of complex content
- Wants to generate study notes and quizzes

### Tertiary: Developer
- Reads GitHub repos, documentation, Stack Overflow
- Wants contextual code explanations and summaries
- Uses multiple tabs and context switches constantly

---

## 5. User Journeys

### Journey 1: Instant Comprehension (MVP Core)
1. User is on a long article they don't have time to read
2. Opens OMNI side panel
3. Clicks **Summarize**
4. Gets a structured summary in seconds

### Journey 2: Contextual Q&A (MVP Core)
1. User is reading a complex technical document
2. Opens OMNI side panel
3. Clicks **Ask** and types their question
4. Gets an answer grounded in the page content

### Journey 3: Save to Memory (MVP Core)
1. User reads something valuable
2. Clicks **Save to OMNI**
3. Content is chunked, embedded, and stored
4. Later: user asks a question in the web app
5. Relevant saved memories surface automatically in the answer

### Journey 4: YouTube Intelligence
1. User watches a YouTube video
2. OMNI extracts transcript via YouTube API
3. User can summarize, ask questions, or generate notes from the video

### Journey 5: PDF Understanding
1. User opens a PDF in Chrome
2. OMNI extracts text from the PDF
3. User can summarize, ask, or extract structured information

### Journey 6: GitHub Comprehension
1. User views a GitHub repository
2. OMNI extracts README, file tree, and key files
3. User gets a project overview or asks technical questions

---

## 6. AI Actions (MVP)

| Action | Description | Input | Output |
|--------|-------------|-------|--------|
| **Summarize** | Condenses page content into key points | Page content | Structured bullet summary |
| **Explain** | Explains content in plain language | Page content + complexity level | Plain-language explanation |
| **Ask** | Answers a user question grounded in page content | Page content + user question | Cited answer |
| **Extract** | Pulls structured data from the page | Page content + extraction prompt | JSON / formatted table |
| **Generate Notes** | Creates organized study/reference notes | Page content | Markdown notes |
| **Generate Quiz** | Creates Q&A quiz from content | Page content | Question-answer pairs |
| **Save to OMNI** | Saves content to persistent memory | Page content + metadata | Confirmation + chunk count |

---

## 7. Context Detectors (MVP)

| Context | Detection Method | Content Extraction |
|---------|-----------------|-------------------|
| **Generic Webpage** | Default fallback | DOM text extraction via content script |
| **YouTube** | `youtube.com/watch` URL match | Video transcript via YouTube Data API v3 |
| **PDF** | `chrome-extension://`, `.pdf` URL, or PDF.js | PDF text layer extraction |
| **GitHub** | `github.com` URL match | README + file tree via GitHub REST API |

---

## 8. MVP Scope Boundaries

### In Scope
- Chrome extension with side panel
- 4 context detectors (generic, YouTube, PDF, GitHub)
- 7 AI actions
- User authentication (Supabase Auth)
- Save to memory with vector search
- Web app dashboard with saved content + memory Q&A
- Secure backend (all API keys server-side)

### Out of Scope (Future)
- Gmail, LinkedIn, Amazon, Twitter integrations
- Voice input / output
- Autonomous browser actions
- Multi-agent orchestration
- Knowledge graph
- Mobile app
- Browser history indexing
- Real-time collaboration
- Third-party integrations (Notion, Obsidian, etc.)

---

## 9. MVP Success Criteria

- A user can install the extension, sign up, and summarize a page in under 60 seconds
- A user can ask a question about the current page and get a grounded answer
- A user can save content and later find it through semantic search in the web app
- All AI API keys are never exposed to the client
- Authentication is enforced on all backend endpoints
- The system works reliably on the 4 supported contexts

---

## 10. MVP Progression Phases

| Phase | Feature | Goal |
|-------|---------|------|
| 1 | Webpage → OMNI → Summarize | Core loop working end-to-end |
| 2 | Webpage → OMNI → Ask | Contextual Q&A working |
| 3 | Webpage → OMNI → Save | Memory pipeline working |
| 4 | Saved content → Memory → Ask | Semantic recall working |
| 5 | YouTube support | Second context type |
| 6 | PDF support | Third context type |
| 7 | GitHub support | Fourth context type |
| 8 | OMNI HUB dashboard | Web app as knowledge base |
