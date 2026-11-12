"use client";

import React, { useState, useEffect } from "react";
import {
  Key, Shield, CheckCircle2, XCircle, AlertCircle, RefreshCw,
  Activity, Clock, Wifi, WifiOff, Zap, Eye, EyeOff, Copy, Settings,
  TrendingUp, DollarSign, BarChart3, Database, Brain, Globe
} from "lucide-react";

interface ProviderStatus {
  provider: string;
  name: string;
  type: string;
  slug: string;
  status: "operational" | "degraded" | "offline" | "not_configured";
  latency_ms: number | null;
  message: string;
  models: string[];
  endpoints?: string[];
  secretName: string;
  rateLimit: string;
  icon: React.ComponentType<any>;
  color: string;
  description: string;
}

const PROVIDER_DEFS: ProviderStatus[] = [
  {
    provider: "anthropic", name: "Anthropic", type: "ai", slug: "anthropic",
    status: "not_configured", latency_ms: null, message: "Pending key",
    models: ["Claude Sonnet 4.5", "Claude 3.5 Haiku", "Claude 3 Opus"],
    secretName: "ANTHROPIC_API_KEY", rateLimit: "60 RPM / 100K TPD",
    icon: Brain, color: "#d4a847",
    description: "Advanced reasoning, code generation, and analysis. Powers JAX-CORE intelligence and specialist agents."
  },
  {
    provider: "gemini", name: "Google Gemini", type: "ai", slug: "gemini",
    status: "not_configured", latency_ms: null, message: "Pending key",
    models: ["Gemini 2.0 Flash", "Gemini 2.0 Pro", "Gemini 1.5 Flash"],
    secretName: "GEMINI_API_KEY", rateLimit: "60 RPM / 100K TPD",
    icon: Brain, color: "#4285f4",
    description: "Large context window (2M tokens), multimodal capabilities. Used for research and large document analysis."
  },
  {
    provider: "deepseek", name: "DeepSeek", type: "ai", slug: "deepseek",
    status: "not_configured", latency_ms: null, message: "Pending key",
    models: ["DeepSeek V3", "DeepSeek R1 (Reasoner)"],
    secretName: "DEEPSEEK_API_KEY", rateLimit: "60 RPM / 100K TPD",
    icon: Brain, color: "#8b5cf6",
    description: "Cost-effective reasoning and code generation. DeepSeek R1 excels at complex mathematical analysis."
  },
  {
    provider: "fred", name: "FRED (Federal Reserve)", type: "economic_data", slug: "fred",
    status: "not_configured", latency_ms: null, message: "Pending key",
    models: [], endpoints: ["GDP", "CPI Inflation", "Unemployment", "Fed Funds Rate", "Treasury Yields"],
    secretName: "FRED_API_KEY", rateLimit: "120 RPM / 50K TPD",
    icon: Database, color: "#00d97e",
    description: "Federal Reserve economic data. GDP, inflation, unemployment, interest rates, and 800K+ economic series."
  },
  {
    provider: "fmp", name: "Financial Modeling Prep", type: "market_data", slug: "fmp",
    status: "not_configured", latency_ms: null, message: "Pending key",
    models: [], endpoints: ["Stock Quotes", "Income Statements", "Balance Sheets", "Cash Flow", "Historical Prices", "Forex Rates", "Crypto Prices", "Earnings Calendar"],
    secretName: "FMP_API_KEY", rateLimit: "300 RPM / 250K TPD",
    icon: TrendingUp, color: "#f59e0b",
    description: "Comprehensive market data: stock quotes, financial statements, forex, crypto, and earnings. Powers Trading Intelligence."
  },
  {
    provider: "alpha_vantage", name: "Alpha Vantage", type: "market_data", slug: "alpha_vantage",
    status: "not_configured", latency_ms: null, message: "Pending key",
    models: [], endpoints: ["Time Series OHLC", "Forex Exchange", "Crypto Exchange", "Technical Indicators", "News Sentiment", "Economic Indicators"],
    secretName: "ALPHA_VANTAGE_API_KEY", rateLimit: "5 RPM / 500 TPD",
    icon: BarChart3, color: "#c41e3a",
    description: "Technical indicators (SMA, EMA, RSI), news sentiment analysis, forex/crypto rates. Complements FMP data."
  },
];

