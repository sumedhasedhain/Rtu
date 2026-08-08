from functools import lru_cache
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "Cycle Tracker API"
    environment: str = "development"
    api_v1_prefix: str = "/api/v1"

    database_url: str = "sqlite+aiosqlite:///./cycle_tracker.db"

    @field_validator("database_url")
    @classmethod
    def _use_async_postgres_driver(cls, v: str) -> str:
        # Managed Postgres providers (Render, Railway, Heroku-style envs) hand out a bare
        # postgres(ql):// URL; our SQLAlchemy engine is async and needs the asyncpg driver.
        if v.startswith("postgres://"):
            v = "postgresql+asyncpg://" + v[len("postgres://") :]
        elif v.startswith("postgresql://"):
            v = "postgresql+asyncpg://" + v[len("postgresql://") :]
        if v.startswith("postgresql+asyncpg://"):
            # asyncpg.connect() only accepts a small, specific set of kwargs. Managed
            # providers (Neon, Render, Heroku-style) hand out libpq-only query params
            # (sslmode, channel_binding, ...) that asyncpg rejects outright with a
            # TypeError. Keep just `ssl` (renamed from libpq's `sslmode`) and drop the rest.
            parts = urlsplit(v)
            query = dict(parse_qsl(parts.query))
            sslmode = query.pop("sslmode", None)
            query.pop("channel_binding", None)
            if sslmode and "ssl" not in query:
                query["ssl"] = sslmode
            v = urlunsplit(parts._replace(query=urlencode(query)))
        return v

    secret_key: str = "dev-secret-key-change-me"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 30
    password_reset_token_expire_minutes: int = 30

    cors_origins: list[str] = ["http://localhost:5173", "http://localhost:3000"]


@lru_cache
def get_settings() -> Settings:
    return Settings()
