import os
import requests
from datetime import datetime, timedelta
import math
from dotenv import load_dotenv

load_dotenv()

FINNHUB_KEY = os.getenv("FINNHUB_API_KEY")

def clean_float(val):
    if val is None:
        return 0
    try:
        if math.isnan(float(val)):
            return 0
        return float(val)
    except:
        return 0

def fetch_finnhub(endpoint: str, symbol: str, params: str = ""):
    url = f"https://finnhub.io/api/v1/{endpoint}?symbol={symbol}&token={FINNHUB_KEY}{params}"
    try:
        r = requests.get(url, timeout=5)
        if r.status_code == 200:
            return r.json()
    except Exception as e:
        print(f"Finnhub API Error for {symbol} on {endpoint}: {e}")
    return {}

def fetch_yahoo_chart(symbol: str, range="1d", interval="1d"):
    url = f"https://query2.finance.yahoo.com/v8/finance/chart/{symbol}?range={range}&interval={interval}"
    headers = {'User-Agent': 'Mozilla/5.0'}
    try:
        r = requests.get(url, headers=headers, timeout=5)
        if r.status_code == 200:
            res = r.json()
            if res.get("chart") and res["chart"].get("result"):
                return res["chart"]["result"][0]
    except Exception:
        pass
    return {}

def get_usd_rate(currency: str):
    if not currency or currency == "USD":
        return 1.0
    
    chart = fetch_yahoo_chart(f"{currency}USD=X")
    if chart and chart.get("meta"):
        return chart["meta"].get("regularMarketPrice", 1.0)
    return 1.0

def get_finnhub_news(symbol: str):
    end_date = datetime.now().strftime('%Y-%m-%d')
    start_date = (datetime.now() - timedelta(days=7)).strftime('%Y-%m-%d')
    url = f"https://finnhub.io/api/v1/company-news?symbol={symbol}&from={start_date}&to={end_date}&token={FINNHUB_KEY}"
    try:
        r = requests.get(url, timeout=5)
        if r.status_code == 200:
            data = r.json()
            if isinstance(data, list):
                return data[:5]
    except Exception as e:
        print(f"Finnhub News Error: {e}")
    return []

def get_fmp_metrics(symbol: str):
    metric = fetch_finnhub("stock/metric", symbol, "&metric=all").get("metric", {})
    profile = fetch_finnhub("stock/profile2", symbol)
    
    rate = get_usd_rate(profile.get("currency", "USD"))
    
    return {
        "peRatio": metric.get("peNormalizedAnnual", "N/A"),
        "pbRatio": metric.get("pbAnnual", "N/A"),
        "marketCap": profile.get("marketCapitalization", 0) * 1000000 * rate # Finnhub returns mcap in millions
    }

def get_fmp_profile(symbol: str):
    profile = fetch_finnhub("stock/profile2", symbol)
    quote = fetch_finnhub("quote", symbol)
    metric = fetch_finnhub("stock/metric", symbol, "&metric=all").get("metric", {})
    
    rate = get_usd_rate(profile.get("currency", "USD"))
    
    current_price = quote.get("c", 0) * rate
    changes = quote.get("d", 0) * rate
    mcap = profile.get("marketCapitalization", 0) * 1000000 * rate

    return {
        "symbol": profile.get("ticker", symbol),
        "companyName": profile.get("name", symbol),
        "image": profile.get("logo", ""),
        "exchangeShortName": profile.get("exchange", ""),
        "sector": profile.get("finnhubIndustry", "N/A"),
        "price": current_price,
        "changes": changes,
        "description": "Information provided by Finnhub API.",
        "mktCap": mcap,
        "beta": metric.get("beta", "N/A"),
        "lastDiv": metric.get("dividendYieldIndicatedAnnual", "N/A"),
        "ceo": "N/A",
        "fullTimeEmployees": "N/A",
        "industry": profile.get("finnhubIndustry", "N/A"),
        "city": "",
        "state": "",
        "country": profile.get("country", ""),
        "website": profile.get("weburl", "#")
    }

def get_explorer_stats(symbol: str):
    chart = fetch_yahoo_chart(symbol, range="5y", interval="1mo")
    metric = fetch_finnhub("stock/metric", symbol, "&metric=all").get("metric", {})
    
    try:
        closes = chart["indicators"]["quote"][0]["close"]
        current = closes[-1] if closes else 0
        
        def perf(months_ago):
            if not closes or len(closes) <= months_ago: return 0
            past = closes[-months_ago - 1]
            if not past: return 0
            return ((current - past) / past) * 100
            
        return {
            "perf1M": perf(1),
            "perf6M": perf(6),
            "perf1Y": perf(12),
            "perf5Y": perf(len(closes)-1) if closes else 0,
            "beta": metric.get("beta", 0),
            "high52": metric.get("52WeekHigh", 0),
            "low52": metric.get("52WeekLow", 0),
            "volAvg": metric.get("10DayAverageTradingVolume", 0) * 1000000 # Finnhub volume in millions
        }
    except Exception as e:
        print(f"Explorer Stats Error: {e}")
        return {}

def get_fmp_income_statement(symbol: str, limit: int = 5):
    # Free Finnhub API does not provide deep historical financials
    return []

def get_fmp_balance_sheet(symbol: str, limit: int = 5):
    return []

def get_fmp_cash_flow(symbol: str, limit: int = 5):
    return []

def get_fmp_ratios(symbol: str, limit: int = 5):
    metric = fetch_finnhub("stock/metric", symbol, "&metric=all").get("metric", {})
    return [{
        "date": datetime.now().strftime('%Y-%m-%d'),
        "peRatio": metric.get("peNormalizedAnnual", 0),
        "pbRatio": metric.get("pbAnnual", 0),
        "debtEquityRatio": metric.get("totalDebt/totalEquityAnnual", 0) / 100 if metric.get("totalDebt/totalEquityAnnual") else 0,
        "returnOnEquity": metric.get("roeTTM", 0)
    }]
