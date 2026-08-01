from collections.abc import AsyncGenerator

import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import StaticPool

from app.db.base import Base
from app.db.session import get_db
from app.main import app
from app.models.symptom import Symptom, SymptomCategory

TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"


@pytest_asyncio.fixture
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    engine = create_async_engine(
        TEST_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    session_maker = async_sessionmaker(bind=engine, expire_on_commit=False, autoflush=False)

    async with session_maker() as session:
        session.add_all(
            [
                Symptom(name="cramps", category=SymptomCategory.PHYSICAL),
                Symptom(name="headache", category=SymptomCategory.PHYSICAL),
                Symptom(name="mood_swings", category=SymptomCategory.EMOTIONAL),
            ]
        )
        await session.commit()

    yield session_maker

    await engine.dispose()


@pytest_asyncio.fixture
async def client(db_session) -> AsyncGenerator[AsyncClient, None]:
    async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
        async with db_session() as session:
            yield session

    app.dependency_overrides[get_db] = override_get_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

    app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def registered_user_tokens(client: AsyncClient) -> dict[str, str]:
    await client.post(
        "/api/v1/auth/register", json={"email": "user@example.com", "password": "supersecret1"}
    )
    resp = await client.post(
        "/api/v1/auth/login", json={"email": "user@example.com", "password": "supersecret1"}
    )
    return resp.json()


@pytest_asyncio.fixture
async def auth_headers(registered_user_tokens: dict[str, str]) -> dict[str, str]:
    return {"Authorization": f"Bearer {registered_user_tokens['access_token']}"}
