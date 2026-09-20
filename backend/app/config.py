import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = os.getenv(
        "DATABASE_URL",
        "postgresql://collabstudy:collabstudy@localhost:5432/collabstudy",
    )
    jwt_secret: str = os.getenv("JWT_SECRET", "change-this-secret-in-production")
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7  # 7 days, fine for a demo project
    groq_api_key: str = os.getenv("GROQ_API_KEY", "")
    groq_model: str = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")

    # Kept as a plain comma-separated string, not list[str]: pydantic-settings
    # tries to JSON-decode env vars for list-typed fields, which breaks on a
    # normal comma-separated value like "http://a,http://b". Split it ourselves.
    cors_origins: str = os.getenv("CORS_ORIGINS", "http://localhost:5173")

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


settings = Settings()
