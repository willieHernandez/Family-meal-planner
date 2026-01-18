from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # MongoDB
    mongodb_uri: str = "mongodb://localhost:27017/mealplanner"
    mongodb_database: str = "mealplanner"

    # Qdrant
    qdrant_host: str = "localhost"
    qdrant_port: int = 6333
    qdrant_collection: str = "recipes"

    # Embedding Model
    embedding_model: str = "all-MiniLM-L6-v2"
    embedding_dimension: int = 384


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
