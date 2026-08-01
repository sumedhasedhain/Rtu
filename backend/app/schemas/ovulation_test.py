import uuid
from datetime import date as date_type
from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.ovulation_test_log import OvulationTestResult


class OvulationTestLogCreate(BaseModel):
    date: date_type
    result: OvulationTestResult
    notes: str | None = None


class OvulationTestLogUpdate(BaseModel):
    date: date_type | None = None
    result: OvulationTestResult | None = None
    notes: str | None = None


class OvulationTestLogRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    date: date_type
    result: OvulationTestResult
    notes: str | None
    created_at: datetime
    updated_at: datetime
