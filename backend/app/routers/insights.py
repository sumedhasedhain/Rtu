from fastapi import APIRouter, Query

from app.core.deps import CurrentUser, DbSession
from app.schemas.cycle import CycleLengthTrendPoint, SymptomFrequencyEntry
from app.services.dashboard_service import DashboardService

router = APIRouter(prefix="/insights", tags=["insights"])


@router.get("/cycle-length-trend", response_model=list[CycleLengthTrendPoint])
async def cycle_length_trend(
    current_user: CurrentUser, db: DbSession
) -> list[CycleLengthTrendPoint]:
    cycles = await DashboardService(db).get_cycle_length_trend(current_user.id)
    return [
        CycleLengthTrendPoint(
            cycle_number=c.cycle_number,
            start_date=c.start_date,
            cycle_length_days=c.cycle_length_days,
        )
        for c in cycles
    ]


@router.get("/symptom-frequency", response_model=list[SymptomFrequencyEntry])
async def symptom_frequency(
    current_user: CurrentUser, db: DbSession, phase: str | None = Query(default=None)
) -> list[SymptomFrequencyEntry]:
    rows = await DashboardService(db).get_symptom_frequency(current_user.id, phase)
    return [
        SymptomFrequencyEntry(symptom_name=name, phase=ph, count=count) for name, ph, count in rows
    ]
