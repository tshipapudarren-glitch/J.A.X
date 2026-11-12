"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Eye, Activity, AlertTriangle, RefreshCw, Globe, TrendingUp, TrendingDown,
  Zap, Radio, Bell, CheckCircle2, Clock, BarChart3, Brain, Shield,
  ArrowUpRight, ArrowDownRight, Minus, ChevronRight, Loader2, Newspaper
} from "lucide-react";

const SUPABASE_URL = "https://nbjjfvzrjctsyixnhjzf.supabase.co";

interface HeatmapItem {
  symbol: string;
  price: number;
  change_pct: number;
  volume?: number;
}

interface Alert {
  id: string;
  symbol: string;
  alert_type: string;
  severity: string;
  title: string;
  description?: string;
  status: string;
  created_at: string;
}

export default function MarketWatchtower() {
  const [heatmap, setHeatmap] = useState<HeatmapItem[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [briefing, setBriefing] = useState<string>("");
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [briefingLoading, setBriefingLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"surveillance" | "alerts" | "briefing">("surveillance");

  const runScan = useCallback(async () => {
    setScanning(true);
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/jax-watchtower`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "scan" }),
      });
      const data = await res.json();
      if (data.success) {
        setHeatmap(data.heatmap || []);
        setSession(data.session);
        // Refresh alerts
        const alertRes = await fetch(`${SUPABASE_URL}/functions/v1/jax-watchtower`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "alerts", limit: 20 }),
        });
        const alertData = await alertRes.json();
        if (alertData.success) setAlerts(alertData.alerts || []);
      }
    } catch {}
    setScanning(false);
    setLoading(false);
  }, []);

  const generateBriefing = useCallback(async () => {
    setBriefingLoading(true);
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/jax-intel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "briefing" }),
      });
      const data = await res.json();
      if (data.success) setBriefing(data.briefing || "");
    } catch {}
    setBriefingLoading(false);
  }, []);

  useEffect(() => { runScan(); }, [runScan]);

  const handleAcknowledgeAlert = async (alertId: string) => {
    await fetch(`${SUPABASE_URL}/functions/v1/jax-watchtower`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update_alert", alert_id: alertId, status: "acknowledged" }),
    });
    runScan();
  };

  const getHeatmapColor = (changePct: number): string => {
    if (changePct > 3) return "#00d97e"
    if (changePct > 1) return "rgba(0, 217, 126, 0.7)"
    if (changePct > 0) return "rgba(0, 217, 126, 0.3)"
    if (changePct === 0) return "rgba(128, 128, 128, 0.2)"
    if (changePct > -1) return "rgba(196, 30, 58, 0.3)"
    if (changePct > -3) return "rgba(196, 30, 58, 0.7)"
    return "#c41e3a"
  };

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case "critical": return { bg: "rgba(196, 30, 58, 0.1)", color: "#c41e3a", border: "rgba(196, 30, 58, 0.3)" }
      case "warning": return { bg: "rgba(245, 158, 11, 0.1)", color: "#f59e0b", border: "rgba(245, 158, 11, 0.3)" }
      default: return { bg: "rgba(66, 133, 244, 0.1)", color: "#4285f4", border: "rgba(66, 133, 244, 0.3)" }
    }
  };

  const activeAlerts = alerts.filter(a => a.status === "triggered");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: "#e0e0e0" }}>Market Watchtower</h2>
          <p className="text-xs mt-1" style={{ color: "#808080" }}>
            Global surveillance • Heatmap • AI briefings • Alert center
          </p>
        </div>
        <div className="flex items-center gap-3">
          {session && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: "rgba(10,10,10,0.4)", border: "1px solid rgba(212,168,71,0.1)" }}>
              <Globe size={12} style={{ color: session.active ? "#00d97e" : "#808080" }} />
              <span className="text-[10px] font-medium" style={{ color: session.active ? "#00d97e" : "#808080" }}>{session.name} Session</span>
            </div>
          )}
          {activeAlerts.length > 0 && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg" style={{ background: "rgba(196,30,58,0.1)", border: "1px solid rgba(196,30,58,0.2)" }}>
              <Bell size={12} style={{ color: "#c41e3a" }} />
              <span className="text-xs font-bold" style={{ color: "#c41e3a" }}>{activeAlerts.length}</span>
            </div>
          )}
          <button onClick={runScan} disabled={scanning} className="p-2 rounded-lg hover:bg-white/5" style={{ color: "#808080" }}>
            <RefreshCw size={14} className={scanning ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Instruments", value: heatmap.length, icon: BarChart3, color: "#d4a847" },
          { label: "Active Alerts", value: activeAlerts.length, icon: AlertTriangle, color: activeAlerts.length > 0 ? "#c41e3a" : "#00d97e" },
          { label: "Market Session", value: session?.name || "—", icon: Globe, color: session?.active ? "#00d97e" : "#808080" },
          { label: "Surveillance", value: scanning ? "Scanning..." : "Active", icon: Eye, color: "#00d97e" },
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

      {/* Tabs */}
      <div className="flex rounded-lg overflow-hidden" style={{ border: "1px solid rgba(212, 168, 71, 0.15)" }}>
        {[
          { id: "surveillance" as const, label: "Surveillance Grid", icon: Eye },
          { id: "alerts" as const, label: `Alert Center (${activeAlerts.length})`, icon: Bell },
          { id: "briefing" as const, label: "AI Briefing", icon: Newspaper },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); if (tab.id === "briefing" && !briefing) generateBriefing(); }}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-medium transition-colors flex-1 justify-center"
              style={{
                background: activeTab === tab.id ? "rgba(212, 168, 71, 0.1)" : "transparent",
                color: activeTab === tab.id ? "#d4a847" : "#808080",
                borderRight: "1px solid rgba(212, 168, 71, 0.1)",
              }}>
              <Icon size={12} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Surveillance Grid */}
      {activeTab === "surveillance" && (
        <div className="space-y-6">
          {/* Heatmap */}
          <div className="jax-glass p-5">
            <h3 className="jax-section-title mb-4 flex items-center gap-2">
              <BarChart3 size={14} style={{ color: "#d4a847" }} />
              Market Heatmap
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {heatmap.map((item) => (
                <div key={item.symbol} className="p-4 rounded-xl text-center transition-all hover:scale-[1.02]"
                  style={{
                    background: `${getHeatmapColor(item.change_pct || 0)}15`,
                    border: `1px solid ${getHeatmapColor(item.change_pct || 0)}30`,
                  }}>
                  <div className="text-xs font-mono font-bold mb-1" style={{ color: "#e0e0e0" }}>{item.symbol}</div>
                  <div className="text-lg font-bold" style={{ color: getHeatmapColor(item.change_pct || 0) }}>
                    ${item.price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    {(item.change_pct || 0) > 0 ? <ArrowUpRight size={10} style={{ color: "#00d97e" }} /> :
                     (item.change_pct || 0) < 0 ? <ArrowDownRight size={10} style={{ color: "#c41e3a" }} /> :
                     <Minus size={10} style={{ color: "#808080" }} />}
                    <span className="text-[10px] font-medium" style={{ color: getHeatmapColor(item.change_pct || 0) }}>
                      {(item.change_pct || 0) >= 0 ? "+" : ""}{(item.change_pct || 0).toFixed(2)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Surveillance Dimensions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="jax-glass p-5">
              <h3 className="jax-section-title mb-3 flex items-center gap-2">
                <Activity size={14} style={{ color: "#00d97e" }} />
                Trend Direction
              </h3>
              <div className="space-y-2">
                {heatmap.map((item) => {
                  const trend = (item.change_pct || 0) > 0.5 ? "uptrend" : (item.change_pct || 0) < -0.5 ? "downtrend" : "ranging";
                  const trendColor = trend === "uptrend" ? "#00d97e" : trend === "downtrend" ? "#c41e3a" : "#f59e0b";
                  return (
                    <div key={item.symbol} className="flex items-center justify-between p-2 rounded" style={{ background: "rgba(10,10,10,0.3)" }}>
                      <span className="text-xs font-mono" style={{ color: "#e0e0e0" }}>{item.symbol}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded font-medium" style={{ background: `${trendColor}15`, color: trendColor, border: `1px solid ${trendColor}30` }}>
                        {trend.toUpperCase()}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="jax-glass p-5">
              <h3 className="jax-section-title mb-3 flex items-center gap-2">
                <Zap size={14} style={{ color: "#f59e0b" }} />
                Market DNA
              </h3>
              <div className="space-y-3">
                <div className="p-3 rounded-lg" style={{ background: "rgba(10,10,10,0.3)" }}>
                  <div className="text-[10px] mb-1" style={{ color: "#808080" }}>Session</div>
                  <div className="text-sm font-medium" style={{ color: "#e0e0e0" }}>{session?.name || "Unknown"}</div>
                </div>
                <div className="p-3 rounded-lg" style={{ background: "rgba(10,10,10,0.3)" }}>
                  <div className="text-[10px] mb-1" style={{ color: "#808080" }}>Risk Sentiment</div>
                  <div className="text-sm font-medium" style={{ color: heatmap.some(h => (h.change_pct || 0) > 1) ? "#00d97e" : heatmap.some(h => (h.change_pct || 0) < -1) ? "#c41e3a" : "#f59e0b" }}>
                    {heatmap.some(h => (h.change_pct || 0) > 1) ? "Risk-On 🟢" : heatmap.some(h => (h.change_pct || 0) < -1) ? "Risk-Off 🔴" : "Neutral 🟡"}
                  </div>
                </div>
                <div className="p-3 rounded-lg" style={{ background: "rgba(10,10,10,0.3)" }}>
                  <div className="text-[10px] mb-1" style={{ color: "#808080" }}>Instruments Monitored</div>
                  <div className="text-sm font-medium" style={{ color: "#e0e0e0" }}>{heatmap.length} active</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Alert Center */}
      {activeTab === "alerts" && (
        <div className="jax-glass p-5">
          <h3 className="jax-section-title mb-4 flex items-center gap-2">
            <Bell size={14} style={{ color: "#d4a847" }} />
            Alert Center
          </h3>
          {alerts.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle2 size={32} style={{ color: "#00d97e" }} className="mx-auto mb-3" />
              <p className="text-sm" style={{ color: "#00d97e" }}>All clear — no alerts triggered</p>
              <p className="text-[10px] mt-1" style={{ color: "#808080" }}>Surveillance rules are monitoring your watchlist</p>
            </div>
          ) : (
            <div className="space-y-2">
              {alerts.map((alert) => {
                const style = getSeverityStyle(alert.severity);
                return (
                  <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg" style={{ background: style.bg, border: `1px solid ${style.border}` }}>
                    <AlertTriangle size={14} style={{ color: style.color, flexShrink: 0, marginTop: 2 }} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium" style={{ color: "#e0e0e0" }}>{alert.title}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: `${style.color}20`, color: style.color }}>
                          {alert.severity.toUpperCase()}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: "rgba(128,128,128,0.1)", color: "#808080" }}>
                          {alert.status}
                        </span>
                      </div>
                      <div className="text-[10px]" style={{ color: "#808080" }}>{alert.description}</div>
                      <div className="text-[10px] mt-1" style={{ color: "#606060" }}>
                        {new Date(alert.created_at).toLocaleString("en-ZA", { timeZone: "Africa/Johannesburg" })}
                      </div>
                    </div>
                    {alert.status === "triggered" && (
                      <button onClick={() => handleAcknowledgeAlert(alert.id)}
                        className="text-[10px] px-2 py-1 rounded flex items-center gap-1" style={{ color: "#d4a847", background: "rgba(212,168,71,0.1)" }}>
                        <CheckCircle2 size={8} /> Ack
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* AI Briefing */}
      {activeTab === "briefing" && (
        <div className="jax-glass p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="jax-section-title flex items-center gap-2">
              <Newspaper size={14} style={{ color: "#d4a847" }} />
              AI Market Briefing
            </h3>
            <button onClick={generateBriefing} disabled={briefingLoading}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium"
              style={{ background: "rgba(212,168,71,0.15)", color: "#d4a847", border: "1px solid rgba(212,168,71,0.3)" }}>
              {briefingLoading ? <Loader2 size={12} className="animate-spin" /> : <Brain size={12} />}
              {briefingLoading ? "Generating..." : "Regenerate"}
            </button>
          </div>
          {briefingLoading ? (
            <div className="text-center py-12">
              <Loader2 size={32} className="animate-spin mx-auto mb-3" style={{ color: "#d4a847" }} />
              <p className="text-xs" style={{ color: "#808080" }}>JAX-BRIEFING agent is compiling market data...</p>
            </div>
          ) : briefing ? (
            <div className="p-4 rounded-lg" style={{ background: "rgba(10,10,10,0.4)", border: "1px solid rgba(212,168,71,0.08)" }}>
              <pre className="whitespace-pre-wrap text-xs font-sans leading-relaxed" style={{ color: "#c0c0c0" }}>{briefing}</pre>
            </div>
          ) : (
            <div className="text-center py-12">
              <Brain size={32} style={{ color: "#404040" }} className="mx-auto mb-3" />
              <p className="text-xs" style={{ color: "#808080" }}>Click "Regenerate" to create a market briefing</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
