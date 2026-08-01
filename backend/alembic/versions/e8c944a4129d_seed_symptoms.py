"""seed symptoms

Revision ID: e8c944a4129d
Revises: 524ccc47d371
Create Date: 2026-08-01 20:29:25.269029

"""
import uuid
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e8c944a4129d'
down_revision: Union[str, None] = '524ccc47d371'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

SYMPTOMS = [
    ("cramps", "physical"),
    ("headache", "physical"),
    ("bloating", "physical"),
    ("acne", "physical"),
    ("fatigue", "physical"),
    ("nausea", "physical"),
    ("backache", "physical"),
    ("tender_breasts", "physical"),
    ("joint_pain", "physical"),
    ("insomnia", "physical"),
    ("mood_swings", "emotional"),
    ("anxiety", "emotional"),
    ("irritability", "emotional"),
    ("sadness", "emotional"),
    ("food_cravings", "emotional"),
]

symptoms_table = sa.table(
    "symptoms",
    sa.column("id", sa.Uuid()),
    sa.column("name", sa.String()),
    sa.column("category", sa.Enum("physical", "emotional", name="symptom_category")),
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
