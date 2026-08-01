from datetime import date

from pydantic import BaseModel


class CycleRead(BaseModel):
    cycle_number: int
    start_date: date
    end_date: date | None
    period_length_days: int
    cycle_length_days: int | None
    is_ongoing: bool
    is_irregular: bool


class ConfidenceRange(BaseModel):
    earliest: date
    latest: date


class NextPeriodPrediction(BaseModel):
    predicted_date: date | None
    confidence_range: ConfidenceRange | None
    confidence_level: str  # "low" | "medium" | "high"
    based_on_cycles: int
    average_cycle_length_days: float | None
    message: str | None = None


class FertileWindowPrediction(BaseModel):
    ovulation_date: date | None
    fertile_window_start: date | None
    fertile_window_end: date | None
    confidence_level: str
    based_on_cycles: int
    message: str | None = None


class CycleLengthTrendPoint(BaseModel):
    cycle_number: int
    start_date: date
    cycle_length_days: int


class SymptomFrequencyEntry(BaseModel):
    symptom_name: str
    phase: str
    count: int


class DashboardSummary(BaseModel):
    today: date
    current_cycle_day: int | None
    current_phase: str
    is_on_period: bool
    last_period_start: date | None
    predicted_next_period_date: date | None
    days_until_next_period: int | None
    cycle_regularity: str  # "regular" | "irregular" | "insufficient_data"
