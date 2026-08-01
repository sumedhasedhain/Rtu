from fastapi import APIRouter, status

from app.core.deps import CurrentUser, DbSession
from app.schemas.auth import (
    AccessTokenResponse,
    LoginRequest,
    LogoutRequest,
    PasswordResetConfirm,
    PasswordResetRequest,
    RefreshRequest,
    TokenResponse,
)
from app.schemas.user import UserCreate, UserRead
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def register(payload: UserCreate, db: DbSession) -> UserRead:
    user = await AuthService(db).register(payload.email, payload.password)
    return UserRead.model_validate(user)


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest, db: DbSession) -> TokenResponse:
    service = AuthService(db)
    user = await service.authenticate(payload.email, payload.password)
    access_token, refresh_token = await service.issue_tokens(user)
    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


@router.post("/refresh", response_model=AccessTokenResponse)
async def refresh(payload: RefreshRequest, db: DbSession) -> AccessTokenResponse:
    access_token = await AuthService(db).refresh_access_token(payload.refresh_token)
    return AccessTokenResponse(access_token=access_token)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(payload: LogoutRequest, db: DbSession) -> None:
    await AuthService(db).logout(payload.refresh_token)


@router.post("/password-reset/request", status_code=status.HTTP_202_ACCEPTED)
async def request_password_reset(payload: PasswordResetRequest, db: DbSession) -> dict[str, str]:
    await AuthService(db).request_password_reset(payload.email)
    return {"detail": "If that email is registered, a reset link has been sent."}


@router.post("/password-reset/confirm", status_code=status.HTTP_204_NO_CONTENT)
async def confirm_password_reset(payload: PasswordResetConfirm, db: DbSession) -> None:
    await AuthService(db).confirm_password_reset(payload.token, payload.new_password)


@router.get("/me", response_model=UserRead)
async def get_me(current_user: CurrentUser) -> UserRead:
    return UserRead.model_validate(current_user)
