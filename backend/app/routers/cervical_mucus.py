import uuid
from datetime import date

from fastapi import APIRouter, status

from app.core.deps import CurrentUser, DbSession
from app.repositories.cervical_mucus_repository import CervicalMucusRepository
from app.schemas.cervical_mucus import (
    CervicalMucusLogCreate,
    CervicalMucusLogRead,
    CervicalMucusLogUpdate,
)
from app.services.log_crud_service import LogCrudService

router = APIRouter(prefix="/cervical-mucus", tags=["cervical-mucus"])


def _service(db: DbSession) -> LogCrudService:
    return LogCrudService(CervicalMucusRepository(db))


@router.get("", response_model=list[CervicalMucusLogRead])
async def list_cervical_mucus(
    current_user: CurrentUser, db: DbSession, start: date | None = None, end: date | None = None
) -> list[CervicalMucusLogRead]:
    entries = await _service(db).list(current_user.id, start, end)
    return [CervicalMucusLogRead.model_validate(e) for e in entries]


@router.post("", response_model=CervicalMucusLogRead, status_code=status.HTTP_201_CREATED)
async def create_cervical_mucus(
    payload: CervicalMucusLogCreate, current_user: CurrentUser, db: DbSession
) -> CervicalMucusLogRead:
    entry = await _service(db).create(current_user.id, **payload.model_dump())
    return CervicalMucusLogRead.model_validate(entry)


@router.get("/{entry_id}", response_model=CervicalMucusLogRead)
async def get_cervical_mucus(
    entry_id: uuid.UUID, current_user: CurrentUser, db: DbSession
) -> CervicalMucusLogRead:
    entry = await _service(db).get_or_404(current_user.id, entry_id)
    return CervicalMucusLogRead.model_validate(entry)


@router.put("/{entry_id}", response_model=CervicalMucusLogRead)
async def update_cervical_mucus(
    entry_id: uuid.UUID,
    payload: CervicalMucusLogUpdate,
    current_user: CurrentUser,
    db: DbSession,
) -> CervicalMucusLogRead:
    entry = await _service(db).update(
        current_user.id, entry_id, **payload.model_dump(exclude_unset=True)
    )
    return CervicalMucusLogRead.model_validate(entry)


@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_cervical_mucus(
    entry_id: uuid.UUID, current_user: CurrentUser, db: DbSession
) -> None:
    await _service(db).delete(current_user.id, entry_id)
