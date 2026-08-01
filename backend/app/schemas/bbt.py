import uuid
from datetime import date as date_type
from datetime import datetime
from datetime import time as time_type

from pydantic import BaseModel, ConfigDict, Field


class BBTLogCreate(BaseModel):
    date: date_type
    temperature_celsius: float = Field(ge=30.0, le=45.0)
    time_recorded: time_type | None = None
    notes: str | None = None


class BBTLogUpdate(BaseModel):
    date: date_type | None = None
    temperature_celsius: float | None = Field(default=None, ge=30.0, le=45.0)
    time_recorded: time_type | None = None
    notes: str | None = None


class BBTLogRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    date: date_type
    temperature_celsius: float
    time_recorded: time_type | None
    notes: str | None
    created_at: datetime
    updated_at: datetime
