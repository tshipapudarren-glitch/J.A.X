"use client";

import React, { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import CommandCentre from "@/views/CommandCentre";
import Assistant from "@/views/Assistant";
import AINetwork from "@/views/AINetwork";
import AgentWorkforce from "@/views/AgentWorkforce";
import TradingIntel from "@/views/TradingIntel";
import AIVault from "@/views/APIVault";
import UsageDashboard from "@/views/UsageDashboard";
import MissionControlView from "@/views/MissionControl";
import MemoryCoreView from "@/views/MemoryCore";
import MarketWatchtower from "@/views/MarketWatchtower";
import ChartIntelligence from "@/views/ChartIntelligence";
import NewsIntel from "@/views/NewsIntel";
import RiskManagement from "@/views/RiskManagement";
import PortfolioIntel from "@/views/PortfolioIntel";
import BrokerMT5 from "@/views/BrokerMT5";
import AutomationHub from "@/views/AutomationHub";
import VoiceAvatar from "@/views/VoiceAvatar";
import DeveloperStudio from "@/views/DeveloperStudio";
import AppFactory from "@/views/AppFactory";
import EAFactory from "@/views/EAFactory";
import IndicatorFactory from "@/views/IndicatorFactory";
import StrategyLab from "@/views/StrategyLab";
import Backtesting from "@/views/Backtesting";
import BusinessIntel from "@/views/BusinessIntel";
import FinanceIntel from "@/views/FinanceIntel";
import DataIntel from "@/views/DataIntel";
import Communications from "@/views/Communications";
import ModulePlaceholder from "@/views/ModulePlaceholder";

const PAGES: Record<string, React.ComponentType> = {
  "command-centre": CommandCentre,
  "assistant": Assistant,
  "ai-network": AINetwork,
  "agents": AgentWorkforce,
  "missions": MissionControlView,
  "memory": MemoryCoreView,
  "trading": TradingIntel,
  "watchtower": MarketWatchtower,
  "charts": ChartIntelligence,
  "news": NewsIntel,
  "risk": RiskManagement,
  "portfolio": PortfolioIntel,
  "broker": BrokerMT5,
  "automation": AutomationHub,
  "voice": VoiceAvatar,
  "dev-studio": DeveloperStudio,
  "app-factory": AppFactory,
  "ea-factory": EAFactory,
  "indicator-factory": IndicatorFactory,
  "strategy-lab": StrategyLab,
  "backtesting": Backtesting,
  "business": BusinessIntel,
  "finance": FinanceIntel,
  "data": DataIntel,
  "comms": Communications,
  "api-vault": AIVault,
  "usage": UsageDashboard,
};

export default function Home() {
  const [activePage, setActivePage] = useState("command-centre");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const ActiveComponent = PAGES[activePage] || (() => <ModulePlaceholder name={activePage} />);

  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{ background: "#050505" }}>
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header
          activePage={activePage}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <main className="flex-1 overflow-auto p-6" style={{ background: "#0a0a0a" }}>
          <div className="animate-fade-in">
            <ActiveComponent />
          </div>
        </main>
      </div>
    </div>
  );
}
