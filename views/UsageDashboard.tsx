"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Activity, DollarSign, Cpu, Clock, Zap, TrendingUp, TrendingDown,
  BarChart3, PieChart, ArrowUpRight, ArrowDownRight, RefreshCw,
  AlertCircle, CheckCircle2, Database, Globe, Server
} from "lucide-react";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://nbjjfvzrjctsyixnhjzf.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

interface UsageData {
  period: string;
  summary: {
    total_requests: number;
    successful_requests: number;
    failed_requests: number;
    total_tokens: number;
    input_tokens: number;
    output_tokens: number;
    estimated_cost_usd: number;
    avg_duration_ms: number;
  };
  recent_requests: any[];
}

interface CouncilSession {
  id: string;
  topic: string;
  task_type: string;
  status: string;
  providers_consulted: string[];
  consensus_level: string;
  total_tokens: number;
  total_duration_ms: number;
  consolidated_report: string;
  contradictions: any[];
  created_at: string;
  completed_at: string | null;
}

export default function UsageDashboard() {
  const [period, setPeriod] = useState("week");
  const [loading, setLoading] = useState(true);
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [councilSessions, setCouncilSessions] = useState<CouncilSession[]>([]);
  const [providerStats, setProviderStats] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchUsage = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/jax-usage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ period }),
      });
      const data = await res.json();
      if (data.success) {
        setUsageData(data);
      } else {
        setError(data.error || "Failed to fetch usage data");
      }
    } catch (e: any) {
      setError(e.message || "Network error");
    }

    // Also fetch council sessions and provider stats from DB
    try {
      const councilRes = await fetch(
        `${SUPABASE_URL}/rest/v1/ai_council_sessions?select=*&order=created_at.desc&limit=10`,
        { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }
      );
      if (councilRes.ok) {
        setCouncilSessions(await councilRes.json());
      }
    } catch {}

    try {
      const providerRes = await fetch(
        `${SUPABASE_URL}/rest/v1/ai_provider_registry?select=slug,name,status,model_count,is_active&order=name.asc`,
        { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }
      );
      if (providerRes.ok) {
        setProviderStats(await providerRes.json());
      }
    } catch {}

    setLoading(false);
  }, [period]);

  useEffect(() => { fetchUsage(); }, [fetchUsage]);

  const s = usageData?.summary;
  const successRate = s && s.total_requests > 0 ? Math.round((s.successful_requests / s.total_requests) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: "#e0e0e0" }}>Usage & Monitoring</h2>
          <p className="text-xs mt-1" style={{ color: "#808080" }}>AI provider usage, costs, and council session history</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex rounded-lg overflow-hidden" style={{ border: "1px solid rgba(212, 168, 71, 0.15)" }}>
            {["today", "week", "month", "all"].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className="px-3 py-1.5 text-xs font-medium capitalize transition-colors"
                style={{
                  background: period === p ? "rgba(212, 168, 71, 0.15)" : "transparent",
                  color: period === p ? "#d4a847" : "#808080",
                  borderRight: "1px solid rgba(212, 168, 71, 0.1)",
                }}
              >
                {p === "all" ? "All Time" : p}
              </button>
            ))}
          </div>
          <button onClick={fetchUsage} className="p-2 rounded-lg hover:bg-white/5 transition-colors" style={{ color: "#808080" }}>
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {[
          { label: "Total Requests", value: s?.total_requests?.toLocaleString() || "0", icon: Activity, color: "#d4a847" },
          { label: "Success Rate", value: `${successRate}%`, icon: CheckCircle2, color: successRate > 80 ? "#00d97e" : "#f59e0b" },
          { label: "Total Tokens", value: s?.total_tokens?.toLocaleString() || "0", icon: Cpu, color: "#00d97e" },
          { label: "Est. Cost", value: `$${s?.estimated_cost_usd?.toFixed(4) || "0.00"}`, icon: DollarSign, color: "#c0c0c0" },
          { label: "Avg Latency", value: `${s?.avg_duration_ms || 0}ms`, icon: Clock, color: "#00d97e" },
          { label: "Failed", value: s?.failed_requests?.toString() || "0", icon: AlertCircle, color: "#c41e3a" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="jax-metric">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px]" style={{ color: "#808080" }}>{stat.label}</span>
                <Icon size={12} style={{ color: stat.color }} />
              </div>
              <div className="text-xl font-bold" style={{ color: "#e0e0e0" }}>{stat.value}</div>
            </div>
          );
        })}
      </div>

      {error && (
        <div className="jax-glass p-4" style={{ borderColor: "rgba(196, 30, 58, 0.3)" }}>
          <div className="flex items-center gap-2">
            <AlertCircle size={14} style={{ color: "#c41e3a" }} />
            <span className="text-sm" style={{ color: "#c41e3a" }}>{error}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Provider Health */}
        <div className="jax-glass p-5">
          <h3 className="jax-section-title flex items-center gap-2">
            <Server size={14} style={{ color: "#d4a847" }} />
            AI Provider Health
          </h3>
          <div className="space-y-3">
            {(providerStats.length > 0 ? providerStats : [
              { slug: "anthropic", name: "Anthropic", status: "online", model_count: 3, is_active: true },
              { slug: "deepseek", name: "DeepSeek", status: "online", model_count: 2, is_active: true },
              { slug: "gemini", name: "Google Gemini", status: "online", model_count: 1, is_active: true },
              { slug: "fred", name: "FRED", status: "online", model_count: 0, is_active: true },
              { slug: "fmp", name: "FMP", status: "online", model_count: 0, is_active: true },
              { slug: "alpha_vantage", name: "Alpha Vantage", status: "online", model_count: 0, is_active: true },
            ]).map((p: any) => {
              const statusColor = p.status === "online" || p.is_active ? "#00d97e" : "#c41e3a";
              const statusLabel = p.status === "online" || p.is_active ? "Active" : "Inactive";
              return (
                <div key={p.slug} className="flex items-center justify-between p-3 rounded-lg" style={{ background: "rgba(10, 10, 10, 0.4)" }}>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{ background: statusColor, boxShadow: `0 0 6px ${statusColor}` }} />
                    <div>
                      <div className="text-sm font-medium" style={{ color: "#e0e0e0" }}>{p.name}</div>
                      <div className="text-[10px]" style={{ color: "#808080" }}>{p.model_count || 0} models</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded" style={{
                    background: `${statusColor}15`, color: statusColor, border: `1px solid ${statusColor}30`
                  }}>
                    {statusLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Token Breakdown */}
        <div className="jax-glass p-5">
          <h3 className="jax-section-title flex items-center gap-2">
            <PieChart size={14} style={{ color: "#d4a847" }} />
            Token Breakdown
          </h3>
          <div className="space-y-4 mt-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span style={{ color: "#808080" }}>Input Tokens</span>
                <span style={{ color: "#00d97e" }}>{s?.input_tokens?.toLocaleString() || "0"}</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(0, 217, 126, 0.1)" }}>
                <div className="h-full rounded-full" style={{
                  width: `${s && s.total_tokens > 0 ? (s.input_tokens / s.total_tokens) * 100 : 50}%`,
                  background: "linear-gradient(90deg, #00d97e, #00b368)",
                }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span style={{ color: "#808080" }}>Output Tokens</span>
                <span style={{ color: "#d4a847" }}>{s?.output_tokens?.toLocaleString() || "0"}</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(212, 168, 71, 0.1)" }}>
                <div className="h-full rounded-full" style={{
                  width: `${s && s.total_tokens > 0 ? (s.output_tokens / s.total_tokens) * 100 : 50}%`,
                  background: "linear-gradient(90deg, #d4a847, #b8912e)",
                }} />
              </div>
            </div>
            <div className="jax-divider" />
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 rounded-lg" style={{ background: "rgba(0, 217, 126, 0.05)", border: "1px solid rgba(0, 217, 126, 0.1)" }}>
                <div className="text-lg font-bold" style={{ color: "#00d97e" }}>{s?.successful_requests || 0}</div>
                <div className="text-[10px]" style={{ color: "#808080" }}>Successful</div>
              </div>
              <div className="text-center p-3 rounded-lg" style={{ background: "rgba(196, 30, 58, 0.05)", border: "1px solid rgba(196, 30, 58, 0.1)" }}>
                <div className="text-lg font-bold" style={{ color: "#c41e3a" }}>{s?.failed_requests || 0}</div>
                <div className="text-[10px]" style={{ color: "#808080" }}>Failed</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Council Sessions */}
      <div className="jax-glass p-5">
        <h3 className="jax-section-title flex items-center gap-2">
          <Globe size={14} style={{ color: "#d4a847" }} />
          Multi-AI Council Sessions
        </h3>
        {councilSessions.length === 0 ? (
          <div className="text-center py-8">
            <Globe size={24} style={{ color: "#404040" }} className="mx-auto mb-2" />
            <p className="text-sm" style={{ color: "#808080" }}>No council sessions yet</p>
            <p className="text-xs mt-1" style={{ color: "#606060" }}>Council sessions appear here when you use the Multi-AI Council in the Assistant or AI Network</p>
          </div>
        ) : (
          <div className="space-y-3">
            {councilSessions.map((session) => (
              <div key={session.id} className="p-4 rounded-lg" style={{ background: "rgba(10, 10, 10, 0.4)", border: "1px solid rgba(212, 168, 71, 0.08)" }}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="text-sm font-medium" style={{ color: "#e0e0e0" }}>{session.topic}</div>
                    <div className="text-[10px] mt-1" style={{ color: "#808080" }}>
                      {new Date(session.created_at).toLocaleString("en-ZA", { timeZone: "Africa/Johannesburg" })}
                    </div>
                  </div>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded" style={{
                    background: session.consensus_level === "full" ? "rgba(0, 217, 126, 0.15)" : session.consensus_level === "split" ? "rgba(245, 158, 11, 0.15)" : "rgba(196, 30, 58, 0.15)",
                    color: session.consensus_level === "full" ? "#00d97e" : session.consensus_level === "split" ? "#f59e0b" : "#c41e3a",
                    border: `1px solid ${session.consensus_level === "full" ? "rgba(0, 217, 126, 0.3)" : session.consensus_level === "split" ? "rgba(245, 158, 11, 0.3)" : "rgba(196, 30, 58, 0.3)"}`,
                  }}>
                    {session.consensus_level?.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-[10px]" style={{ color: "#808080" }}>
                  <span>{session.total_tokens?.toLocaleString() || 0} tokens</span>
                  <span>{session.total_duration_ms || 0}ms</span>
                  <span>{session.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edge Functions Status */}
      <div className="jax-glass p-5">
        <h3 className="jax-section-title flex items-center gap-2">
          <Database size={14} style={{ color: "#d4a847" }} />
          Edge Functions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: "jax-gateway", desc: "Unified AI Gateway", version: "v4", status: "ACTIVE", color: "#00d97e" },
            { name: "jax-router", desc: "Smart Router", version: "v8", status: "ACTIVE", color: "#00d97e" },
            { name: "jax-council", desc: "Multi-AI Council", version: "v5", status: "ACTIVE", color: "#00d97e" },
            { name: "jax-usage", desc: "Usage Analytics", version: "v2", status: "ACTIVE", color: "#00d97e" },
            { name: "jax-health-check", desc: "Health Check", version: "v1", status: "ACTIVE", color: "#00d97e" },
          ].map((fn) => (
            <div key={fn.name} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: "rgba(10, 10, 10, 0.4)" }}>
              <div className="w-2 h-2 rounded-full" style={{ background: fn.color, boxShadow: `0 0 6px ${fn.color}` }} />
              <div className="flex-1">
                <div className="text-sm font-mono font-medium" style={{ color: "#e0e0e0" }}>{fn.name}</div>
                <div className="text-[10px]" style={{ color: "#808080" }}>{fn.desc} • {fn.version}</div>
              </div>
              <span className="text-[9px] font-medium px-1.5 py-0.5 rounded" style={{
                background: `${fn.color}15`, color: fn.color, border: `1px solid ${fn.color}30`
              }}>
                {fn.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
