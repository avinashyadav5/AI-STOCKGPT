import { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { STOCKS, WATCHLIST_DEFAULT } from "./data/stocks";
import { fetchMultipleQuotes } from "./api/yahoo";

// Layout
import Sidebar from "./components/Sidebar";

// Core Pages (MVP)
import DashboardPage from "./pages/DashboardPage";
import ChatPage from "./pages/ChatPage";
import ChartPage from "./pages/ChartPage";
import WatchlistPage from "./pages/WatchlistPage";
import AlertsPage from "./pages/AlertsPage";
import CompanyProfilePage from "./pages/CompanyProfilePage";
import FinancialsPage from "./pages/FinancialsPage";
import NewsPage from "./pages/NewsPage";
import MarketsPage from "./pages/MarketsPage";
import ScreenerPage from "./pages/ScreenerPage";
import PortfolioPage from "./pages/PortfolioPage";
import ComparePage from "./pages/ComparePage";
import ExplorerPage from "./pages/ExplorerPage";
import CalendarPage from "./pages/CalendarPage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";

// Placeholder for remaining Phase 2/3 Pages
import PlaceholderPage from "./pages/PlaceholderPage";

import "./App.css";

export default function App() {
  const navigate = useNavigate();

  // ── Global state ──
  const [livePrice, setLivePrice] = useState({ ...STOCKS });
  const [time, setTime] = useState(new Date());
  const [selectedStock, setSelectedStock] = useState("TMCV.NS");
  const [watchlist, setWatchlist] = useState([]);

  // ── Chat state ──
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hello! I'm **StockGPT**, your AI-powered investment research platform.\n\nI coordinate a pipeline of specialized agents — News, Filing, Ratio, Portfolio, and Risk — to give you comprehensive stock analysis.\n\nTry asking: *\"Should I invest in Tata Motors?\"* or *\"Analyze INFY vs TCS\"*\n\n> ⚠️ Research & education only. Not financial advice.",
      agents: null,
    },
  ]);
  const [agentActive, setAgentActive] = useState(-1);
  const [agentDone, setAgentDone] = useState(-1);
  const [isThinking, setIsThinking] = useState(false);

  // ── Alert state ──
  const [alertTicker, setAlertTicker] = useState("");
  const [alertPrice, setAlertPrice] = useState("");
  const [alerts, setAlerts] = useState([
    { ticker: "TMCV.NS", price: 950, dir: "above" },
    { ticker: "TSLA", price: 230, dir: "below" },
  ]);

  // ── Real Data Polling ──
  useEffect(() => {
    let active = true;

    const pollData = async () => {
      const symbols = Object.keys(STOCKS);
      if (symbols.length === 0) return;
      
      const quotes = await fetchMultipleQuotes(symbols);
      if (!active || !quotes || quotes.length === 0) return;

      setLivePrice((prev) => {
        const next = { ...prev };
        quotes.forEach(q => {
          const t = q.symbol;
          if (next[t]) {
            next[t] = {
              ...next[t],
              price: q.regularMarketPrice || next[t].price,
              change: q.regularMarketChange || next[t].change,
              pct: q.regularMarketChangePercent || next[t].pct,
              mcap: q.marketCap ? "$" + (q.marketCap / 1e9).toFixed(1) + "B" : next[t].mcap,
              currency: q.currency || next[t].currency,
            };
            STOCKS[t] = { ...STOCKS[t], ...next[t] };
          }
        });
        return next;
      });
    };

    pollData();
    const id = setInterval(pollData, 15000);

    // Initial Watchlist load from DB
    fetch("http://127.0.0.1:8000/api/watchlist")
      .then(res => res.json())
      .then(data => {
        if (data && data.watchlist) {
          const tickers = data.watchlist.map(w => w.ticker);
          setWatchlist(tickers.length > 0 ? tickers : WATCHLIST_DEFAULT);
        }
      })
      .catch(err => console.error("Failed to load watchlist from DB", err));

    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  // ── Clock ──
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // ── Navigation helpers ──
  const handleViewChart = (ticker) => {
    setSelectedStock(ticker);
    navigate("/charts");
  };

  const handleAddCustomStock = (ticker, name) => {
    const upTicker = ticker.toUpperCase();
    if (!STOCKS[upTicker]) {
      const newStock = {
        name: name || upTicker,
        price: 0,
        change: 0,
        pct: 0,
        sector: "Custom",
        market: upTicker.endsWith(".NS") || upTicker.endsWith(".BO") ? "NSE" : "CUSTOM",
        mcap: "N/A",
        currency: upTicker.endsWith(".NS") || upTicker.endsWith(".BO") ? "INR" : "USD",
      };
      STOCKS[upTicker] = newStock;
      setLivePrice((prev) => ({ ...prev, [upTicker]: newStock }));
    }
    setSelectedStock(upTicker);
  };

  const handleRemoveStock = (ticker) => {
    const keys = Object.keys(livePrice);
    if (keys.length <= 1) return; // Prevent removing the last stock
    
    delete STOCKS[ticker];
    setLivePrice((prev) => {
      const next = { ...prev };
      delete next[ticker];
      return next;
    });

    if (selectedStock === ticker) {
      setSelectedStock(keys.find(k => k !== ticker));
    }
    
    setWatchlist(prev => prev.filter(t => t !== ticker));
    fetch(`http://127.0.0.1:8000/api/watchlist/${ticker}`, { method: 'DELETE' }).catch(console.error);
    setAlerts(prev => prev.filter(a => a.ticker !== ticker));
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="app-layout">
      {/* ── Sidebar (Left Column) ── */}
      <Sidebar />

      {/* ── Main Content (Right Column) ── */}
      <div className="app-main">
        {/* Top Header */}
        <header className="header">
          <div className="ticker-strip">
            {Object.entries(livePrice).slice(0, 8).map(([ticker, s]) => {
              const up = s.pct >= 0;
              return (
                <button key={ticker} className="ticker-item" onClick={() => handleViewChart(ticker)}>
                  <span className="ticker-symbol">{ticker.replace(".NS", "")}</span>
                  <span className="ticker-price">${s.price.toLocaleString()}</span>
                  <span className={`ticker-change ${up ? "up" : "down"}`}>{up ? "▲" : "▼"}{Math.abs(s.pct).toFixed(2)}%</span>
                </button>
              );
            })}
          </div>

          <div className="header-right">
            <div className="live-indicator">
              <span className="live-dot" />
              <span className="live-label">LIVE</span>
            </div>
            <span className="header-clock">{time.toLocaleTimeString()}</span>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="page-content">
          <Routes>
            {/* MVP Core Pages */}
            <Route path="/" element={<DashboardPage />} />
            <Route 
              path="/chat" 
              element={
                <ChatPage
                  messages={messages} setMessages={setMessages}
                  query={query} setQuery={setQuery}
                  agentActive={agentActive} setAgentActive={setAgentActive}
                  agentDone={agentDone} setAgentDone={setAgentDone}
                  isThinking={isThinking} setIsThinking={setIsThinking}
                  livePrice={livePrice} onViewChart={handleViewChart}
                />
              } 
            />
            <Route 
              path="/charts" 
              element={
                <ChartPage
                  selectedStock={selectedStock} setSelectedStock={setSelectedStock}
                  livePrice={livePrice}
                  watchlist={watchlist} setWatchlist={setWatchlist}
                  onAddCustomStock={handleAddCustomStock}
                  onRemoveStock={handleRemoveStock}
                />
              } 
            />
            <Route path="/company" element={<CompanyProfilePage />} />
            <Route path="/financials" element={<FinancialsPage />} />
            <Route path="/news" element={<NewsPage />} />
            <Route 
              path="/watchlist" 
              element={
                <WatchlistPage
                  watchlist={watchlist} setWatchlist={setWatchlist} livePrice={livePrice}
                  onViewChart={handleViewChart} onRemoveStock={handleRemoveStock}
                />
              } 
            />
            <Route 
              path="/alerts" 
              element={
                <AlertsPage
                  alerts={alerts} setAlerts={setAlerts}
                  alertTicker={alertTicker} setAlertTicker={setAlertTicker}
                  alertPrice={alertPrice} setAlertPrice={setAlertPrice}
                  livePrice={livePrice}
                />
              } 
            />

            {/* Future Placeholder Pages */}
            <Route path="/markets" element={<MarketsPage />} />
            <Route path="/explorer" element={<ExplorerPage />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/portfolio" element={<PortfolioPage />} />
            <Route path="/screener" element={<ScreenerPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
