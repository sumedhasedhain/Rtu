"""Runs the real Alembic migration chain against a throwaway SQLite file and reads the
seeded data back through the ORM — the exact path that surfaced a real bug where the
symptom seed migration inserted enum .value strings ("physical") while SQLAlchemy's
Enum type stores the member name ("PHYSICAL") by default. The other test fixtures seed
data via the ORM directly and can't catch this class of bug; this test exists so a
future migration can't reintroduce it silently.
"""

import asyncio
import uuid
from pathlib import Path

from sqlalchemy import select
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from alembic import command
from alembic.config import Config
from app.models.symptom import Symptom, SymptomCategory

BACKEND_DIR = Path(__file__).resolve().parents[2]


async def _read_symptoms(database_url: str) -> list[Symptom]:
    engine = create_async_engine(database_url)
    session_maker = async_sessionmaker(bind=engine, expire_on_commit=False)
    try:
        async with session_maker() as session:
            # Same ORM-level select SymptomRepository.list_all() runs — this is what
            # actually raised LookupError against the old, buggy seed data.
            return list((await session.execute(select(Symptom))).scalars().all())
    finally:
        await engine.dispose()


def test_seed_migration_data_is_readable_through_the_orm(tmp_path) -> None:
    db_path = tmp_path / f"migration_test_{uuid.uuid4().hex}.db"
    database_url = f"sqlite+aiosqlite:///{db_path}"

    alembic_cfg = Config(str(BACKEND_DIR / "alembic.ini"))
    alembic_cfg.set_main_option("script_location", str(BACKEND_DIR / "alembic"))
    alembic_cfg.set_main_option("sqlalchemy.url", database_url)
    # alembic's env.py runs migrations via asyncio.run() internally, so this whole test
    # stays synchronous — calling it from inside a pytest-asyncio event loop would raise
    # "asyncio.run() cannot be called from a running event loop".
    command.upgrade(alembic_cfg, "head")

    symptoms = asyncio.run(_read_symptoms(database_url))

    assert len(symptoms) > 0
    categories = {s.category for s in symptoms}
    assert categories == {SymptomCategory.PHYSICAL, SymptomCategory.EMOTIONAL}
