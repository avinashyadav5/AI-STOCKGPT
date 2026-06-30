"""
Phase 3 — RAG Pipeline (Vercel-Compatible Lightweight Mock)
Strategy: Returns hardcoded summaries instead of heavy FAISS/PyTorch
to stay under Vercel's 250MB function size limit.
"""
import os
from dotenv import load_dotenv

load_dotenv()

TICKER_SUMMARIES = {
    "AAPL": """Apple Inc. (AAPL) — 2023 Annual Report Summary.
Apple designs, manufactures and markets smartphones, personal computers, tablets, wearables and accessories.
Revenue: $383.3B (FY2023). Net Income: $97.0B. Gross Margin: 44.1%.
Key segments: iPhone (52%), Services (22%), Mac (8%), iPad (6%), Wearables/Home/Accessories (10%).
Services segment revenue grew 16% YoY, driven by App Store, Apple Music, iCloud, and Apple TV+.
iPhone 15 launch drove hardware sales recovery. Significant R&D investment in Vision Pro (spatial computing).
Cash and short-term investments: $162.1B. Free Cash Flow: $99.6B.
Risks: China market concentration, regulatory pressure in EU/US, supply chain diversification ongoing.""",

    "MSFT": """Microsoft Corporation (MSFT) — 2023 Annual Report Summary.
Microsoft develops software, services, devices and solutions. Segments: Productivity & Business Processes, Intelligent Cloud, More Personal Computing.
Revenue: $211.9B (FY2023, +7% YoY). Net Income: $72.4B. Operating Margin: 41.8%.
Azure cloud services grew 27% YoY. Copilot AI integration across Office 365. OpenAI partnership.
LinkedIn revenue +10%, Dynamics +16%.
Gaming segment impacted by Activision Blizzard acquisition ($68.7B deal closed Oct 2023).
Free Cash Flow: $59.5B. Dividend payout increased. Share buybacks: $22.2B.
Risks: AI compute costs, regulatory scrutiny of OpenAI partnership, gaming market slowdown.""",

    "NVDA": """NVIDIA Corporation (NVDA) — 2024 Annual Report Summary.
NVIDIA designs GPUs and system-on-chip units for gaming, data centers, professional visualization and automotive.
Revenue: $60.9B (FY2024, +122% YoY). Net Income: $29.8B. Gross Margin: 72.7%.
Data Center segment: $47.5B (+217% YoY) driven by H100/A100 GPU demand from AI hyperscalers.
H100 GPU backlog extends 12+ months. Next-gen Blackwell architecture ramping in late 2024.
Gaming revenue: $10.4B (+15% YoY). Auto segment: $1.09B (+21%).
Cash: $26.0B. No long-term debt. Aggressive R&D at 10% of revenue.
Risks: Export controls on China AI chips, AMD/Intel competition, customer concentration (Microsoft, Google, Meta, Amazon).""",

    "TSLA": """Tesla Inc. (TSLA) — 2023 Annual Report Summary.
Tesla designs, develops, manufactures and sells electric vehicles and energy generation products.
Revenue: $96.8B (FY2023, +19% YoY). Net Income: $15.0B. Automotive Gross Margin: 18.2% (down from 25.6%).
Delivered 1.81M vehicles in 2023 (+38% YoY). Price cuts drove volume but compressed margins.
Energy Generation & Storage: $6.0B (+54%). Services & Other: $8.3B.
Cybertruck launched Nov 2023; production ramp ongoing. Model 3 Highland refresh in key markets.
Cash: $29.1B. Capex guidance $7-9B for 2024. New factories in Mexico and Europe planned.
Risks: EV competition intensifying (BYD, legacy OEMs), margin pressure, Elon Musk distraction risk.""",
}

def query_rag(question: str, ticker: str = None, k: int = 4) -> str:
    """Mock query for Vercel deployment without heavy ML dependencies."""
    if ticker and ticker.upper() in TICKER_SUMMARIES:
        return TICKER_SUMMARIES[ticker.upper()]
    
    # If no specific ticker, just return all of them
    return "\n\n".join(TICKER_SUMMARIES.values())

def ingest_ticker(ticker: str, text: str):
    """Mock ingest"""
    TICKER_SUMMARIES[ticker.upper()] = text
    return True

def get_available_tickers() -> list:
    return list(TICKER_SUMMARIES.keys())
