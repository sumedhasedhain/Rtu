from app.models.bbt_log import BBTLog
from app.repositories.base_log_repository import BaseLogRepository


class BBTRepository(BaseLogRepository[BBTLog]):
    model = BBTLog