export default function AIVaultPage() {
  const [providers, setProviders] = useState<ProviderStatus[]>(PROVIDER_DEFS);
  const [checking, setChecking] = useState(false);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [keyInputs, setKeyInputs] = useState<Record<string, string>>({});
  const [savedKeys, setSavedKeys] = useState<Record<string, boolean>>({});

  const statusColors: Record<string, string> = {
    operational: "#00d97e",
    degraded: "#f59e0b",
    offline: "#c41e3a",
    not_configured: "#808080",
  };

  const typeLabels: Record<string, string> = {
    ai: "AI Intelligence",
    economic_data: "Economic Data",
    market_data: "Market Data",
  };

  const totalOperational = providers.filter(p => p.status === "operational").length;
  const totalAI = providers.filter(p => p.type === "ai");
  const totalData = providers.filter(p => p.type !== "ai");

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="jax-metric">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs" style={{ color: "#808080" }}>Providers Online</span>
            <Zap size={14} style={{ color: "#d4a847" }} />
          </div>
          <div className="text-2xl font-bold" style={{ color: totalOperational > 0 ? "#00d97e" : "#f59e0b" }}>
            {totalOperational}/{providers.length}
          </div>
          <div className="text-xs" style={{ color: "#808080" }}>
            {totalOperational === 0 ? "Awaiting API keys" : "Active connections"}
          </div>
        </div>
        <div className="jax-metric">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs" style={{ color: "#808080" }}>AI Providers</span>
            <Brain size={14} style={{ color: "#d4a847" }} />
          </div>
          <div className="text-2xl font-bold" style={{ color: "#e0e0e0" }}>
            {totalAI.filter(p => p.status === "operational").length}/{totalAI.length}
          </div>
          <div className="text-xs" style={{ color: "#808080" }}>Claude, Gemini, DeepSeek</div>
        </div>
        <div className="jax-metric">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs" style={{ color: "#808080" }}>Data Providers</span>
            <Database size={14} style={{ color: "#d4a847" }} />
          </div>
          <div className="text-2xl font-bold" style={{ color: "#e0e0e0" }}>
            {totalData.filter(p => p.status === "operational").length}/{totalData.length}
          </div>
          <div className="text-xs" style={{ color: "#808080" }}>FRED, FMP, Alpha Vantage</div>
        </div>
        <div className="jax-metric">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs" style={{ color: "#808080" }}>Gateway Status</span>
            <Shield size={14} style={{ color: "#00d97e" }} />
          </div>
          <div className="text-2xl font-bold" style={{ color: "#00d97e" }}>ACTIVE</div>
          <div className="text-xs" style={{ color: "#808080" }}>Edge Function deployed</div>
        </div>
      </div>

      {/* Gateway Info */}
      <div className="jax-glass p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Shield size={18} style={{ color: "#d4a847" }} />
            <h3 className="text-sm font-semibold" style={{ color: "#e0e0e0" }}>J.A.X. AI Gateway</h3>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: "#00d97e", boxShadow: "0 0 6px #00d97e" }} />
            <span className="text-xs" style={{ color: "#00d97e" }}>Deployed</span>
          </div>
        </div>
        <p className="text-xs mb-3" style={{ color: "#808080" }}>
          The JAX Gateway is a Supabase Edge Function that routes all API requests through a unified interface.
          API keys are stored encrypted in Supabase Secrets and never exposed to the frontend.
        </p>
        <div className="grid grid-cols-3 gap-3 text-xs">
          <div className="p-2 rounded" style={{ background: "rgba(10,10,10,0.4)" }}>
            <span style={{ color: "#808080" }}>Endpoint:</span>
            <div className="font-mono text-[10px] mt-1" style={{ color: "#d4a847" }}>/functions/v1/jax-gateway</div>
          </div>
          <div className="p-2 rounded" style={{ background: "rgba(10,10,10,0.4)" }}>
            <span style={{ color: "#808080" }}>Health Check:</span>
            <div className="font-mono text-[10px] mt-1" style={{ color: "#d4a847" }}>/functions/v1/jax-health-check</div>
          </div>
          <div className="p-2 rounded" style={{ background: "rgba(10,10,10,0.4)" }}>
            <span style={{ color: "#808080" }}>Security:</span>
            <div className="font-mono text-[10px] mt-1" style={{ color: "#00d97e" }}>JWT Verified</div>
          </div>
        </div>
      </div>

      {/* AI Providers Section */}
      <div>
        <h3 className="jax-section-title">AI Intelligence Providers</h3>
        <div className="space-y-4">
          {providers.filter(p => p.type === "ai").map((provider) => (
            <ProviderCard
              key={provider.slug}
              provider={provider}
              statusColors={statusColors}
              showKey={showKeys[provider.slug] || false}
              onToggleKey={() => setShowKeys(prev => ({ ...prev, [provider.slug]: !prev[provider.slug] }))}
              keyValue={keyInputs[provider.slug] || ""}
              onKeyChange={(val) => setKeyInputs(prev => ({ ...prev, [provider.slug]: val }))}
              isSaved={savedKeys[provider.slug] || false}
              onSave={() => setSavedKeys(prev => ({ ...prev, [provider.slug]: true }))}
            />
          ))}
        </div>
      </div>

      {/* Data Providers Section */}
      <div>
        <h3 className="jax-section-title">Financial & Economic Data Providers</h3>
        <div className="space-y-4">
          {providers.filter(p => p.type !== "ai").map((provider) => (
            <ProviderCard
              key={provider.slug}
              provider={provider}
              statusColors={statusColors}
              showKey={showKeys[provider.slug] || false}
              onToggleKey={() => setShowKeys(prev => ({ ...prev, [provider.slug]: !prev[provider.slug] }))}
              keyValue={keyInputs[provider.slug] || ""}
              onKeyChange={(val) => setKeyInputs(prev => ({ ...prev, [provider.slug]: val }))}
              isSaved={savedKeys[provider.slug] || false}
              onSave={() => setSavedKeys(prev => ({ ...prev, [provider.slug]: true }))}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ProviderCard({ provider, statusColors, showKey, onToggleKey, keyValue, onKeyChange, isSaved, onSave }: {
  provider: ProviderStatus;
  statusColors: Record<string, string>;
  showKey: boolean;
  onToggleKey: () => void;
  keyValue: string;
  onKeyChange: (val: string) => void;
  isSaved: boolean;
  onSave: () => void;
}) {
  const typeLabels: Record<string, string> = { ai: "AI Intelligence", economic_data: "Economic Data", market_data: "Market Data" };

  return (
    <div className="jax-glass p-5" style={{ borderColor: `${statusColors[provider.status]}20` }}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${provider.color}15`, border: `1px solid ${provider.color}30` }}>
            {React.createElement(provider.icon, { size: 18, style: { color: provider.color } })}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm" style={{ color: "#e0e0e0" }}>{provider.name}</span>
              <span className="jax-badge" style={{
                fontSize: "9px",
                background: `${statusColors[provider.status]}15`,
                color: statusColors[provider.status],
                border: `1px solid ${statusColors[provider.status]}30`,
              }}>
                {provider.status === "operational" ? "● Online" : provider.status === "not_configured" ? "○ Needs Key" : "● " + provider.status}
              </span>
            </div>
            <div className="text-xs" style={{ color: "#808080" }}>{typeLabels[provider.type]}</div>
          </div>
        </div>
        {provider.latency_ms && (
          <div className="text-right">
            <div className="text-xs font-mono" style={{ color: "#d4a847" }}>{provider.latency_ms}ms</div>
            <div className="text-[10px]" style={{ color: "#808080" }}>{provider.rateLimit}</div>
          </div>
        )}
      </div>

      <p className="text-xs mb-4" style={{ color: "#808080" }}>{provider.description}</p>

      {/* Models / Endpoints */}
      {provider.models.length > 0 && (
        <div className="mb-3">
          <div className="text-[10px] uppercase tracking-wider mb-1.5" style={{ color: provider.color }}>Models</div>
          <div className="flex flex-wrap gap-1.5">
            {provider.models.map(m => (
              <span key={m} className="text-[10px] px-2 py-0.5 rounded" style={{ background: "rgba(10,10,10,0.5)", color: "#c0c0c0", border: "1px solid rgba(192,192,192,0.08)" }}>
                {m}
              </span>
            ))}
          </div>
        </div>
      )}
      {provider.endpoints && provider.endpoints.length > 0 && (
        <div className="mb-3">
          <div className="text-[10px] uppercase tracking-wider mb-1.5" style={{ color: provider.color }}>Endpoints</div>
          <div className="flex flex-wrap gap-1.5">
            {provider.endpoints.map(e => (
              <span key={e} className="text-[10px] px-2 py-0.5 rounded" style={{ background: "rgba(10,10,10,0.5)", color: "#c0c0c0", border: "1px solid rgba(192,192,192,0.08)" }}>
                {e}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* API Key Input */}
      <div className="jax-divider" />
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <input
            type={showKey ? "text" : "password"}
            value={keyValue}
            onChange={(e) => onKeyChange(e.target.value)}
            placeholder={`Enter ${provider.secretName}...`}
            className="jax-input pr-10 text-xs font-mono"
            style={{ fontSize: "11px" }}
          />
          <button
            onClick={onToggleKey}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1"
            style={{ color: "#808080" }}
          >
            {showKey ? <EyeOff size={12} /> : <Eye size={12} />}
          </button>
        </div>
        <button
          onClick={onSave}
          disabled={!keyValue}
          className="px-3 py-2 rounded-lg text-xs font-medium disabled:opacity-40 transition-all"
          style={{
            background: isSaved ? "rgba(0, 217, 126, 0.15)" : keyValue ? "rgba(212, 168, 71, 0.15)" : "rgba(10,10,10,0.4)",
            color: isSaved ? "#00d97e" : "#d4a847",
            border: `1px solid ${isSaved ? "rgba(0,217,126,0.3)" : keyValue ? "rgba(212,168,71,0.3)" : "rgba(192,192,192,0.1)"}`,
          }}
        >
          {isSaved ? <CheckCircle2 size={14} /> : <Key size={14} />}
        </button>
      </div>
      <div className="text-[10px] mt-1.5 font-mono" style={{ color: "#606060" }}>
        Secret: {provider.secretName}
      </div>
    </div>
  );
}
