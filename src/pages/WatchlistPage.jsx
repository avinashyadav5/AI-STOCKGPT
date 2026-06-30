import { STOCKS, C, generateCandleData } from "../data/stocks";
import Sparkline from "../components/Sparkline";

export default function WatchlistPage({ watchlist, setWatchlist, livePrice, onViewChart }) {
  return (
    <div className="watchlist-page">
      <div className="section-heading">
        My Watchlist
        <span className="section-count">{watchlist.length}</span>
      </div>
      <div className="watchlist-table">
        <div className="wl-header">
          <span className="wl-col wl-symbol">Symbol</span>
          <span className="wl-col wl-name">Name</span>
          <span className="wl-col wl-price">Price</span>
          <span className="wl-col wl-change">Change</span>
          <span className="wl-col wl-pct">Chg%</span>
          <span className="wl-col wl-trend">Trend</span>
          <span className="wl-col wl-action"></span>
        </div>
        {watchlist.map((ticker, i) => {
          const s = livePrice[ticker] || STOCKS[ticker];
          const cdata = generateCandleData(s.price, 20);
          const up = s.pct >= 0;
          return (
            <div key={ticker} className="wl-row" onClick={() => onViewChart(ticker)} style={{ animationDelay: `${i * 0.05}s` }}>
              <span className="wl-col wl-symbol"><span className="wl-ticker-badge">{ticker.replace(".NS", "")}</span></span>
              <span className="wl-col wl-name">{s.name}</span>
              <span className="wl-col wl-price">${livePrice[ticker]?.price.toLocaleString()}</span>
              <span className={`wl-col wl-change ${up ? "up" : "down"}`}>{up ? "+" : ""}{s.change.toFixed(2)}</span>
              <span className={`wl-col wl-pct ${up ? "up" : "down"}`}>{up ? "+" : ""}{s.pct.toFixed(2)}%</span>
              <span className="wl-col wl-trend"><Sparkline data={cdata} color={up ? C.emerald : C.crimson} /></span>
              <span className="wl-col wl-action" onClick={(e) => { e.stopPropagation(); onRemoveStock(ticker); }}>
                <button className="alert-remove-btn" title="Remove from watchlist">×</button>
              </span>
            </div>
          );
        })}
      </div>
      <div className="watchlist-hint">Click any row to view the full chart. Prices update live.</div>
    </div>
  );
}
