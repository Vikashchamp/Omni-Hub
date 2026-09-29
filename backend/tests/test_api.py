import pytest
from unittest.mock import AsyncMock, patch
from fastapi.testclient import TestClient
from app.main import app
from app.api.v1.ai import get_gemini_service
from app.services.gemini import GeminiService

client = TestClient(app)


def test_health_check():
    """Verify /health returns 200 and status ok."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_summarize_missing_content():
    """Verify missing content returns 422 Unprocessable Entity."""
    response = client.post(
        "/api/v1/ai/summarize",
        json={"title": "Test Page", "url": "https://example.com"}
    )
    assert response.status_code == 422


def test_summarize_empty_content():
    """Verify empty/whitespace content returns 422 validation error."""
    response = client.post(
        "/api/v1/ai/summarize",
        json={"title": "Test Page", "url": "https://example.com", "content": "   "}
    )
    assert response.status_code == 422


def test_summarize_content_too_short():
    """Verify content with fewer than 10 characters returns 422 validation error."""
    response = client.post(
        "/api/v1/ai/summarize",
        json={"title": "Test Page", "url": "https://example.com", "content": "short"}
    )
    assert response.status_code == 422


def test_summarize_content_too_long():
    """Verify content exceeding max_length (100,000 chars) is rejected."""
    oversized_content = "A" * 100_001
    response = client.post(
        "/api/v1/ai/summarize",
        json={"title": "Test Page", "url": "https://example.com", "content": oversized_content}
    )
    assert response.status_code == 422


def test_summarize_valid_mocked():
    """Verify valid request with mocked Gemini returns expected summary format."""
    mock_service = AsyncMock(spec=GeminiService)
    mock_service.summarize_page.return_value = "### Summary\n- Key point 1\n- Key point 2"

    app.dependency_overrides[get_gemini_service] = lambda: mock_service

    try:
        response = client.post(
            "/api/v1/ai/summarize",
            json={
                "title": "Quantum Computing Guide",
                "url": "https://example.com/quantum",
                "content": "Quantum computers use qubits instead of classical bits to perform calculations exponentially faster."
            }
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["title"] == "Quantum Computing Guide"
        assert data["url"] == "https://example.com/quantum"
        assert "Key point 1" in data["summary"]
        mock_service.summarize_page.assert_awaited_once_with(
            title="Quantum Computing Guide",
            url="https://example.com/quantum",
            content="Quantum computers use qubits instead of classical bits to perform calculations exponentially faster."
        )
    finally:
        app.dependency_overrides.clear()
