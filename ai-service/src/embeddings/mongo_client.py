from datetime import datetime, timezone
from typing import Any, Iterator

from pymongo import MongoClient
from pymongo.collection import Collection

from src.config import get_settings


class MongoService:
    """Service for interacting with MongoDB."""

    def __init__(self) -> None:
        settings = get_settings()
        self.client: MongoClient[dict[str, Any]] = MongoClient(settings.mongodb_uri)
        self.db = self.client[settings.mongodb_database]

    @property
    def recipes(self) -> Collection[dict[str, Any]]:
        """Get recipes collection."""
        return self.db["recipes"]

    def get_all_recipes(self) -> Iterator[dict[str, Any]]:
        """Get all recipes from the database.

        Yields:
            Recipe documents.
        """
        yield from self.recipes.find({})

    def get_recipes_needing_embedding(self) -> Iterator[dict[str, Any]]:
        """Get recipes that don't have embeddings yet.

        Yields:
            Recipe documents without embeddings.
        """
        yield from self.recipes.find({"embedding": {"$exists": False}})

    def update_recipe_embedding(
        self,
        recipe_id: str,
        qdrant_collection: str,
        vector_id: str,
    ) -> None:
        """Update recipe with embedding back-reference.

        Args:
            recipe_id: MongoDB recipe ID.
            qdrant_collection: Name of Qdrant collection.
            vector_id: ID in Qdrant.
        """
        from bson import ObjectId

        self.recipes.update_one(
            {"_id": ObjectId(recipe_id)},
            {
                "$set": {
                    "embedding": {
                        "qdrantCollection": qdrant_collection,
                        "vectorId": vector_id,
                        "embeddedAt": datetime.now(timezone.utc),
                    },
                    "updatedAt": datetime.now(timezone.utc),
                }
            },
        )

    def close(self) -> None:
        """Close the MongoDB connection."""
        self.client.close()
