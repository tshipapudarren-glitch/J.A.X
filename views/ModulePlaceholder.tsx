"use client";

import React from "react";
import { Construction, Hexagon } from "lucide-react";

interface Props {
  name: string;
}

const MODULE_DESCRIPTIONS: Record<string, { description: string; features: string[]; phase: number }> = {
  "watchtower": { description: "Comprehensive market surveillance with 54 specialized detection systems including heatmaps, volatility monitoring, liquidity radar, and AI-powered threat detection.", features: ["Global Market Scanner", "Market Heatmap", "Opportunity Radar", "Volatility Surveillance", "Liquidity Radar", "Trend Monitor", "54 Detection Systems"], phase: 5 },
  "charts": { description: "Advanced chart analysis with multi-timeframe views, technical indicators, market structure overlays, and AI-powered screenshot analysis.", features: ["Live Charts", "Multi-Timeframe", "Technical Indicators", "Market Structure Overlays", "AI Screenshot Analysis", "Drawing Tools"], phase: 6 },
  "ea-factory": { description: "Complete EA development studio with strategy rule builder, MQL5 code generation, compilation service, and deployment pipeline.", features: ["Strategy Rule Builder", "MQL5 Code Generation", "Compilation Service", "Parameter Editor", "Version Control", "Backtest Integration"], phase: 7 },
  "indicator-factory": { description: "Create custom indicators in Pine Script v6 and MQL5 with equivalent implementations and drawing outputs.", features: ["Pine Script v6", "MQL5 Indicators", "Drawing Engine", "Cross-Language Matching"], phase: 8 },
  "strategy-lab": { description: "Professional strategy research environment with rule builder, optimization, and performance analysis.", features: ["Strategy Builder", "Parameter Optimization", "Historical Analysis", "Strategy Comparison", "Performance Reports"], phase: 9 },
  "backtesting": { description: "Quantitative research with Monte Carlo simulation, walk-forward testing, and stress testing.", features: ["Historical Testing", "Monte Carlo", "Walk-Forward", "Stress Testing", "Drawdown Analysis"], phase: 9 },
  "news": { description: "Global financial news intelligence with sentiment analysis, economic calendar, and news-to-trade workflow.", features: ["Breaking News Radar", "Sentiment Engine", "Economic Calendar", "News Impact Predictor"], phase: 10 },
  "research": { description: "AI-powered research environment with web search, document analysis, and source verification.", features: ["Web Research", "Document Analysis", "Source Comparison", "Fact Verification"], phase: 10 },
  "risk": { description: "Central risk management with deterministic controls that cannot be overridden by AI.", features: ["Position Sizing", "Exposure Limits", "Correlation Monitor", "Emergency Stop"], phase: 4 },
  "portfolio": { description: "Portfolio-wide intelligence with exposure analysis, diversification reports, and performance tracking.", features: ["Equity Tracking", "Exposure Analysis", "Diversification", "Performance Reports"], phase: 11 },
  "broker": { description: "MT5 integration with EA bridge, account monitoring, and execution surveillance.", features: ["MT5 Connection", "EA Bridge", "Account Monitor", "Execution Analysis"], phase: 11 },
  "automation": { description: "Central automation engine with scheduled tasks, event triggers, and conditional workflows.", features: ["Scheduled Tasks", "Event Triggers", "Conditional Workflows", "Mission Automation"], phase: 13 },
  "voice": { description: "Voice-controlled interface with speech-to-text, text-to-speech, and animated avatar.", features: ["Speech-to-Text", "Text-to-Speech", "Voice Commands", "Talking Avatar"], phase: 12 },
  "memory": { description: "Central knowledge store with search, context retrieval, and permission-based access.", features: ["Long-term Memory", "Searchable History", "Context Retrieval", "Memory Summarization"], phase: 3 },
  "dev-studio": { description: "Professional development environment with code editor, testing, and deployment.", features: ["Code Editor", "Multi-Language", "AI Generation", "Testing", "Deployment"], phase: 14 },
  "app-factory": { description: "AI application creation from description to deployment.", features: ["Requirements Generation", "Architecture Design", "UI Generation", "Backend Generation"], phase: 14 },
  "web-architect": { description: "AI website development with responsive design and SEO recommendations.", features: ["Website Generation", "Landing Pages", "Responsive Design", "SEO"], phase: 14 },
  "creative": { description: "Creative production centre for images, video, audio, and brand identity.", features: ["Image Generation", "Video Production", "Brand Identity", "Social Media"], phase: 14 },
  "business": { description: "Business assistant for research, planning, and analysis.", features: ["Competitor Analysis", "Business Planning", "Marketing Strategy", "Revenue Analysis"], phase: 14 },
  "finance": { description: "Financial reporting, budget planning, and revenue analysis.", features: ["Financial Reports", "Budget Planning", "Revenue Analysis", "Forecasting"], phase: 14 },
  "data": { description: "Data analysis centre with CSV/Excel processing and statistical analysis.", features: ["CSV Analysis", "Data Visualization", "Statistical Analysis", "Trend Detection"], phase: 14 },
  "comms": { description: "Central communication system with Telegram, email, and notifications.", features: ["Telegram Integration", "Email", "Push Notifications", "Delivery Tracking"], phase: 14 },
  "api-vault": { description: "Secure API key management with validation, usage tracking, and rotation.", features: ["Key Storage", "Connection Testing", "Usage Tracking", "Rate Limit Monitoring"], phase: 1 },
  "security": { description: "Security centre with authentication, permissions, audit logs, and approval gateway.", features: ["Authentication", "RBAC", "Audit Logs", "Approval Gateway"], phase: 15 },
  "missions": { description: "Autonomous mission control with planning, execution, and approval workflows.", features: ["Mission Planning", "Agent Assignment", "Progress Tracking", "Approval Gateway"], phase: 3 },
  "analytics": { description: "System-wide analytics and reporting dashboard.", features: ["Performance Reports", "Usage Analytics", "Cost Tracking", "Trend Analysis"], phase: 15 },
  "devices": { description: "Device management for connected platforms and sessions.", features: ["Connected Devices", "Session Management", "Push Permissions"], phase: 15 },
  "health": { description: "System health monitoring with service status and alerting.", features: ["Service Monitoring", "Error Logs", "Latency Tracking", "Failure Detection"], phase: 15 },
  "settings": { description: "System configuration and preferences.", features: ["User Preferences", "System Settings", "Integration Config", "Theme"], phase: 1 },
};

