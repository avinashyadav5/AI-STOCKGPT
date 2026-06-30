import { STOCKS } from "../data/stocks";

export default function AlertsPage({ alerts, setAlerts, alertTicker, setAlertTicker, alertPrice, setAlertPrice, livePrice }) {
  return (
    <div className="alerts-page">
      <div className="section-heading">Price Alerts</div>
      <div className="alert-form">
        <select id="alert-ticker-select" value={alertTicker} onChange={(e) => setAlertTicker(e.target.value)} className="alert-select">
          <option value="">Select ticker…</option>
          {Object.keys(STOCKS).map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <input id="alert-price-input" value={alertPrice} onChange={(e) => setAlertPrice(e.target.value)} placeholder="Target price" className="alert-input" type="number" />
        <button className="alert-add-btn" onClick={() => {
          if (!alertTicker || !alertPrice) return;
          const s = livePrice[alertTicker] || STOCKS[alertTicker];
          const dir = +alertPrice > s.price ? "above" : "below";
          setAlerts((prev) => [...prev, { ticker: alertTicker, price: +alertPrice, dir }]);
          setAlertTicker(""); setAlertPrice("");
        }}>+ Add Alert</button>
      </div>
      <div className="alert-list">
        {alerts.map((a, i) => {
          const s = livePrice[a.ticker] || STOCKS[a.ticker];
          const triggered = a.dir === "above" ? s.price >= a.price : s.price <= a.price;
          return (
            <div key={i} className={`alert-card ${triggered ? "triggered" : ""}`} style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="alert-info">
                <span className="alert-ticker">{a.ticker.replace(".NS", "")}</span>
                <span className="alert-desc">Alert when price goes {a.dir} <strong>${a.price.toLocaleString()}</strong></span>
                <span className="alert-current">Current: ${s.price.toLocaleString()}</span>
              </div>
              <div className="alert-actions">
                {triggered && <span className="alert-triggered-badge">🔔 TRIGGERED</span>}
                <button className="alert-remove-btn" onClick={() => setAlerts((prev) => prev.filter((_, j) => j !== i))}>×</button>
              </div>
            </div>
          );
        })}
        {alerts.length === 0 && <div className="alert-empty">No alerts set. Add one above to get started.</div>}
      </div>
    </div>
  );
}
