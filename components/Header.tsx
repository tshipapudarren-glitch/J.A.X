"use client";

import React from "react";
import { Menu, Search, Bell, Wifi, WifiOff, Cpu, Clock, User } from "lucide-react";

interface HeaderProps {
  activePage: string;
  onToggleSidebar: () => void;
}

const PAGE_NAMES: Record<string, string> = {
  "command-centre": "Supreme Command Centre",
  "assistant": "J.A.X. Assistant",
  "ai-network": "AI Intelligence Network",
  "agents": "Agent Workforce",
  "trading": "Trading Intelligence",
  "watchtower": "Market Watchtower",
  "charts": "Chart Intelligence",
  "ea-factory": "EA Factory",
  "indicator-factory": "Indicator Factory",
  "strategy-lab": "Strategy Laboratory",
  "backtesting": "Backtesting Centre",
  "news": "News Intelligence",
  "research": "Research Centre",
  "risk": "Risk Management",
  "portfolio": "Portfolio Intelligence",
  "broker": "Broker & MT5 Centre",
  "automation": "Automation Hub",
  "voice": "Voice & Avatar Studio",
  "memory": "Memory Core",
  "dev-studio": "Developer Studio",
  "app-factory": "App Factory",
  "web-architect": "Website Architect",
  "creative": "Creative Studio",
  "business": "Business Intelligence",
  "finance": "Finance Intelligence",
  "data": "Data Intelligence",
  "comms": "Communications Centre",
  "api-vault": "API Vault",
  "security": "Security Centre",
  "missions": "Mission Control",
  "analytics": "Analytics & Reports",
  "devices": "Device & Platform Centre",
  "health": "System Health",
  "settings": "Settings",
};

export default function Header({ activePage, onToggleSidebar }: HeaderProps) {
  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Johannesburg" });

  return (
    <header className="jax-header flex items-center justify-between px-6 py-3 h-14">
      {/* Left */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg hover:bg-white/5 transition-colors lg:hidden"
          style={{ color: "#808080" }}
        >
          <Menu size={18} />
        </button>
        <div>
          <h1 className="text-lg font-semibold" style={{ color: "#e0e0e0" }}>
            {PAGE_NAMES[activePage] || activePage}
          </h1>
        </div>
      </div>

      {/* Center - Status Indicators */}
      <div className="hidden md:flex items-center gap-6">
        {/* AI Provider Status */}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: "#00d97e", boxShadow: "0 0 6px #00d97e" }} />
          <span className="text-xs" style={{ color: "#808080" }}>Claude Active</span>
        </div>

        {/* Market Status */}
        <div className="flex items-center gap-2">
          <Wifi size={12} style={{ color: "#00d97e" }} />
          <span className="text-xs" style={{ color: "#808080" }}>Markets Live</span>
        </div>

        {/* Active Agents */}
        <div className="flex items-center gap-2">
          <Cpu size={12} style={{ color: "#d4a847" }} />
          <span className="text-xs" style={{ color: "#808080" }}>8 Agents Online</span>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {/* Time */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ background: "rgba(26, 26, 46, 0.5)" }}>
          <Clock size={12} style={{ color: "#d4a847" }} />
          <span className="text-xs font-mono" style={{ color: "#c0c0c0" }}>{timeStr} SAST</span>
        </div>

        {/* Search */}
        <button className="p-2 rounded-lg hover:bg-white/5 transition-colors" style={{ color: "#808080" }}>
          <Search size={16} />
        </button>

        {/* Notifications */}
        <button className="p-2 rounded-lg hover:bg-white/5 transition-colors relative" style={{ color: "#808080" }}>
          <Bell size={16} />
          <div className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ background: "#c41e3a" }} />
        </button>

        {/* User */}
        <div className="flex items-center gap-2 pl-3 border-l" style={{ borderColor: "rgba(192, 192, 192, 0.1)" }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #d4a847, #a07c2e)" }}>
            <User size={14} style={{ color: "#0a0a0a" }} />
          </div>
        </div>
      </div>
    </header>
  );
}
