from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.routers import (
    account,
    auth,
    bbt,
    cervical_mucus,
    cycles,
    dashboard,
    export,
    insights,
    ovulation_tests,
    periods,
    predictions,
    symptoms,
)

settings = get_settings()

app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

routers = (
    auth.router,
    periods.router,
    symptoms.router,
    bbt.router,
    cervical_mucus.router,
    ovulation_tests.router,
    cycles.router,
    predictions.router,
    insights.router,
    dashboard.router,
    export.router,
    account.router,
)
for router in routers:
    app.include_router(router, prefix=settings.api_v1_prefix)


@app.get("/health")
async def health_check() -> dict[str, str]:
    return {"status": "ok"}
