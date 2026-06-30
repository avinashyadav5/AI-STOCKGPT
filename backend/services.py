import os
import requests
from datetime import datetime, timedelta
import yfinance as yf
from dotenv import load_dotenv

load_dotenv()

import math

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

def get_usd_rate(currency: str):
    if not currency or currency == "USD":
        return 1.0
    try:
        rate_info = yf.Ticker(f"{currency}USD=X").info
        return rate_info.get("regularMarketPrice") or rate_info.get("previousClose") or 1.0
    except Exception as e:
        print(f"FX Error: {e}")
        return 1.0

def get_finnhub_news(symbol: str):
    end_date = datetime.now().strftime('%Y-%m-%d')
    start_date = (datetime.now() - timedelta(days=7)).strftime('%Y-%m-%d')
    url = f"https://finnhub.io/api/v1/company-news?symbol={symbol}&from={start_date}&to={end_date}&token={FINNHUB_KEY}"
    try:
        r = requests.get(url)
        data = r.json()
        if isinstance(data, list):
            return data[:5]
        return []
    except Exception as e:
        print(f"Finnhub Error: {e}")
        return []

def get_fmp_metrics(symbol: str):
    try:
        info = yf.Ticker(symbol).info
        rate = get_usd_rate(info.get("currency", "USD"))
        return {
            "peRatio": info.get("trailingPE", "N/A"),
            "pbRatio": info.get("priceToBook", "N/A"),
            "marketCap": info.get("marketCap", 0) * rate
        }
    except Exception as e:
        print(f"Metrics Error: {e}")
        return {}

def get_fmp_profile(symbol: str):
    try:
        info = yf.Ticker(symbol).info
        
        # Currency Normalization
        price = info.get("currentPrice", 0)
        changes = price - info.get("previousClose", 0)
        mcap = info.get("marketCap", 0)
        
        rate = get_usd_rate(info.get("currency", "USD"))
        price = price * rate
        changes = changes * rate
        mcap = mcap * rate

        return {
            "symbol": info.get("symbol", symbol),
            "companyName": info.get("shortName", symbol),
            "image": "", # yfinance doesn't provide logo
            "exchangeShortName": info.get("exchange", ""),
            "sector": info.get("sector", "N/A"),
            "price": price,
            "changes": changes,
            "description": info.get("longBusinessSummary", "No description available."),
            "mktCap": mcap,
            "beta": info.get("beta", "N/A"),
            "lastDiv": info.get("dividendYield", "N/A"),
            "ceo": info.get("companyOfficers", [{"name": "N/A"}])[0].get("name", "N/A") if info.get("companyOfficers") else "N/A",
            "fullTimeEmployees": info.get("fullTimeEmployees", "N/A"),
            "industry": info.get("industry", "N/A"),
            "city": info.get("city", ""),
            "state": info.get("state", ""),
            "country": info.get("country", ""),
            "website": info.get("website", "#")
        }
    except Exception as e:
        print(f"Profile Error: {e}")
        return {}

def get_explorer_stats(symbol: str):
    try:
        ticker = yf.Ticker(symbol)
        hist = ticker.history(period="5y")
        info = ticker.info
        
        if hist.empty:
            return {}
            
        current = hist.iloc[-1]['Close']
        def perf(days_ago):
            try:
                past = hist.iloc[-days_ago]['Close']
                return ((current - past) / past) * 100
            except IndexError:
                return 0
                
        return {
            "perf1M": perf(21),
            "perf6M": perf(126),
            "perf1Y": perf(252),
            "perf5Y": perf(len(hist)-1) if len(hist) > 0 else 0,
            "beta": info.get("beta", 0),
            "high52": info.get("fiftyTwoWeekHigh", 0),
            "low52": info.get("fiftyTwoWeekLow", 0),
            "volAvg": info.get("averageVolume", 0)
        }
    except Exception as e:
        print(f"Explorer Stats Error: {e}")
        return {}

def get_fmp_income_statement(symbol: str, limit: int = 5):
    try:
        ticker = yf.Ticker(symbol)
        df = ticker.income_stmt
        if df.empty: return []
        
        rate = get_usd_rate(ticker.info.get("currency", "USD"))
        
        # Convert to list of dicts simulating FMP format
        res = []
        for col in df.columns[:limit]:
            row = df[col]
            res.append({
                "date": col.strftime('%Y-%m-%d'),
                "revenue": clean_float(row.get("Total Revenue", 0)) * rate,
                "grossProfit": clean_float(row.get("Gross Profit", 0)) * rate,
                "operatingIncome": clean_float(row.get("Operating Income", 0)) * rate,
                "netIncome": clean_float(row.get("Net Income", 0)) * rate
            })
        return res
    except Exception:
        return []

def get_fmp_balance_sheet(symbol: str, limit: int = 5):
    try:
        ticker = yf.Ticker(symbol)
        df = ticker.balance_sheet
        if df.empty: return []
        
        rate = get_usd_rate(ticker.info.get("currency", "USD"))
        
        res = []
        for col in df.columns[:limit]:
            row = df[col]
            res.append({
                "date": col.strftime('%Y-%m-%d'),
                "totalAssets": clean_float(row.get("Total Assets", 0)) * rate,
                "totalLiabilities": clean_float(row.get("Total Liabilities Net Minority Interest", 0)) * rate,
                "totalDebt": clean_float(row.get("Total Debt", 0)) * rate,
                "totalStockholdersEquity": clean_float(row.get("Stockholders Equity", 0)) * rate,
                "cashAndCashEquivalents": clean_float(row.get("Cash And Cash Equivalents", 0)) * rate
            })
        return res
    except Exception:
        return []

def get_fmp_cash_flow(symbol: str, limit: int = 5):
    try:
        ticker = yf.Ticker(symbol)
        df = ticker.cashflow
        if df.empty: return []
        
        rate = get_usd_rate(ticker.info.get("currency", "USD"))
        
        res = []
        for col in df.columns[:limit]:
            row = df[col]
            res.append({
                "date": col.strftime('%Y-%m-%d'),
                "operatingCashFlow": clean_float(row.get("Operating Cash Flow", 0)) * rate,
                "capitalExpenditure": clean_float(row.get("Capital Expenditure", 0)) * rate,
                "freeCashFlow": clean_float(row.get("Free Cash Flow", 0)) * rate
            })
        return res
    except Exception:
        return []

def get_fmp_ratios(symbol: str, limit: int = 5):
    # yfinance doesn't provide historical ratios easily without parsing financials
    # We will just return empty or current ratios mapped to one year
    try:
        info = yf.Ticker(symbol).info
        return [{
            "date": datetime.now().strftime('%Y-%m-%d'),
            "peRatio": info.get("trailingPE", 0),
            "pbRatio": info.get("priceToBook", 0),
            "debtEquityRatio": info.get("debtToEquity", 0) / 100 if info.get("debtToEquity") else 0,
            "returnOnEquity": info.get("returnOnEquity", 0)
        }]
    except Exception:
        return []
