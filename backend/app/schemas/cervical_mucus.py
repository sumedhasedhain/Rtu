import uuid
from datetime import date as date_type
from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.cervical_mucus_log import CervicalMucusType


class CervicalMucusLogCreate(BaseModel):
    date: date_type
    type: CervicalMucusType
    notes: str | None = None


class CervicalMucusLogUpdate(BaseModel):
    date: date_type | None = None
    type: CervicalMucusType | None = None
    notes: str | None = None


class CervicalMucusLogRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    date: date_type
    type: CervicalMucusType
    notes: str | None
    created_at: datetime
    updated_at: datetime
