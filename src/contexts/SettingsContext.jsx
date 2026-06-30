/**
 * SettingsContext.jsx
 * Global settings store — persisted to localStorage.
 * Any component can read settings via useSettings().
 * Changes in SettingsPage are applied app-wide instantly.
 */
import { createContext, useContext, useState, useEffect, useCallback } from "react";

const SettingsContext = createContext(null);

// ─── Default values ───────────────────────────────────────────────────────────
export const DEFAULT_SETTINGS = {
  // Profile
  fullName:        "Aryan Mehta",
  email:           "aryan.mehta@email.com",
  username:        "aryan_trades",
  country:         "India",
  timezone:        "Asia/Kolkata (IST +5:30)",
  profileCurrency: "INR",
  phone:           "+91 98765 43210",
  avatar:          null,

  // Appearance
  themeMode:   "dark",       // "dark" | "light" | "system"
  accent:      "violet",     // "violet" | "emerald" | "purple" | "rose" | "amber" | "cyan"
  fontSize:    "medium",     // "small" | "medium" | "large"
  compactMode: false,
  animations:  true,

  // Preferences
  defCurrency: "INR",        // currency symbol for display
  defExchange: "NSE",
  language:    "English",

  // Notifications
  priceEmail:     true,
  pricePush:      true,
  priceSms:       false,
  newsAlerts:     true,
  earningsAlerts: true,
  dividendAlerts: true,
  ipoAlerts:      true,

  // AI Preferences
  aiModel:       "llama3",    // "gpt4" | "llama3" | "gemini"
  responseStyle: "investor",  // "beginner" | "investor" | "analyst"
  responseLen:   "medium",    // "short" | "medium" | "detailed"
  outBullets:    true,
  outTables:     true,
  outCharts:     false,
  outMarkdown:   true,
  incRisks:      true,
  incOpps:       true,
  incRatios:     true,
  incSources:    true,
  ragEnabled:    true,

  // Market Preferences
  mktNSE:    true,
  mktBSE:    false,
  mktNASDAQ: false,
  mktNYSE:   false,
  secIT:      true,
  secBanking: true,
  secPharma:  true,
  secEnergy:  true,
  secAuto:    false,
  secFMCG:    false,
  timeframe:  "1M",

  // Security
  twoFA: false,

  // Export
  exportFmt: "PDF",
  autoSave:  true,

  // Notifications (channels)
  newsNotifs:     false,
  earningsNotifs: true,
};

// ─── Accent → CSS var map ─────────────────────────────────────────────────────
const ACCENT_MAP = {
  violet:  { main: "#6366f1", dim: "#4f46e5", glow: "rgba(99,102,241,0.2)" },
  emerald: { main: "#10b981", dim: "#059669", glow: "rgba(16,185,129,0.2)" },
  purple:  { main: "#a855f7", dim: "#9333ea", glow: "rgba(168,85,247,0.2)" },
  rose:    { main: "#f43f5e", dim: "#e11d48", glow: "rgba(244,63,94,0.2)"  },
  amber:   { main: "#f59e0b", dim: "#d97706", glow: "rgba(245,158,11,0.2)" },
  cyan:    { main: "#06b6d4", dim: "#0891b2", glow: "rgba(6,182,212,0.2)"  },
};

// ─── Font size map ────────────────────────────────────────────────────────────
const FONT_SIZE_MAP = { small: "12px", medium: "14px", large: "16px" };

// ─── AI model → Groq model id ─────────────────────────────────────────────────
export const AI_MODEL_MAP = {
  gpt4:   "llama-3.3-70b-versatile",  // placeholder (Groq doesn't have GPT-4)
  llama3: "llama-3.3-70b-versatile",
  gemini: "gemma2-9b-it",
};

// ─── Response style → system prompt addon ────────────────────────────────────
export const STYLE_PROMPT = {
  beginner: "Explain in simple, beginner-friendly terms. Avoid jargon. Use analogies.",
  investor: "Respond as a professional investor. Be balanced, concise, and actionable.",
  analyst:  "Respond as a senior equity research analyst. Use financial terminology, precise data, and structured analysis.",
};

