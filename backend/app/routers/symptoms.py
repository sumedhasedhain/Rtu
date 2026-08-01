import uuid
from datetime import date

from fastapi import APIRouter, status

from app.core.deps import CurrentUser, DbSession
from app.repositories.symptom_log_repository import SymptomLogRepository
from app.repositories.symptom_repository import SymptomRepository
from app.schemas.symptom import SymptomLogCreate, SymptomLogRead, SymptomLogUpdate, SymptomRead
from app.services.log_crud_service import LogCrudService

router = APIRouter(tags=["symptoms"])


def _service(db: DbSession) -> LogCrudService:
    return LogCrudService(SymptomLogRepository(db))


@router.get("/symptoms", response_model=list[SymptomRead])
async def list_symptom_types(db: DbSession) -> list[SymptomRead]:
    symptoms = await SymptomRepository(db).list_all()
    return [SymptomRead.model_validate(s) for s in symptoms]


@router.get("/symptom-logs", response_model=list[SymptomLogRead])
async def list_symptom_logs(
    current_user: CurrentUser, db: DbSession, start: date | None = None, end: date | None = None
) -> list[SymptomLogRead]:
    entries = await _service(db).list(current_user.id, start, end)
    return [SymptomLogRead.model_validate(e) for e in entries]


@router.post("/symptom-logs", response_model=SymptomLogRead, status_code=status.HTTP_201_CREATED)
async def create_symptom_log(
    payload: SymptomLogCreate, current_user: CurrentUser, db: DbSession
) -> SymptomLogRead:
    entry = await _service(db).create(current_user.id, **payload.model_dump())
    return SymptomLogRead.model_validate(entry)


@router.get("/symptom-logs/{entry_id}", response_model=SymptomLogRead)
async def get_symptom_log(
    entry_id: uuid.UUID, current_user: CurrentUser, db: DbSession
) -> SymptomLogRead:
    entry = await _service(db).get_or_404(current_user.id, entry_id)
    return SymptomLogRead.model_validate(entry)


@router.put("/symptom-logs/{entry_id}", response_model=SymptomLogRead)
async def update_symptom_log(
    entry_id: uuid.UUID, payload: SymptomLogUpdate, current_user: CurrentUser, db: DbSession
) -> SymptomLogRead:
    entry = await _service(db).update(
        current_user.id, entry_id, **payload.model_dump(exclude_unset=True)
    )
    return SymptomLogRead.model_validate(entry)


@router.delete("/symptom-logs/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_symptom_log(entry_id: uuid.UUID, current_user: CurrentUser, db: DbSession) -> None:
    await _service(db).delete(current_user.id, entry_id)
