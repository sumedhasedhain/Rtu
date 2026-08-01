import uuid
from datetime import date
from typing import Generic, TypeVar

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession

ModelT = TypeVar("ModelT")


class BaseLogRepository(Generic[ModelT]):
    """Shared CRUD for the per-day logging tables (periods, symptoms, bbt, cervical mucus,
    ovulation tests). All of these tables share the same shape: a user-scoped row keyed by
    date, so the list/get/create/update/delete logic is identical and only the model differs.
    """

    model: type[ModelT]

    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_for_user(
        self,
        user_id: uuid.UUID,
        start: date | None = None,
        end: date | None = None,
    ) -> list[ModelT]:
        conditions = [self.model.user_id == user_id]
        if start is not None:
            conditions.append(self.model.date >= start)
        if end is not None:
            conditions.append(self.model.date <= end)
        stmt = select(self.model).where(and_(*conditions)).order_by(self.model.date)
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def get_by_id(self, user_id: uuid.UUID, entry_id: uuid.UUID) -> ModelT | None:
        stmt = select(self.model).where(
            and_(self.model.id == entry_id, self.model.user_id == user_id)
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def create(self, user_id: uuid.UUID, **fields) -> ModelT:
        entry = self.model(user_id=user_id, **fields)
        self.db.add(entry)
        await self.db.commit()
        await self.db.refresh(entry)
        return entry

    async def update(self, entry: ModelT, **fields) -> ModelT:
        for key, value in fields.items():
            if value is not None:
                setattr(entry, key, value)
        await self.db.commit()
        await self.db.refresh(entry)
        return entry

    async def delete(self, entry: ModelT) -> None:
        await self.db.delete(entry)
        await self.db.commit()
