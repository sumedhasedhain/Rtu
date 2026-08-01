from fastapi import APIRouter, Response

from app.core.deps import CurrentUser, DbSession
from app.services.export_service import ExportService

router = APIRouter(prefix="/export", tags=["export"])


@router.get("/csv")
async def export_csv(current_user: CurrentUser, db: DbSession) -> Response:
    csv_content = await ExportService(db).export_csv(current_user.id)
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=cycle_tracker_export.csv"},
    )


@router.get("/pdf")
async def export_pdf(current_user: CurrentUser, db: DbSession) -> Response:
    pdf_bytes = await ExportService(db).export_pdf(current_user.id, current_user.email)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=cycle_tracker_export.pdf"},
    )
