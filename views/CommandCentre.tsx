"use client";

import React from "react";
import {
  TrendingUp, TrendingDown, Activity, Cpu, Bell, Shield, AlertTriangle,
  Zap, Target, BarChart3, Eye, ArrowUpRight, ArrowDownRight, Clock,
  DollarSign, Layers, CheckCircle2, XCircle, AlertCircle
} from "lucide-react";

function MetricCard({ label, value, change, changeType, icon: Icon }: {
  label: string;
  value: string;
  change?: string;
  changeType?: "up" | "down" | "neutral";
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
}) {
  return (
    <div className="jax-metric">
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs font-medium" style={{ color: "#808080" }}>{label}</span>
        <Icon size={16} style={{ color: "#d4a847" }} />
      </div>
      <div className="text-2xl font-bold mb-1" style={{ color: "#e0e0e0" }}>{value}</div>
      {change && (
        <div className="flex items-center gap-1">
          {changeType === "up" && <ArrowUpRight size={12} style={{ color: "#00d97e" }} />}
          {changeType === "down" && <ArrowDownRight size={12} style={{ color: "#c41e3a" }} />}
          <span className="text-xs" style={{ color: changeType === "up" ? "#00d97e" : changeType === "down" ? "#c41e3a" : "#808080" }}>
            {change}
          </span>
        </div>
      )}
    </div>
  );
}

function StatusDot({ status }: { status: "online" | "warning" | "offline" }) {
  const colors = { online: "#00d97e", warning: "#f59e0b", offline: "#c41e3a" };
  return (
    <div className="w-2 h-2 rounded-full" style={{ background: colors[status], boxShadow: `0 0 6px ${colors[status]}` }} />
  );
}

