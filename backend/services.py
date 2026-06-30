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

def fetch_yahoo_json(symbol: str, modules: str):
    """Fetch raw JSON from Yahoo Finance quoteSummary API"""
    url = f"https://query2.finance.yahoo.com/v10/finance/quoteSummary/{symbol}?modules={modules}"
    headers = {'User-Agent': 'Mozilla/5.0'}
    try:
        r = requests.get(url, headers=headers, timeout=5)
        res = r.json()
        if res.get("quoteSummary") and res["quoteSummary"].get("result"):
            return res["quoteSummary"]["result"][0]
    except Exception as e:
        print(f"Yahoo API Error for {symbol}: {e}")
    return {}

def fetch_yahoo_chart(symbol: str, range="1d", interval="1d"):
    url = f"https://query2.finance.yahoo.com/v8/finance/chart/{symbol}?range={range}&interval={interval}"
    headers = {'User-Agent': 'Mozilla/5.0'}
    try:
        r = requests.get(url, headers=headers, timeout=5)
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
        data = r.json()
        if isinstance(data, list):
            return data[:5]
        return []
    except Exception as e:
        print(f"Finnhub Error: {e}")
        return []

def get_fmp_metrics(symbol: str):
    data = fetch_yahoo_json(symbol, "summaryDetail,price")
    detail = data.get("summaryDetail", {})
    price = data.get("price", {})
    rate = get_usd_rate(price.get("currency", "USD"))
    
    return {
        "peRatio": detail.get("trailingPE", {}).get("raw", "N/A"),
        "pbRatio": detail.get("priceToBook", {}).get("raw", "N/A"),
        "marketCap": price.get("marketCap", {}).get("raw", 0) * rate
    }

def get_fmp_profile(symbol: str):
    data = fetch_yahoo_json(symbol, "assetProfile,summaryDetail,price")
    profile = data.get("assetProfile", {})
    detail = data.get("summaryDetail", {})
    price = data.get("price", {})
    
    # Currency Normalization
    current_price = price.get("regularMarketPrice", {}).get("raw", 0)
    prev_close = detail.get("previousClose", {}).get("raw", 0)
    changes = current_price - prev_close
    mcap = price.get("marketCap", {}).get("raw", 0)
    
    rate = get_usd_rate(price.get("currency", "USD"))
    current_price *= rate
    changes *= rate
    mcap *= rate

    officers = profile.get("companyOfficers", [])
    ceo = "N/A"
    if officers:
        ceo = officers[0].get("name", "N/A")

    return {
        "symbol": price.get("symbol", symbol),
        "companyName": price.get("shortName", symbol),
        "image": "",
        "exchangeShortName": price.get("exchangeName", ""),
        "sector": profile.get("sector", "N/A"),
        "price": current_price,
        "changes": changes,
        "description": profile.get("longBusinessSummary", "No description available."),
        "mktCap": mcap,
        "beta": detail.get("beta", {}).get("raw", "N/A"),
        "lastDiv": detail.get("dividendYield", {}).get("raw", "N/A"),
        "ceo": ceo,
        "fullTimeEmployees": profile.get("fullTimeEmployees", "N/A"),
        "industry": profile.get("industry", "N/A"),
        "city": profile.get("city", ""),
        "state": profile.get("state", ""),
        "country": profile.get("country", ""),
        "website": profile.get("website", "#")
    }

def get_explorer_stats(symbol: str):
    chart = fetch_yahoo_chart(symbol, range="5y", interval="1mo")
    detail = fetch_yahoo_json(symbol, "summaryDetail").get("summaryDetail", {})
    
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
            "beta": detail.get("beta", {}).get("raw", 0),
            "high52": detail.get("fiftyTwoWeekHigh", {}).get("raw", 0),
            "low52": detail.get("fiftyTwoWeekLow", {}).get("raw", 0),
            "volAvg": detail.get("averageVolume", {}).get("raw", 0)
        }
    except Exception as e:
        print(f"Explorer Stats Error: {e}")
        return {}

def get_fmp_income_statement(symbol: str, limit: int = 5):
    data = fetch_yahoo_json(symbol, "incomeStatementHistory,price")
    stmts = data.get("incomeStatementHistory", {}).get("incomeStatementHistory", [])
    rate = get_usd_rate(data.get("price", {}).get("currency", "USD"))
    
    res = []
    for stmt in stmts[:limit]:
        res.append({
            "date": stmt.get("endDate", {}).get("fmt", "N/A"),
            "revenue": stmt.get("totalRevenue", {}).get("raw", 0) * rate,
            "grossProfit": stmt.get("grossProfit", {}).get("raw", 0) * rate,
            "operatingIncome": stmt.get("operatingIncome", {}).get("raw", 0) * rate,
            "netIncome": stmt.get("netIncome", {}).get("raw", 0) * rate
        })
    return res

def get_fmp_balance_sheet(symbol: str, limit: int = 5):
    data = fetch_yahoo_json(symbol, "balanceSheetHistory,price")
    stmts = data.get("balanceSheetHistory", {}).get("balanceSheetStatements", [])
    rate = get_usd_rate(data.get("price", {}).get("currency", "USD"))
    
    res = []
    for stmt in stmts[:limit]:
        res.append({
            "date": stmt.get("endDate", {}).get("fmt", "N/A"),
            "totalAssets": stmt.get("totalAssets", {}).get("raw", 0) * rate,
            "totalLiabilities": stmt.get("totalLiab", {}).get("raw", 0) * rate,
            "totalDebt": (stmt.get("shortLongTermDebt", {}).get("raw", 0) + stmt.get("longTermDebt", {}).get("raw", 0)) * rate,
            "totalStockholdersEquity": stmt.get("totalStockholderEquity", {}).get("raw", 0) * rate,
            "cashAndCashEquivalents": stmt.get("cash", {}).get("raw", 0) * rate
        })
    return res

def get_fmp_cash_flow(symbol: str, limit: int = 5):
    data = fetch_yahoo_json(symbol, "cashflowStatementHistory,price")
    stmts = data.get("cashflowStatementHistory", {}).get("cashflowStatements", [])
    rate = get_usd_rate(data.get("price", {}).get("currency", "USD"))
    
    res = []
    for stmt in stmts[:limit]:
        res.append({
            "date": stmt.get("endDate", {}).get("fmt", "N/A"),
            "operatingCashFlow": stmt.get("totalCashFromOperatingActivities", {}).get("raw", 0) * rate,
            "capitalExpenditure": stmt.get("capitalExpenditures", {}).get("raw", 0) * rate,
            "freeCashFlow": (stmt.get("totalCashFromOperatingActivities", {}).get("raw", 0) + stmt.get("capitalExpenditures", {}).get("raw", 0)) * rate
        })
    return res

def get_fmp_ratios(symbol: str, limit: int = 5):
    data = fetch_yahoo_json(symbol, "summaryDetail,financialData")
    detail = data.get("summaryDetail", {})
    findata = data.get("financialData", {})
    
    return [{
        "date": datetime.now().strftime('%Y-%m-%d'),
        "peRatio": detail.get("trailingPE", {}).get("raw", 0),
        "pbRatio": detail.get("priceToBook", {}).get("raw", 0),
        "debtEquityRatio": findata.get("debtToEquity", {}).get("raw", 0) / 100 if findata.get("debtToEquity", {}).get("raw") else 0,
        "returnOnEquity": findata.get("returnOnEquity", {}).get("raw", 0)
    }]
