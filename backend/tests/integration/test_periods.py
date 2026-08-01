from httpx import AsyncClient


async def test_create_and_list_period(client: AsyncClient, auth_headers: dict[str, str]) -> None:
    resp = await client.post(
        "/api/v1/periods",
        json={"date": "2026-01-01", "flow_intensity": "medium", "notes": "day one"},
        headers=auth_headers,
    )
    assert resp.status_code == 201
    body = resp.json()
    assert body["date"] == "2026-01-01"
    assert body["flow_intensity"] == "medium"

    list_resp = await client.get("/api/v1/periods", headers=auth_headers)
    assert list_resp.status_code == 200
    assert len(list_resp.json()) == 1


async def test_create_period_requires_auth(client: AsyncClient) -> None:
    resp = await client.post(
        "/api/v1/periods", json={"date": "2026-01-01", "flow_intensity": "medium"}
    )
    assert resp.status_code == 401


async def test_duplicate_date_returns_conflict(
    client: AsyncClient, auth_headers: dict[str, str]
) -> None:
    payload = {"date": "2026-01-05", "flow_intensity": "light"}
    first = await client.post("/api/v1/periods", json=payload, headers=auth_headers)
    second = await client.post("/api/v1/periods", json=payload, headers=auth_headers)
    assert first.status_code == 201
    assert second.status_code == 409


async def test_list_filters_by_date_range(
    client: AsyncClient, auth_headers: dict[str, str]
) -> None:
    for d in ["2026-02-01", "2026-02-15", "2026-03-01"]:
        await client.post(
            "/api/v1/periods", json={"date": d, "flow_intensity": "light"}, headers=auth_headers
        )

    resp = await client.get(
        "/api/v1/periods", params={"start": "2026-02-01", "end": "2026-02-28"}, headers=auth_headers
    )
    dates = [e["date"] for e in resp.json()]
    assert dates == ["2026-02-01", "2026-02-15"]


async def test_get_update_delete_period(client: AsyncClient, auth_headers: dict[str, str]) -> None:
    create_resp = await client.post(
        "/api/v1/periods",
        json={"date": "2026-04-01", "flow_intensity": "heavy"},
        headers=auth_headers,
    )
    entry_id = create_resp.json()["id"]

    get_resp = await client.get(f"/api/v1/periods/{entry_id}", headers=auth_headers)
    assert get_resp.status_code == 200
    assert get_resp.json()["flow_intensity"] == "heavy"

    update_resp = await client.put(
        f"/api/v1/periods/{entry_id}", json={"flow_intensity": "light"}, headers=auth_headers
    )
    assert update_resp.status_code == 200
    assert update_resp.json()["flow_intensity"] == "light"

    delete_resp = await client.delete(f"/api/v1/periods/{entry_id}", headers=auth_headers)
    assert delete_resp.status_code == 204

    missing_resp = await client.get(f"/api/v1/periods/{entry_id}", headers=auth_headers)
    assert missing_resp.status_code == 404


async def test_get_nonexistent_period_returns_404(
    client: AsyncClient, auth_headers: dict[str, str]
) -> None:
    resp = await client.get(
        "/api/v1/periods/00000000-0000-0000-0000-000000000000", headers=auth_headers
    )
    assert resp.status_code == 404


async def test_users_cannot_access_each_others_periods(
    client: AsyncClient, auth_headers: dict[str, str]
) -> None:
    create_resp = await client.post(
        "/api/v1/periods",
        json={"date": "2026-05-01", "flow_intensity": "medium"},
        headers=auth_headers,
    )
    entry_id = create_resp.json()["id"]

    await client.post(
        "/api/v1/auth/register", json={"email": "other@example.com", "password": "supersecret1"}
    )
    login_resp = await client.post(
        "/api/v1/auth/login", json={"email": "other@example.com", "password": "supersecret1"}
    )
    other_headers = {"Authorization": f"Bearer {login_resp.json()['access_token']}"}

    get_resp = await client.get(f"/api/v1/periods/{entry_id}", headers=other_headers)
    assert get_resp.status_code == 404

    other_list_resp = await client.get("/api/v1/periods", headers=other_headers)
    assert other_list_resp.json() == []
