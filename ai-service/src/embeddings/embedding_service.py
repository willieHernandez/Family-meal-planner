from typing import Any

from sentence_transformers import SentenceTransformer

from src.config import get_settings


class EmbeddingService:
    """Service for generating recipe embeddings."""

    def __init__(self) -> None:
        settings = get_settings()
        self.model = SentenceTransformer(settings.embedding_model)
        self.dimension = settings.embedding_dimension

    def create_recipe_text(self, recipe: dict[str, Any]) -> str:
        """Create a text representation of a recipe for embedding.

        Args:
            recipe: Recipe document from MongoDB.

        Returns:
            Text representation combining name, ingredients, and instructions.
        """
        parts = [recipe.get("name", "")]

        ingredients = recipe.get("ingredients", [])
        if ingredients:
            ingredient_names = [ing.get("name", "") for ing in ingredients]
            parts.append("Ingredients: " + ", ".join(ingredient_names))

        instructions = recipe.get("instructions", [])
        if instructions:
            parts.append("Instructions: " + " ".join(instructions[:3]))

        return " | ".join(filter(None, parts))

    def embed_recipe(self, recipe: dict[str, Any]) -> list[float]:
        """Generate embedding vector for a recipe.

        Args:
            recipe: Recipe document from MongoDB.

        Returns:
            Embedding vector as list of floats.
        """
        text = self.create_recipe_text(recipe)
        embedding = self.model.encode(text)
        return embedding.tolist()

    def embed_text(self, text: str) -> list[float]:
        """Generate embedding vector for arbitrary text.

        Args:
            text: Text to embed.

        Returns:
            Embedding vector as list of floats.
        """
        embedding = self.model.encode(text)
        return embedding.tolist()
