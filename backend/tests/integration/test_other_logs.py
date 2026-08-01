from httpx import AsyncClient


async def test_bbt_crud(client: AsyncClient, auth_headers: dict[str, str]) -> None:
    create_resp = await client.post(
        "/api/v1/bbt",
        json={"date": "2026-01-10", "temperature_celsius": 36.5, "time_recorded": "07:00:00"},
        headers=auth_headers,
    )
    assert create_resp.status_code == 201
    entry_id = create_resp.json()["id"]

    list_resp = await client.get("/api/v1/bbt", headers=auth_headers)
    assert len(list_resp.json()) == 1

    update_resp = await client.put(
        f"/api/v1/bbt/{entry_id}", json={"temperature_celsius": 36.8}, headers=auth_headers
    )
    assert update_resp.status_code == 200
    assert float(update_resp.json()["temperature_celsius"]) == 36.8

    delete_resp = await client.delete(f"/api/v1/bbt/{entry_id}", headers=auth_headers)
    assert delete_resp.status_code == 204


async def test_cervical_mucus_crud(client: AsyncClient, auth_headers: dict[str, str]) -> None:
    create_resp = await client.post(
        "/api/v1/cervical-mucus",
        json={"date": "2026-01-12", "type": "egg_white"},
        headers=auth_headers,
    )
    assert create_resp.status_code == 201
    entry_id = create_resp.json()["id"]

    update_resp = await client.put(
        f"/api/v1/cervical-mucus/{entry_id}", json={"type": "watery"}, headers=auth_headers
    )
    assert update_resp.status_code == 200
    assert update_resp.json()["type"] == "watery"

    delete_resp = await client.delete(f"/api/v1/cervical-mucus/{entry_id}", headers=auth_headers)
    assert delete_resp.status_code == 204


async def test_ovulation_test_crud(client: AsyncClient, auth_headers: dict[str, str]) -> None:
    create_resp = await client.post(
        "/api/v1/ovulation-tests",
        json={"date": "2026-01-14", "result": "positive"},
        headers=auth_headers,
    )
    assert create_resp.status_code == 201
    entry_id = create_resp.json()["id"]

    list_resp = await client.get("/api/v1/ovulation-tests", headers=auth_headers)
    assert len(list_resp.json()) == 1

    delete_resp = await client.delete(f"/api/v1/ovulation-tests/{entry_id}", headers=auth_headers)
    assert delete_resp.status_code == 204


async def test_symptom_lookup_and_log_crud(
    client: AsyncClient, auth_headers: dict[str, str]
) -> None:
    symptoms_resp = await client.get("/api/v1/symptoms")
    assert symptoms_resp.status_code == 200
    symptoms = symptoms_resp.json()
    assert len(symptoms) == 3
    cramps = next(s for s in symptoms if s["name"] == "cramps")

    create_resp = await client.post(
        "/api/v1/symptom-logs",
        json={"date": "2026-01-15", "symptom_id": cramps["id"], "severity": 4, "notes": "ouch"},
        headers=auth_headers,
    )
    assert create_resp.status_code == 201
    entry_id = create_resp.json()["id"]
    assert create_resp.json()["severity"] == 4

    update_resp = await client.put(
        f"/api/v1/symptom-logs/{entry_id}", json={"severity": 2}, headers=auth_headers
    )
    assert update_resp.status_code == 200
    assert update_resp.json()["severity"] == 2

    delete_resp = await client.delete(f"/api/v1/symptom-logs/{entry_id}", headers=auth_headers)
    assert delete_resp.status_code == 204


async def test_symptom_log_severity_out_of_range_rejected(
    client: AsyncClient, auth_headers: dict[str, str]
) -> None:
    symptoms_resp = await client.get("/api/v1/symptoms")
    symptom_id = symptoms_resp.json()[0]["id"]

    resp = await client.post(
        "/api/v1/symptom-logs",
        json={"date": "2026-01-15", "symptom_id": symptom_id, "severity": 9},
        headers=auth_headers,
    )
    assert resp.status_code == 422
