"use client";

import React, { useState } from "react";
import {
  Brain, Zap, CheckCircle2, XCircle, AlertCircle, ArrowRightLeft, Activity,
  Clock, DollarSign, Cpu, Send, Loader2, MessageSquare, Shield, ChevronDown,
  ChevronUp, Sparkles, Router, Users2
} from "lucide-react";

const SUPABASE_URL = "https://nbjjfvzrjctsyixnhjzf.supabase.co";

export default function AINetwork() {
  // Router demo state
  const [routerQuery, setRouterQuery] = useState("What is the best strategy for trading gold in a risk-on environment?");
  const [routerStrategy, setRouterStrategy] = useState("balanced");
  const [routerTaskType, setRouterTaskType] = useState("trading");
  const [routerLoading, setRouterLoading] = useState(false);
  const [routerResult, setRouterResult] = useState<any>(null);
  const [routerError, setRouterError] = useState<string | null>(null);

  // Council demo state
  const [councilTopic, setCouncilTopic] = useState("What is the outlook for XAU/USD gold in the current market?");
  const [councilProviders, setCouncilProviders] = useState(["deepseek", "gemini"]);
  const [councilLoading, setCouncilLoading] = useState(false);
  const [councilResult, setCouncilResult] = useState<any>(null);
  const [councilError, setCouncilError] = useState<string | null>(null);
  const [expandedProvider, setExpandedProvider] = useState<string | null>(null);

  const handleRouterTest = async () => {
    setRouterLoading(true);
    setRouterError(null);
    setRouterResult(null);
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/jax-router`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task_type: routerTaskType,
          messages: [{ role: "user", content: routerQuery }],
          strategy: routerStrategy,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setRouterResult(data);
      } else {
        setRouterError(data.error || "Router failed");
      }
    } catch (e: any) {
      setRouterError(e.message || "Network error");
    }
    setRouterLoading(false);
  };

  const handleCouncilTest = async () => {
    setCouncilLoading(true);
    setCouncilError(null);
    setCouncilResult(null);
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/jax-council`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: councilTopic,
          providers: councilProviders,
          messages: [{ role: "user", content: councilTopic }],
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCouncilResult(data);
      } else {
        setCouncilError(data.error || "Council failed");
      }
    } catch (e: any) {
      setCouncilError(e.message || "Network error");
    }
    setCouncilLoading(false);
  };

  const toggleProvider = (slug: string) => {
    setCouncilProviders(prev =>
      prev.includes(slug) ? prev.filter(p => p !== slug) : [...prev, slug]
    );
  };

  const routingRules = [
    { task: "simple_query", provider: "deepseek", model: "deepseek-chat", temp: 0.5, icon: "💬" },
    { task: "trading", provider: "deepseek", model: "deepseek-chat", temp: 0.4, icon: "📊" },
    { task: "analysis", provider: "anthropic", model: "claude-sonnet-4-5", temp: 0.3, icon: "🔍" },
    { task: "coding", provider: "deepseek", model: "deepseek-chat", temp: 0.2, icon: "💻" },
    { task: "creative", provider: "anthropic", model: "claude-sonnet-4-5", temp: 0.9, icon: "🎨" },
    { task: "research", provider: "anthropic", model: "claude-sonnet-4-5", temp: 0.3, icon: "📚" },
  ];

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Edge Functions", value: "5", sub: "Active", icon: Zap, color: "#00d97e" },
          { label: "AI Providers", value: "3", sub: "Connected", icon: Brain, color: "#d4a847" },
          { label: "Routing Rules", value: "12", sub: "Task types", icon: Router, color: "#d4a847" },
          { label: "Council Providers", value: "2", sub: "DeepSeek + Gemini", icon: Users2, color: "#00d97e" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="jax-metric">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs" style={{ color: "#808080" }}>{stat.label}</span>
                <Icon size={14} style={{ color: stat.color }} />
              </div>
              <div className="text-2xl font-bold" style={{ color: "#e0e0e0" }}>{stat.value}</div>
              <div className="text-xs" style={{ color: "#808080" }}>{stat.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Smart Router */}
      <div className="jax-glass p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="jax-section-title flex items-center gap-2">
            <Router size={14} style={{ color: "#d4a847" }} />
            Smart Router — Live Test
          </h3>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full jax-pulse" style={{ background: "#00d97e", boxShadow: "0 0 6px #00d97e" }} />
            <span className="text-[10px] font-medium" style={{ color: "#00d97e" }}>ACTIVE</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div>
            <label className="text-[10px] font-medium mb-1 block" style={{ color: "#808080" }}>TASK TYPE</label>
            <select
              value={routerTaskType}
              onChange={(e) => setRouterTaskType(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-xs font-mono"
              style={{ background: "rgba(10, 10, 10, 0.6)", color: "#e0e0e0", border: "1px solid rgba(212, 168, 71, 0.15)" }}
            >
              {["simple_query", "trading", "analysis", "coding", "creative", "research", "general"].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-medium mb-1 block" style={{ color: "#808080" }}>STRATEGY</label>
            <select
              value={routerStrategy}
              onChange={(e) => setRouterStrategy(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-xs font-mono"
              style={{ background: "rgba(10, 10, 10, 0.6)", color: "#e0e0e0", border: "1px solid rgba(212, 168, 71, 0.15)" }}
            >
              <option value="cost">Cost (cheapest)</option>
              <option value="speed">Speed (fastest)</option>
              <option value="balanced">Balanced</option>
              <option value="quality">Quality (best model)</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleRouterTest}
              disabled={routerLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all"
              style={{
                background: routerLoading ? "rgba(212, 168, 71, 0.1)" : "rgba(212, 168, 71, 0.15)",
                color: "#d4a847",
                border: "1px solid rgba(212, 168, 71, 0.3)",
              }}
            >
              {routerLoading ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
              {routerLoading ? "Routing..." : "Route Request"}
            </button>
          </div>
        </div>

        <textarea
          value={routerQuery}
          onChange={(e) => setRouterQuery(e.target.value)}
          className="w-full px-3 py-2 rounded-lg text-xs font-mono resize-none mb-3"
          rows={2}
          style={{ background: "rgba(10, 10, 10, 0.6)", color: "#e0e0e0", border: "1px solid rgba(212, 168, 71, 0.1)" }}
          placeholder="Enter your query..."
        />

        {routerError && (
          <div className="p-3 rounded-lg mb-3" style={{ background: "rgba(196, 30, 58, 0.1)", border: "1px solid rgba(196, 30, 58, 0.2)" }}>
            <div className="flex items-center gap-2">
              <XCircle size={12} style={{ color: "#c41e3a" }} />
              <span className="text-xs" style={{ color: "#c41e3a" }}>{routerError}</span>
            </div>
          </div>
        )}

        {routerResult && (
          <div className="p-4 rounded-lg" style={{ background: "rgba(0, 217, 126, 0.03)", border: "1px solid rgba(0, 217, 126, 0.15)" }}>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 size={12} style={{ color: "#00d97e" }} />
              <span className="text-xs font-medium" style={{ color: "#00d97e" }}>
                Routed to {routerResult.provider}/{routerResult.model}
              </span>
              <span className="text-[10px] ml-auto" style={{ color: "#808080" }}>{routerResult.duration_ms}ms</span>
            </div>
            <div className="text-xs mb-3 p-3 rounded-lg" style={{ background: "rgba(10, 10, 10, 0.4)", color: "#c0c0c0", maxHeight: "120px", overflow: "auto" }}>
              {routerResult.content}
            </div>
            <div className="flex items-center gap-4 text-[10px]" style={{ color: "#808080" }}>
              <span>Tokens: {routerResult.input_tokens}→{routerResult.output_tokens}</span>
              <span>Strategy: {routerResult.routing?.strategy}</span>
              <span>Attempts: {routerResult.routing?.attempts}</span>
              {routerResult.routing?.fallback_used && <span style={{ color: "#f59e0b" }}>⚡ Fallback used</span>}
            </div>
          </div>
        )}

        {/* Routing Rules Table */}
        <div className="jax-divider" />
        <div className="text-xs font-medium mb-3 mt-3" style={{ color: "#d4a847" }}>ROUTING RULES</div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {routingRules.map((rule) => (
            <div key={rule.task} className="flex items-center justify-between p-2 rounded-lg text-xs" style={{ background: "rgba(10, 10, 10, 0.3)" }}>
              <div className="flex items-center gap-2">
                <span>{rule.icon}</span>
                <span className="font-mono" style={{ color: "#c0c0c0" }}>{rule.task}</span>
              </div>
              <div className="flex items-center gap-2">
                <span style={{ color: "#808080" }}>{rule.provider}</span>
                <span className="text-[9px] px-1 py-0.5 rounded" style={{ background: "rgba(212, 168, 71, 0.1)", color: "#d4a847" }}>
                  T:{rule.temp}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Multi-AI Council */}
      <div className="jax-glass p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="jax-section-title flex items-center gap-2">
            <Users2 size={14} style={{ color: "#d4a847" }} />
            Multi-AI Council — Live Test
          </h3>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full jax-pulse" style={{ background: "#00d97e", boxShadow: "0 0 6px #00d97e" }} />
            <span className="text-[10px] font-medium" style={{ color: "#00d97e" }}>ACTIVE</span>
          </div>
        </div>

        <textarea
          value={councilTopic}
          onChange={(e) => setCouncilTopic(e.target.value)}
          className="w-full px-3 py-2 rounded-lg text-xs font-mono resize-none mb-3"
          rows={2}
          style={{ background: "rgba(10, 10, 10, 0.6)", color: "#e0e0e0", border: "1px solid rgba(212, 168, 71, 0.1)" }}
          placeholder="Topic for council deliberation..."
        />

        <div className="flex items-center gap-3 mb-4">
          <span className="text-[10px] font-medium" style={{ color: "#808080" }}>COUNCIL MEMBERS:</span>
          {[
            { slug: "deepseek", label: "DeepSeek", color: "#00d97e" },
            { slug: "gemini", label: "Gemini", color: "#4285f4" },
            { slug: "anthropic", label: "Anthropic", color: "#d4a847" },
          ].map((p) => (
            <button
              key={p.slug}
              onClick={() => toggleProvider(p.slug)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                background: councilProviders.includes(p.slug) ? `${p.color}15` : "rgba(10, 10, 10, 0.3)",
                color: councilProviders.includes(p.slug) ? p.color : "#606060",
                border: `1px solid ${councilProviders.includes(p.slug) ? `${p.color}30` : "rgba(255,255,255,0.03)"}`,
              }}
            >
              {councilProviders.includes(p.slug) ? "✓ " : ""}{p.label}
            </button>
          ))}
          <button
            onClick={handleCouncilTest}
            disabled={councilLoading || councilProviders.length === 0}
            className="ml-auto flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{
              background: councilLoading ? "rgba(212, 168, 71, 0.1)" : "rgba(212, 168, 71, 0.15)",
              color: "#d4a847",
              border: "1px solid rgba(212, 168, 71, 0.3)",
            }}
          >
            {councilLoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
            {councilLoading ? "Deliberating..." : "Convene Council"}
          </button>
        </div>

        {councilError && (
          <div className="p-3 rounded-lg mb-3" style={{ background: "rgba(196, 30, 58, 0.1)", border: "1px solid rgba(196, 30, 58, 0.2)" }}>
            <div className="flex items-center gap-2">
              <XCircle size={12} style={{ color: "#c41e3a" }} />
              <span className="text-xs" style={{ color: "#c41e3a" }}>{councilError}</span>
            </div>
          </div>
        )}

        {councilResult && (
          <div className="space-y-3">
            {/* Summary bar */}
            <div className="flex items-center justify-between p-3 rounded-lg" style={{
              background: councilResult.consensus_level === "full" ? "rgba(0, 217, 126, 0.05)" : "rgba(245, 158, 11, 0.05)",
              border: `1px solid ${councilResult.consensus_level === "full" ? "rgba(0, 217, 126, 0.15)" : "rgba(245, 158, 11, 0.15)"}`,
            }}>
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium" style={{ color: councilResult.consensus_level === "full" ? "#00d97e" : "#f59e0b" }}>
                  Consensus: {councilResult.consensus_level.toUpperCase()}
                </span>
                <span className="text-[10px]" style={{ color: "#808080" }}>
                  {councilResult.providers_consulted.length} providers
                </span>
              </div>
              <div className="flex items-center gap-3 text-[10px]" style={{ color: "#808080" }}>
                <span>{councilResult.total_tokens.toLocaleString()} tokens</span>
                <span>{councilResult.total_duration_ms}ms</span>
                {councilResult.contradictions.length > 0 && (
                  <span style={{ color: "#f59e0b" }}>⚠ {councilResult.contradictions.length} contradictions</span>
                )}
              </div>
            </div>

            {/* Individual responses */}
            {councilResult.responses.map((resp: any) => (
              <div key={resp.provider} className="rounded-lg overflow-hidden" style={{ border: "1px solid rgba(212, 168, 71, 0.08)" }}>
                <button
                  onClick={() => setExpandedProvider(expandedProvider === resp.provider ? null : resp.provider)}
                  className="w-full flex items-center justify-between p-3 text-left"
                  style={{ background: "rgba(10, 10, 10, 0.4)" }}
                >
                  <div className="flex items-center gap-2">
                    {resp.status === "success" ? <CheckCircle2 size={12} style={{ color: "#00d97e" }} /> : <XCircle size={12} style={{ color: "#c41e3a" }} />}
                    <span className="text-xs font-medium" style={{ color: "#e0e0e0" }}>
                      {resp.provider.charAt(0).toUpperCase() + resp.provider.slice(1)}
                    </span>
                    <span className="text-[10px] font-mono" style={{ color: "#808080" }}>{resp.model}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px]" style={{ color: "#808080" }}>{resp.duration_ms}ms • {resp.tokens.input + resp.tokens.output} tokens</span>
                    {expandedProvider === resp.provider ? <ChevronUp size={12} style={{ color: "#808080" }} /> : <ChevronDown size={12} style={{ color: "#808080" }} />}
                  </div>
                </button>
                {expandedProvider === resp.provider && councilResult.consolidated_report && (
                  <div className="p-4 text-xs" style={{ background: "rgba(5, 5, 5, 0.6)", color: "#c0c0c0", maxHeight: "300px", overflow: "auto" }}>
                    <pre className="whitespace-pre-wrap font-sans">{councilResult.consolidated_report}</pre>
                  </div>
                )}
              </div>
            ))}

            {/* Contradictions */}
            {councilResult.contradictions.length > 0 && (
              <div className="p-3 rounded-lg" style={{ background: "rgba(245, 158, 11, 0.05)", border: "1px solid rgba(245, 158, 11, 0.15)" }}>
                <div className="text-xs font-medium mb-2 flex items-center gap-2" style={{ color: "#f59e0b" }}>
                  <AlertCircle size={12} />
                  Contradictions Detected ({councilResult.contradictions.length})
                </div>
                {councilResult.contradictions.map((c: any, i: number) => (
                  <div key={i} className="text-[10px] py-1" style={{ color: "#808080" }}>
                    <span style={{ color: "#f59e0b" }}>{c.providers.join(" vs ")}</span>: &quot;{c.claim_a?.substring(0, 80)}...&quot; vs &quot;{c.claim_b?.substring(0, 80)}...&quot;
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* System Architecture */}
      <div className="jax-glass p-5">
        <h3 className="jax-section-title flex items-center gap-2">
          <Activity size={14} style={{ color: "#d4a847" }} />
          Intelligence Network Architecture
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="p-4 rounded-lg text-center" style={{ background: "rgba(10, 10, 10, 0.4)", border: "1px solid rgba(0, 217, 126, 0.15)" }}>
            <Router size={20} style={{ color: "#00d97e" }} className="mx-auto mb-2" />
            <div className="text-sm font-medium mb-1" style={{ color: "#e0e0e0" }}>Smart Router</div>
            <div className="text-[10px]" style={{ color: "#808080" }}>Routes by cost, speed, quality with automatic fallback chains</div>
            <div className="jax-badge jax-badge-green mt-2" style={{ fontSize: "9px" }}>jax-router v8</div>
          </div>
          <div className="p-4 rounded-lg text-center" style={{ background: "rgba(10, 10, 10, 0.4)", border: "1px solid rgba(212, 168, 71, 0.15)" }}>
            <Users2 size={20} style={{ color: "#d4a847" }} className="mx-auto mb-2" />
            <div className="text-sm font-medium mb-1" style={{ color: "#e0e0e0" }}>Multi-AI Council</div>
            <div className="text-[10px]" style={{ color: "#808080" }}>Parallel analysis, contradiction detection, consensus scoring</div>
            <div className="jax-badge jax-badge-gold mt-2" style={{ fontSize: "9px" }}>jax-council v5</div>
          </div>
          <div className="p-4 rounded-lg text-center" style={{ background: "rgba(10, 10, 10, 0.4)", border: "1px solid rgba(192, 192, 192, 0.15)" }}>
            <Activity size={20} style={{ color: "#c0c0c0" }} className="mx-auto mb-2" />
            <div className="text-sm font-medium mb-1" style={{ color: "#e0e0e0" }}>Usage Analytics</div>
            <div className="text-[10px]" style={{ color: "#808080" }}>Token tracking, cost estimation, daily breakdowns</div>
            <div className="jax-badge mt-2" style={{ fontSize: "9px", background: "rgba(192, 192, 192, 0.1)", color: "#c0c0c0", border: "1px solid rgba(192, 192, 192, 0.2)" }}>jax-usage v2</div>
          </div>
        </div>
      </div>
    </div>
  );
}
