from dataclasses import dataclass
from typing import List

@dataclass(frozen=True)
class SymbolConfig:
    symbol: str
    name: str
    base_price: float
    tick_volatility_cents: float
    max_intraday_deviation_cents: float
    mean_volume: int
    volume_jitter: int

SYMBOL_CONFIGS: List[SymbolConfig] = [
    # ---- Mega-cap tech / growth ----
    SymbolConfig("AAPL", "Apple Inc.", 190.0, 6.0, 250.0, 950, 250),
    SymbolConfig("MSFT", "Microsoft Corp.", 380.0, 6.0, 250.0, 850, 220),
    SymbolConfig("GOOG", "Alphabet Class C", 140.0, 5.0, 220.0, 800, 220),
    SymbolConfig("AMZN", "Amazon.com Inc.", 150.0, 7.0, 260.0, 900, 260),
    SymbolConfig("TSLA", "Tesla Inc.", 260.0, 12.0, 600.0, 1100, 400),
    SymbolConfig("META", "Meta Platforms Inc.", 320.0, 8.0, 400.0, 900, 260),
    SymbolConfig("NVDA", "NVIDIA Corp.", 450.0, 14.0, 800.0, 1000, 350),
    SymbolConfig("NFLX", "Netflix Inc.", 400.0, 10.0, 450.0, 700, 220),
    SymbolConfig("ADBE", "Adobe Inc.", 500.0, 10.0, 500.0, 650, 200),
    SymbolConfig("CRM", "Salesforce Inc.", 230.0, 7.0, 300.0, 650, 200),

    SymbolConfig("ORCL", "Oracle Corp.", 120.0, 4.0, 180.0, 600, 180),
    SymbolConfig("INTC", "Intel Corp.", 40.0, 3.0, 120.0, 700, 200),
    SymbolConfig("AMD", "Advanced Micro Devices", 120.0, 5.0, 220.0, 800, 230),
    SymbolConfig("CSCO", "Cisco Systems Inc.", 55.0, 3.0, 130.0, 600, 170),
    SymbolConfig("TXN", "Texas Instruments Inc.", 165.0, 5.0, 220.0, 600, 180),
    SymbolConfig("QCOM", "Qualcomm Inc.", 140.0, 5.0, 220.0, 650, 190),
    SymbolConfig("AVGO", "Broadcom Inc.", 900.0, 20.0, 1200.0, 600, 180),
    SymbolConfig("IBM", "IBM Corp.", 140.0, 4.0, 180.0, 500, 150),
    SymbolConfig("SHOP", "Shopify Inc.", 70.0, 6.0, 260.0, 700, 260),
    SymbolConfig("SQ", "Block Inc.", 65.0, 7.0, 260.0, 750, 260),

    SymbolConfig("PYPL", "PayPal Holdings Inc.", 70.0, 6.0, 260.0, 700, 230),
    SymbolConfig("UBER", "Uber Technologies", 45.0, 4.0, 180.0, 800, 260),
    SymbolConfig("LYFT", "Lyft Inc.", 12.0, 5.0, 200.0, 500, 200),
    SymbolConfig("ABNB", "Airbnb Inc.", 130.0, 6.0, 260.0, 700, 230),
    SymbolConfig("SNAP", "Snap Inc.", 10.0, 4.0, 150.0, 650, 220),
    SymbolConfig("PINS", "Pinterest Inc.", 30.0, 4.0, 180.0, 600, 200),
    SymbolConfig("SPOT", "Spotify Technology", 160.0, 8.0, 300.0, 600, 200),
    SymbolConfig("DOCU", "DocuSign Inc.", 55.0, 6.0, 240.0, 500, 180),
    SymbolConfig("ZM", "Zoom Video Communications", 70.0, 7.0, 260.0, 500, 180),
    SymbolConfig("MDB", "MongoDB Inc.", 380.0, 12.0, 700.0, 500, 170),

    SymbolConfig("SNOW", "Snowflake Inc.", 170.0, 10.0, 450.0, 550, 180),
    SymbolConfig("DDOG", "Datadog Inc.", 110.0, 7.0, 260.0, 550, 180),
    SymbolConfig("NET", "Cloudflare Inc.", 70.0, 7.0, 260.0, 600, 190),
    SymbolConfig("CRWD", "CrowdStrike Holdings", 260.0, 10.0, 500.0, 600, 190),
    SymbolConfig("ZS", "Zscaler Inc.", 180.0, 9.0, 400.0, 550, 180),
    SymbolConfig("OKTA", "Okta Inc.", 90.0, 7.0, 260.0, 500, 170),
    SymbolConfig("PANW", "Palo Alto Networks", 250.0, 9.0, 450.0, 550, 180),
    SymbolConfig("TEAM", "Atlassian Corp.", 200.0, 8.0, 350.0, 550, 170),
    SymbolConfig("INTU", "Intuit Inc.", 500.0, 10.0, 600.0, 550, 170),
    SymbolConfig("NOW", "ServiceNow Inc.", 650.0, 12.0, 800.0, 500, 160),

    SymbolConfig("HUBS", "HubSpot Inc.", 500.0, 11.0, 700.0, 450, 150),

    # ---- Financials ----
    SymbolConfig("JPM", "JPMorgan Chase & Co.", 170.0, 4.0, 200.0, 800, 220),
    SymbolConfig("BAC", "Bank of America", 35.0, 3.0, 120.0, 900, 260),
    SymbolConfig("C", "Citigroup Inc.", 50.0, 3.0, 130.0, 700, 220),
    SymbolConfig("WFC", "Wells Fargo", 45.0, 3.0, 130.0, 700, 220),
    SymbolConfig("GS", "Goldman Sachs", 360.0, 8.0, 400.0, 500, 160),
    SymbolConfig("MS", "Morgan Stanley", 90.0, 5.0, 220.0, 600, 190),
    SymbolConfig("V", "Visa Inc.", 250.0, 5.0, 260.0, 600, 180),
    SymbolConfig("MA", "Mastercard Inc.", 400.0, 6.0, 320.0, 550, 170),
    SymbolConfig("AXP", "American Express", 180.0, 5.0, 260.0, 550, 170),

    # ---- Consumer ----
    SymbolConfig("WMT", "Walmart Inc.", 155.0, 3.0, 150.0, 700, 200),
    SymbolConfig("TGT", "Target Corp.", 140.0, 4.0, 200.0, 600, 190),
    SymbolConfig("COST", "Costco Wholesale", 550.0, 6.0, 350.0, 600, 180),
    SymbolConfig("HD", "Home Depot", 320.0, 5.0, 260.0, 600, 180),
    SymbolConfig("LOW", "Lowe's Companies", 220.0, 5.0, 220.0, 550, 170),
    SymbolConfig("NKE", "Nike Inc.", 110.0, 4.0, 200.0, 650, 200),
    SymbolConfig("SBUX", "Starbucks Corp.", 100.0, 4.0, 200.0, 600, 190),
    SymbolConfig("MCD", "McDonald's Corp.", 290.0, 4.0, 200.0, 550, 170),
    SymbolConfig("KO", "Coca-Cola Co.", 60.0, 2.0, 80.0, 650, 200),
    SymbolConfig("PEP", "PepsiCo Inc.", 180.0, 3.0, 150.0, 600, 180),
    SymbolConfig("DIS", "Walt Disney Co.", 100.0, 4.0, 200.0, 600, 190),
    SymbolConfig("ROKU", "Roku Inc.", 70.0, 8.0, 300.0, 500, 200),
    SymbolConfig("TTD", "The Trade Desk", 80.0, 7.0, 260.0, 500, 190),
    SymbolConfig("F", "Ford Motor Co.", 14.0, 2.0, 70.0, 650, 220),
    SymbolConfig("GM", "General Motors", 35.0, 3.0, 120.0, 600, 200),

    # ---- ETFs ----
    SymbolConfig("SPY", "S&P 500 ETF", 450.0, 4.0, 260.0, 1000, 300),
    SymbolConfig("QQQ", "NASDAQ 100 ETF", 380.0, 4.0, 260.0, 900, 270),
    SymbolConfig("IWM", "Russell 2000 ETF", 200.0, 4.0, 220.0, 800, 250),

    # ---- Energy / Industrials ----
    SymbolConfig("XOM", "Exxon Mobil", 110.0, 3.0, 150.0, 700, 220),
    SymbolConfig("CVX", "Chevron Corp.", 170.0, 3.0, 150.0, 650, 210),
    SymbolConfig("COP", "ConocoPhillips", 115.0, 3.0, 150.0, 600, 200),
    SymbolConfig("CAT", "Caterpillar Inc.", 260.0, 4.0, 220.0, 550, 180),
    SymbolConfig("BA", "Boeing Co.", 220.0, 5.0, 260.0, 550, 180),
    SymbolConfig("GE", "General Electric", 110.0, 3.0, 150.0, 600, 190),
    SymbolConfig("LMT", "Lockheed Martin", 430.0, 5.0, 300.0, 450, 150),

    # ---- Healthcare ----
    SymbolConfig("JNJ", "Johnson & Johnson", 170.0, 3.0, 150.0, 600, 180),
    SymbolConfig("PFE", "Pfizer Inc.", 35.0, 2.0, 80.0, 650, 200),
    SymbolConfig("MRK", "Merck & Co.", 110.0, 3.0, 150.0, 600, 190),
    SymbolConfig("ABBV", "AbbVie Inc.", 160.0, 3.0, 150.0, 600, 190),
    SymbolConfig("UNH", "UnitedHealth Group", 500.0, 6.0, 350.0, 550, 170),
    SymbolConfig("TMO", "Thermo Fisher Scientific", 550.0, 7.0, 400.0, 450, 150),
    SymbolConfig("GILD", "Gilead Sciences", 80.0, 3.0, 130.0, 550, 180),
    SymbolConfig("BMY", "Bristol-Myers Squibb", 65.0, 3.0, 120.0, 550, 180),
    SymbolConfig("AMGN", "Amgen Inc.", 260.0, 4.0, 220.0, 500, 170),

    # ---- Apparel / software ----
    SymbolConfig("LULU", "Lululemon Athletica", 380.0, 6.0, 320.0, 550, 180),
    SymbolConfig("ADSK", "Autodesk Inc.", 210.0, 6.0, 260.0, 500, 170),
    SymbolConfig("ETSY", "Etsy Inc.", 70.0, 6.0, 260.0, 550, 180),
    SymbolConfig("ROST", "Ross Stores", 120.0, 4.0, 200.0, 550, 180),
    SymbolConfig("BKNG", "Booking Holdings", 3200.0, 25.0, 2000.0, 300, 120),

    # ---- Airlines ----
    SymbolConfig("DAL", "Delta Air Lines", 40.0, 3.0, 130.0, 600, 200),
    SymbolConfig("UAL", "United Airlines", 45.0, 3.0, 130.0, 600, 200),
    SymbolConfig("FDX", "FedEx Corp.", 260.0, 4.0, 220.0, 550, 180),
    SymbolConfig("UPS", "United Parcel Service", 190.0, 4.0, 220.0, 550, 180),

    # ---- Telecom ----
    SymbolConfig("T", "AT&T Inc.", 18.0, 1.5, 60.0, 650, 200),
    SymbolConfig("VZ", "Verizon Communications", 35.0, 2.0, 80.0, 650, 200),
    SymbolConfig("CHTR", "Charter Communications", 330.0, 6.0, 300.0, 350, 140),
    SymbolConfig("TMUS", "T-Mobile US", 150.0, 4.0, 200.0, 500, 170),

    # ---- New tech / crypto-adjacent ----
    SymbolConfig("PLTR", "Palantir Technologies", 22.0, 5.0, 200.0, 700, 230),
    SymbolConfig("RBLX", "Roblox Corp.", 30.0, 5.0, 220.0, 650, 220),
    SymbolConfig("COIN", "Coinbase Global", 140.0, 15.0, 900.0, 650, 250),
]

allowed_symbols: List[str] = [cfg.symbol for cfg in SYMBOL_CONFIGS]