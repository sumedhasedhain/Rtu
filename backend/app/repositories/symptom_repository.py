import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.symptom import Symptom


class SymptomRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_all(self) -> list[Symptom]:
        result = await self.db.execute(select(Symptom).order_by(Symptom.category, Symptom.name))
        return list(result.scalars().all())

    async def get_by_id(self, symptom_id: uuid.UUID) -> Symptom | None:
        result = await self.db.execute(select(Symptom).where(Symptom.id == symptom_id))
        return result.scalar_one_or_none()
