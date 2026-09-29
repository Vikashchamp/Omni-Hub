from pydantic import BaseModel, Field, field_validator


class SummarizeRequest(BaseModel):
    title: str = Field(default="Untitled Page", max_length=500, description="Title of the web page")
    url: str = Field(default="", max_length=2048, description="URL of the web page")
    content: str = Field(
        ...,
        min_length=10,
        max_length=100_000,
        description="Extracted visible text of the web page"
    )

    @field_validator("content")
    @classmethod
    def validate_content_not_empty(cls, v: str) -> str:
        stripped = v.strip()
        if len(stripped) < 10:
            raise ValueError("Page content must contain at least 10 readable characters.")
        return stripped


class SummarizeResponse(BaseModel):
    success: bool = True
    summary: str
    title: str
    url: str
