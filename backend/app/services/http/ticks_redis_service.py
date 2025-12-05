import json
from datetime import datetime, timezone
from app.core.redis_client import redis_client

WINDOW_MS = 24 * 60 * 60 * 1000


def now_ms():
    return int(datetime.now(timezone.utc).timestamp() * 1000)

async def add_tick_to_redis(tick: dict):
    ts_ms = int(float(tick["timestamp"]) * 1000)

    data = {
        "symbol": tick["symbol"],
        "price": tick["price"],
        "volume": tick["volume"],
        "timestamp_ms": ts_ms,
    }

    key = f"ticks:{data['symbol']}"
    serialized = json.dumps(data)

    await redis_client.zadd(key, {serialized: ts_ms})

    await redis_client.zremrangebyscore(key, 0, ts_ms - WINDOW_MS)

async def get_ticks_from_redis(symbol: str, lookback_hours: int = 24):
    key = f"ticks:{symbol}"
    end = now_ms()
    start = end - lookback_hours * 60 * 60 * 1000

    raw_items = await redis_client.zrangebyscore(key, start, end)
    return [json.loads(item) for item in raw_items]

async def get_latest_tick(symbol: str):
    key = f"ticks:{symbol}"

    raw = await redis_client.zrevrange(key, 0, 0)
    if not raw:
        return None

    return json.loads(raw[0])