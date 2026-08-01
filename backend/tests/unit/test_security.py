from datetime import UTC, datetime

import jwt
import pytest

from app.core.security import (
    as_utc_aware,
    create_access_token,
    decode_token,
    hash_opaque_token,
    hash_password,
    verify_password,
)


def test_hash_password_produces_different_hash_than_input() -> None:
    hashed = hash_password("supersecret1")
    assert hashed != "supersecret1"


def test_verify_password_accepts_correct_password() -> None:
    hashed = hash_password("supersecret1")
    assert verify_password("supersecret1", hashed) is True


def test_verify_password_rejects_wrong_password() -> None:
    hashed = hash_password("supersecret1")
    assert verify_password("wrongpassword", hashed) is False


def test_same_password_hashes_differently_each_time() -> None:
    # bcrypt salts each hash, so two hashes of the same password must differ.
    assert hash_password("supersecret1") != hash_password("supersecret1")


def test_access_token_round_trips_subject() -> None:
    token = create_access_token("user-123")
    payload = decode_token(token)
    assert payload["sub"] == "user-123"
    assert payload["type"] == "access"


def test_decode_token_rejects_tampered_token() -> None:
    token = create_access_token("user-123")
    tampered = token[:-1] + ("A" if token[-1] != "A" else "B")
    with pytest.raises(jwt.PyJWTError):
        decode_token(tampered)


def test_decode_token_rejects_expired_token(monkeypatch: pytest.MonkeyPatch) -> None:
    from app.core import security as security_module

    real_datetime = security_module.datetime

    class FrozenDatetime(real_datetime):
        @classmethod
        def now(cls, tz=None):
            return real_datetime(2020, 1, 1, tzinfo=UTC)

    monkeypatch.setattr(security_module, "datetime", FrozenDatetime)
    token = create_access_token("user-123")

    with pytest.raises(jwt.ExpiredSignatureError):
        decode_token(token)


def test_hash_opaque_token_is_deterministic() -> None:
    assert hash_opaque_token("abc") == hash_opaque_token("abc")
    assert hash_opaque_token("abc") != hash_opaque_token("xyz")


def test_as_utc_aware_leaves_aware_datetime_unchanged() -> None:
    dt = datetime(2026, 1, 1, tzinfo=UTC)
    assert as_utc_aware(dt) == dt


def test_as_utc_aware_attaches_utc_to_naive_datetime() -> None:
    naive = datetime(2026, 1, 1)
    aware = as_utc_aware(naive)
    assert aware.tzinfo == UTC
    assert aware == datetime(2026, 1, 1, tzinfo=UTC)


def test_as_utc_aware_naive_datetime_compares_correctly() -> None:
    naive_past = datetime(2020, 1, 1)
    assert as_utc_aware(naive_past) < datetime.now(UTC)
