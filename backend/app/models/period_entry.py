import enum
import uuid
from datetime import date

from sqlalchemy import Date, Enum, ForeignKey, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.mixins import TimestampMixin, UUIDPKMixin


class FlowIntensity(str, enum.Enum):
    SPOTTING = "spotting"
    LIGHT = "light"
    MEDIUM = "medium"
    HEAVY = "heavy"


class PeriodEntry(UUIDPKMixin, TimestampMixin, Base):
    __tablename__ = "period_entries"
    __table_args__ = (UniqueConstraint("user_id", "date", name="uq_period_entry_user_date"),)

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    flow_intensity: Mapped[FlowIntensity] = mapped_column(
        Enum(FlowIntensity, name="flow_intensity"), nullable=False
    )
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    user: Mapped["User"] = relationship(back_populates="period_entries")  # noqa: F821
