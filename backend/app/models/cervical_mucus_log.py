import enum
import uuid
from datetime import date

from sqlalchemy import Date, Enum, ForeignKey, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.mixins import TimestampMixin, UUIDPKMixin


class CervicalMucusType(str, enum.Enum):
    DRY = "dry"
    STICKY = "sticky"
    CREAMY = "creamy"
    WATERY = "watery"
    EGG_WHITE = "egg_white"


class CervicalMucusLog(UUIDPKMixin, TimestampMixin, Base):
    __tablename__ = "cervical_mucus_logs"
    __table_args__ = (UniqueConstraint("user_id", "date", name="uq_cervical_mucus_log_user_date"),)

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    type: Mapped[CervicalMucusType] = mapped_column(
        Enum(CervicalMucusType, name="cervical_mucus_type"), nullable=False
    )
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    user: Mapped["User"] = relationship(back_populates="cervical_mucus_logs")  # noqa: F821
