from app.core.config import Settings


def test_bare_postgres_scheme_gets_asyncpg_driver() -> None:
    settings = Settings(database_url="postgres://user:pass@host:5432/db")
    assert settings.database_url == "postgresql+asyncpg://user:pass@host:5432/db"


def test_bare_postgresql_scheme_gets_asyncpg_driver() -> None:
    settings = Settings(database_url="postgresql://user:pass@host:5432/db")
    assert settings.database_url == "postgresql+asyncpg://user:pass@host:5432/db"


def test_urls_with_driver_already_specified_are_left_alone() -> None:
    settings = Settings(database_url="postgresql+asyncpg://user:pass@host:5432/db")
    assert settings.database_url == "postgresql+asyncpg://user:pass@host:5432/db"


def test_sqlite_url_is_left_alone() -> None:
    settings = Settings(database_url="sqlite+aiosqlite:///./cycle_tracker.db")
    assert settings.database_url == "sqlite+aiosqlite:///./cycle_tracker.db"


def test_sslmode_query_param_is_rewritten_for_asyncpg() -> None:
    settings = Settings(database_url="postgresql://user:pass@host:5432/db?sslmode=require")
    assert settings.database_url == "postgresql+asyncpg://user:pass@host:5432/db?ssl=require"
