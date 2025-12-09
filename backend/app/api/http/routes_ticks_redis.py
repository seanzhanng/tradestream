from fastapi import APIRouter, Query
from app.services.http.ticks_redis_service import (
    get_ticks_from_redis,
    get_latest_tick,
)

router = APIRouter(tags=["Ticks"])


@router.get("/ticks")
async def get_recent_ticks(
    symbol: str = Query(..., description="Symbol, e.g. AAPL"),
    lookback_hours: int = Query(
        24,
        ge=1,
        le=72,
        description="Number of hours of tick data to retrieve",
    ),
):
    """
    Return the last `lookback_hours` of ticks for a symbol from Redis.
    """
    symbol = symbol.upper()
    return await get_ticks_from_redis(symbol, lookback_hours)


@router.get("/ticks/latest")
async def get_latest(
    symbol: str = Query(..., description="Symbol, e.g. AAPL"),
):
    """
    Return the most recent tick for the requested symbol (from Redis).
    """
    symbol = symbol.upper()
    return await get_latest_tick(symbol)