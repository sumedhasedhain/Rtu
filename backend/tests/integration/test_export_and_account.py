from httpx import AsyncClient


async def test_export_csv(client: AsyncClient, auth_headers: dict[str, str]) -> None:
    await client.post(
        "/api/v1/periods",
        json={"date": "2026-01-01", "flow_intensity": "medium"},
        headers=auth_headers,
    )

    resp = await client.get("/api/v1/export/csv", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.headers["content-type"].startswith("text/csv")
    text = resp.text
    assert "date,type,detail,notes" in text
    assert "2026-01-01,period,medium," in text


async def test_export_csv_requires_auth(client: AsyncClient) -> None:
    resp = await client.get("/api/v1/export/csv")
    assert resp.status_code == 401


async def test_export_pdf(client: AsyncClient, auth_headers: dict[str, str]) -> None:
    await client.post(
        "/api/v1/periods",
        json={"date": "2026-01-01", "flow_intensity": "medium"},
        headers=auth_headers,
    )

    resp = await client.get("/api/v1/export/pdf", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.headers["content-type"] == "application/pdf"
    assert resp.content[:4] == b"%PDF"


async def test_delete_account_removes_user_and_cascades(
    client: AsyncClient, auth_headers: dict[str, str]
) -> None:
    await client.post(
        "/api/v1/periods",
        json={"date": "2026-01-01", "flow_intensity": "medium"},
        headers=auth_headers,
    )

    delete_resp = await client.delete("/api/v1/account", headers=auth_headers)
    assert delete_resp.status_code == 204

    me_resp = await client.get("/api/v1/auth/me", headers=auth_headers)
    assert me_resp.status_code == 401

    login_resp = await client.post(
        "/api/v1/auth/login", json={"email": "user@example.com", "password": "supersecret1"}
    )
    assert login_resp.status_code == 401


async def test_delete_account_requires_auth(client: AsyncClient) -> None:
    resp = await client.delete("/api/v1/account")
    assert resp.status_code == 401
