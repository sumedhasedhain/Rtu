import uuid
from datetime import date as date_type
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.symptom import SymptomCategory


class SymptomRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    category: SymptomCategory


class SymptomLogCreate(BaseModel):
    date: date_type
    symptom_id: uuid.UUID
    severity: int = Field(ge=1, le=5)
    notes: str | None = None


class SymptomLogUpdate(BaseModel):
    date: date_type | None = None
    symptom_id: uuid.UUID | None = None
    severity: int | None = Field(default=None, ge=1, le=5)
    notes: str | None = None


class SymptomLogRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    date: date_type
    symptom_id: uuid.UUID
    severity: int
    notes: str | None
    created_at: datetime
    updated_at: datetime
