from sqlalchemy import Boolean, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.mixins import TimestampMixin, UUIDPKMixin


class User(UUIDPKMixin, TimestampMixin, Base):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    refresh_tokens: Mapped[list["RefreshToken"]] = relationship(  # noqa: F821
        back_populates="user", cascade="all, delete-orphan"
    )
    password_reset_tokens: Mapped[list["PasswordResetToken"]] = relationship(  # noqa: F821
        back_populates="user", cascade="all, delete-orphan"
    )
    period_entries: Mapped[list["PeriodEntry"]] = relationship(  # noqa: F821
        back_populates="user", cascade="all, delete-orphan"
    )
    symptom_logs: Mapped[list["SymptomLog"]] = relationship(  # noqa: F821
        back_populates="user", cascade="all, delete-orphan"
    )
    bbt_logs: Mapped[list["BBTLog"]] = relationship(  # noqa: F821
        back_populates="user", cascade="all, delete-orphan"
    )
    cervical_mucus_logs: Mapped[list["CervicalMucusLog"]] = relationship(  # noqa: F821
        back_populates="user", cascade="all, delete-orphan"
    )
    ovulation_test_logs: Mapped[list["OvulationTestLog"]] = relationship(  # noqa: F821
        back_populates="user", cascade="all, delete-orphan"
    )
