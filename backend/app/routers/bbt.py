import uuid
from datetime import date

from fastapi import APIRouter, status

from app.core.deps import CurrentUser, DbSession
from app.repositories.bbt_repository import BBTRepository
from app.schemas.bbt import BBTLogCreate, BBTLogRead, BBTLogUpdate
from app.services.log_crud_service import LogCrudService

router = APIRouter(prefix="/bbt", tags=["bbt"])


def _service(db: DbSession) -> LogCrudService:
    return LogCrudService(BBTRepository(db))


@router.get("", response_model=list[BBTLogRead])
async def list_bbt(
    current_user: CurrentUser, db: DbSession, start: date | None = None, end: date | None = None
) -> list[BBTLogRead]:
    entries = await _service(db).list(current_user.id, start, end)
    return [BBTLogRead.model_validate(e) for e in entries]


@router.post("", response_model=BBTLogRead, status_code=status.HTTP_201_CREATED)
async def create_bbt(payload: BBTLogCreate, current_user: CurrentUser, db: DbSession) -> BBTLogRead:
    entry = await _service(db).create(current_user.id, **payload.model_dump())
    return BBTLogRead.model_validate(entry)


@router.get("/{entry_id}", response_model=BBTLogRead)
async def get_bbt(entry_id: uuid.UUID, current_user: CurrentUser, db: DbSession) -> BBTLogRead:
    entry = await _service(db).get_or_404(current_user.id, entry_id)
    return BBTLogRead.model_validate(entry)


@router.put("/{entry_id}", response_model=BBTLogRead)
async def update_bbt(
    entry_id: uuid.UUID, payload: BBTLogUpdate, current_user: CurrentUser, db: DbSession
) -> BBTLogRead:
    entry = await _service(db).update(
        current_user.id, entry_id, **payload.model_dump(exclude_unset=True)
    )
    return BBTLogRead.model_validate(entry)


@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_bbt(entry_id: uuid.UUID, current_user: CurrentUser, db: DbSession) -> None:
    await _service(db).delete(current_user.id, entry_id)