export default function ModulePlaceholder({ name = "module" }: Props) {
  const module = MODULE_DESCRIPTIONS[name] || { description: "This module is being built as part of the J.A.X. OMNIVERSE ecosystem.", features: ["Coming soon"], phase: 0 };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="jax-glass p-10 max-w-lg text-center">
        <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center jax-border-animate" style={{ background: "rgba(212, 168, 71, 0.05)", border: "1px solid rgba(212, 168, 71, 0.2)" }}>
          <Hexagon size={28} style={{ color: "#d4a847" }} />
        </div>
        
        <h2 className="jax-text-gold text-2xl font-bold mb-2">
          {name.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
        </h2>
        
        <div className="jax-badge jax-badge-gold mb-4">
          <Construction size={10} /> Phase {module.phase}
        </div>
        
        <p className="text-sm mb-6" style={{ color: "#808080" }}>
          {module.description}
        </p>
        
        <div className="text-left mb-6">
          <div className="text-[10px] uppercase tracking-wider mb-2" style={{ color: "#d4a847" }}>Planned Features</div>
          <div className="space-y-1.5">
            {module.features.map((feature) => (
              <div key={feature} className="flex items-center gap-2 text-xs" style={{ color: "#c0c0c0" }}>
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#d4a847" }} />
                {feature}
              </div>
            ))}
          </div>
        </div>
        
        <div className="jax-divider" />
        
        <div className="text-xs" style={{ color: "#606060" }}>
          This module will be activated in Phase {module.phase} of the J.A.X. OMNIVERSE build plan.
        </div>
      </div>
    </div>
  );
}
