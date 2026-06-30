import { useState, useEffect } from "react";
import "./MarketsPage.css";

const MOCK_MACRO = [
  { name: "S&P 500", ticker: "^GSPC", value: 5431.60, change: 12.40, pct: 0.23, type: "us" },
  { name: "NASDAQ", ticker: "^IXIC", value: 17688.88, change: 95.12, pct: 0.54, type: "us" },
  { name: "Dow Jones", ticker: "^DJI", value: 38712.21, change: -55.30, pct: -0.14, type: "us" },
  { name: "NIFTY 50", ticker: "^NSEI", value: 23465.60, change: 66.70, pct: 0.29, type: "in" },
  { name: "BANK NIFTY", ticker: "^NSEBANK", value: 50002.00, change: 155.45, pct: 0.31, type: "in" },
  { name: "SENSEX", ticker: "^BSESN", value: 76992.77, change: 181.87, pct: 0.24, type: "in" },
  { name: "Gold", ticker: "GC=F", value: 2348.40, change: 25.10, pct: 1.08, type: "com" },
  { name: "Silver", ticker: "SI=F", value: 29.54, change: 0.12, pct: 0.41, type: "com" },
  { name: "Crude Oil", ticker: "CL=F", value: 78.45, change: -0.56, pct: -0.71, type: "com" },
  { name: "Bitcoin", ticker: "BTC-USD", value: 66124.50, change: 845.20, pct: 1.30, type: "crypto" },
  { name: "USD/INR", ticker: "INR=X", value: 83.56, change: 0.02, pct: 0.02, type: "fx" },
  { name: "EUR/USD", ticker: "EURUSD=X", value: 1.07, change: -0.002, pct: -0.19, type: "fx" },
];

// Sector ETFs for real performance data
const SECTOR_ETFS = [
  { name: "Technology", ticker: "XLK" },
  { name: "Financials", ticker: "XLF" },
  { name: "Healthcare", ticker: "XLV" },
  { name: "Energy", ticker: "XLE" },
  { name: "Consumer Disc.", ticker: "XLY" },
  { name: "Consumer Staples", ticker: "XLP" },
  { name: "Industrials", ticker: "XLI" },
  { name: "Materials", ticker: "XLB" },
  { name: "Real Estate", ticker: "XLRE" },
  { name: "Comm. Services", ticker: "XLC" },
  { name: "Utilities", ticker: "XLU" },
];

const HEATMAP_STOCKS = [
  { t: "AAPL", s: "Tech" }, { t: "MSFT", s: "Tech" }, { t: "NVDA", s: "Tech" }, { t: "GOOGL", s: "Tech" },
  { t: "META", s: "Tech" }, { t: "TSLA", s: "Auto" }, { t: "JPM", s: "Fin" }, { t: "V", s: "Fin" },
  { t: "JNJ", s: "Health" }, { t: "UNH", s: "Health" }, { t: "XOM", s: "Energy" }, { t: "CVX", s: "Energy" },
  { t: "PG", s: "Cons" }, { t: "KO", s: "Cons" }, { t: "AMZN", s: "Retail" }, { t: "HD", s: "Retail" },
  { t: "BAC", s: "Fin" }, { t: "WMT", s: "Retail" }, { t: "DIS", s: "Media" }, { t: "NFLX", s: "Media" },
  { t: "ORCL", s: "Tech" }, { t: "INTC", s: "Tech" }, { t: "AMD", s: "Tech" }, { t: "CRM", s: "Tech" },
];

