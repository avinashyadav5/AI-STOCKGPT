import os
from dotenv import load_dotenv
load_dotenv()
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db, ChatMessage, Watchlist
from services import (
    get_finnhub_news, get_fmp_metrics, get_fmp_profile,
    get_fmp_income_statement, get_fmp_balance_sheet,
    get_fmp_cash_flow, get_fmp_ratios, get_explorer_stats
)
import yfinance as yf
from ai_pipeline import get_intent_and_ticker, run_ai_agent, analyze_news_sentiment
from report_generator import generate_investment_report
from rag import get_available_tickers

app = FastAPI(title="StockGPT AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    livePrice: dict = {}
    ai_model: str = "llama-3.3-70b-versatile"
    system_prompt_addon: str = ""

class WatchlistRequest(BaseModel):
    ticker: str
    shares: int = 0
    avg_cost: str = "0.0"
    currency: str = "USD"

@app.post("/api/chat")
def chat_endpoint(req: ChatRequest, db: Session = Depends(get_db)):
    # 1. NLP extraction for the UI trace and DB tagging
    ticker = get_intent_and_ticker(req.message)
    
    # 2. Autonomous Multi-Agent Execution
    ai_response = run_ai_agent(req.message, ai_model=req.ai_model, prompt_addon=req.system_prompt_addon)
    
    # 3. Save to Postgres
    chat_log = ChatMessage(user_message=req.message, ai_response=ai_response, ticker=ticker)
    db.add(chat_log)
    db.commit()
    
    return {"reply": ai_response, "extractedTicker": ticker}

@app.get("/api/news")
def news_endpoint(ticker: str = "AAPL"):
    # Fetch latest 10 articles
    news = get_finnhub_news(ticker)
    
    # Analyze Sentiment via NLP Agent
    analyzed_news = analyze_news_sentiment(news)
    
    return {"ticker": ticker, "news": analyzed_news}

@app.get("/api/financials")
def financials_endpoint(ticker: str = "AAPL"):
    income = get_fmp_income_statement(ticker)
    balance = get_fmp_balance_sheet(ticker)
    cash = get_fmp_cash_flow(ticker)
    ratios = get_fmp_ratios(ticker)
    
    return {
        "ticker": ticker,
        "income": income,
        "balance": balance,
        "cash": cash,
        "ratios": ratios
    }

@app.get("/api/profile")
def profile_endpoint(ticker: str = "AAPL"):
    profile = get_fmp_profile(ticker)
    return {"ticker": ticker, "profile": profile}

@app.get("/api/explorer")
def explorer_endpoint(ticker: str = "AAPL"):
    stats = get_explorer_stats(ticker)
    return {"ticker": ticker, "stats": stats}

@app.get("/api/watchlist")
def get_watchlist(db: Session = Depends(get_db)):
    items = db.query(Watchlist).all()
    return {"watchlist": [{"id": i.id, "ticker": i.ticker, "shares": i.shares, "avg_cost": i.avg_cost} for i in items]}

@app.post("/api/watchlist")
def add_watchlist(req: WatchlistRequest, db: Session = Depends(get_db)):
    converted_cost = req.avg_cost
    try:
        if req.currency and req.currency != "USD":
            rate_info = yf.Ticker(f"{req.currency}USD=X").info
            rate = rate_info.get("regularMarketPrice") or rate_info.get("previousClose") or 1.0
            converted_cost = str(float(req.avg_cost) * rate)
    except Exception as e:
        print(f"Currency Conversion Error: {e}")
        # fallback to the original cost if conversion fails

    item = db.query(Watchlist).filter(Watchlist.ticker == req.ticker).first()
    if item:
        item.shares = req.shares
        item.avg_cost = converted_cost
    else:
        item = Watchlist(ticker=req.ticker, shares=req.shares, avg_cost=converted_cost)
        db.add(item)
    db.commit()
    db.refresh(item)
    return {"status": "success", "item": {"id": item.id, "ticker": item.ticker}}

@app.delete("/api/watchlist/{ticker}")
def remove_watchlist(ticker: str, db: Session = Depends(get_db)):
    item = db.query(Watchlist).filter(Watchlist.ticker == ticker).first()
    if item:
        db.delete(item)
        db.commit()
    return {"status": "success"}

MOCK_SCREENER_UNIVERSE = [
    { "ticker": "AAPL", "name": "Apple Inc.", "sector": "Technology", "mcap": 3400, "pe": 28.4, "div": 0.5, "roe": 145.2 },
    { "ticker": "MSFT", "name": "Microsoft Corp.", "sector": "Technology", "mcap": 3100, "pe": 35.2, "div": 0.7, "roe": 38.4 },
    { "ticker": "NVDA", "name": "NVIDIA Corp.", "sector": "Technology", "mcap": 2200, "pe": 72.1, "div": 0.02, "roe": 68.2 },
    { "ticker": "JPM", "name": "JPMorgan Chase", "sector": "Financials", "mcap": 580, "pe": 11.5, "div": 2.3, "roe": 16.5 },
    { "ticker": "V", "name": "Visa Inc.", "sector": "Financials", "mcap": 560, "pe": 31.8, "div": 0.7, "roe": 45.1 },
    { "ticker": "JNJ", "name": "Johnson & Johnson", "sector": "Healthcare", "mcap": 380, "pe": 14.2, "div": 3.1, "roe": 24.8 },
    { "ticker": "UNH", "name": "UnitedHealth Group", "sector": "Healthcare", "mcap": 450, "pe": 20.4, "div": 1.5, "roe": 27.6 },
    { "ticker": "XOM", "name": "Exxon Mobil", "sector": "Energy", "mcap": 420, "pe": 12.8, "div": 3.4, "roe": 21.2 },
    { "ticker": "CVX", "name": "Chevron Corp.", "sector": "Energy", "mcap": 300, "pe": 13.5, "div": 4.1, "roe": 18.5 },
    { "ticker": "PG", "name": "Procter & Gamble", "sector": "Consumer", "mcap": 390, "pe": 25.6, "div": 2.4, "roe": 32.1 },
    { "ticker": "KO", "name": "Coca-Cola Co.", "sector": "Consumer", "mcap": 260, "pe": 24.1, "div": 3.2, "roe": 41.5 },
    { "ticker": "TSLA", "name": "Tesla Inc.", "sector": "Auto", "mcap": 550, "pe": 45.2, "div": 0.0, "roe": 22.4 },
    { "ticker": "TM", "name": "Toyota Motor", "sector": "Auto", "mcap": 320, "pe": 9.5, "div": 2.8, "roe": 14.1 },
    { "ticker": "TATAMOTORS.NS", "name": "Tata Motors", "sector": "Auto", "mcap": 42, "pe": 14.2, "div": 0.6, "roe": 22.3 },
    { "ticker": "RELIANCE.NS", "name": "Reliance Ind.", "sector": "Energy", "mcap": 230, "pe": 26.5, "div": 0.4, "roe": 9.8 },
    { "ticker": "HDFCBANK.NS", "name": "HDFC Bank", "sector": "Financials", "mcap": 175, "pe": 18.2, "div": 1.2, "roe": 15.6 },
    { "ticker": "INFY.NS", "name": "Infosys", "sector": "Technology", "mcap": 85, "pe": 24.5, "div": 2.4, "roe": 31.2 },
    { "ticker": "TCS.NS", "name": "TCS", "sector": "Technology", "mcap": 180, "pe": 30.1, "div": 1.8, "roe": 46.5 },
]

@app.get("/api/screener")
def screener_endpoint(sector: str = "All", pe: str = "All", div: str = "All"):
    results = []
    for s in MOCK_SCREENER_UNIVERSE:
        if sector != "All" and s["sector"] != sector:
            continue
        
        if pe == "<15" and s["pe"] >= 15: continue
        if pe == "15-30" and (s["pe"] < 15 or s["pe"] > 30): continue
        if pe == ">30" and s["pe"] <= 30: continue
        
        if div == ">1%" and s["div"] <= 1: continue
        if div == ">3%" and s["div"] <= 3: continue
        if div == "None" and s["div"] > 0: continue
        
        results.append(s)
        
    return {"status": "success", "results": results}

@app.get("/api/calendar")
def calendar_endpoint():
    # Return mock upcoming earnings
    return {"calendar": [
        {"ticker": "AAPL", "date": "2026-07-28", "eps_est": 1.34},
        {"ticker": "MSFT", "date": "2026-07-22", "eps_est": 2.93},
        {"ticker": "NVDA", "date": "2026-08-15", "eps_est": 0.64}
    ]}

class ReportRequest(BaseModel):
    ticker: str
    company_name: str = ""
    ai_model: str = "llama-3.3-70b-versatile"
    system_prompt_addon: str = ""

@app.post("/api/generate_report")
def generate_report_endpoint(req: ReportRequest):
    """Phase 3: Generate AI Investment Research Report with RAG."""
    ticker = req.ticker.upper()
    
    # Gather context
    profile = get_fmp_profile(ticker)
    financials = {
        "income": get_fmp_income_statement(ticker, limit=1),
        "ratios": get_fmp_ratios(ticker)
    }
    news = get_finnhub_news(ticker)
    
    company_name = req.company_name or profile.get("companyName", ticker)
    
    report = generate_investment_report(
        ticker=ticker,
        company_name=company_name,
        financials=financials,
        news=news,
        ai_model=req.ai_model,
        prompt_addon=req.system_prompt_addon
    )
    
    return {
        "ticker": ticker,
        "company": company_name,
        "report": report,
        "rag_supported": ticker in get_available_tickers()
    }

@app.get("/api/rag-status")
def rag_status_endpoint():
    """Return which tickers have RAG/10-K data available."""
    return {"tickers_with_rag": get_available_tickers()}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
