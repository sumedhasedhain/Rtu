import uuid
from collections import Counter
from datetime import date, timedelta

from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.period_repository import PeriodRepository
from app.repositories.symptom_log_repository import SymptomLogRepository
from app.repositories.symptom_repository import SymptomRepository
from app.services.cycle_service import Cycle, derive_cycles
from app.services.prediction_service import (
    FertileWindowPrediction,
    NextPeriodPrediction,
    cycle_regularity,
    determine_phase,
    predict_fertile_window,
    predict_next_period,
)


class DashboardService:
    """Composes cycle_service/prediction_service (pure logic) with the DB-backed repositories
    to answer cycle/prediction/insight/dashboard questions for a given user."""

    def __init__(self, db: AsyncSession):
        self.db = db
        self.periods = PeriodRepository(db)
        self.symptom_logs = SymptomLogRepository(db)
        self.symptoms = SymptomRepository(db)

    async def get_cycles(self, user_id: uuid.UUID) -> list[Cycle]:
        entries = await self.periods.list_for_user(user_id)
        return derive_cycles([e.date for e in entries])

    async def get_next_period_prediction(self, user_id: uuid.UUID) -> NextPeriodPrediction:
        cycles = await self.get_cycles(user_id)
        return predict_next_period(cycles)

    async def get_fertile_window_prediction(self, user_id: uuid.UUID) -> FertileWindowPrediction:
        cycles = await self.get_cycles(user_id)
        return predict_fertile_window(cycles)

    async def get_cycle_length_trend(self, user_id: uuid.UUID) -> list[Cycle]:
        cycles = await self.get_cycles(user_id)
        return [c for c in cycles if c.cycle_length_days is not None]

    async def get_symptom_frequency(
        self, user_id: uuid.UUID, phase: str | None = None
    ) -> list[tuple[str, str, int]]:
        cycles = await self.get_cycles(user_id)
        logs = await self.symptom_logs.list_for_user(user_id)
        symptoms_by_id = {s.id: s.name for s in await self.symptoms.list_all()}

        counts: Counter[tuple[str, str]] = Counter()
        for log in logs:
            log_phase = determine_phase(log.date, cycles)
            if phase is not None and log_phase != phase:
                continue
            symptom_name = symptoms_by_id.get(log.symptom_id, "unknown")
            counts[(symptom_name, log_phase)] += 1

        return [(name, ph, count) for (name, ph), count in sorted(counts.items())]

    async def get_dashboard_summary(self, user_id: uuid.UUID, today: date) -> dict:
        cycles = await self.get_cycles(user_id)
        regularity = cycle_regularity(cycles)

        if not cycles:
            return {
                "today": today,
                "current_cycle_day": None,
                "current_phase": "unknown",
                "is_on_period": False,
                "last_period_start": None,
                "predicted_next_period_date": None,
                "days_until_next_period": None,
                "cycle_regularity": regularity,
            }

        current_cycle = cycles[-1]
        current_cycle_day = (today - current_cycle.start_date).days + 1
        period_end = current_cycle.start_date + timedelta(days=current_cycle.period_length_days - 1)
        is_on_period = current_cycle.start_date <= today <= period_end

        prediction = predict_next_period(cycles)
        days_until_next_period = (
            (prediction.predicted_date - today).days if prediction.predicted_date else None
        )

        return {
            "today": today,
            "current_cycle_day": current_cycle_day if current_cycle_day > 0 else None,
            "current_phase": determine_phase(today, cycles),
            "is_on_period": is_on_period,
            "last_period_start": current_cycle.start_date,
            "predicted_next_period_date": prediction.predicted_date,
            "days_until_next_period": days_until_next_period,
            "cycle_regularity": regularity,
        }
