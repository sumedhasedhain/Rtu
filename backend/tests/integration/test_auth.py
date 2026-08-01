from httpx import AsyncClient


async def test_register_creates_user(client: AsyncClient) -> None:
    resp = await client.post(
        "/api/v1/auth/register", json={"email": "new@example.com", "password": "supersecret1"}
    )
    assert resp.status_code == 201
    body = resp.json()
    assert body["email"] == "new@example.com"
    assert "id" in body
    assert "hashed_password" not in body


async def test_register_rejects_duplicate_email(client: AsyncClient) -> None:
    payload = {"email": "dupe@example.com", "password": "supersecret1"}
    first = await client.post("/api/v1/auth/register", json=payload)
    second = await client.post("/api/v1/auth/register", json=payload)
    assert first.status_code == 201
    assert second.status_code == 409


async def test_register_rejects_short_password(client: AsyncClient) -> None:
    resp = await client.post(
        "/api/v1/auth/register", json={"email": "short@example.com", "password": "abc"}
    )
    assert resp.status_code == 422


async def test_login_success_returns_tokens(client: AsyncClient) -> None:
    await client.post(
        "/api/v1/auth/register", json={"email": "login@example.com", "password": "supersecret1"}
    )
    resp = await client.post(
        "/api/v1/auth/login", json={"email": "login@example.com", "password": "supersecret1"}
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["access_token"]
    assert body["refresh_token"]
    assert body["token_type"] == "bearer"


async def test_login_wrong_password_rejected(client: AsyncClient) -> None:
    await client.post(
        "/api/v1/auth/register", json={"email": "wrongpw@example.com", "password": "supersecret1"}
    )
    resp = await client.post(
        "/api/v1/auth/login", json={"email": "wrongpw@example.com", "password": "nope12345"}
    )
    assert resp.status_code == 401


async def test_login_nonexistent_user_rejected(client: AsyncClient) -> None:
    resp = await client.post(
        "/api/v1/auth/login", json={"email": "ghost@example.com", "password": "supersecret1"}
    )
    assert resp.status_code == 401


async def test_me_requires_valid_token(client: AsyncClient) -> None:
    resp = await client.get("/api/v1/auth/me")
    assert resp.status_code == 401

    bad_resp = await client.get(
        "/api/v1/auth/me", headers={"Authorization": "Bearer not-a-real-token"}
    )
    assert bad_resp.status_code == 401


async def test_me_returns_current_user(client: AsyncClient, auth_headers: dict[str, str]) -> None:
    resp = await client.get("/api/v1/auth/me", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["email"] == "user@example.com"


async def test_refresh_issues_new_access_token(
    client: AsyncClient, registered_user_tokens: dict[str, str]
) -> None:
    resp = await client.post(
        "/api/v1/auth/refresh", json={"refresh_token": registered_user_tokens["refresh_token"]}
    )
    assert resp.status_code == 200
    assert resp.json()["access_token"]


async def test_refresh_rejects_invalid_token(client: AsyncClient) -> None:
    resp = await client.post("/api/v1/auth/refresh", json={"refresh_token": "bogus-token"})
    assert resp.status_code == 401


async def test_logout_revokes_refresh_token(
    client: AsyncClient, registered_user_tokens: dict[str, str]
) -> None:
    refresh_token = registered_user_tokens["refresh_token"]
    logout_resp = await client.post("/api/v1/auth/logout", json={"refresh_token": refresh_token})
    assert logout_resp.status_code == 204

    reuse_resp = await client.post("/api/v1/auth/refresh", json={"refresh_token": refresh_token})
    assert reuse_resp.status_code == 401


async def test_password_reset_flow(client: AsyncClient, caplog) -> None:
    await client.post(
        "/api/v1/auth/register", json={"email": "reset@example.com", "password": "oldpassword1"}
    )

    import logging

    with caplog.at_level(logging.INFO):
        req_resp = await client.post(
            "/api/v1/auth/password-reset/request", json={"email": "reset@example.com"}
        )
    assert req_resp.status_code == 202

    token = None
    for record in caplog.records:
        if "reset token" in record.message:
            token = record.message.rsplit(" ", 1)[-1]
    assert token is not None

    confirm_resp = await client.post(
        "/api/v1/auth/password-reset/confirm",
        json={"token": token, "new_password": "newpassword1"},
    )
    assert confirm_resp.status_code == 204

    old_login = await client.post(
        "/api/v1/auth/login", json={"email": "reset@example.com", "password": "oldpassword1"}
    )
    assert old_login.status_code == 401

    new_login = await client.post(
        "/api/v1/auth/login", json={"email": "reset@example.com", "password": "newpassword1"}
    )
    assert new_login.status_code == 200


async def test_password_reset_request_for_unknown_email_is_silent(client: AsyncClient) -> None:
    resp = await client.post(
        "/api/v1/auth/password-reset/request", json={"email": "unknown@example.com"}
    )
    assert resp.status_code == 202
