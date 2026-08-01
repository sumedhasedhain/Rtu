from datetime import date

from fastapi import APIRouter

from app.core.deps import CurrentUser, DbSession
from app.schemas.cycle import DashboardSummary
from app.services.dashboard_service import DashboardService

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/summary", response_model=DashboardSummary)
async def dashboard_summary(current_user: CurrentUser, db: DbSession) -> DashboardSummary:
    summary = await DashboardService(db).get_dashboard_summary(current_user.id, date.today())
    return DashboardSummary(**summary)
