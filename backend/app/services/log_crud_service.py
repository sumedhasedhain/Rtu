import uuid
from datetime import date
from typing import Generic, TypeVar

from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError

from app.repositories.base_log_repository import BaseLogRepository

ModelT = TypeVar("ModelT")


class LogCrudService(Generic[ModelT]):
    """Ownership-checked CRUD on a BaseLogRepository, shared by every per-day log resource."""

    def __init__(self, repository: BaseLogRepository[ModelT]):
        self.repository = repository

    async def list(self, user_id: uuid.UUID, start: date | None, end: date | None) -> list[ModelT]:
        return await self.repository.list_for_user(user_id, start, end)

    async def get_or_404(self, user_id: uuid.UUID, entry_id: uuid.UUID) -> ModelT:
        entry = await self.repository.get_by_id(user_id, entry_id)
        if entry is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Entry not found")
        return entry

    async def create(self, user_id: uuid.UUID, **fields) -> ModelT:
        try:
            return await self.repository.create(user_id, **fields)
        except IntegrityError as exc:
            await self.repository.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An entry for this date already exists",
            ) from exc

    async def update(self, user_id: uuid.UUID, entry_id: uuid.UUID, **fields) -> ModelT:
        entry = await self.get_or_404(user_id, entry_id)
        try:
            return await self.repository.update(entry, **fields)
        except IntegrityError as exc:
            await self.repository.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An entry for this date already exists",
            ) from exc

    async def delete(self, user_id: uuid.UUID, entry_id: uuid.UUID) -> None:
        entry = await self.get_or_404(user_id, entry_id)
        await self.repository.delete(entry)
