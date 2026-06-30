import { useRef, useEffect, useState } from "react";
import { C } from "../data/stocks";
import { fetchHistoricalData } from "../api/yahoo";

export default function PriceChart({ ticker, stock }) {
  const canvasRef = useRef(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const loadData = async () => {
      setLoading(true);
      const hist = await fetchHistoricalData(ticker, '3mo', '1d');
      if (active) {
        setData(hist);
        setLoading(false);
      }
    };
    loadData();
    return () => { active = false; };
  }, [ticker]);

  useEffect(() => {
    if (loading || data.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    const W = rect.width, H = rect.height;
    const pad = { top: 24, bottom: 44, left: 64, right: 24 };
    const chartW = W - pad.left - pad.right;
    const chartH = H - pad.top - pad.bottom;

    ctx.clearRect(0, 0, W, H);
    const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
    bgGrad.addColorStop(0, "#0A1628");
    bgGrad.addColorStop(1, "#050B18");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    const prices = data.flatMap((d) => [d.high, d.low]);
    const minP = Math.min(...prices);
    const maxP = Math.max(...prices);
    const range = maxP - minP;
    const toY = (p) => pad.top + chartH - ((p - minP) / range) * chartH;

    // Grid
    for (let i = 0; i <= 5; i++) {
      const y = pad.top + (i / 5) * chartH;
      ctx.strokeStyle = i === 0 || i === 5 ? C.border : "#0F1E35";
      ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(W - pad.right, y); ctx.stroke();
      const price = maxP - (i / 5) * range;
      ctx.fillStyle = C.textDim;
      ctx.font = "11px 'JetBrains Mono', monospace";
      ctx.textAlign = "right";
      ctx.fillText(price.toFixed(0), pad.left - 10, y + 4);
    }

    // MA20
    const ma20 = data.map((_, i) => {
      if (i < 19) return null;
      return data.slice(i - 19, i + 1).map((d) => d.close).reduce((a, b) => a + b) / 20;
    });
    ctx.strokeStyle = C.amber + "AA";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 3]);
    ctx.beginPath();
    let started = false;
    data.forEach((d, i) => {
      if (ma20[i] === null) return;
      const x = pad.left + (i / (data.length - 1)) * chartW;
      const y = toY(ma20[i]);
      if (!started) { ctx.moveTo(x, y); started = true; } else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.setLineDash([]);

    // Candles
    const cw = Math.max((chartW / data.length) * 0.55, 3);
    data.forEach((d, i) => {
      const x = pad.left + (i / (data.length - 1)) * chartW;
      const isUp = d.close >= d.open;
      const color = isUp ? C.emerald : C.crimson;
      ctx.strokeStyle = color + "CC";
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x, toY(d.high)); ctx.lineTo(x, toY(d.low)); ctx.stroke();
      const bodyTop = Math.min(toY(d.open), toY(d.close));
      const bodyH = Math.abs(toY(d.open) - toY(d.close)) || 1;
      ctx.fillStyle = color + "DD";
      ctx.fillRect(x - cw / 2, bodyTop, cw, bodyH);
      if (i > data.length - 5) {
        ctx.shadowColor = color; ctx.shadowBlur = 6;
        ctx.fillRect(x - cw / 2, bodyTop, cw, bodyH);
        ctx.shadowBlur = 0;
      }
    });

    // Volume
    const maxVol = Math.max(...data.map((d) => d.vol));
    data.forEach((d, i) => {
      const x = pad.left + (i / (data.length - 1)) * chartW;
      const barH = (d.vol / maxVol) * 24;
      const isUp = d.close >= d.open;
      ctx.fillStyle = (isUp ? C.emerald : C.crimson) + "33";
      ctx.fillRect(x - cw / 2, H - pad.bottom + 8, cw, barH);
    });

    // X labels
    ctx.fillStyle = C.textDim;
    ctx.font = "10px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    ["60d ago", "45d", "30d", "15d", "Today"].forEach((label, i) => {
      ctx.fillText(label, pad.left + (i / 4) * chartW, H - 6);
    });

    // Legend
    ctx.font = "10px 'Inter', sans-serif";
    ctx.textAlign = "left";
    ctx.strokeStyle = C.amber + "AA"; ctx.lineWidth = 1.5; ctx.setLineDash([6, 3]);
    ctx.beginPath(); ctx.moveTo(pad.left + 4, 12); ctx.lineTo(pad.left + 24, 12); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = C.amber; ctx.fillText("MA20", pad.left + 28, 15);
  }, [ticker, data]);

  return (
    <div className="chart-canvas-wrap" style={{ position: 'relative' }}>
      {loading && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(5, 11, 24, 0.7)', color: 'var(--cyan)' }}>
          Loading chart data...
        </div>
      )}
      <canvas ref={canvasRef} style={{ width: "100%", height: 280, borderRadius: 10, border: `1px solid ${C.border}` }} />
    </div>
  );
}
