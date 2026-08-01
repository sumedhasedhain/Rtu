import enum

from sqlalchemy import Enum, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.mixins import UUIDPKMixin


class SymptomCategory(str, enum.Enum):
    PHYSICAL = "physical"
    EMOTIONAL = "emotional"


class Symptom(UUIDPKMixin, Base):
    __tablename__ = "symptoms"

    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    category: Mapped[SymptomCategory] = mapped_column(
        Enum(SymptomCategory, name="symptom_category"), nullable=False
    )

    logs: Mapped[list["SymptomLog"]] = relationship(back_populates="symptom")  # noqa: F821
