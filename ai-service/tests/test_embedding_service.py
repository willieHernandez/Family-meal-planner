"""Tests for embedding service."""

import pytest

from src.embeddings.embedding_service import EmbeddingService


class TestEmbeddingService:
    """Test cases for EmbeddingService."""

    def test_create_recipe_text(self) -> None:
        """Test recipe text creation."""
        service = EmbeddingService()

        recipe = {
            "name": "Spaghetti Carbonara",
            "ingredients": [
                {"name": "spaghetti", "quantity": 400, "unit": "g"},
                {"name": "eggs", "quantity": 4, "unit": "count"},
            ],
            "instructions": [
                "Cook pasta according to package directions.",
                "Mix eggs with cheese.",
                "Combine pasta with egg mixture.",
            ],
        }

        text = service.create_recipe_text(recipe)

        assert "Spaghetti Carbonara" in text
        assert "spaghetti" in text
        assert "eggs" in text

    def test_create_recipe_text_empty(self) -> None:
        """Test recipe text creation with empty recipe."""
        service = EmbeddingService()

        recipe: dict[str, object] = {}
        text = service.create_recipe_text(recipe)

        assert text == ""
