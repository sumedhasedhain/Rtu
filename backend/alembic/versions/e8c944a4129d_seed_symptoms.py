"""seed symptoms

Revision ID: e8c944a4129d
Revises: 524ccc47d371
Create Date: 2026-08-01 20:29:25.269029

"""
import uuid
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

from app.models.symptom import SymptomCategory

# revision identifiers, used by Alembic.
revision: str = 'e8c944a4129d'
down_revision: Union[str, None] = '524ccc47d371'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# Values are SymptomCategory members (not raw strings): SQLAlchemy's Enum type stores the
# member *name* ("PHYSICAL") by default, not its .value ("physical") — bulk_insert bypasses
# the ORM's automatic conversion, so this has to match that convention exactly.
SYMPTOMS = [
    ("cramps", SymptomCategory.PHYSICAL),
    ("headache", SymptomCategory.PHYSICAL),
    ("bloating", SymptomCategory.PHYSICAL),
    ("acne", SymptomCategory.PHYSICAL),
    ("fatigue", SymptomCategory.PHYSICAL),
    ("nausea", SymptomCategory.PHYSICAL),
    ("backache", SymptomCategory.PHYSICAL),
    ("tender_breasts", SymptomCategory.PHYSICAL),
    ("joint_pain", SymptomCategory.PHYSICAL),
    ("insomnia", SymptomCategory.PHYSICAL),
    ("mood_swings", SymptomCategory.EMOTIONAL),
    ("anxiety", SymptomCategory.EMOTIONAL),
    ("irritability", SymptomCategory.EMOTIONAL),
    ("sadness", SymptomCategory.EMOTIONAL),
    ("food_cravings", SymptomCategory.EMOTIONAL),
]

symptoms_table = sa.table(
    "symptoms",
    sa.column("id", sa.Uuid()),
    sa.column("name", sa.String()),
    sa.column("category", sa.Enum(SymptomCategory, name="symptom_category")),
)


def upgrade() -> None:
    op.bulk_insert(
        symptoms_table,
        [{"id": uuid.uuid4(), "name": name, "category": category} for name, category in SYMPTOMS],
    )


def downgrade() -> None:
    op.execute(
        symptoms_table.delete().where(
            symptoms_table.c.name.in_([name for name, _ in SYMPTOMS])
        )
    )
