from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api import api_v1_router

app = FastAPI(
    title="OMNI HUB Intelligence API",
    description="AI-powered intelligence layer for the web backend service",
    version="0.1.0",
)

# Configure CORS for Chrome Extension & Local Development
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_origin_regex=settings.cors_origin_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["Health"])
async def health_check():
    """
    Health check endpoint returning system readiness.
    """
    return {"status": "ok"}


# Mount API routers
app.include_router(api_v1_router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
