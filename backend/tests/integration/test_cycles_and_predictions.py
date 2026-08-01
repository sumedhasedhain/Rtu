from datetime import date, timedelta

from httpx import AsyncClient


async def _log_period(
    client: AsyncClient, headers: dict[str, str], start: date, length: int = 4
) -> None:
    for i in range(length):
        await client.post(
            "/api/v1/periods",
            json={"date": (start + timedelta(days=i)).isoformat(), "flow_intensity": "medium"},
            headers=headers,
        )


async def test_cycles_empty_with_no_data(client: AsyncClient, auth_headers: dict[str, str]) -> None:
    resp = await client.get("/api/v1/cycles", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json() == []


async def test_cycles_reflects_logged_periods(
    client: AsyncClient, auth_headers: dict[str, str]
) -> None:
    await _log_period(client, auth_headers, date(2026, 1, 1))
    await _log_period(client, auth_headers, date(2026, 1, 29))

    resp = await client.get("/api/v1/cycles", headers=auth_headers)
    assert resp.status_code == 200
    cycles = resp.json()
    assert len(cycles) == 2
    assert cycles[0]["cycle_length_days"] == 28
    assert cycles[1]["is_ongoing"] is True


async def test_next_period_prediction_with_no_data(
    client: AsyncClient, auth_headers: dict[str, str]
) -> None:
    resp = await client.get("/api/v1/predictions/next-period", headers=auth_headers)
    assert resp.status_code == 200
    body = resp.json()
    assert body["predicted_date"] is None
    assert body["confidence_level"] == "low"


async def test_next_period_prediction_with_regular_history(
    client: AsyncClient, auth_headers: dict[str, str]
) -> None:
    for i in range(4):
        await _log_period(client, auth_headers, date(2026, 1, 1) + timedelta(days=28 * i))

    resp = await client.get("/api/v1/predictions/next-period", headers=auth_headers)
    body = resp.json()
    assert body["predicted_date"] == "2026-04-23"
    assert body["confidence_level"] == "high"
    assert body["based_on_cycles"] == 3


async def test_fertile_window_prediction(client: AsyncClient, auth_headers: dict[str, str]) -> None:
    for i in range(3):
        await _log_period(client, auth_headers, date(2026, 1, 1) + timedelta(days=28 * i))

    resp = await client.get("/api/v1/predictions/fertile-window", headers=auth_headers)
    assert resp.status_code == 200
    body = resp.json()
    assert body["ovulation_date"] is not None
    assert body["fertile_window_start"] < body["ovulation_date"] < body["fertile_window_end"]


async def test_cycle_length_trend(client: AsyncClient, auth_headers: dict[str, str]) -> None:
    for i in range(3):
        await _log_period(client, auth_headers, date(2026, 1, 1) + timedelta(days=28 * i))

    resp = await client.get("/api/v1/insights/cycle-length-trend", headers=auth_headers)
    assert resp.status_code == 200
    points = resp.json()
    # Last (ongoing) cycle has no completed length, so it's excluded from the trend.
    assert len(points) == 2
    assert all(p["cycle_length_days"] == 28 for p in points)


async def test_symptom_frequency(client: AsyncClient, auth_headers: dict[str, str]) -> None:
    await _log_period(client, auth_headers, date(2026, 1, 1))
    symptoms = (await client.get("/api/v1/symptoms")).json()
    cramps_id = next(s["id"] for s in symptoms if s["name"] == "cramps")

    await client.post(
        "/api/v1/symptom-logs",
        json={"date": "2026-01-01", "symptom_id": cramps_id, "severity": 3},
        headers=auth_headers,
    )
    await client.post(
        "/api/v1/symptom-logs",
        json={"date": "2026-01-02", "symptom_id": cramps_id, "severity": 3},
        headers=auth_headers,
    )

    resp = await client.get("/api/v1/insights/symptom-frequency", headers=auth_headers)
    assert resp.status_code == 200
    entries = resp.json()
    cramps_entry = next(e for e in entries if e["symptom_name"] == "cramps")
    assert cramps_entry["count"] == 2
    assert cramps_entry["phase"] == "menstrual"


async def test_symptom_frequency_filtered_by_phase(
    client: AsyncClient, auth_headers: dict[str, str]
) -> None:
    await _log_period(client, auth_headers, date(2026, 1, 1))
    symptoms = (await client.get("/api/v1/symptoms")).json()
    headache_id = next(s["id"] for s in symptoms if s["name"] == "headache")

    await client.post(
        "/api/v1/symptom-logs",
        json={"date": "2026-01-01", "symptom_id": headache_id, "severity": 2},
        headers=auth_headers,
    )

    matching = await client.get(
        "/api/v1/insights/symptom-frequency", params={"phase": "menstrual"}, headers=auth_headers
    )
    assert len(matching.json()) == 1

    non_matching = await client.get(
        "/api/v1/insights/symptom-frequency", params={"phase": "luteal"}, headers=auth_headers
    )
    assert non_matching.json() == []


async def test_dashboard_summary_with_no_data(
    client: AsyncClient, auth_headers: dict[str, str]
) -> None:
    resp = await client.get("/api/v1/dashboard/summary", headers=auth_headers)
    assert resp.status_code == 200
    body = resp.json()
    assert body["current_cycle_day"] is None
    assert body["cycle_regularity"] == "insufficient_data"


async def test_dashboard_summary_reflects_current_cycle(
    client: AsyncClient, auth_headers: dict[str, str]
) -> None:
    today = date.today()
    await _log_period(client, auth_headers, today, length=3)

    resp = await client.get("/api/v1/dashboard/summary", headers=auth_headers)
    assert resp.status_code == 200
    body = resp.json()
    assert body["current_cycle_day"] == 1
    assert body["is_on_period"] is True
    assert body["current_phase"] == "menstrual"
    assert body["last_period_start"] == today.isoformat()
