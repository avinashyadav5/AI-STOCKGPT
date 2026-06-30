let fxRatesCache = { "USD": 1.0 };

async function getFxRate(currency) {
  if (!currency || currency === "USD") return 1.0;
  if (fxRatesCache[currency]) return fxRatesCache[currency];
  try {
    const res = await fetch(`/api/finance/v8/finance/chart/${currency}USD=X?interval=1d&range=1d`);
    if (res.ok) {
      const data = await res.json();
      const price = data.chart.result?.[0]?.meta?.regularMarketPrice;
      if (price) {
        fxRatesCache[currency] = price;
        return price;
      }
    }
  } catch (e) {}
  return 1.0;
}

export async function fetchStockQuote(symbol) {
  try {
    const res = await fetch(`/api/finance/v8/finance/chart/${symbol}?interval=1d&range=1d`);
    if (!res.ok) throw new Error("Failed to fetch");
    const data = await res.json();
    const result = data.chart.result?.[0];
    if (!result) return null;
    
    const meta = result.meta;
    const rate = await getFxRate(meta.currency);
    meta.regularMarketPrice *= rate;
    meta.previousClose *= rate;
    
    return meta;
  } catch (err) {
    console.error(`Error fetching quote for ${symbol}:`, err);
    return null;
  }
}

export async function fetchMultipleQuotes(symbols) {
  try {
    const promises = symbols.map(async (sym) => {
      try {
        const res = await fetch(`/api/finance/v8/finance/chart/${sym}?interval=1d&range=1d`);
        if (!res.ok) return null;
        const data = await res.json();
        const meta = data.chart.result?.[0]?.meta;
        if (!meta) return null;
        
        const rate = await getFxRate(meta.currency);
        const price = meta.regularMarketPrice * rate;
        const prev = (meta.previousClose || price) * rate;
        const change = price - prev;
        const pct = prev ? (change / prev) * 100 : 0;
        
        return {
          symbol: meta.symbol,
          regularMarketPrice: price,
          regularMarketChange: change,
          regularMarketChangePercent: pct,
          currency: "USD",
        };
      } catch {
        return null;
      }
    });
    const results = await Promise.all(promises);
    return results.filter(Boolean);
  } catch (err) {
    console.error(`Error fetching quotes:`, err);
    return [];
  }
}

export async function fetchHistoricalData(symbol, range = '3mo', interval = '1d') {
  try {
    const res = await fetch(`/api/finance/v8/finance/chart/${symbol}?interval=${interval}&range=${range}`);
    if (!res.ok) throw new Error("Failed to fetch");
    const data = await res.json();
    const result = data.chart.result?.[0];
    if (!result) return [];
    
    const timestamps = result.timestamp || [];
    const quote = result.indicators.quote[0] || {};
    const meta = result.meta || {};
    
    const rate = await getFxRate(meta.currency);
    
    const historical = [];
    for (let i = 0; i < timestamps.length; i++) {
      if (quote.close[i] !== null && quote.close[i] !== undefined) {
        historical.push({
          time: timestamps[i] * 1000,
          open: quote.open[i] * rate,
          high: quote.high[i] * rate,
          low: quote.low[i] * rate,
          close: quote.close[i] * rate,
          vol: quote.volume[i]
        });
      }
    }
    return historical;
  } catch (err) {
    console.error(`Error fetching historical for ${symbol}:`, err);
    return [];
  }
}

export async function searchTickers(query) {
  try {
    const res = await fetch(`/api/finance/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=6&newsCount=0`);
    if (!res.ok) throw new Error("Failed to search");
    const data = await res.json();
    return data.quotes || [];
  } catch (err) {
    console.error(`Error searching for ${query}:`, err);
    return [];
  }
}
