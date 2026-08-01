from fastapi import APIRouter

from app.core.deps import CurrentUser, DbSession
from app.schemas.cycle import CycleRead
from app.services.dashboard_service import DashboardService

router = APIRouter(prefix="/cycles", tags=["cycles"])


@router.get("", response_model=list[CycleRead])
async def list_cycles(current_user: CurrentUser, db: DbSession) -> list[CycleRead]:
    cycles = await DashboardService(db).get_cycles(current_user.id)
    return [CycleRead.model_validate(c.__dict__) for c in cycles]
