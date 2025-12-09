from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import asyncio
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import engine, Base
from app.core.logger import logger

from app.services.ws.analytics_broadcaster import analytics_kafka_consumer
from app.services.ws.tick_broadcaster import tick_kafka_consumer
from app.services.analytics_consumer import consume_analytics

from app.api.http.routes_users import router as users_router_http
from app.api.http.routes_watchlist import router as watchlist_router_http
from app.api.http.routes_health import router as health_router_http
from app.api.http.routes_baselines import router as baselines_router_http
from app.api.http.routes_ticks_redis import router as ticks_router_redis_http
from app.api.http.routes_symbols import router as symbols_router_http

from app.api.ws.routes_analytics_ws import router as analytics_router_ws
from app.api.ws.routes_ticks_ws import router as ticks_router_ws

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting backend...")

    asyncio.create_task(tick_kafka_consumer())
    logger.info("Tick background consumer started")

    asyncio.create_task(analytics_kafka_consumer())
    logger.info("Analytics background consumer started")

    asyncio.create_task(consume_analytics())
    logger.info("Analytics DB consumer started")

    yield

    logger.info("Shutting down backend...")

app = FastAPI(title="Tradestream Backend", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    logger.info("Health check OK")
    return {"status": "ok"}

app.include_router(users_router_http, prefix="/api")
app.include_router(watchlist_router_http, prefix="/api")
app.include_router(health_router_http, prefix="/api")
app.include_router(baselines_router_http, prefix="/api")
app.include_router(ticks_router_redis_http, prefix="/api")
app.include_router(symbols_router_http, prefix="/api")

app.include_router(analytics_router_ws)
app.include_router(ticks_router_ws)