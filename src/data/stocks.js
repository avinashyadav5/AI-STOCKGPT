// StockGPT — Shared Data & Helpers

export const C = {
  bg: "#050B18",
  surface: "#0A1628",
  surfaceAlt: "#0F1E35",
  surfaceElevated: "#132844",
  border: "#1A2F4A",
  borderBright: "#1E3A5F",
  borderGlow: "#2A4A6F",
  cyan: "#00D4FF",
  cyanDim: "#0088AA",
  amber: "#F59E0B",
  emerald: "#10B981",
  crimson: "#EF4444",
  violet: "#A78BFA",
  pink: "#F472B6",
  orange: "#FB923C",
  text: "#E2EAF4",
  textDim: "#8BA3C1",
  muted: "#4A6585",
  ultraDim: "#334155",
};

export const STOCKS = {
  "TMCV.NS":       { name: "Tata Motors", price: 11.21, change: +0.03, pct: +0.25, sector: "Auto", market: "NSE", mcap: "$41.4B" },
  "RELIANCE.NS":   { name: "Reliance Industries", price: 34.17, change: -0.15, pct: -0.43, sector: "Energy", market: "NSE", mcap: "$230B" },
  "INFY.NS":       { name: "Infosys", price: 20.15, change: +0.22, pct: +1.13, sector: "IT", market: "NSE", mcap: "$83.6B" },
  "HDFCBANK.NS":   { name: "HDFC Bank", price: 23.08, change: +0.06, pct: +0.27, sector: "Banking", market: "NSE", mcap: "$175B" },
  "TCS.NS":        { name: "TCS", price: 50.45, change: -0.28, pct: -0.55, sector: "IT", market: "NSE", mcap: "$182B" },
  "AAPL":          { name: "Apple Inc.", price: 213.49, change: +1.87, pct: +0.88, sector: "Tech", market: "NASDAQ", mcap: "$3.4T" },
  "NVDA":          { name: "NVIDIA", price: 891.32, change: +14.23, pct: +1.62, sector: "Tech", market: "NASDAQ", mcap: "$2.2T" },
  "TSLA":          { name: "Tesla", price: 248.61, change: -7.34, pct: -2.87, sector: "Auto", market: "NASDAQ", mcap: "$789B" },
  "TM":            { name: "Toyota Motor", price: 198.45, change: +1.20, pct: +0.61, sector: "Auto", market: "NYSE", mcap: "$265B" },
  "MSFT":          { name: "Microsoft", price: 415.32, change: +5.12, pct: +1.25, sector: "Tech", market: "NASDAQ", mcap: "$3.1T" },
  "GOOGL":         { name: "Alphabet", price: 172.40, change: -1.05, pct: -0.61, sector: "Tech", market: "NASDAQ", mcap: "$2.1T" },
  "AMZN":          { name: "Amazon", price: 185.20, change: +2.30, pct: +1.26, sector: "Consumer", market: "NASDAQ", mcap: "$1.9T" },
  "HMC":           { name: "Honda Motor", price: 34.12, change: +0.45, pct: +1.34, sector: "Auto", market: "NYSE", mcap: "$56B" },
};

export const WATCHLIST_DEFAULT = ["TMCV.NS", "RELIANCE.NS", "INFY.NS", "NVDA", "TSLA"];

export const AGENT_PIPELINE = [
  { id: "financial", label: "Financial Agent", icon: "⚡", color: "#00D4FF", desc: "Routing query to specialist agents…" },
  { id: "news",      label: "News Agent",      icon: "📰", color: "#F59E0B", desc: "Scanning 847 sources for recent coverage…" },
  { id: "filing",    label: "Filing Agent",    icon: "📋", color: "#A78BFA", desc: "Parsing Q4 annual report (RAG)…" },
  { id: "ratio",     label: "Ratio Agent",     icon: "📊", color: "#34D399", desc: "Computing P/E, EV/EBITDA, D/E ratios…" },
  { id: "portfolio", label: "Portfolio Agent", icon: "💼", color: "#FB923C", desc: "Cross-referencing portfolio exposure…" },
  { id: "risk",      label: "Risk Analysis",   icon: "🛡️", color: "#F472B6", desc: "Stress-testing against macro scenarios…" },
];

export const SPINNER = "⣾⣽⣻⢿⡿⣟⣯⣷";

export function generateCandleData(basePrice, days = 60) {
  const data = [];
  let price = basePrice * 0.88;
  for (let i = 0; i < days; i++) {
    const open = price;
    const change = (Math.random() - 0.47) * price * 0.025;
    const close = open + change;
    const high = Math.max(open, close) * (1 + Math.random() * 0.012);
    const low = Math.min(open, close) * (1 - Math.random() * 0.012);
    const vol = Math.floor(Math.random() * 8000000 + 2000000);
    data.push({ open, close, high, low, vol, day: i });
    price = close;
  }
  return data;
}

export function detectTicker(text) {
  const up = text.toUpperCase();
  for (const [ticker, stock] of Object.entries(STOCKS)) {
    if (up.includes(ticker) || up.includes(stock.name.toUpperCase().split(" ")[0]))
      return [ticker, stock];
  }
  return ["TMCV.NS", STOCKS["TMCV.NS"]];
}

export function buildResponse(ticker, stock) {
  const up = stock.pct >= 0;
  return `## ${stock.name} (${ticker}) — Research Summary\n\n**Current Price:** $${stock.price.toLocaleString()} | **Today:** ${up ? "▲" : "▼"} ${Math.abs(stock.pct).toFixed(2)}%\n\n### 📰 News Signal (News Agent)\nThree significant developments surfaced this week: (1) JLR reported record Q3 EV deliveries +34% YoY, (2) Tata Motors secured a ₹3,200 Cr EV fleet contract with the Indian government, and (3) commodity headwinds in steel pricing may compress margins by ~80bps in FY26. Sentiment score: **Bullish (7.2/10)**.\n\n### 📋 Fundamentals (Filing Agent — Annual Report RAG)\nFrom the FY25 annual report: Revenue grew **18.4% YoY** to ₹4.38L Cr. EBITDA margin expanded 220bps to **13.7%**. Net debt reduced by ₹8,400 Cr. Management guidance targets EBITDA >15% by FY27 driven by JLR electrification and domestic CV recovery.\n\n### 📊 Key Ratios (Ratio Agent)\n| Metric | Value | Sector Median |\n|--------|-------|---------------|\n| P/E (TTM) | 14.2x | 18.6x |\n| EV/EBITDA | 8.4x | 10.1x |\n| Debt/Equity | 1.18 | 0.94 |\n| ROE | 22.3% | 14.7% |\n| Current Ratio | 1.31 | 1.22 |\n\nStock appears **undervalued** relative to sector on earnings and EBITDA basis.\n\n### 💼 Portfolio Fit (Portfolio Agent)\nHigh correlation (0.72) with broader auto sector. Adding this position would increase portfolio beta to 1.18. Consider sizing at ≤4% to maintain risk budget. Diversification benefit exists vs. current IT-heavy holdings.\n\n### 🛡️ Risk Factors (Risk Analysis Agent)\n- **Macro:** GBP/INR exposure (~38% revenues from JLR UK)\n- **Execution:** EV transition capex ₹75,000 Cr through FY28\n- **Downside scenario:** If JLR volumes miss by 15%, fair value drops to ₹780\n- **Bull case:** Full JLR EV ramp, fair value ₹1,180\n\n---\n> ⚠️ **Disclaimer:** This is AI-generated research for educational purposes only. Not personalized financial advice. Past performance ≠ future results. Consult a SEBI-registered advisor before investing.`;
}
