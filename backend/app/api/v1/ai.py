from fastapi import APIRouter, HTTPException, Depends
from app.schemas.ai import SummarizeRequest, SummarizeResponse
from app.services.gemini import gemini_service, GeminiService

router = APIRouter(prefix="/ai", tags=["AI Intelligence"])


def get_gemini_service() -> GeminiService:
    return gemini_service


@router.post("/summarize", response_model=SummarizeResponse)
async def summarize_page(
    payload: SummarizeRequest,
    service: GeminiService = Depends(get_gemini_service),
) -> SummarizeResponse:
    """
    Summarize extracted web page content using Gemini AI.
    """
    summary_text = await service.summarize_page(
        title=payload.title,
        url=payload.url,
        content=payload.content,
    )

    return SummarizeResponse(
        success=True,
        summary=summary_text,
        title=payload.title,
        url=payload.url,
    )
