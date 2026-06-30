import { useState, useEffect } from "react";
import "./PortfolioPage.css";

// Using real backend data

export default function PortfolioPage() {
  const cash = 0.00;
  
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAdd, setShowAdd] = useState(false);
  const [addTicker, setAddTicker] = useState("");
  const [addShares, setAddShares] = useState(0);
  const [addCost, setAddCost] = useState(0);
  const [addCurrency, setAddCurrency] = useState("USD");

  const fetchPortfolio = async () => {
    setLoading(true);
    try {
      const dbRes = await fetch("/api/watchlist");
      const dbData = await dbRes.json();
      const userHoldings = dbData.watchlist || [];

      const promises = userHoldings.map(h => 
        fetch(`/api/profile?ticker=${h.ticker}`)
          .then(res => res.json())
          .then(data => ({
            ...h,
            avgCost: parseFloat(h.avg_cost),
            name: data.profile?.companyName || h.ticker,
            price: data.profile?.price || 0,
            sector: data.profile?.sector || "Unknown"
          }))
          .catch(() => ({ ...h, avgCost: parseFloat(h.avg_cost), name: h.ticker, price: 0, sector: "Unknown" }))
      );
      const results = await Promise.all(promises);
      setHoldings(results);
    } catch (err) {
      console.error("Failed to load portfolio", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const handleSavePosition = async () => {
    if (!addTicker) return;
    try {
      const res = await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          ticker: addTicker.toUpperCase(), 
          shares: Number(addShares), 
          avg_cost: String(addCost),
          currency: addCurrency
        })
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Server returned ${res.status}: ${errorText}`);
      }
      setAddTicker(""); setAddShares(0); setAddCost(0); setAddCurrency("USD"); setShowAdd(false);
      fetchPortfolio();
    } catch (error) {
      console.error("Error saving position:", error);
      alert("Failed to save position: " + error.message);
    }
  };

  const handleRemove = async (ticker) => {
    await fetch(`/api/watchlist/${ticker}`, { method: "DELETE" });
    fetchPortfolio();
  };

  const holdingsData = holdings.map(h => {
    const totalValue = h.shares * h.price;
    const totalCost = h.shares * h.avgCost;
    const returnTotal = totalValue - totalCost;
    const returnPct = totalCost > 0 ? (returnTotal / totalCost) * 100 : 0;
    return { ...h, totalValue, totalCost, returnTotal, returnPct };
  });

  const equityValue = holdingsData.reduce((acc, h) => acc + h.totalValue, 0);
  const totalValue = equityValue + cash;
  
  const totalCost = holdingsData.reduce((acc, h) => acc + h.totalCost, 0);
  const totalReturn = equityValue - totalCost;
  const totalReturnPct = totalCost > 0 ? (totalReturn / totalCost) * 100 : 0;

  // Mock sector allocation
  const sectors = {};
  holdingsData.forEach(h => {
    sectors[h.sector] = (sectors[h.sector] || 0) + h.totalValue;
  });
  
  const allocation = Object.keys(sectors).map(sec => ({
    name: sec,
    value: sectors[sec],
    pct: totalValue > 0 ? (sectors[sec] / totalValue) * 100 : 0
  }));
  if (totalValue > 0) {
    allocation.push({ name: "Cash", value: cash, pct: (cash / totalValue) * 100 });
  }

  return (
    <div className="portfolio-page page-container">
      <div className="portfolio-header">
        <h1>My Portfolio</h1>
        <p>Real-time performance and asset allocation.</p>
      </div>

      {loading ? (
        <div className="spinner" style={{ margin: '40px auto' }}></div>
      ) : (
        <>
          <div className="portfolio-summary-cards">
            <div className="port-card">
              <div className="port-card-label">Total Value</div>
              <div className="port-card-value">${totalValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
            </div>
            <div className="port-card">
              <div className="port-card-label">Total Return</div>
              <div className={`port-card-value ${totalReturn >= 0 ? "text-emerald" : "text-crimson"}`}>
                {totalReturn >= 0 ? "+$" : "-$"}{Math.abs(totalReturn).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} 
                <span className="port-card-pct">({totalReturnPct.toFixed(2)}%)</span>
              </div>
            </div>
            <div className="port-card">
              <div className="port-card-label">Available Cash</div>
              <div className="port-card-value">${cash.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
            </div>
          </div>

          <div className="portfolio-allocation">
            <h3>Asset Allocation</h3>
            <div className="alloc-bar-container">
              {allocation.map((item, i) => (
                <div 
                  key={item.name} 
                  className={`alloc-segment alloc-color-${i}`} 
                  style={{ width: `${item.pct}%` }}
                  title={`${item.name} (${item.pct.toFixed(1)}%)`}
                />
              ))}
            </div>
            <div className="alloc-legend">
              {allocation.map((item, i) => (
                <div key={item.name} className="legend-item">
                  <span className={`legend-dot alloc-bg-${i}`} />
                  <span className="legend-name">{item.name}</span>
                  <span className="legend-pct">{item.pct.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="portfolio-holdings">
            <h3>Current Holdings</h3>
            <div className="screener-table-wrapper">
              <table className="screener-table">
                <thead>
                  <tr>
                    <th>Ticker</th>
                    <th>Company</th>
                    <th className="num-col">Shares</th>
                    <th className="num-col">Avg Cost</th>
                    <th className="num-col">Current Price</th>
                    <th className="num-col">Total Value</th>
                    <th className="num-col">Total Return</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {holdingsData.map((h) => (
                    <tr key={h.ticker}>
                      <td><span className="ticker-badge">{h.ticker}</span></td>
                      <td className="company-name">{h.name}</td>
                      <td className="num-col">{h.shares}</td>
                      <td className="num-col">${h.avgCost.toFixed(2)}</td>
                      <td className="num-col">${h.price.toFixed(2)}</td>
                      <td className="num-col">${h.totalValue.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</td>
                      <td className={`num-col ${h.returnTotal >= 0 ? "text-emerald" : "text-crimson"}`}>
                        {h.returnTotal >= 0 ? "+" : "-"}${Math.abs(h.returnTotal).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})} ({h.returnPct.toFixed(2)}%)
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <button 
                          className="alert-remove-btn" 
                          title="Remove position"
                          onClick={() => handleRemove(h.ticker)}
                          style={{ background: "none", border: "none", color: "var(--textDim)", cursor: "pointer", fontSize: "16px" }}
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div style={{ marginTop: "16px" }}>
              {showAdd ? (
                <div style={{ display: "flex", gap: "10px", alignItems: "center", background: "var(--surface)", padding: "16px", borderRadius: "10px", border: "1px solid var(--border)" }}>
                  <input className="s-input" placeholder="Ticker (e.g. AAPL)" value={addTicker} onChange={(e) => setAddTicker(e.target.value)} style={{ width: "120px" }} />
                  <input className="s-input" type="number" placeholder="Shares" value={addShares} onChange={(e) => setAddShares(e.target.value)} style={{ width: "100px" }} />
                  <div style={{ display: "flex", gap: "4px" }}>
                    <select className="s-input" value={addCurrency} onChange={(e) => setAddCurrency(e.target.value)} style={{ width: "70px", padding: "8px" }}>
                      <option value="USD">USD</option>
                      <option value="INR">INR</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="CAD">CAD</option>
                      <option value="AUD">AUD</option>
                    </select>
                    <input className="s-input" type="number" placeholder="Avg Cost" value={addCost} onChange={(e) => setAddCost(e.target.value)} style={{ width: "100px" }} />
                  </div>
                  <button className="port-save-btn" onClick={handleSavePosition} style={{ background: "var(--violet)", color: "white", padding: "8px 16px", border: "none", borderRadius: "8px", cursor: "pointer" }}>Save</button>
                  <button onClick={() => setShowAdd(false)} style={{ background: "transparent", color: "var(--textDim)", border: "none", cursor: "pointer" }}>Cancel</button>
                </div>
              ) : (
                <button 
                  onClick={() => setShowAdd(true)}
                  style={{ 
                    background: "var(--surfaceElevated)", 
                    border: "1px dashed var(--textDim)", 
                    color: "var(--text)", 
                    padding: "14px 16px", 
                    borderRadius: "8px", 
                    cursor: "pointer", 
                    width: "100%",
                    fontWeight: "600",
                    transition: "all 0.2s"
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.borderColor = "var(--borderBright)"; e.currentTarget.style.background = "var(--surface)"; }}
                  onMouseOut={(e) => { e.currentTarget.style.borderColor = "var(--textDim)"; e.currentTarget.style.background = "var(--surfaceElevated)"; }}
                >
                  + Add / Edit Position
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
