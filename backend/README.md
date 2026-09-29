# OMNI HUB — Backend Service (`backend`)

> **FastAPI Intelligence & AI Backend**  
> Python 3.11+ · FastAPI · Google GenAI SDK (`google-genai`) · Uvicorn

---

## Overview

The backend service is the secure core of OMNI HUB. It handles all interactions with Google Gemini AI models, keeping API keys protected server-side so client applications never touch secrets.

In **Phase 3A**, the backend provides:
- `GET /health` — Readiness probe
- `POST /api/v1/ai/summarize` — High-value, structured webpage summarization using Gemini 3.8 Flash

---

## Local Development Setup

### 1. Create Python Virtual Environment

```bash
cd backend
python -m venv .venv

# Windows (PowerShell / Command Prompt)
.venv\Scripts\activate

# macOS / Linux
source .venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment Variables

Set your Gemini API key in your terminal or in a `.env` file (copy from root `.env.example`):

```bash
# Windows PowerShell
$env:GEMINI_API_KEY="your-gemini-api-key-here"
$env:GEMINI_MODEL="gemini-3.8-flash"

# Windows CMD
set GEMINI_API_KEY=your-gemini-api-key-here
set GEMINI_MODEL=gemini-3.8-flash

# macOS / Linux (bash/zsh)
export GEMINI_API_KEY="your-gemini-api-key-here"
export GEMINI_MODEL="gemini-3.8-flash"
```

> [!IMPORTANT]
> Never commit your real API key to Git. The `.gitignore` at the repository root prevents `.env` and credential files from being tracked.

### 4. Run the Development Server

```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

The server will be available at:
- **API Base:** `http://localhost:8000`
- **Interactive OpenAPI Docs:** `http://localhost:8000/docs`
- **Health Check:** `http://localhost:8000/health`

### 5. Run the Test Suite

```bash
pytest -v
```

All unit tests run with mocked Gemini dependencies and do not require a live API key.

---

## API Endpoints

### `GET /health`
Returns system status.

**Response:**
```json
{
  "status": "ok"
}
```

### `POST /api/v1/ai/summarize`
Summarizes visible webpage content using Gemini AI.

**Request:**
```json
{
  "title": "Understanding Quantum Mechanics",
  "url": "https://example.com/quantum",
  "content": "Quantum mechanics is a fundamental theory in physics..."
}
```

**Response:**
```json
{
  "success": true,
  "summary": "### Key Takeaways\n- Quantum mechanics operates at atomic scales...\n- Superposition allows qubits to evaluate states simultaneously...",
  "title": "Understanding Quantum Mechanics",
  "url": "https://example.com/quantum"
}
```