export default function CommandCentre() {
  return (
    <div className="space-y-6">
      {/* Top Status Bar */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="jax-badge jax-badge-green">
          <StatusDot status="online" /> System Operational
        </div>
        <div className="jax-badge jax-badge-gold">
          <Cpu size={10} /> 8 Agents Active
        </div>
        <div className="jax-badge jax-badge-blue">
          <Zap size={10} /> Phase 1 Active
        </div>
        <div className="jax-badge" style={{ background: "rgba(196, 30, 58, 0.1)", color: "#ff4d6a", border: "1px solid rgba(196, 30, 58, 0.2)" }}>
          <AlertTriangle size={10} /> 2 Pending Approvals
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <MetricCard label="AI Provider" value="Claude" change="Sonnet 4.5" changeType="neutral" icon={Cpu} />
        <MetricCard label="Active Agents" value="8" change="+2 today" changeType="up" icon={Layers} />
        <MetricCard label="Running Missions" value="3" change="1 awaiting approval" changeType="neutral" icon={Target} />
        <MetricCard label="Market Status" value="LIVE" change="XAUUSD $2,680" changeType="up" icon={Activity} />
        <MetricCard label="Open Exposure" value="$12,450" change="2 positions" changeType="neutral" icon={DollarSign} />
        <MetricCard label="System Health" value="99.8%" change="All services OK" changeType="up" icon={Shield} />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left - Market Overview */}
        <div className="lg:col-span-2 space-y-6">
          {/* Market Summary */}
          <div className="jax-glass p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="jax-section-title mb-0">Market Overview</h3>
              <span className="text-xs" style={{ color: "#808080" }}>Last updated: just now</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { symbol: "XAUUSD", name: "Gold", price: "2,680.45", change: "+0.82%", up: true },
                { symbol: "EURUSD", name: "Euro", price: "1.0542", change: "-0.15%", up: false },
                { symbol: "BTCUSD", name: "Bitcoin", price: "97,234", change: "+2.34%", up: true },
                { symbol: "US30", name: "Dow Jones", price: "44,823", change: "+0.45%", up: true },
              ].map((item) => (
                <div key={item.symbol} className="p-3 rounded-lg" style={{ background: "rgba(10, 10, 10, 0.5)", border: "1px solid rgba(192, 192, 192, 0.05)" }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold" style={{ color: "#d4a847" }}>{item.symbol}</span>
                    {item.up ? <TrendingUp size={12} style={{ color: "#00d97e" }} /> : <TrendingDown size={12} style={{ color: "#c41e3a" }} />}
                  </div>
                  <div className="text-sm font-semibold" style={{ color: "#e0e0e0" }}>${item.price}</div>
                  <div className="text-xs" style={{ color: item.up ? "#00d97e" : "#c41e3a" }}>{item.change}</div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Provider Status */}
          <div className="jax-glass p-5">
            <h3 className="jax-section-title">AI Intelligence Network</h3>
            <div className="space-y-3">
              {[
                { name: "Anthropic Claude", model: "claude-sonnet-4-5", status: "online" as const, latency: "1.2s", usage: "2,340 tokens" },
                { name: "OpenAI GPT", model: "gpt-4o", status: "online" as const, latency: "0.8s", usage: "Pending key" },
                { name: "Google Gemini", model: "gemini-pro", status: "warning" as const, latency: "—", usage: "Pending key" },
                { name: "Groq", model: "llama-3", status: "offline" as const, latency: "—", usage: "Pending key" },
              ].map((provider) => (
                <div key={provider.name} className="flex items-center justify-between p-3 rounded-lg" style={{ background: "rgba(10, 10, 10, 0.4)" }}>
                  <div className="flex items-center gap-3">
                    <StatusDot status={provider.status} />
                    <div>
                      <div className="text-sm font-medium" style={{ color: "#e0e0e0" }}>{provider.name}</div>
                      <div className="text-xs" style={{ color: "#808080" }}>{provider.model}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs" style={{ color: "#c0c0c0" }}>{provider.latency}</div>
                    <div className="text-xs" style={{ color: "#808080" }}>{provider.usage}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Opportunities */}
          <div className="jax-glass p-5">
            <h3 className="jax-section-title">Trading Opportunities</h3>
            <div className="space-y-2">
              {[
                { instrument: "XAUUSD", direction: "BUY", type: "Liquidity Sweep + BOS", entry: "2,675.00", sl: "2,668.00", tp: "2,695.00", rr: "2.86", confidence: "Strong" },
                { instrument: "BTCUSD", direction: "BUY", type: "Trend Continuation", entry: "96,800", sl: "95,500", tp: "100,000", rr: "2.46", confidence: "Moderate" },
              ].map((opp, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg" style={{ background: "rgba(10, 10, 10, 0.4)", border: "1px solid rgba(0, 217, 126, 0.1)" }}>
                  <div className="flex items-center gap-4">
                    <span className="jax-badge jax-badge-green">{opp.direction}</span>
                    <div>
                      <div className="text-sm font-bold" style={{ color: "#d4a847" }}>{opp.instrument}</div>
                      <div className="text-xs" style={{ color: "#808080" }}>{opp.type}</div>
                    </div>
                  </div>
                  <div className="hidden md:flex items-center gap-6 text-xs">
                    <div><span style={{ color: "#808080" }}>Entry:</span> <span style={{ color: "#c0c0c0" }}>{opp.entry}</span></div>
                    <div><span style={{ color: "#808080" }}>SL:</span> <span style={{ color: "#c41e3a" }}>{opp.sl}</span></div>
                    <div><span style={{ color: "#808080" }}>TP:</span> <span style={{ color: "#00d97e" }}>{opp.tp}</span></div>
                    <div><span style={{ color: "#808080" }}>R:R:</span> <span style={{ color: "#d4a847" }}>{opp.rr}</span></div>
                    <div className="jax-badge jax-badge-gold">{opp.confidence}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* JAX Status */}
          <div className="jax-glass p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(212, 168, 71, 0.2), rgba(212, 168, 71, 0.05))", border: "1px solid rgba(212, 168, 71, 0.3)" }}>
                <Cpu size={18} style={{ color: "#d4a847" }} />
              </div>
              <div>
                <div className="jax-text-gold font-bold text-sm">J.A.X. STATUS</div>
                <div className="text-xs" style={{ color: "#808080" }}>All systems nominal</div>
              </div>
            </div>
            <div className="space-y-2 text-xs">
              {[
                { label: "Uptime", value: "99.8%", status: "online" as const },
                { label: "Core Intelligence", value: "Active", status: "online" as const },
                { label: "Memory Core", value: "142 records", status: "online" as const },
                { label: "Agent Workforce", value: "8/56 deployed", status: "online" as const },
                { label: "API Connections", value: "1/7 active", status: "warning" as const },
                { label: "Market Feed", value: "Connected", status: "online" as const },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-2">
                    <StatusDot status={item.status} />
                    <span style={{ color: "#808080" }}>{item.label}</span>
                  </div>
                  <span style={{ color: "#c0c0c0" }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Approvals */}
          <div className="jax-glass p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="jax-section-title mb-0">Pending Approvals</h3>
              <span className="jax-badge jax-badge-red">2</span>
            </div>
            <div className="space-y-3">
              {[
                { action: "Deploy EA: XAU Breakout v2", risk: "high", time: "5 min ago" },
                { action: "Risk limit increase: 2% → 3%", risk: "critical", time: "12 min ago" },
              ].map((approval, i) => (
                <div key={i} className="p-3 rounded-lg" style={{ background: "rgba(196, 30, 58, 0.05)", border: "1px solid rgba(196, 30, 58, 0.15)" }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium" style={{ color: "#e0e0e0" }}>{approval.action}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px]" style={{ color: "#808080" }}><Clock size={10} className="inline mr-1" />{approval.time}</span>
                    <span className={`jax-badge ${approval.risk === "critical" ? "jax-badge-red" : "jax-badge-gold"}`}>
                      {approval.risk}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="jax-glass p-5">
            <h3 className="jax-section-title">Recent Activity</h3>
            <div className="space-y-3">
              {[
                { icon: CheckCircle2, text: "Database migration completed", time: "Just now", color: "#00d97e" },
                { icon: Cpu, text: "JAX-CORE initialized", time: "2 min ago", color: "#d4a847" },
                { icon: Bell, text: "XAUUSD opportunity detected", time: "5 min ago", color: "#d4a847" },
                { icon: AlertCircle, text: "OpenAI key pending", time: "15 min ago", color: "#f59e0b" },
                { icon: Shield, text: "Security audit passed", time: "1 hour ago", color: "#00d97e" },
              ].map((activity, i) => {
                const Icon = activity.icon;
                return (
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <Icon size={14} style={{ color: activity.color }} />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs" style={{ color: "#c0c0c0" }}>{activity.text}</div>
                      <div className="text-[10px]" style={{ color: "#808080" }}>{activity.time}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
