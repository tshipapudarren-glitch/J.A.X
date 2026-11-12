"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  TrendingUp, TrendingDown, Activity, RefreshCw, Search, Zap, Brain,
  Target, Shield, AlertTriangle, BarChart3, ArrowUpRight, ArrowDownRight,
  Eye, Clock, DollarSign, ChevronRight, Loader2, Radio, Globe,
  CheckCircle2, XCircle
} from "lucide-react";

const SUPABASE_URL = "https://nbjjfvzrjctsyixnhjzf.supabase.co";

interface PriceData {
  symbol: string;
  price: number;
  change_pct?: number;
  bid?: number;
  ask?: number;
  spread?: number;
  high_24h?: number;
  low_24h?: number;
  dayRange?: string;
  yearRange?: string;
  volume?: number;
}

interface AnalysisResult {
  agent: string;
  agent_name: string;
  content: string;
  duration_ms: number;
  success: boolean;
}

export default function TradingIntel() {
  const [prices, setPrices] = useState<PriceData[]>([]);
  const [loadingPrices, setLoadingPrices] = useState(true);
  const [selectedSymbol, setSelectedSymbol] = useState("AAPL");
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [marketCondition, setMarketCondition] = useState("");
  const [expandedAnalysis, setExpandedAnalysis] = useState<string | null>(null);

  const fetchPrices = useCallback(async () => {
    setLoadingPrices(true);
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/jax-market`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "watchlist" }),
      });
      const data = await res.json();
      if (data.success) {
        setPrices(data.prices || []);
        setSessionInfo(data.market_session);
      }
    } catch {}
    setLoadingPrices(false);
  }, []);

  const runAnalysis = useCallback(async (symbol: string) => {
    setAnalysisLoading(true);
    setAnalysisResults([]);
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/jax-analysis`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "analyze",
          symbol,
          agents: ["jax-market-core", "jax-structure", "jax-volatility", "jax-momentum", "jax-signal"],
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAnalysisResults(data.analyses || []);
        if (data.quote) {
          const changePct = data.quote.change_pct;
          if (changePct > 1) setMarketCondition("Risk-On 🟢");
          else if (changePct < -1) setMarketCondition("Risk-Off 🔴");
          else setMarketCondition("Neutral 🟡");
        }
      }
    } catch {}
    setAnalysisLoading(false);
  }, []);

  useEffect(() => { fetchPrices(); }, [fetchPrices]);

  const handleSelectSymbol = (symbol: string) => {
    setSelectedSymbol(symbol);
    runAnalysis(symbol);
  };

  const getPriceColor = (p: PriceData) => {
    if (!p.change_pct) return "#e0e0e0";
    return p.change_pct > 0 ? "#00d97e" : p.change_pct < 0 ? "#c41e3a" : "#e0e0e0";
  };

  const signalAnalysis = analysisResults.find(a => a.agent === "jax-signal");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: "#e0e0e0" }}>Trading Intelligence</h2>
          <p className="text-xs mt-1" style={{ color: "#808080" }}>
            Live market data • AI-powered analysis • Opportunity detection
          </p>
        </div>
        <div className="flex items-center gap-3">
          {sessionInfo && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: "rgba(10,10,10,0.4)", border: "1px solid rgba(212,168,71,0.1)" }}>
              <Globe size={12} style={{ color: sessionInfo.active ? "#00d97e" : "#808080" }} />
              <span className="text-[10px]" style={{ color: sessionInfo.active ? "#00d97e" : "#808080" }}>
                {sessionInfo.name}
              </span>
            </div>
          )}
          <button onClick={fetchPrices} className="p-2 rounded-lg hover:bg-white/5" style={{ color: "#808080" }}>
            <RefreshCw size={14} className={loadingPrices ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Market Condition Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="jax-metric col-span-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px]" style={{ color: "#808080" }}>Market Condition</span>
            <Radio size={12} style={{ color: "#d4a847" }} />
          </div>
          <div className="text-sm font-bold" style={{ color: "#d4a847" }}>{marketCondition || "Loading..."}</div>
        </div>
        <div className="jax-metric">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px]" style={{ color: "#808080" }}>Watchlist</span>
            <Eye size={12} style={{ color: "#00d97e" }} />
          </div>
          <div className="text-2xl font-bold" style={{ color: "#e0e0e0" }}>{prices.length}</div>
          <div className="text-[10px]" style={{ color: "#808080" }}>Instruments</div>
        </div>
        <div className="jax-metric">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px]" style={{ color: "#808080" }}>Analysts</span>
            <Brain size={12} style={{ color: "#00d97e" }} />
          </div>
          <div className="text-2xl font-bold" style={{ color: "#e0e0e0" }}>6</div>
          <div className="text-[10px]" style={{ color: "#808080" }}>Trading agents</div>
        </div>
        <div className="jax-metric">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px]" style={{ color: "#808080" }}>Data Source</span>
            <Activity size={12} style={{ color: "#4285f4" }} />
          </div>
          <div className="text-sm font-bold font-mono" style={{ color: "#e0e0e0" }}>FMP</div>
          <div className="text-[10px]" style={{ color: "#808080" }}>Financial Modeling Prep</div>
        </div>
      </div>

      {/* Price Tickers */}
      <div className="jax-glass p-5">
        <h3 className="jax-section-title mb-3 flex items-center gap-2">
          <BarChart3 size={14} style={{ color: "#d4a847" }} />
          Live Price Feed
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {prices.map((p) => (
            <div key={p.symbol}
              onClick={() => handleSelectSymbol(p.symbol)}
              className="p-3 rounded-lg cursor-pointer transition-all hover:border-opacity-50"
              style={{
                background: selectedSymbol === p.symbol ? "rgba(212,168,71,0.06)" : "rgba(10,10,10,0.4)",
                border: `1px solid ${selectedSymbol === p.symbol ? "rgba(212,168,71,0.2)" : "rgba(255,255,255,0.03)"}`,
              }}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-mono font-bold" style={{ color: "#e0e0e0" }}>{p.symbol}</span>
                {p.change_pct !== undefined && p.change_pct !== null && (
                  p.change_pct >= 0 ? <ArrowUpRight size={12} style={{ color: "#00d97e" }} /> : <ArrowDownRight size={12} style={{ color: "#c41e3a" }} />
                )}
              </div>
              <div className="text-lg font-bold" style={{ color: getPriceColor(p) }}>
                ${p.price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              {p.change_pct !== undefined && p.change_pct !== null && (
                <div className="text-[10px]" style={{ color: getPriceColor(p) }}>
                  {p.change_pct >= 0 ? "+" : ""}{p.change_pct.toFixed(2)}%
                </div>
              )}
              {p.high_24h && p.low_24h && (
                <div className="text-[9px] mt-1" style={{ color: "#808080" }}>
                  {p.low_24h?.toFixed(2)} — {p.high_24h?.toFixed(2)}
                </div>
              )}
            </div>
          ))}
          {prices.length === 0 && !loadingPrices && (
            <div className="col-span-5 text-center py-6">
              <p className="text-xs" style={{ color: "#808080" }}>No price data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Analysis Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Signal Card */}
        <div className="jax-glass p-5">
          <h3 className="jax-section-title mb-3 flex items-center gap-2">
            <Target size={14} style={{ color: "#d4a847" }} />
            Trading Signal
          </h3>
          {analysisLoading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 size={24} className="animate-spin" style={{ color: "#d4a847" }} />
              <p className="text-xs mt-2" style={{ color: "#808080" }}>Analyzing {selectedSymbol}...</p>
              <p className="text-[10px] mt-1" style={{ color: "#606060" }}>Running 5 specialist agents</p>
            </div>
          ) : signalAnalysis ? (
            <div>
              <div className="text-center mb-4">
                <div className="text-3xl font-bold mb-1" style={{ color: "#e0e0e0" }}>{selectedSymbol}</div>
                <div className="text-xs font-mono" style={{ color: "#808080" }}>
                  {prices.find(p => p.symbol === selectedSymbol)?.price?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div className="p-4 rounded-lg mb-3" style={{
                background: signalAnalysis.content?.toLowerCase().includes("long") ? "rgba(0,217,126,0.05)" :
                  signalAnalysis.content?.toLowerCase().includes("short") ? "rgba(196,30,58,0.05)" : "rgba(212,168,71,0.05)",
                border: `1px solid ${signalAnalysis.content?.toLowerCase().includes("long") ? "rgba(0,217,126,0.15)" :
                  signalAnalysis.content?.toLowerCase().includes("short") ? "rgba(196,30,58,0.15)" : "rgba(212,168,71,0.15)"}`,
              }}>
                <pre className="whitespace-pre-wrap text-xs font-sans" style={{ color: "#c0c0c0", maxHeight: "200px", overflow: "auto" }}>
                  {signalAnalysis.content?.substring(0, 600)}
                </pre>
              </div>
              <div className="text-[10px] text-right" style={{ color: "#808080" }}>
                {signalAnalysis.agent_name} • {signalAnalysis.duration_ms}ms
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Target size={24} style={{ color: "#404040" }} className="mx-auto mb-2" />
              <p className="text-xs" style={{ color: "#808080" }}>Select an instrument to analyze</p>
            </div>
          )}
        </div>

        {/* Agent Analyses */}
        <div className="lg:col-span-2 jax-glass p-5">
          <h3 className="jax-section-title mb-3 flex items-center gap-2">
            <Brain size={14} style={{ color: "#d4a847" }} />
            Specialist Agent Analysis
          </h3>
          <div className="space-y-2">
            {analysisResults.filter(a => a.agent !== "jax-signal").map((result) => (
              <div key={result.agent} className="rounded-lg overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.03)" }}>
                <button
                  onClick={() => setExpandedAnalysis(expandedAnalysis === result.agent ? null : result.agent)}
                  className="w-full flex items-center justify-between p-3 text-left"
                  style={{ background: "rgba(10,10,10,0.4)" }}
                >
                  <div className="flex items-center gap-2">
                    {result.success ? <CheckCircle2 size={12} style={{ color: "#00d97e" }} /> : <XCircle size={12} style={{ color: "#c41e3a" }} />}
                    <span className="text-xs font-medium" style={{ color: "#e0e0e0" }}>
                      {result.agent_name}
                    </span>
                    <span className="text-[10px] font-mono" style={{ color: "#808080" }}>
                      {result.duration_ms}ms
                    </span>
                  </div>
                  <ChevronRight size={12} style={{
                    color: "#808080",
                    transform: expandedAnalysis === result.agent ? "rotate(90deg)" : "none",
                    transition: "transform 0.2s",
                  }} />
                </button>
                {expandedAnalysis === result.agent && (
                  <div className="p-4" style={{ background: "rgba(5,5,5,0.6)", borderTop: "1px solid rgba(255,255,255,0.03)" }}>
                    <pre className="whitespace-pre-wrap text-xs font-sans" style={{ color: "#c0c0c0", maxHeight: "300px", overflow: "auto" }}>
                      {result.content}
                    </pre>
                  </div>
                )}
              </div>
            ))}
            {analysisResults.length === 0 && !analysisLoading && (
              <div className="text-center py-8">
                <Brain size={24} style={{ color: "#404040" }} className="mx-auto mb-2" />
                <p className="text-xs" style={{ color: "#808080" }}>Click an instrument above to run AI analysis</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Trading Agents Registry */}
      <div className="jax-glass p-5">
        <h3 className="jax-section-title mb-3 flex items-center gap-2">
          <Zap size={14} style={{ color: "#d4a847" }} />
          Trading Agent Fleet
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { name: "JAX-MARKET-CORE", role: "Structure", icon: TrendingUp, color: "#00d97e", desc: "Trend & market phase" },
            { name: "JAX-STRUCTURE", role: "S/R Levels", icon: Target, color: "#4285f4", desc: "Support & resistance" },
            { name: "JAX-LIQUIDITY", role: "Liquidity", icon: Activity, color: "#f59e0b", desc: "Order flow & stops" },
            { name: "JAX-VOLATILITY", role: "Volatility", icon: BarChart3, color: "#9b59b6", desc: "ATR & regimes" },
            { name: "JAX-MOMENTUM", role: "Momentum", icon: Zap, color: "#e74c3c", desc: "RSI & divergence" },
            { name: "JAX-SIGNAL", role: "Aggregator", icon: Shield, color: "#d4a847", desc: "Signal & confidence" },
          ].map((agent) => {
            const Icon = agent.icon;
            const isActive = analysisResults.some(a => a.agent_name === agent.name);
            return (
              <div key={agent.name} className="p-3 rounded-lg text-center" style={{
                background: isActive ? `${agent.color}08` : "rgba(10,10,10,0.4)",
                border: `1px solid ${isActive ? `${agent.color}25` : "rgba(255,255,255,0.03)"}`,
              }}>
                <Icon size={16} style={{ color: agent.color }} className="mx-auto mb-1" />
                <div className="text-[10px] font-mono font-medium" style={{ color: "#e0e0e0" }}>{agent.name.split("-").slice(1).join("-")}</div>
                <div className="text-[9px]" style={{ color: "#808080" }}>{agent.desc}</div>
                {isActive && (
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <div className="w-1.5 h-1.5 rounded-full jax-pulse" style={{ background: agent.color }} />
                    <span className="text-[8px]" style={{ color: agent.color }}>Active</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
