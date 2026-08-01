from app.models.ovulation_test_log import OvulationTestLog
from app.repositories.base_log_repository import BaseLogRepository


class OvulationTestRepository(BaseLogRepository[OvulationTestLog]):
    model = OvulationTestLog
