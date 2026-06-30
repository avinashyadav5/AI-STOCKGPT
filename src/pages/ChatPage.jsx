import { useRef, useEffect, useCallback } from "react";
import AgentTrace from "../components/AgentTrace";
import MarkdownLite from "../components/MarkdownLite";
import { AGENT_PIPELINE, SPINNER, buildResponse, detectTicker } from "../data/stocks";
import { useSettings } from "../contexts/SettingsContext";
import "./ChatPage.css";

const SUGGESTIONS = [
  "Should I invest in Tata Motors?",
  "Compare INFY vs TCS",
  "NVDA earnings summary",
  "What's TSLA's risk profile?",
];

export default function ChatPage({
  messages, setMessages, query, setQuery,
  agentActive, setAgentActive, agentDone, setAgentDone,
  isThinking, setIsThinking, livePrice, onViewChart,
}) {
  const chatEndRef = useRef(null);
  const spinRef = useRef(null);
  const { aiModelId, getAiPromptAddons } = useSettings();

  useEffect(() => {
    if (!isThinking) return;
    const id = setInterval(() => {
      if (spinRef.current) spinRef.current.textContent = SPINNER[Math.floor(Date.now() / 120) % 8];
    }, 120);
    return () => clearInterval(id);
  }, [isThinking]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  const runAgents = useCallback(async (userMsg) => {
    setIsThinking(true);
    setAgentActive(0);
    setAgentDone(-1);
    
    let currentAgent = 0;
    const interval = setInterval(() => {
      currentAgent++;
      if (currentAgent < AGENT_PIPELINE.length) {
        setAgentActive(currentAgent);
        setAgentDone(currentAgent - 1);
      }
    }, 800);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMsg, 
          livePrice,
          ai_model: aiModelId,
          system_prompt_addon: getAiPromptAddons()
        })
      });
      const data = await res.json();
      
      clearInterval(interval);
      setAgentActive(-1);
      setIsThinking(false);
      
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: data.reply || "No response received.",
        agents: "done",
        ticker: data.extractedTicker,
      }]);
    } catch (err) {
      clearInterval(interval);
      setAgentActive(-1);
      setIsThinking(false);
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: "Error: Could not connect to AI backend. Make sure the server is running.",
        agents: "done",
      }]);
    }
  }, [livePrice, setMessages, setIsThinking, setAgentActive, setAgentDone]);

  const send = () => {
    const q = query.trim();
    if (!q || isThinking) return;
    setMessages((prev) => [...prev, { role: "user", content: q }]);
    setQuery("");
    runAgents(q);
  };

  return (
    <div className="chat-layout">
      {/* Sidebar */}
      <aside className="chat-sidebar">
        <div className="sidebar-section-label">
          <span className="section-dot" /> Agent Pipeline
        </div>
        <AgentTrace active={agentActive} done={agentDone} />
        <div className="sidebar-divider" />
        <div className="sidebar-section-label">
          <span className="section-dot" /> Architecture
        </div>
        <div className="sidebar-info">
          Each query triggers a cascade of specialized AI agents. Results are synthesized into a comprehensive research brief.
        </div>
        <div className="arch-flow">
          <div className="arch-node arch-primary">Financial Agent</div>
          <div className="arch-arrow">↓</div>
          <div className="arch-fan">
            <div className="arch-node arch-secondary">News</div>
            <div className="arch-node arch-secondary">Filing</div>
            <div className="arch-node arch-secondary">Ratio</div>
          </div>
          <div className="arch-arrow">↓</div>
          <div className="arch-node arch-tertiary">Portfolio</div>
          <div className="arch-arrow">↓</div>
          <div className="arch-node arch-tertiary">Risk</div>
          <div className="arch-arrow">↓</div>
          <div className="arch-node arch-primary">LLM Summary</div>
        </div>
      </aside>

      {/* Chat main */}
      <div className="chat-main">
        <div className="chat-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`msg-wrap ${msg.role}`}>
              <div className={`msg-bubble ${msg.role}`}>
                {msg.role === "assistant" && (
                  <div className="msg-header">
                    <span className="msg-avatar">G</span>
                    <span className="msg-sender">StockGPT</span>
                    {msg.agents === "done" && <span className="msg-badge">6 agents</span>}
                  </div>
                )}
                <MarkdownLite text={msg.content} />
                {msg.ticker && (
                  <button className="msg-chart-link" onClick={() => onViewChart(msg.ticker)}>
                    View {msg.ticker.replace(".NS", "")} Chart →
                  </button>
                )}
              </div>
            </div>
          ))}
          {isThinking && (
            <div className="msg-wrap assistant">
              <div className="msg-bubble assistant thinking-bubble">
                <span ref={spinRef} className="thinking-spinner">⣾</span>
                <span className="thinking-text">Running agent pipeline…</span>
                <span className="thinking-dots"><span className="dot" /><span className="dot" /><span className="dot" /></span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="chat-input-area">
          <div className="chat-input-wrapper">
            <input
              id="chat-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ask about any stock — e.g. 'Analyze Tata Motors fundamentals'"
              className="chat-input"
              disabled={isThinking}
            />
            <button onClick={send} disabled={isThinking} className="chat-send-btn">
              {isThinking ? "…" : "Analyze"}
            </button>
          </div>
          <div className="chat-suggestions">
            {SUGGESTIONS.map((q) => (
              <button key={q} className="suggestion-chip" onClick={() => setQuery(q)}>{q}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
