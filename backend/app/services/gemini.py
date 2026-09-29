import logging
from typing import Optional
from fastapi import HTTPException
from app.config import settings

logger = logging.getLogger(__name__)

SYSTEM_INSTRUCTION = """You are OMNI, an AI intelligence layer for the web.

Summarize the supplied webpage content accurately.
Do not invent information.

Prioritize:
1. Main idea
2. Important points
3. Key facts
4. Useful conclusions

If the content is insufficient, say so rather than hallucinating. Keep the formatting clean and readable using concise bullet points and bold highlights where appropriate."""


class GeminiService:
    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        self.api_key = api_key or settings.gemini_api_key
        self.model = model or settings.gemini_model
        self._client = None

    def _get_client(self):
        if self._client is not None:
            return self._client

        key = self.api_key or settings.gemini_api_key
        if not key:
            raise HTTPException(
                status_code=503,
                detail="Gemini API key is not configured. Set GEMINI_API_KEY in your environment.",
            )

        try:
            from google import genai
            self._client = genai.Client(api_key=key)
            return self._client
        except Exception as e:
            logger.error("Failed to initialize Google GenAI client: %s", e)
            raise HTTPException(
                status_code=500,
                detail=f"Failed to initialize Gemini AI client: {str(e)}",
            )

    async def summarize_page(self, title: str, url: str, content: str) -> str:
        """
        Generate a concise, accurate summary of webpage content using Google GenAI SDK.
        """
        client = self._get_client()

        prompt = f"""Webpage Title: {title}
Webpage URL: {url}

Extracted Webpage Content:
\"\"\"
{content}
\"\"\"

Please provide a structured, high-value summary of this page according to your system instructions."""

        try:
            from google.genai import types

            response = client.models.generate_content(
                model=self.model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction=SYSTEM_INSTRUCTION,
                    temperature=0.3,
                ),
            )

            if not response or not response.text:
                raise HTTPException(
                    status_code=502,
                    detail="Gemini returned an empty response. The content may be restricted or blocked.",
                )

            return response.text.strip()

        except HTTPException:
            raise
        except Exception as e:
            logger.error("Gemini summarization failed: %s", e)
            raise HTTPException(
                status_code=502,
                detail=f"Gemini AI summarization failed: {str(e)}",
            )


# Default singleton instance
gemini_service = GeminiService()
