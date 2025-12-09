import asyncio
import json
import random
import time
import logging
from typing import Dict
import asyncpg
from aiokafka import AIOKafkaProducer, AIOKafkaConsumer
from symbols import SYMBOL_CONFIGS

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)

KAFKA_BROKER = "kafka:9092"
TOPIC = "market_ticks"

DB_CONFIG = {
    "user": "postgres",
    "password": "postgres",
    "database": "tradestream",
    "host": "db",
    "port": 5432,
}

CREATE_TABLE_QUERY = """
CREATE TABLE IF NOT EXISTS ticks (
    id SERIAL,
    symbol TEXT NOT NULL,
    price DOUBLE PRECISION NOT NULL,
    volume INTEGER NOT NULL,
    ts TIMESTAMPTZ NOT NULL,
    PRIMARY KEY (symbol, ts, id)
);
"""

CREATE_HYPERTABLE_QUERY = """
SELECT create_hypertable(
    'ticks',
    'ts',
    partitioning_column => 'symbol',
    number_partitions => 8,
    if_not_exists => TRUE
);
"""

INSERT_QUERY = """
INSERT INTO ticks (symbol, price, volume, ts)
VALUES ($1, $2, $3, to_timestamp($4));
"""


async def wait_for_kafka() -> None:
    while True:
        try:
            test = AIOKafkaProducer(bootstrap_servers=KAFKA_BROKER)
            await test.start()
            await test.stop()
            logging.info("Kafka is ready.")
            return
        except Exception as exc:
            logging.warning("Kafka not ready: %s. Retrying in 2s...", exc)
            await asyncio.sleep(2)


async def wait_for_db() -> asyncpg.Connection:
    while True:
        try:
            conn = await asyncpg.connect(**DB_CONFIG)
            logging.info("Connected to TimescaleDB.")
            return conn
        except Exception as exc:
            logging.warning("DB not ready: %s. Retrying in 2s...", exc)
            await asyncio.sleep(2)


async def produce() -> None:
    """
    Produces realistic-ish ticks:

    - Each symbol has a base_price from SYMBOL_CONFIGS.
    - Price follows a small random walk (Gaussian steps in cents).
    - There is mild mean reversion back toward base_price.
    - Price is clamped to a max intraday deviation band.
    """
    await wait_for_kafka()
    producer = AIOKafkaProducer(
        bootstrap_servers=KAFKA_BROKER,
        value_serializer=lambda value: json.dumps(value).encode("utf-8"),
    )
    await producer.start()
    logging.info("Producer started.")

    current_prices: Dict[str, float] = {
        cfg.symbol: cfg.base_price for cfg in SYMBOL_CONFIGS
    }

    try:
        while True:
            now_timestamp = time.time()

            for cfg in SYMBOL_CONFIGS:
                prev_price = current_prices[cfg.symbol]

                step_cents = random.gauss(0.0, cfg.tick_volatility_cents)
                new_price = prev_price + step_cents / 100.0

                mean_reversion_strength = 0.002
                new_price += (cfg.base_price - new_price) * mean_reversion_strength

                band_dollars = cfg.max_intraday_deviation_cents / 100.0
                min_price = cfg.base_price - band_dollars
                max_price = cfg.base_price + band_dollars
                if new_price < min_price:
                    new_price = min_price
                elif new_price > max_price:
                    new_price = max_price

                current_prices[cfg.symbol] = new_price

                raw_volume = int(
                    random.gauss(cfg.mean_volume, cfg.volume_jitter)
                )
                volume = max(1, raw_volume)

                msg = {
                    "symbol": cfg.symbol,
                    "price": round(new_price, 2),
                    "volume": volume,
                    "timestamp": now_timestamp,
                }

                await producer.send_and_wait(TOPIC, msg)
                logging.info("Produced \u2192 %s", msg)

            await asyncio.sleep(2)

    finally:
        logging.info("Stopping producer...")
        await producer.stop()


async def consume_and_store() -> None:
    conn = await wait_for_db()

    await conn.execute(CREATE_TABLE_QUERY)
    logging.info("Table ensured.")

    try:
        await conn.execute(CREATE_HYPERTABLE_QUERY)
        logging.info("Hypertable ready.")
    except Exception as exc:
        logging.info("Hypertable already exists or error: %s", exc)

    consumer = AIOKafkaConsumer(
        TOPIC,
        bootstrap_servers=KAFKA_BROKER,
        group_id="db-writer-group",
        value_deserializer=lambda value: json.loads(value.decode("utf-8")),
    )

    await consumer.start()
    logging.info("DB consumer started.")

    try:
        async for msg in consumer:
            tick = msg.value
            logging.info("Inserting tick \u2192 %s", tick)

            await conn.execute(
                INSERT_QUERY,
                tick["symbol"],
                tick["price"],
                tick["volume"],
                tick["timestamp"],
            )
    finally:
        await consumer.stop()
        await conn.close()


async def main() -> None:
    await asyncio.gather(
        produce(),
        consume_and_store(),
    )


if __name__ == "__main__":
    asyncio.run(main())