from app.models.cervical_mucus_log import CervicalMucusLog
from app.repositories.base_log_repository import BaseLogRepository


class CervicalMucusRepository(BaseLogRepository[CervicalMucusLog]):
    model = CervicalMucusLog
