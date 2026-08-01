import enum
import uuid
from datetime import date

from sqlalchemy import Date, Enum, ForeignKey, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.mixins import TimestampMixin, UUIDPKMixin


class OvulationTestResult(str, enum.Enum):
    NEGATIVE = "negative"
    POSITIVE = "positive"
    PEAK = "peak"


class OvulationTestLog(UUIDPKMixin, TimestampMixin, Base):
    __tablename__ = "ovulation_test_logs"
    __table_args__ = (UniqueConstraint("user_id", "date", name="uq_ovulation_test_log_user_date"),)

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    result: Mapped[OvulationTestResult] = mapped_column(
        Enum(OvulationTestResult, name="ovulation_test_result"), nullable=False
    )
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    user: Mapped["User"] = relationship(back_populates="ovulation_test_logs")  # noqa: F821
