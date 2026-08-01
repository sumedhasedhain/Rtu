import uuid
from datetime import date

from fastapi import APIRouter, status

from app.core.deps import CurrentUser, DbSession
from app.repositories.ovulation_test_repository import OvulationTestRepository
from app.schemas.ovulation_test import (
    OvulationTestLogCreate,
    OvulationTestLogRead,
    OvulationTestLogUpdate,
)
from app.services.log_crud_service import LogCrudService

router = APIRouter(prefix="/ovulation-tests", tags=["ovulation-tests"])


def _service(db: DbSession) -> LogCrudService:
    return LogCrudService(OvulationTestRepository(db))


@router.get("", response_model=list[OvulationTestLogRead])
async def list_ovulation_tests(
    current_user: CurrentUser, db: DbSession, start: date | None = None, end: date | None = None
) -> list[OvulationTestLogRead]:
    entries = await _service(db).list(current_user.id, start, end)
    return [OvulationTestLogRead.model_validate(e) for e in entries]


@router.post("", response_model=OvulationTestLogRead, status_code=status.HTTP_201_CREATED)
async def create_ovulation_test(
    payload: OvulationTestLogCreate, current_user: CurrentUser, db: DbSession
) -> OvulationTestLogRead:
    entry = await _service(db).create(current_user.id, **payload.model_dump())
    return OvulationTestLogRead.model_validate(entry)


@router.get("/{entry_id}", response_model=OvulationTestLogRead)
async def get_ovulation_test(
    entry_id: uuid.UUID, current_user: CurrentUser, db: DbSession
) -> OvulationTestLogRead:
    entry = await _service(db).get_or_404(current_user.id, entry_id)
    return OvulationTestLogRead.model_validate(entry)


@router.put("/{entry_id}", response_model=OvulationTestLogRead)
async def update_ovulation_test(
    entry_id: uuid.UUID,
    payload: OvulationTestLogUpdate,
    current_user: CurrentUser,
    db: DbSession,
) -> OvulationTestLogRead:
    entry = await _service(db).update(
        current_user.id, entry_id, **payload.model_dump(exclude_unset=True)
    )
    return OvulationTestLogRead.model_validate(entry)


@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_ovulation_test(
    entry_id: uuid.UUID, current_user: CurrentUser, db: DbSession
) -> None:
    await _service(db).delete(current_user.id, entry_id)
