"""Batch embedding job for recipes."""

import logging
from typing import Any

from src.config import get_settings
from src.embeddings.embedding_service import EmbeddingService
from src.embeddings.mongo_client import MongoService
from src.embeddings.qdrant_client import QdrantService

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


def process_recipe(
    recipe: dict[str, Any],
    embedding_service: EmbeddingService,
    qdrant_service: QdrantService,
    mongo_service: MongoService,
) -> bool:
    """Process a single recipe for embedding.

    Args:
        recipe: Recipe document from MongoDB.
        embedding_service: Service for generating embeddings.
        qdrant_service: Service for Qdrant operations.
        mongo_service: Service for MongoDB operations.

    Returns:
        True if successful, False otherwise.
    """
    recipe_id = str(recipe["_id"])
    recipe_name = recipe.get("name", "Unknown")

    try:
        vector = embedding_service.embed_recipe(recipe)

        payload = {
            "recipeId": recipe_id,
            "recipeName": recipe_name,
            "tags": recipe.get("tags", []),
        }

        settings = get_settings()
        vector_id = qdrant_service.upsert_recipe(recipe_id, vector, payload)

        mongo_service.update_recipe_embedding(
            recipe_id,
            settings.qdrant_collection,
            vector_id,
        )

        logger.info(f"Embedded recipe: {recipe_name} (ID: {recipe_id})")
        return True

    except Exception as e:
        logger.error(f"Failed to embed recipe {recipe_name} (ID: {recipe_id}): {e}")
        return False


def main() -> None:
    """Run batch embedding job."""
    logger.info("Starting batch embedding job...")

    mongo_service = MongoService()
    qdrant_service = QdrantService()
    embedding_service = EmbeddingService()

    qdrant_service.ensure_collection()

    success_count = 0
    error_count = 0

    try:
        for recipe in mongo_service.get_recipes_needing_embedding():
            if process_recipe(recipe, embedding_service, qdrant_service, mongo_service):
                success_count += 1
            else:
                error_count += 1

        logger.info(
            f"Batch embedding complete. Success: {success_count}, Errors: {error_count}"
        )

    finally:
        mongo_service.close()


if __name__ == "__main__":
    main()
