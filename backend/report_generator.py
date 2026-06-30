"""
Phase 3 — AI Investment Report Generator
Multi-step pipeline: RAG context → News → Financials → LLM synthesis
"""
import os
import requests
from dotenv import load_dotenv
from rag import query_rag, get_available_tickers, TICKER_SUMMARIES

load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

def _groq_chat(messages: list, model: str = "llama-3.3-70b-versatile", max_tokens: int = 2048) -> str:
    """Call Groq chat completion."""
    headers = {"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"}
    payload = {"model": model, "messages": messages, "max_tokens": max_tokens, "temperature": 0.4}
    try:
        r = requests.post(GROQ_URL, headers=headers, json=payload, timeout=60)
        r.raise_for_status()
        return r.json()["choices"][0]["message"]["content"]
    except Exception as e:
        return f"[Report Generation Error: {e}]"

def generate_investment_report(ticker: str, company_name: str = None, financials: dict = None, news: list = None, ai_model: str = "llama-3.3-70b-versatile", prompt_addon: str = "") -> str:
    """
    Generate a 3-section AI investment thesis for a given ticker.
    Steps:
    1. Retrieve RAG context (10-K data)
    2. Gather recent news headlines
    3. Pull latest financial metrics
    4. Synthesize into a structured markdown report
    """
    ticker_upper = ticker.upper()
    company = company_name or ticker_upper
    available = get_available_tickers()

    # ── Step 1: RAG context ──
    rag_context = ""
    if ticker_upper in available:
        rag_context = query_rag(f"Key financial metrics, risks and growth drivers for {ticker_upper}", ticker=ticker_upper)
    elif ticker_upper in TICKER_SUMMARIES:
        rag_context = TICKER_SUMMARIES[ticker_upper]

    # ── Step 2: Financials context ──
    fin_context = ""
    if financials:
        income = financials.get("income", [{}])[0] if financials.get("income") else {}
        ratios = financials.get("ratios", [{}])[0] if financials.get("ratios") else {}
        fin_context = f"""
Latest Financials:
- Revenue: ${income.get('revenue', 0)/1e9:.1f}B
- Net Income: ${income.get('netIncome', 0)/1e9:.1f}B
- Gross Profit: ${income.get('grossProfit', 0)/1e9:.1f}B
- P/E Ratio: {ratios.get('peRatio', 'N/A')}
- Return on Equity: {ratios.get('returnOnEquity', 'N/A')}
"""

    # ── Step 3: News context ──
    news_context = ""
    if news:
        headlines = [f"- {n.get('headline', n.get('summary', ''))[:150]}" for n in news[:5] if n.get('headline') or n.get('summary')]
        news_context = "Recent Headlines:\n" + "\n".join(headlines)

    # ── Step 4: Synthesize report ──
    system_prompt = f"""You are a senior equity research analyst at a top investment bank. 
Your task is to produce a concise, structured, professional investment research report in Markdown.
Be factual and balanced. Use proper financial terminology. Flag genuine risks clearly.
Always include a disclaimer at the end.

{prompt_addon}"""

    user_prompt = f"""Generate a comprehensive investment research report for **{company} ({ticker_upper})**.

{"**Annual Report Context (RAG):**" + chr(10) + rag_context + chr(10) if rag_context else ""}
{fin_context}
{news_context}

Structure the report with these exact sections:
## Executive Summary
(2-3 sentence investment thesis: bull/neutral/bear recommendation with rationale)

## Business Overview & Competitive Position
(Business model, key segments, market position, moat)

## Financial Analysis
(Revenue trends, profitability, cash flow, balance sheet health, key ratios)

## Growth Catalysts
(3-5 specific near-term and long-term drivers with estimated impact)

## Key Risks
(3-5 specific risks with probability/impact assessment)

## Valuation & Price Outlook
(Current valuation vs. peers, fair value estimate, 12-month outlook)

## Investment Verdict
(Clear recommendation: BUY / HOLD / SELL with confidence level)

---
*Disclaimer: This report is AI-generated for educational purposes only and does not constitute financial advice.*"""

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt}
    ]

    report = _groq_chat(messages, model=ai_model, max_tokens=2500)
    return report