export const LENGTH_PROMPT = {
  short:    "Keep the response concise — under 150 words.",
  medium:   "Provide a comprehensive but focused response — around 300-500 words.",
  detailed: "Provide an exhaustive, detailed analysis with all relevant sections.",
};

// ─── Apply settings to DOM ─────────────────────────────────────────────────────
function applyToDom(settings) {
  const root = document.documentElement;

  // Theme
  const resolvedTheme = settings.themeMode === "system"
    ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
    : settings.themeMode;

  root.setAttribute("data-theme", resolvedTheme);
  document.body.className = [
    resolvedTheme === "light" ? "theme-light" : "",
    settings.compactMode ? "compact" : "",
    settings.animations ? "" : "no-animations",
  ].filter(Boolean).join(" ");

  // Accent color
  const ac = ACCENT_MAP[settings.accent] || ACCENT_MAP.violet;
  root.style.setProperty("--violet",    ac.main);
  root.style.setProperty("--accentDim", ac.dim);
  root.style.setProperty("--accentGlow",ac.glow);

  // Font size
  root.style.setProperty("--base-font-size", FONT_SIZE_MAP[settings.fontSize] || "14px");
  root.style.fontSize = FONT_SIZE_MAP[settings.fontSize] || "14px";
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function SettingsProvider({ children }) {
  const [settings, setSettingsRaw] = useState(() => {
    try {
      const stored = localStorage.getItem("stockgpt_settings");
      return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Apply on mount and every change
  useEffect(() => {
    applyToDom(settings);
    localStorage.setItem("stockgpt_settings", JSON.stringify(settings));
  }, [settings]);

  // System theme listener
  useEffect(() => {
    if (settings.themeMode !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyToDom(settings);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [settings.themeMode]);

  const updateSetting = useCallback((key, value) => {
    setSettingsRaw(prev => ({ ...prev, [key]: value }));
  }, []);

  const updateSettings = useCallback((patch) => {
    setSettingsRaw(prev => ({ ...prev, ...patch }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettingsRaw(DEFAULT_SETTINGS);
  }, []);

  // Currency formatter
  const formatPrice = useCallback((value, ticker = "") => {
    const isINR = ticker?.endsWith(".NS") || ticker?.endsWith(".BO") || settings.defCurrency === "INR";
    const sym = isINR ? "₹" : "$";
    if (!value && value !== 0) return `${sym}—`;
    if (value >= 1e7) return `${sym}${(value / 1e7).toFixed(2)}Cr`;
    if (value >= 1e5) return `${sym}${(value / 1e5).toFixed(2)}L`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    return `${sym}${Number(value).toLocaleString()}`;
  }, [settings.defCurrency]);

  // Build AI system prompt additions based on settings
  const getAiPromptAddons = useCallback(() => {
    const parts = [];
    parts.push(STYLE_PROMPT[settings.responseStyle] || STYLE_PROMPT.investor);
    parts.push(LENGTH_PROMPT[settings.responseLen] || LENGTH_PROMPT.medium);

    const include = [];
    if (settings.incRisks)   include.push("risk factors");
    if (settings.incOpps)    include.push("opportunities");
    if (settings.incRatios)  include.push("financial ratios");
    if (settings.incSources) include.push("sources/citations");
    if (include.length) parts.push(`Always include: ${include.join(", ")}.`);

    const fmt = [];
    if (settings.outBullets)  fmt.push("bullet points");
    if (settings.outTables)   fmt.push("tables");
    if (settings.outMarkdown) fmt.push("markdown formatting");
    if (fmt.length) parts.push(`Prefer output as: ${fmt.join(", ")}.`);

    return parts.join(" ");
  }, [settings]);

  return (
    <SettingsContext.Provider value={{
      settings,
      updateSetting,
      updateSettings,
      resetSettings,
      formatPrice,
      getAiPromptAddons,
      aiModelId: AI_MODEL_MAP[settings.aiModel] || AI_MODEL_MAP.llama3,
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used inside SettingsProvider");
  return ctx;
}
