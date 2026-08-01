import uuid
from datetime import date

from fastapi import APIRouter, status

from app.core.deps import CurrentUser, DbSession
from app.repositories.period_repository import PeriodRepository
from app.schemas.period import PeriodEntryCreate, PeriodEntryRead, PeriodEntryUpdate
from app.services.log_crud_service import LogCrudService

router = APIRouter(prefix="/periods", tags=["periods"])


def _service(db: DbSession) -> LogCrudService:
    return LogCrudService(PeriodRepository(db))


@router.get("", response_model=list[PeriodEntryRead])
async def list_periods(
    current_user: CurrentUser,
    db: DbSession,
    start: date | None = None,
    end: date | None = None,
) -> list[PeriodEntryRead]:
    entries = await _service(db).list(current_user.id, start, end)
    return [PeriodEntryRead.model_validate(e) for e in entries]


@router.post("", response_model=PeriodEntryRead, status_code=status.HTTP_201_CREATED)
async def create_period(
    payload: PeriodEntryCreate, current_user: CurrentUser, db: DbSession
) -> PeriodEntryRead:
    entry = await _service(db).create(current_user.id, **payload.model_dump())
    return PeriodEntryRead.model_validate(entry)


@router.get("/{entry_id}", response_model=PeriodEntryRead)
async def get_period(
    entry_id: uuid.UUID, current_user: CurrentUser, db: DbSession
) -> PeriodEntryRead:
    entry = await _service(db).get_or_404(current_user.id, entry_id)
    return PeriodEntryRead.model_validate(entry)


@router.put("/{entry_id}", response_model=PeriodEntryRead)
async def update_period(
    entry_id: uuid.UUID, payload: PeriodEntryUpdate, current_user: CurrentUser, db: DbSession
) -> PeriodEntryRead:
    entry = await _service(db).update(
        current_user.id, entry_id, **payload.model_dump(exclude_unset=True)
    )
    return PeriodEntryRead.model_validate(entry)


@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_period(entry_id: uuid.UUID, current_user: CurrentUser, db: DbSession) -> None:
    await _service(db).delete(current_user.id, entry_id)
