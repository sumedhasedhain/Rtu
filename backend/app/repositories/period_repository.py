from app.models.period_entry import PeriodEntry
from app.repositories.base_log_repository import BaseLogRepository


class PeriodRepository(BaseLogRepository[PeriodEntry]):
    model = PeriodEntry
