<p align="center">
  <img src="public/favicon.svg" width="80" alt="StockGPT Logo" />
</p>

<h1 align="center">AI StockGPT</h1>

<p align="center">
  <strong>An AI-powered equity research terminal that combines real-time market data, multi-agent LLM analysis, and RAG-powered document intelligence into a single premium dashboard.</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#project-structure">Project Structure</a> •
  <a href="#api-reference">API Reference</a> •
  <a href="#license">License</a>
</p>

---

## ✨ Features

| Category | Capabilities |
|----------|-------------|
| **AI Chat Assistant** | Natural language stock research powered by Groq LLMs with real-time tool calling (news, financials, company profiles) |
| **Multi-Agent Pipeline** | LangGraph ReAct agent that autonomously decides which tools to invoke — News Agent, Financials Agent, Profile Agent, Filing Agent |
| **RAG (Retrieval-Augmented Generation)** | FAISS vector store over SEC 10-K annual report summaries for AAPL, MSFT, NVDA, TSLA — enables deep fundamental Q&A |
| **Live Market Data** | Real-time price polling via Yahoo Finance API with automatic currency normalization to USD |
| **Interactive Charts** | Candlestick and line charts with technical overlays (RSI, MACD, Bollinger Bands, Moving Averages) |
| **Portfolio Tracker** | Add holdings with cost basis, track P&L, and view allocation breakdowns with live price updates |
| **Stock Screener** | Filter equities by market cap, P/E ratio, sector, dividend yield, and performance metrics |
| **Equity Comparison** | Side-by-side comparison of up to 4 stocks across price, valuation, dividends, and fundamentals |
| **Watchlist** | Persistent watchlist synced to PostgreSQL with real-time sparkline charts |
| **Price Alerts** | Set price-based alerts that trigger visual notifications when thresholds are crossed |
| **News Feed** | AI-powered sentiment analysis on live Finnhub news articles (Bullish / Bearish / Neutral) |
| **Investment Reports** | One-click generation of comprehensive PDF-style markdown reports for any ticker |
| **Company Profiles** | Detailed company overview pages with business description, sector, market cap, and key executives |
| **Financial Statements** | Income statement, balance sheet, and cash flow data displayed in clean tabular format |
| **Market Explorer** | Bird's-eye view of market sectors with top gainers, losers, and sector-level performance |
| **Earnings Calendar** | Upcoming earnings dates with EPS estimates, revenue forecasts, and historical beat/miss records |
| **Settings Dashboard** | Full customization: themes, accent colors, AI model selection, data refresh rates, and notification preferences |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React + Vite)                 │
│                                                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │Dashboard │ │  Chat AI │ │  Charts  │ │Portfolio │  ...   │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘        │
│       │             │            │             │            │
│       └─────────────┴──────┬─────┴─────────────┘            │
│                            │                                │
│                    Yahoo Finance API                        │
│                  (via Vite dev proxy)                       │
│                 Live quotes, charts, FX                     │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP (REST)
┌────────────────────────┴────────────────────────────────────┐
│                  BACKEND (FastAPI + Python)                 │
│                                                             │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────────┐   │
│  │  NLP Layer  │  │  ReAct Agent │  │   RAG Pipeline    │   │
│  │ (Groq 8B)   │  │ (LangGraph)  │  │ (FAISS + HFEmb)   │   │
│  │ Intent +    │  │              │  │ SEC 10-K filings  │   │
│  │ Ticker      │  │ ┌──────────┐ │  │ Vector similarity │   │
│  │ Extraction  │  │ │  Tools:  │ │  │ search            │   │
│  └─────────────┘  │ │• News    │ │  └───────────────────┘   │
│                   │ │• Finance │ │                          │
│  ┌─────────────┐  │ │• Profile │ │  ┌───────────────────┐   │
│  │  Services   │  │ │• RAG     │ │  │    PostgreSQL     │   │
│  │ yfinance    │  │ └──────────┘ │  │  Chat history     │   │
│  │ Finnhub     │  └──────────────┘  │  Watchlist        │   │
│  │ FX rates    │                    │  Portfolio        │   │
│  └─────────────┘                    └───────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### How the AI Pipeline Works

