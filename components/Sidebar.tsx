"use client";

import React from "react";
import {
  Shield, Bot, Brain, Users, TrendingUp, Eye, BarChart3, Cpu,
  LineChart, FlaskConical, Activity, Newspaper, Search, AlertTriangle,
  PieChart, Landmark, Zap, Mic, Database, Code2, Smartphone, Globe,
  Palette, Briefcase, Wallet, Database as DbIcon, MessageSquare, Key,
  Lock, Target, LineChart as Analytics, Monitor, Heart, Settings,
  ChevronLeft, ChevronRight, Hexagon
} from "lucide-react";

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const NAV_SECTIONS = [
  {
    title: "COMMAND",
    items: [
      { id: "command-centre", label: "Supreme Command", icon: Shield },
      { id: "assistant", label: "J.A.X. Assistant", icon: Bot },
    ],
  },
  {
    title: "INTELLIGENCE",
    items: [
      { id: "ai-network", label: "AI Network", icon: Brain },
      { id: "agents", label: "Agent Workforce", icon: Users },
      { id: "missions", label: "Mission Control", icon: Target },
      { id: "memory", label: "Memory Core", icon: Database },
      { id: "trading", label: "Trading Intel", icon: TrendingUp },
      { id: "watchtower", label: "Market Watchtower", icon: Eye },
      { id: "charts", label: "Chart Intelligence", icon: BarChart3 },
    ],
  },
  {
    title: "FACTORIES",
    items: [
      { id: "ea-factory", label: "EA Factory", icon: Cpu },
      { id: "indicator-factory", label: "Indicator Factory", icon: LineChart },
      { id: "strategy-lab", label: "Strategy Lab", icon: FlaskConical },
      { id: "backtesting", label: "Backtesting", icon: Activity },
    ],
  },
  {
    title: "RESEARCH",
    items: [
      { id: "news", label: "News Intelligence", icon: Newspaper },
      { id: "research", label: "Research Centre", icon: Search },
      { id: "risk", label: "Risk Management", icon: AlertTriangle },
      { id: "portfolio", label: "Portfolio Intel", icon: PieChart },
      { id: "broker", label: "Broker & MT5", icon: Landmark },
    ],
  },
  {
    title: "OPERATIONS",
    items: [
      { id: "automation", label: "Automation Hub", icon: Zap },
      { id: "voice", label: "Voice & Avatar", icon: Mic },
      { id: "memory", label: "Memory Core", icon: Database },
      { id: "dev-studio", label: "Developer Studio", icon: Code2 },
      { id: "app-factory", label: "App Factory", icon: Smartphone },
      { id: "web-architect", label: "Website Architect", icon: Globe },
      { id: "creative", label: "Creative Studio", icon: Palette },
    ],
  },
  {
    title: "BUSINESS",
    items: [
      { id: "business", label: "Business Intel", icon: Briefcase },
      { id: "finance", label: "Finance Intel", icon: Wallet },
      { id: "data", label: "Data Intel", icon: DbIcon },
      { id: "comms", label: "Communications", icon: MessageSquare },
    ],
  },
  {
    title: "SYSTEM",
    items: [
      { id: "usage", label: "Usage & Monitoring", icon: Activity },
      { id: "api-vault", label: "API Vault", icon: Key },
      { id: "security", label: "Security Centre", icon: Lock },
      { id: "missions", label: "Mission Control", icon: Target },
      { id: "analytics", label: "Analytics", icon: Analytics },
      { id: "devices", label: "Devices", icon: Monitor },
      { id: "health", label: "System Health", icon: Heart },
      { id: "settings", label: "Settings", icon: Settings },
    ],
  },
];

export default function Sidebar({ activePage, onNavigate, collapsed, onToggleCollapse }: SidebarProps) {
  return (
    <div
      className={`jax-sidebar flex flex-col h-full transition-all duration-300 ${collapsed ? "w-16" : "w-64"}`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: "rgba(212, 168, 71, 0.08)" }}>
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Hexagon className="w-7 h-7" style={{ color: "#d4a847" }} strokeWidth={1.5} />
            <div>
              <div className="jax-text-gold font-bold text-lg tracking-wide leading-none">J.A.X.</div>
              <div className="text-[9px] tracking-[3px] uppercase" style={{ color: "#808080" }}>Omniverse</div>
            </div>
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-md hover:bg-white/5 transition-colors"
          style={{ color: "#808080" }}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-3 px-2">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title} className="mb-4">
            {!collapsed && (
              <div className="jax-section-title px-3 mb-1">{section.title}</div>
            )}
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <div
                  key={item.id}
                  className={`jax-nav-item ${isActive ? "active" : ""}`}
                  onClick={() => onNavigate(item.id)}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon size={16} style={{ color: isActive ? "#d4a847" : "#808080", flexShrink: 0 }} />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* System Status */}
      {!collapsed && (
        <div className="p-3 border-t" style={{ borderColor: "rgba(212, 168, 71, 0.08)" }}>
          <div className="jax-glass p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full jax-pulse" style={{ background: "#00d97e", boxShadow: "0 0 8px #00d97e" }} />
              <span className="text-xs font-medium" style={{ color: "#00d97e" }}>System Online</span>
            </div>
            <div className="text-[10px]" style={{ color: "#808080" }}>
              v9.0.0 • Phase 9 — FINAL
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
