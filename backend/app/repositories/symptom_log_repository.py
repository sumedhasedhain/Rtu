from app.models.symptom_log import SymptomLog
from app.repositories.base_log_repository import BaseLogRepository


class SymptomLogRepository(BaseLogRepository[SymptomLog]):
    model = SymptomLog
