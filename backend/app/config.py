from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field
from typing import List


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    # Gemini AI configuration
    gemini_api_key: str = Field(default="", alias="GEMINI_API_KEY")
    gemini_model: str = Field(default="gemini-3.8-flash", alias="GEMINI_MODEL")

    # Server & CORS configuration
    app_env: str = Field(default="development", alias="APP_ENV")
    allowed_origins: List[str] = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
    ]
    # Regex to match Chrome extension origins
    cors_origin_regex: str = r"^(chrome-extension://.*|http://localhost:\d+)$"

    # Input guardrails
    max_content_length: int = 100_000
    min_content_length: int = 20


settings = Settings()
