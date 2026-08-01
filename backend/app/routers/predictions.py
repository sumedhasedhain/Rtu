from fastapi import APIRouter

from app.core.deps import CurrentUser, DbSession
from app.schemas.cycle import ConfidenceRange, FertileWindowPrediction, NextPeriodPrediction
from app.services.dashboard_service import DashboardService

router = APIRouter(prefix="/predictions", tags=["predictions"])


@router.get("/next-period", response_model=NextPeriodPrediction)
async def next_period(current_user: CurrentUser, db: DbSession) -> NextPeriodPrediction:
    result = await DashboardService(db).get_next_period_prediction(current_user.id)
    return NextPeriodPrediction(
        predicted_date=result.predicted_date,
        confidence_range=(
            ConfidenceRange(
                earliest=result.confidence_range.earliest, latest=result.confidence_range.latest
            )
            if result.confidence_range
            else None
        ),
        confidence_level=result.confidence_level,
        based_on_cycles=result.based_on_cycles,
        average_cycle_length_days=result.average_cycle_length_days,
        message=result.message,
    )


@router.get("/fertile-window", response_model=FertileWindowPrediction)
async def fertile_window(current_user: CurrentUser, db: DbSession) -> FertileWindowPrediction:
    result = await DashboardService(db).get_fertile_window_prediction(current_user.id)
    return FertileWindowPrediction(
        ovulation_date=result.ovulation_date,
        fertile_window_start=result.fertile_window_start,
        fertile_window_end=result.fertile_window_end,
        confidence_level=result.confidence_level,
        based_on_cycles=result.based_on_cycles,
        message=result.message,
    )
