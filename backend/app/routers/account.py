from fastapi import APIRouter, status

from app.core.deps import CurrentUser, DbSession
from app.repositories.user_repository import UserRepository

router = APIRouter(prefix="/account", tags=["account"])


@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
async def delete_account(current_user: CurrentUser, db: DbSession) -> None:
    """GDPR-style deletion: cascades to every log table via the ORM relationship cascades."""
    await UserRepository(db).delete(current_user)
