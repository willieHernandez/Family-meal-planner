from typing import Any

from qdrant_client import QdrantClient
from qdrant_client.http import models

from src.config import get_settings


class QdrantService:
    """Service for interacting with Qdrant vector database."""

    def __init__(self) -> None:
        settings = get_settings()
        self.client = QdrantClient(host=settings.qdrant_host, port=settings.qdrant_port)
        self.collection_name = settings.qdrant_collection
        self.dimension = settings.embedding_dimension

    def ensure_collection(self) -> None:
        """Create collection if it doesn't exist."""
        collections = self.client.get_collections().collections
        exists = any(c.name == self.collection_name for c in collections)

        if not exists:
            self.client.create_collection(
                collection_name=self.collection_name,
                vectors_config=models.VectorParams(
                    size=self.dimension,
                    distance=models.Distance.COSINE,
                ),
            )

    def upsert_recipe(
        self,
        recipe_id: str,
        vector: list[float],
        payload: dict[str, Any],
    ) -> str:
        """Upsert a recipe embedding into Qdrant.

        Args:
            recipe_id: MongoDB recipe ID.
            vector: Embedding vector.
            payload: Additional metadata to store.

        Returns:
            The vector ID (same as recipe_id).
        """
        self.client.upsert(
            collection_name=self.collection_name,
            points=[
                models.PointStruct(
                    id=recipe_id,
                    vector=vector,
                    payload=payload,
                )
            ],
        )
        return recipe_id

    def search(
        self,
        query_vector: list[float],
        limit: int = 10,
    ) -> list[dict[str, Any]]:
        """Search for similar recipes.

        Args:
            query_vector: Query embedding vector.
            limit: Maximum number of results.

        Returns:
            List of search results with scores and payloads.
        """
        results = self.client.search(
            collection_name=self.collection_name,
            query_vector=query_vector,
            limit=limit,
        )

        return [
            {
                "id": str(result.id),
                "score": result.score,
                "payload": result.payload,
            }
            for result in results
        ]

    def delete_recipe(self, recipe_id: str) -> None:
        """Delete a recipe from the vector store.

        Args:
            recipe_id: MongoDB recipe ID.
        """
        self.client.delete(
            collection_name=self.collection_name,
            points_selector=models.PointIdsList(points=[recipe_id]),
        )
