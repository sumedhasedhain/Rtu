import uuid
from datetime import date as date_type
from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.period_entry import FlowIntensity


class PeriodEntryCreate(BaseModel):
    date: date_type
    flow_intensity: FlowIntensity
    notes: str | None = None


class PeriodEntryUpdate(BaseModel):
    date: date_type | None = None
    flow_intensity: FlowIntensity | None = None
    notes: str | None = None


class PeriodEntryRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    date: date_type
    flow_intensity: FlowIntensity
    notes: str | None
    created_at: datetime
    updated_at: datetime
