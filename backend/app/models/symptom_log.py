import uuid
from datetime import date

from sqlalchemy import CheckConstraint, Date, ForeignKey, Integer, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.mixins import TimestampMixin, UUIDPKMixin


class SymptomLog(UUIDPKMixin, TimestampMixin, Base):
    __tablename__ = "symptom_logs"
    __table_args__ = (
        UniqueConstraint("user_id", "date", "symptom_id", name="uq_symptom_log_user_date_symptom"),
        CheckConstraint("severity >= 1 AND severity <= 5", name="ck_symptom_log_severity_range"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    symptom_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("symptoms.id", ondelete="CASCADE"), nullable=False
    )
    severity: Mapped[int] = mapped_column(Integer, nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    user: Mapped["User"] = relationship(back_populates="symptom_logs")  # noqa: F821
    symptom: Mapped["Symptom"] = relationship(back_populates="logs")  # noqa: F821