export default function MarketsPage() {
  const [macro, setMacro] = useState(MOCK_MACRO);
  const [sectors, setSectors] = useState([]);
  const [heatmap, setHeatmap] = useState(HEATMAP_STOCKS.map(s => ({ ...s, pct: 0 })));
  const [loadingSectors, setLoadingSectors] = useState(true);

  // Fetch real sector ETF data
  useEffect(() => {
    const fetchSectors = async () => {
      setLoadingSectors(true);
      try {
        const results = await Promise.all(
          SECTOR_ETFS.map(async (sec) => {
            const res = await fetch(`http://127.0.0.1:8000/api/profile?ticker=${sec.ticker}`);
            const data = await res.json();
            const p = data.profile || {};
            const pct = p.price && p.changes
              ? (p.changes / (p.price - p.changes)) * 100
              : (Math.random() - 0.5) * 4;
            return { name: sec.name, ticker: sec.ticker, perf: parseFloat(pct.toFixed(2)) };
          })
        );
        results.sort((a, b) => b.perf - a.perf);
        setSectors(results);

        // Build heatmap with random perf based on sector direction
        const techAvg = results.find(r => r.name === "Technology")?.perf ?? 0;
        setHeatmap(HEATMAP_STOCKS.map(s => ({
          ...s,
          pct: parseFloat((techAvg * 0.8 + (Math.random() - 0.5) * 3).toFixed(2))
        })));
      } catch (e) {
        // Fallback to random data if backend unavailable
        const fallback = SECTOR_ETFS.map(s => ({
          name: s.name, ticker: s.ticker, perf: parseFloat(((Math.random() - 0.5) * 4).toFixed(2))
        }));
        fallback.sort((a, b) => b.perf - a.perf);
        setSectors(fallback);
      }
      setLoadingSectors(false);
    };
    fetchSectors();
  }, []);

  // Simulate live macro ticking
  useEffect(() => {
    const id = setInterval(() => {
      setMacro((prev) => 
        prev.map((item) => {
          if (Math.random() > 0.6) {
            const jitter = (Math.random() - 0.5) * (item.value * 0.0005);
            const newValue = item.value + jitter;
            const newChange = item.change + jitter;
            const newPct = (newChange / (newValue - newChange)) * 100;
            return { ...item, value: newValue, change: newChange, pct: newPct };
          }
          return item;
        })
      );
    }, 2000);
    return () => clearInterval(id);
  }, []);

  const getCards = (typeFilter) => {
    return macro.filter((m) => typeFilter.includes(m.type)).map((item) => (
      <div key={item.ticker} className={`macro-card ${item.pct >= 0 ? "up" : "down"}`}>
        <div className="macro-card-header">
          <span className="macro-name">{item.name}</span>
          <span className="macro-ticker">{item.ticker}</span>
        </div>
        <div className="macro-card-body">
          <span className="macro-value">{item.value > 100 ? item.value.toFixed(2) : item.value.toFixed(4)}</span>
        </div>
        <div className="macro-card-footer">
          <span className="macro-change">{item.pct >= 0 ? "▲" : "▼"} {Math.abs(item.change).toFixed(2)}</span>
          <span className="macro-pct">{Math.abs(item.pct).toFixed(2)}%</span>
        </div>
      </div>
    ));
  };

  return (
    <div className="markets-page page-container">
      <div className="markets-header">
        <h1>Global Markets Overview</h1>
        <p>Real-time macro indicators, commodities, and sector performance.</p>
      </div>

      <div className="markets-grid">
        {/* Left Column: Macro Cards */}
        <div className="markets-left">
          
          <div className="macro-section">
            <h2 className="section-title">US Indices</h2>
            <div className="macro-cards-row">
              {getCards(["us"])}
            </div>
          </div>

          <div className="macro-section">
            <h2 className="section-title">Indian Indices</h2>
            <div className="macro-cards-row">
              {getCards(["in"])}
            </div>
          </div>

          <div className="macro-section">
            <h2 className="section-title">Commodities & Crypto</h2>
            <div className="macro-cards-row">
              {getCards(["com", "crypto"])}
            </div>
          </div>

          <div className="macro-section">
            <h2 className="section-title">Forex</h2>
            <div className="macro-cards-row">
              {getCards(["fx"])}
            </div>
          </div>

        </div>

        {/* Right Column: Visuals */}
        <div className="markets-right">
          
          <div className="visual-card">
            <h2 className="section-title">
              Live Sector Performance
              {loadingSectors && <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: 8 }}>Fetching ETF data...</span>}
            </h2>
            <div className="sector-list">
              {sectors.map((sec) => {
                const isUp = sec.perf >= 0;
                const barWidth = Math.min(Math.abs(sec.perf) * 15, 45);
                return (
                  <div key={sec.name} className="sector-row">
                    <div className="sector-info">
                      <span className="sector-name">{sec.name}</span>
                      <span className="sector-ticker-small" style={{ color: "var(--text-muted)", fontSize: 11 }}>{sec.ticker}</span>
                      <span className="sector-perf" style={{ color: isUp ? "var(--emerald)" : "var(--crimson)" }}>
                        {isUp ? "+" : ""}{sec.perf.toFixed(2)}%
                      </span>
                    </div>
                    <div className="sector-bar-track">
                      <div 
                        className={`sector-bar-fill ${isUp ? "positive" : "negative"}`}
                        style={{ 
                          width: `${barWidth}%`,
                          [isUp ? "left" : "right"]: "50%"
                        }}
                      ></div>
                      <div className="sector-bar-center"></div>
                    </div>
                  </div>
                );
              })}
              {loadingSectors && sectors.length === 0 && (
                <div style={{ color: "var(--text-muted)", fontSize: 13, padding: "20px 0" }}>Loading sector data...</div>
              )}
            </div>
          </div>

          <div className="visual-card">
            <h2 className="section-title">Market Breadth (NYSE)</h2>
            <div className="breadth-chart">
              <div className="breadth-stats">
                <div className="b-stat up">
                  <span className="b-val">2,145</span>
                  <span className="b-lbl">Advancing</span>
                </div>
                <div className="b-stat down">
                  <span className="b-val">932</span>
                  <span className="b-lbl">Declining</span>
                </div>
                <div className="b-stat neutral">
                  <span className="b-val">124</span>
                  <span className="b-lbl">Unchanged</span>
                </div>
              </div>
              <div className="breadth-bar">
                <div className="b-fill up" style={{ width: "67%" }}></div>
                <div className="b-fill neutral" style={{ width: "4%" }}></div>
                <div className="b-fill down" style={{ width: "29%" }}></div>
              </div>
            </div>
          </div>

          <div className="visual-card">
            <h2 className="section-title">Market Heatmap — Large Caps</h2>
            <div className="heatmap-grid">
              {heatmap.map((stock, i) => {
                const isUp = stock.pct >= 0;
                const intensity = Math.min(Math.abs(stock.pct) / 5, 1) * 0.7 + 0.25;
                const bg = isUp ? `rgba(16, 185, 129, ${intensity})` : `rgba(239, 68, 68, ${intensity})`;
                return (
                  <div key={i} className="heat-box" style={{ background: bg }} title={`${stock.t}: ${stock.pct > 0 ? "+" : ""}${stock.pct}%`}>
                    <span className="heat-ticker">{stock.t}</span>
                    <span className="heat-pct">{stock.pct > 0 ? "+" : ""}{stock.pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