1. **User Query** → User types a natural language question (e.g., *"How is Apple performing?"*)
2. **NLP Extraction** → A lightweight Groq Llama-3.1-8B model extracts the stock ticker and intent
3. **ReAct Agent** → A LangGraph ReAct agent (powered by Llama-3.3-70B) autonomously reasons about which tools to call
4. **Tool Execution** → The agent calls one or more tools:
   - `fetch_news_tool` — Retrieves live news from Finnhub
   - `fetch_financials_tool` — Pulls P/E, P/B, market cap from yfinance
   - `fetch_profile_tool` — Gets company description and metadata
   - `filing_rag_tool` — Performs semantic search over 10-K annual report chunks via FAISS
5. **Synthesis** → The LLM synthesizes all tool outputs into a formatted markdown response
6. **Persistence** → The conversation is saved to PostgreSQL for history

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| **React 19** | Component-based UI framework |
| **Vite 8** | Lightning-fast build tool and dev server |
| **React Router 7** | Client-side routing |
| **Vanilla CSS** | Custom design system with glassmorphism, gradients, and micro-animations |
| **Yahoo Finance API** | Real-time quotes, historical OHLCV data, ticker search (proxied via Vite) |

### Backend
| Technology | Purpose |
|-----------|---------|
| **FastAPI** | High-performance async Python API framework |
| **LangChain + LangGraph** | Multi-agent orchestration with ReAct pattern |
| **Groq** | Ultra-fast LLM inference (Llama 3.3 70B + Llama 3.1 8B) |
| **FAISS** | Vector similarity search for RAG over SEC filings |
| **HuggingFace Embeddings** | Sentence embeddings for document chunking |
| **PostgreSQL** | Persistent storage for chat history, watchlist, and portfolio |
| **yfinance** | Python wrapper for Yahoo Finance data |
| **Finnhub** | Real-time financial news API |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **Python** ≥ 3.10
- **PostgreSQL** running locally (default: `localhost:5432`)
- **API Keys**: [Groq](https://console.groq.com/) and [Finnhub](https://finnhub.io/)

### 1. Clone the Repository

```bash
git clone https://github.com/avinashyadav5/AI-STOCKGPT.git
cd AI-STOCKGPT
```

### 2. Setup the Backend

```bash
cd backend
python -m venv venv

# Windows
.\venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
```

Create a `.env` file inside the `backend/` directory:

```env
GROQ_API_KEY=your_groq_api_key_here
FINNHUB_API_KEY=your_finnhub_api_key_here
DATABASE_URL=postgresql://postgres:password@localhost:5432/stockgpt
```

### 3. Setup the Frontend

```bash
cd ..  # back to root
npm install
```

### 4. Run the Application

From the project root, this single command starts **both** the Vite dev server and the FastAPI backend concurrently:

```bash
npm run dev
```

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs (Swagger)**: http://localhost:8000/docs

---

## 📁 Project Structure

```
AI-STOCKGPT/
│
├── backend/                    # Python FastAPI backend
│   ├── main.py                 # API endpoints (chat, portfolio, watchlist, financials)
│   ├── ai_pipeline.py          # Multi-agent LLM pipeline (LangGraph ReAct agent)
│   ├── rag.py                  # RAG pipeline (FAISS vector store + SEC 10-K data)
│   ├── services.py             # External API integrations (yfinance, Finnhub, FX rates)
│   ├── database.py             # PostgreSQL models and session management (SQLAlchemy)
│   ├── report_generator.py     # Investment report generation engine
│   ├── faiss_index/            # Pre-built FAISS vector index for annual reports
│   │   ├── index.faiss
│   │   └── index.pkl
│   ├── requirements.txt        # Python dependencies
│   └── .env                    # Environment variables (not committed)
│
├── src/                        # React frontend source
│   ├── api/
│   │   └── yahoo.js            # Yahoo Finance API client with FX normalization
│   ├── assets/                 # Static images and SVGs
│   ├── components/             # Reusable UI components
│   │   ├── Sidebar.jsx         # Navigation sidebar
│   │   ├── Sidebar.css
│   │   ├── PriceChart.jsx      # Candlestick / line chart component
│   │   ├── Sparkline.jsx       # Mini sparkline chart for watchlist
│   │   ├── AgentTrace.jsx      # AI agent execution trace visualizer
│   │   └── MarkdownLite.jsx    # Lightweight markdown renderer
│   ├── contexts/
│   │   └── SettingsContext.jsx  # Global settings store (theme, preferences, AI config)
│   ├── data/
│   │   └── stocks.js           # Stock universe, color palette, and helper functions
│   ├── pages/                  # Application pages
│   │   ├── DashboardPage.jsx   # Main dashboard with portfolio overview
│   │   ├── ChatPage.jsx        # AI chat interface
│   │   ├── ChartPage.jsx       # Interactive stock charts with technicals
│   │   ├── PortfolioPage.jsx   # Portfolio tracker with P&L
│   │   ├── WatchlistPage.jsx   # Persistent watchlist
│   │   ├── AlertsPage.jsx      # Price alert management
│   │   ├── ComparePage.jsx     # Multi-stock comparison tool
│   │   ├── ScreenerPage.jsx    # Stock screener with filters
│   │   ├── CompanyProfilePage.jsx  # Company overview and details
│   │   ├── FinancialsPage.jsx  # Financial statements viewer
│   │   ├── NewsPage.jsx        # AI sentiment-tagged news feed
│   │   ├── MarketsPage.jsx     # Market overview and sectors
│   │   ├── ExplorerPage.jsx    # Market sector explorer
│   │   ├── CalendarPage.jsx    # Earnings calendar
│   │   ├── ReportsPage.jsx     # AI-generated investment reports
│   │   └── SettingsPage.jsx    # Application settings
│   ├── App.jsx                 # Root component with routing and state
│   ├── App.css                 # Global application styles
│   ├── index.css               # CSS reset and base styles
│   └── main.jsx                # React entry point
│
├── public/                     # Static public assets
│   ├── favicon.svg
│   └── icons.svg
│
├── index.html                  # HTML entry point
├── vite.config.js              # Vite configuration with API proxy
├── package.json                # Node.js dependencies and scripts
├── .gitignore                  # Git ignore rules
└── README.md                   # This file
```

---

## 📡 API Reference

### Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/chat` | Send a message to the AI agent and receive a research response |

### Portfolio
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/portfolio` | Retrieve all portfolio holdings |
| `POST` | `/api/portfolio` | Add a new holding (ticker, shares, avg cost) |
| `DELETE` | `/api/portfolio/{ticker}` | Remove a holding |

### Watchlist
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/watchlist` | Retrieve the watchlist |
| `POST` | `/api/watchlist` | Add a ticker to the watchlist |
| `DELETE` | `/api/watchlist/{ticker}` | Remove a ticker |

### Market Data
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/stock/{ticker}` | Get live stock profile, price, and financials |
| `GET` | `/api/stock/{ticker}/income` | Income statement data |
| `GET` | `/api/stock/{ticker}/balance` | Balance sheet data |
| `GET` | `/api/stock/{ticker}/cashflow` | Cash flow statement data |
| `GET` | `/api/stock/{ticker}/ratios` | Financial ratios (P/E, ROE, margins, etc.) |
| `GET` | `/api/news/{ticker}` | Latest news with AI sentiment analysis |
| `GET` | `/api/explorer/stats` | Market-wide sector statistics |

### Reports
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/report/generate` | Generate a full AI investment report |

---

## 🔑 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GROQ_API_KEY` | ✅ | API key for Groq LLM inference |
| `FINNHUB_API_KEY` | ✅ | API key for Finnhub financial news |
| `DATABASE_URL` | ✅ | PostgreSQL connection string |

---

## 🧠 AI & NLP Architecture

### Why These Technologies?

| Technology | Why We Use It |
|-----------|---------------|
| **LLM (Llama 3.3 70B via Groq)** | Provides high-quality financial analysis and synthesis. Groq delivers sub-second inference latency. |
| **NLP (Llama 3.1 8B)** | Lightweight model for fast intent classification and ticker extraction from natural language queries. |
| **RAG (FAISS + HuggingFace)** | Enables the LLM to answer questions grounded in actual SEC filing data, preventing hallucinations about company fundamentals. |
| **ReAct Agent (LangGraph)** | Allows the AI to autonomously decide which data sources to query based on the user's question, rather than following a fixed pipeline. |

---

## 📄 License

This project is for **educational and research purposes only**. It does not constitute financial advice.

---

<p align="center">
  Built with ❤️ by <a href="https://github.com/avinashyadav5">Avinash Yadav</a>
</p>
