import logging
from datetime import UTC, datetime, timedelta

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.security import (
    as_utc_aware,
    create_access_token,
    generate_opaque_token,
    hash_opaque_token,
    hash_password,
    verify_password,
)
from app.models.user import User
from app.repositories.password_reset_repository import PasswordResetRepository
from app.repositories.refresh_token_repository import RefreshTokenRepository
from app.repositories.user_repository import UserRepository

logger = logging.getLogger(__name__)
settings = get_settings()


class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.users = UserRepository(db)
        self.refresh_tokens = RefreshTokenRepository(db)
        self.password_resets = PasswordResetRepository(db)

    async def register(self, email: str, password: str) -> User:
        existing = await self.users.get_by_email(email)
        if existing is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT, detail="Email is already registered"
            )
        return await self.users.create(email=email, hashed_password=hash_password(password))

    async def authenticate(self, email: str, password: str) -> User:
        user = await self.users.get_by_email(email)
        if user is None or not verify_password(password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password"
            )
        if not user.is_active:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is disabled")
        return user

    async def issue_tokens(self, user: User) -> tuple[str, str]:
        access_token = create_access_token(str(user.id))
        raw_refresh_token = generate_opaque_token()
        expires_at = datetime.now(UTC) + timedelta(days=settings.refresh_token_expire_days)
        await self.refresh_tokens.create(
            user_id=user.id,
            token_hash=hash_opaque_token(raw_refresh_token),
            expires_at=expires_at,
        )
        return access_token, raw_refresh_token

    async def refresh_access_token(self, raw_refresh_token: str) -> str:
        token = await self.refresh_tokens.get_by_hash(hash_opaque_token(raw_refresh_token))
        if token is None or token.revoked or as_utc_aware(token.expires_at) < datetime.now(UTC):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired refresh token"
            )
        return create_access_token(str(token.user_id))

    async def logout(self, raw_refresh_token: str) -> None:
        token = await self.refresh_tokens.get_by_hash(hash_opaque_token(raw_refresh_token))
        if token is not None and not token.revoked:
            await self.refresh_tokens.revoke(token)

    async def request_password_reset(self, email: str) -> None:
        user = await self.users.get_by_email(email)
        if user is None:
            # Don't reveal whether the email exists.
            return
        raw_token = generate_opaque_token()
        expires_at = datetime.now(UTC) + timedelta(
            minutes=settings.password_reset_token_expire_minutes
        )
        await self.password_resets.create(
            user_id=user.id, token_hash=hash_opaque_token(raw_token), expires_at=expires_at
        )
        # Email sending is stubbed for this portfolio project: log instead of dispatching an email.
        logger.info("Password reset requested for %s — reset token: %s", email, raw_token)

    async def confirm_password_reset(self, raw_token: str, new_password: str) -> None:
        reset_token = await self.password_resets.get_by_hash(hash_opaque_token(raw_token))
        if (
            reset_token is None
            or reset_token.used
            or as_utc_aware(reset_token.expires_at) < datetime.now(UTC)
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired reset token"
            )
        user = await self.users.get_by_id(reset_token.user_id)
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid reset token"
            )

        user.hashed_password = hash_password(new_password)
        await self.password_resets.mark_used(reset_token)
        await self.refresh_tokens.revoke_all_for_user(user.id)
        await self.db.commit()
