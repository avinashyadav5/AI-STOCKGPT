import { useState, useEffect } from "react";
import { STOCKS, C } from "../data/stocks";
import { searchTickers } from "../api/yahoo";
import PriceChart from "../components/PriceChart";

export default function ChartPage({ selectedStock, setSelectedStock, livePrice, watchlist, setWatchlist, onAddCustomStock, onRemoveStock }) {
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTicker, setNewTicker] = useState("");
  const [newName, setNewName] = useState("");
  const stock = livePrice[selectedStock] || STOCKS[selectedStock];

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (search.trim()) {
        setIsSearching(true);
        const results = await searchTickers(search);
        const newResults = results.filter(r => r.symbol && !STOCKS[r.symbol.toUpperCase()]);
        setSearchResults(newResults);
        setIsSearching(false);
      } else {
        setSearchResults([]);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const filteredStocks = Object.keys(STOCKS).filter((t) => 
    t.toLowerCase().includes(search.toLowerCase()) || 
    STOCKS[t].name.toLowerCase().includes(search.toLowerCase())
  );

  const inWatchlist = watchlist.includes(selectedStock);
  const toggleWatchlist = () => {
    if (inWatchlist) {
      setWatchlist(watchlist.filter(t => t !== selectedStock));
      fetch(`http://127.0.0.1:8000/api/watchlist/${selectedStock}`, { method: 'DELETE' }).catch(console.error);
    } else {
      setWatchlist([...watchlist, selectedStock]);
      fetch(`http://127.0.0.1:8000/api/watchlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker: selectedStock, shares: 0, avg_cost: "0.0" })
      }).catch(console.error);
    }
  };

  const ratios = [
    { label: "P/E (TTM)", value: "14.2x", color: C.cyan },
    { label: "P/B", value: "3.1x", color: C.cyan },
    { label: "EV/EBITDA", value: "8.4x", color: C.violet },
    { label: "ROE", value: "22.3%", color: C.emerald },
    { label: "ROA", value: "7.8%", color: C.emerald },
    { label: "D/E", value: "1.18", color: C.amber },
    { label: "Current Ratio", value: "1.31", color: C.cyan },
    { label: "Div Yield", value: "0.43%", color: C.orange },
  ];

  const indicators = [
    { label: "RSI (14)", value: "58.3", note: "Neutral", noteColor: C.textDim },
    { label: "MACD", value: "+2.14", note: "Bullish", noteColor: C.emerald },
    { label: "BB Upper", value: "$" + (stock.price * 1.04).toFixed(2), note: "", noteColor: C.textDim },
    { label: "50 DMA", value: "$" + (stock.price * 0.97).toFixed(2), note: "Above", noteColor: C.emerald },
    { label: "200 DMA", value: "$" + (stock.price * 0.91).toFixed(2), note: "Above", noteColor: C.emerald },
    { label: "Vol (3M avg)", value: "4.2M", note: "", noteColor: C.textDim },
  ];

  return (
    <div className="chart-page">
      <div style={{ display: 'flex', gap: 10, marginBottom: 4, position: 'relative' }}>
        <input 
          type="text" 
          placeholder="Search company or ticker..." 
          value={search} 
          onChange={(e) => {
            const val = e.target.value;
            setSearch(val);
            if (val.trim() !== "") {
              const matches = Object.keys(STOCKS).filter((t) => 
                t.toLowerCase().includes(val.toLowerCase()) || 
                STOCKS[t].name.toLowerCase().includes(val.toLowerCase())
              );
              if (matches.length > 0 && matches[0] !== selectedStock) {
                setSelectedStock(matches[0]);
              }
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setSearch("");
              setSearchResults([]);
            }
          }}
          className="alert-input"
          style={{ flex: 1, maxWidth: 300, padding: '8px 12px' }}
        />

        {(searchResults.length > 0 || isSearching) && search.trim() !== "" && (
          <div style={{ position: 'absolute', top: 40, left: 0, width: 300, background: 'var(--surface-elevated)', border: `1px solid var(--border)`, borderRadius: 8, zIndex: 100, maxHeight: 250, overflowY: 'auto', boxShadow: '0 8px 16px rgba(0,0,0,0.5)' }}>
            {isSearching && <div style={{ padding: 12, color: 'var(--text-muted)' }}>Searching Yahoo Finance...</div>}
            {!isSearching && searchResults.map(r => (
              <div 
                key={r.symbol}
                onClick={() => {
                  onAddCustomStock(r.symbol, r.shortname || r.longname);
                  setSearch("");
                  setSearchResults([]);
                }}
                style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
                onMouseOver={e => e.currentTarget.style.background = 'var(--border)'}
                onMouseOut={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, color: 'var(--text)' }}>{r.symbol}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>{r.exchange}</span>
                </div>
                <span style={{ color: 'var(--text-dim)', fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.shortname || r.longname}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="stock-selector">
        {filteredStocks.map((t) => (
          <div key={t} className={`stock-chip ${selectedStock === t ? "active" : ""}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 8px' }}>
            <span onClick={() => setSelectedStock(t)} style={{ cursor: 'pointer' }}>
              {t.replace(".NS", "")}
            </span>
            <span 
              onClick={(e) => { e.stopPropagation(); onRemoveStock(t); }} 
              style={{ cursor: 'pointer', opacity: 0.5, fontSize: 14, lineHeight: 1 }}
              onMouseOver={e => e.target.style.opacity = 1}
              onMouseOut={e => e.target.style.opacity = 0.5}
            >
              ×
            </span>
          </div>
        ))}
        {filteredStocks.length === 0 && search.trim() !== "" && !showAddForm && (
          <button 
            className="alert-add-btn" 
            style={{ padding: '6px 12px', fontSize: 11 }}
            onClick={() => {
              setShowAddForm(true);
              setNewTicker(search.toUpperCase());
            }}
          >
            + Add custom stock "{search}"
          </button>
        )}
      </div>

      {showAddForm && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 14, padding: 14, background: 'var(--surface-alt)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
          <input 
            type="text" 
            placeholder="Ticker (e.g. META)" 
            value={newTicker} 
            onChange={(e) => setNewTicker(e.target.value)}
            className="alert-input"
            style={{ flex: 1 }}
          />
          <input 
            type="text" 
            placeholder="Company Name" 
            value={newName} 
            onChange={(e) => setNewName(e.target.value)}
            className="alert-input"
            style={{ flex: 2 }}
          />
          <button 
            className="alert-add-btn" 
            onClick={() => {
              if (newTicker.trim()) {
                onAddCustomStock(newTicker.trim(), newName.trim());
                setShowAddForm(false);
                setSearch("");
              }
            }}
          >
            Save
          </button>
          <button 
            className="alert-remove-btn" 
            onClick={() => setShowAddForm(false)}
          >×</button>
        </div>
      )}

      <div className="price-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14 }}>
          <div className="price-main">
            <span className="price-value">${livePrice[selectedStock]?.price?.toLocaleString() || stock.price?.toLocaleString()}</span>
            <span className={`price-change ${stock.pct >= 0 ? "up" : "down"}`}>
              {stock.pct >= 0 ? "▲" : "▼"} {Math.abs(stock.change).toFixed(2)} ({Math.abs(stock.pct).toFixed(2)}%)
            </span>
          </div>
          <button 
            className="alert-add-btn" 
            onClick={toggleWatchlist}
            style={{ 
              background: inWatchlist ? 'transparent' : '', 
              border: inWatchlist ? '1px solid var(--border)' : '',
              color: inWatchlist ? 'var(--text-muted)' : '',
              boxShadow: inWatchlist ? 'none' : ''
            }}
          >
            {inWatchlist ? "− Remove from Watchlist" : "+ Add to Watchlist"}
          </button>
        </div>
        <div className="price-meta">
          <span className="price-name">{stock.name}</span>
          <span className="price-sep">·</span>
          <span className="price-ticker">{selectedStock}</span>
          <span className="price-sep">·</span>
          <span className="price-sector">{stock.sector}</span>
          <span className="price-sep">·</span>
          <span className="price-mcap">{stock.mcap}</span>
          <span className="live-badge-small"><span className="live-dot" /> LIVE</span>
        </div>
      </div>

      <PriceChart ticker={selectedStock} stock={livePrice[selectedStock] || stock} />

      <div className="section-heading">Technical Indicators</div>
      <div className="indicator-grid">
        {indicators.map((ind) => (
          <div key={ind.label} className="indicator-card">
            <div className="indicator-label">{ind.label}</div>
            <div className="indicator-value">{ind.value}</div>
            {ind.note && <div className="indicator-note" style={{ color: ind.noteColor }}>{ind.note}</div>}
          </div>
        ))}
      </div>

      <div className="section-heading">Fundamental Ratios</div>
      <div className="ratio-grid">
        {ratios.map((r) => (
          <div key={r.label} className="ratio-card">
            <div className="ratio-label">{r.label}</div>
            <div className="ratio-value" style={{ color: r.color }}>{r.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
