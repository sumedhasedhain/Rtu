import uuid
from datetime import date, time

from sqlalchemy import Date, ForeignKey, Numeric, Text, Time, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.mixins import TimestampMixin, UUIDPKMixin


class BBTLog(UUIDPKMixin, TimestampMixin, Base):
    __tablename__ = "bbt_logs"
    __table_args__ = (UniqueConstraint("user_id", "date", name="uq_bbt_log_user_date"),)

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    temperature_celsius: Mapped[float] = mapped_column(Numeric(4, 2), nullable=False)
    time_recorded: Mapped[time | None] = mapped_column(Time, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    user: Mapped["User"] = relationship(back_populates="bbt_logs")  # noqa: F821
