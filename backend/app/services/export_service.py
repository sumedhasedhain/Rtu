import csv
import io
import uuid
from dataclasses import dataclass
from datetime import date

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.bbt_repository import BBTRepository
from app.repositories.cervical_mucus_repository import CervicalMucusRepository
from app.repositories.ovulation_test_repository import OvulationTestRepository
from app.repositories.period_repository import PeriodRepository
from app.repositories.symptom_log_repository import SymptomLogRepository
from app.repositories.symptom_repository import SymptomRepository
from app.services.cycle_service import derive_cycles


@dataclass(frozen=True)
class ExportRow:
    date: date
    log_type: str
    detail: str
    notes: str | None


class ExportService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.periods = PeriodRepository(db)
        self.symptom_logs = SymptomLogRepository(db)
        self.symptoms = SymptomRepository(db)
        self.bbt = BBTRepository(db)
        self.cervical_mucus = CervicalMucusRepository(db)
        self.ovulation_tests = OvulationTestRepository(db)

    async def _collect_rows(self, user_id: uuid.UUID) -> list[ExportRow]:
        rows: list[ExportRow] = []

        for entry in await self.periods.list_for_user(user_id):
            rows.append(ExportRow(entry.date, "period", entry.flow_intensity.value, entry.notes))

        symptoms_by_id = {s.id: s.name for s in await self.symptoms.list_all()}
        for entry in await self.symptom_logs.list_for_user(user_id):
            name = symptoms_by_id.get(entry.symptom_id, "unknown")
            rows.append(
                ExportRow(
                    entry.date, "symptom", f"{name} (severity {entry.severity}/5)", entry.notes
                )
            )

        for entry in await self.bbt.list_for_user(user_id):
            rows.append(ExportRow(entry.date, "bbt", f"{entry.temperature_celsius}°C", entry.notes))

        for entry in await self.cervical_mucus.list_for_user(user_id):
            rows.append(ExportRow(entry.date, "cervical_mucus", entry.type.value, entry.notes))

        for entry in await self.ovulation_tests.list_for_user(user_id):
            rows.append(ExportRow(entry.date, "ovulation_test", entry.result.value, entry.notes))

        rows.sort(key=lambda r: (r.date, r.log_type))
        return rows

    async def export_csv(self, user_id: uuid.UUID) -> str:
        rows = await self._collect_rows(user_id)
        buffer = io.StringIO()
        writer = csv.writer(buffer)
        writer.writerow(["date", "type", "detail", "notes"])
        for row in rows:
            writer.writerow([row.date.isoformat(), row.log_type, row.detail, row.notes or ""])
        return buffer.getvalue()

    async def export_pdf(self, user_id: uuid.UUID, user_email: str) -> bytes:
        rows = await self._collect_rows(user_id)
        period_entries = await self.periods.list_for_user(user_id)
        cycles = derive_cycles([e.date for e in period_entries])

        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        styles = getSampleStyleSheet()
        elements = [
            Paragraph("Cycle Tracker Export", styles["Title"]),
            Paragraph(f"Account: {user_email}", styles["Normal"]),
            Spacer(1, 12),
            Paragraph("Cycle History", styles["Heading2"]),
        ]

        cycle_table_data = [
            ["Cycle #", "Start Date", "Period Length (days)", "Cycle Length (days)"]
        ]
        for c in cycles:
            cycle_table_data.append(
                [
                    str(c.cycle_number),
                    c.start_date.isoformat(),
                    str(c.period_length_days),
                    str(c.cycle_length_days) if c.cycle_length_days is not None else "ongoing",
                ]
            )
        elements.append(_styled_table(cycle_table_data))
        elements.append(Spacer(1, 20))

        elements.append(Paragraph("Logged Entries", styles["Heading2"]))
        log_table_data = [["Date", "Type", "Detail", "Notes"]]
        for row in rows:
            log_table_data.append([row.date.isoformat(), row.log_type, row.detail, row.notes or ""])
        elements.append(_styled_table(log_table_data))

        doc.build(elements)
        return buffer.getvalue()


def _styled_table(data: list[list[str]]) -> Table:
    table = Table(data, repeatRows=1)
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#5b21b6")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTSIZE", (0, 0), (-1, -1), 8),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f3f4f6")]),
            ]
        )
    )
    return table
