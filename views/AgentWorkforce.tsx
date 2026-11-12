"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Users, Zap, CheckCircle2, XCircle, Activity, Clock, Send,
  Loader2, RefreshCw, Brain, Shield, Eye, Cpu, Target, MessageSquare
} from "lucide-react";

const SUPABASE_URL = "https://nbjjfvzrjctsyixnhjzf.supabase.co";

interface Agent {
  slug: string;
  name: string;
  category: string;
  description?: string;
  status: string;
  is_core: boolean;
  capabilities?: string[];
  provider?: string;
  model?: string;
  total_executions?: number;
  total_tokens?: number;
  avg_duration_ms?: number;
  last_active_at?: string;
}

export default function AgentWorkforce() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [execInput, setExecInput] = useState("");
  const [execResult, setExecResult] = useState<any>(null);
  const [execLoading, setExecLoading] = useState(false);
  const [executions, setExecutions] = useState<any[]>([]);

  const fetchAgents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/jax-agents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "list" }),
      });
      const data = await res.json();
      if (data.success) setAgents(data.agents || []);
    } catch {}
    setLoading(false);
  }, []);

  const fetchExecutions = useCallback(async (agentSlug: string) => {
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/jax-agents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "history", agent_slug: agentSlug, limit: 10 }),
      });
      const data = await res.json();
      if (data.success) setExecutions(data.executions || []);
    } catch {}
  }, []);

  useEffect(() => { fetchAgents(); }, [fetchAgents]);

  const handleExecuteAgent = async () => {
    if (!selectedAgent || !execInput.trim()) return;
    setExecLoading(true);
    setExecResult(null);
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/jax-agents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "execute", agent_slug: selectedAgent.slug, input: execInput }),
      });
      const data = await res.json();
      setExecResult(data);
      fetchExecutions(selectedAgent.slug);
    } catch (e: any) {
      setExecResult({ success: false, error: e.message });
    }
    setExecLoading(false);
  };

  const handleSelectAgent = (agent: Agent) => {
    setSelectedAgent(agent);
    setExecResult(null);
    setExecInput("");
    fetchExecutions(agent.slug);
  };

  const coreAgents = agents.filter(a => a.is_core || a.slug?.startsWith("jax-"));
  const specialistAgents = agents.filter(a => !a.is_core && !a.slug?.startsWith("jax-"));

  const statusColors: Record<string, string> = { active: "#00d97e", inactive: "#808080", error: "#c41e3a" };

  const categoryIcons: Record<string, any> = {
    core: Brain, trading: Target, analysis: Eye, risk: Shield,
    research: MessageSquare, development: Cpu, management: Users,
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Agents", value: agents.length, icon: Users, color: "#d4a847" },
          { label: "Core Agents", value: coreAgents.length, icon: Brain, color: "#00d97e" },
          { label: "Active Now", value: agents.filter(a => a.status === "active").length, icon: Activity, color: "#00d97e" },
          { label: "Specialist Agents", value: specialistAgents.length, icon: Cpu, color: "#d4a847" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="jax-metric">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs" style={{ color: "#808080" }}>{stat.label}</span>
                <Icon size={14} style={{ color: stat.color }} />
              </div>
              <div className="text-2xl font-bold" style={{ color: "#e0e0e0" }}>{stat.value}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agent List */}
        <div className="lg:col-span-1 jax-glass p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="jax-section-title">Agent Registry</h3>
            <button onClick={fetchAgents} className="p-1 rounded hover:bg-white/5" style={{ color: "#808080" }}>
              <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
            </button>
          </div>

          {/* Core Agents */}
          <div className="text-[10px] font-medium mb-2" style={{ color: "#d4a847" }}>CORE ORCHESTRATORS</div>
          <div className="space-y-1.5 mb-4">
            {coreAgents.map((agent) => (
              <div key={agent.slug || agent.name}
                onClick={() => handleSelectAgent(agent)}
                className="flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all"
                style={{
                  background: selectedAgent?.slug === agent.slug ? "rgba(212,168,71,0.08)" : "rgba(10,10,10,0.3)",
                  border: `1px solid ${selectedAgent?.slug === agent.slug ? "rgba(212,168,71,0.15)" : "transparent"}`,
                }}>
                <div className="w-1.5 h-1.5 rounded-full" style={{
                  background: statusColors[agent.status] || "#808080",
                  boxShadow: `0 0 4px ${statusColors[agent.status] || "#808080"}`,
                }} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium truncate" style={{ color: "#e0e0e0" }}>{agent.name}</div>
                  <div className="text-[9px] truncate" style={{ color: "#808080" }}>{agent.description?.substring(0, 50) || agent.slug}</div>
                </div>
                <span className="text-[8px] px-1 py-0.5 rounded" style={{
                  background: `${statusColors[agent.status]}15`,
                  color: statusColors[agent.status],
                }}>{agent.status}</span>
              </div>
            ))}
          </div>

          {/* Specialist Agents */}
          {specialistAgents.length > 0 && (
            <>
              <div className="text-[10px] font-medium mb-2" style={{ color: "#808080" }}>SPECIALIST AGENTS</div>
              <div className="space-y-1.5">
                {specialistAgents.slice(0, 12).map((agent) => (
                  <div key={agent.slug || agent.name}
                    onClick={() => handleSelectAgent(agent)}
                    className="flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all"
                    style={{
                      background: selectedAgent?.slug === agent.slug ? "rgba(212,168,71,0.08)" : "transparent",
                    }}>
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: statusColors[agent.status] || "#808080" }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs truncate" style={{ color: "#c0c0c0" }}>{agent.name}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Agent Details & Execution */}
        <div className="lg:col-span-2 space-y-4">
          {selectedAgent ? (
            <>
              {/* Agent Info */}
              <div className="jax-glass p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold" style={{ color: "#e0e0e0" }}>{selectedAgent.name}</h3>
                      <div className="w-2 h-2 rounded-full" style={{
                        background: statusColors[selectedAgent.status] || "#808080",
                        boxShadow: `0 0 6px ${statusColors[selectedAgent.status] || "#808080"}`,
                      }} />
                    </div>
                    <p className="text-xs mt-1" style={{ color: "#808080" }}>{selectedAgent.description}</p>
                  </div>
                  <span className="jax-badge" style={{
                    background: selectedAgent.is_core ? "rgba(212,168,71,0.1)" : "rgba(192,192,192,0.1)",
                    color: selectedAgent.is_core ? "#d4a847" : "#808080",
                    border: `1px solid ${selectedAgent.is_core ? "rgba(212,168,71,0.2)" : "rgba(192,192,192,0.1)"}`,
                  }}>
                    {selectedAgent.is_core ? "CORE" : "SPECIALIST"}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  <div className="text-center p-2 rounded" style={{ background: "rgba(10,10,10,0.4)" }}>
                    <div className="text-sm font-bold" style={{ color: "#e0e0e0" }}>{selectedAgent.provider || "—"}</div>
                    <div className="text-[9px]" style={{ color: "#808080" }}>Provider</div>
                  </div>
                  <div className="text-center p-2 rounded" style={{ background: "rgba(10,10,10,0.4)" }}>
                    <div className="text-sm font-bold font-mono" style={{ color: "#e0e0e0" }}>{selectedAgent.model || "—"}</div>
                    <div className="text-[9px]" style={{ color: "#808080" }}>Model</div>
                  </div>
                  <div className="text-center p-2 rounded" style={{ background: "rgba(10,10,10,0.4)" }}>
                    <div className="text-sm font-bold" style={{ color: "#e0e0e0" }}>{selectedAgent.total_executions || 0}</div>
                    <div className="text-[9px]" style={{ color: "#808080" }}>Executions</div>
                  </div>
                  <div className="text-center p-2 rounded" style={{ background: "rgba(10,10,10,0.4)" }}>
                    <div className="text-sm font-bold" style={{ color: "#e0e0e0" }}>{selectedAgent.avg_duration_ms || 0}ms</div>
                    <div className="text-[9px]" style={{ color: "#808080" }}>Avg Latency</div>
                  </div>
                </div>

                {selectedAgent.capabilities && selectedAgent.capabilities.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {selectedAgent.capabilities.map((cap, i) => (
                      <span key={i} className="text-[9px] px-2 py-0.5 rounded" style={{ background: "rgba(0,217,126,0.08)", color: "#00d97e", border: "1px solid rgba(0,217,126,0.15)" }}>
                        {cap}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Execute Agent */}
              <div className="jax-glass p-5">
                <h3 className="jax-section-title mb-3 flex items-center gap-2">
                  <Zap size={14} style={{ color: "#d4a847" }} />
                  Execute Agent
                </h3>
                <textarea value={execInput} onChange={e => setExecInput(e.target.value)}
                  placeholder={`Send a task to ${selectedAgent.name}...`}
                  rows={2} className="w-full px-3 py-2 rounded-lg text-xs resize-none mb-3"
                  style={{ background: "rgba(10,10,10,0.6)", color: "#e0e0e0", border: "1px solid rgba(212,168,71,0.1)" }} />
                <button onClick={handleExecuteAgent} disabled={execLoading || !execInput.trim()}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium"
                  style={{ background: "rgba(212,168,71,0.15)", color: "#d4a847", border: "1px solid rgba(212,168,71,0.3)" }}>
                  {execLoading ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                  {execLoading ? "Executing..." : "Execute"}
                </button>

                {execResult && (
                  <div className="mt-4 p-4 rounded-lg" style={{
                    background: execResult.success ? "rgba(0,217,126,0.03)" : "rgba(196,30,58,0.05)",
                    border: `1px solid ${execResult.success ? "rgba(0,217,126,0.15)" : "rgba(196,30,58,0.2)"}`,
                  }}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {execResult.success ? <CheckCircle2 size={12} style={{ color: "#00d97e" }} /> : <XCircle size={12} style={{ color: "#c41e3a" }} />}
                        <span className="text-xs font-medium" style={{ color: execResult.success ? "#00d97e" : "#c41e3a" }}>
                          {execResult.success ? "Success" : "Failed"}
                        </span>
                      </div>
                      <span className="text-[10px]" style={{ color: "#808080" }}>{execResult.duration_ms}ms</span>
                    </div>
                    {execResult.content && (
                      <div className="text-xs p-3 rounded mt-2 max-h-64 overflow-auto" style={{ background: "rgba(10,10,10,0.4)", color: "#c0c0c0" }}>
                        <pre className="whitespace-pre-wrap font-sans">{execResult.content}</pre>
                      </div>
                    )}
                    {execResult.error && (
                      <div className="text-xs mt-2" style={{ color: "#c41e3a" }}>{execResult.error}</div>
                    )}
                    <div className="flex gap-4 mt-2 text-[10px]" style={{ color: "#808080" }}>
                      <span>Tokens: {execResult.input_tokens}→{execResult.output_tokens}</span>
                      <span>{execResult.provider}/{execResult.model}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Execution History */}
              {executions.length > 0 && (
                <div className="jax-glass p-5">
                  <h3 className="jax-section-title mb-3 flex items-center gap-2">
                    <Clock size={14} style={{ color: "#808080" }} />
                    Recent Executions
                  </h3>
                  <div className="space-y-2">
                    {executions.slice(0, 5).map((exec: any) => (
                      <div key={exec.id} className="flex items-center gap-3 p-2 rounded-lg text-xs" style={{ background: "rgba(10,10,10,0.3)" }}>
                        {exec.status === "success" ? <CheckCircle2 size={10} style={{ color: "#00d97e" }} /> : <XCircle size={10} style={{ color: "#c41e3a" }} />}
                        <span className="flex-1 truncate" style={{ color: "#c0c0c0" }}>{exec.input_text?.substring(0, 60) || "Task"}</span>
                        <span style={{ color: "#808080" }}>{exec.duration_ms}ms</span>
                        <span style={{ color: "#808080" }}>{new Date(exec.created_at).toLocaleTimeString("en-ZA", { timeZone: "Africa/Johannesburg", hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="jax-glass p-5 flex flex-col items-center justify-center h-96">
              <Brain size={32} style={{ color: "#404040" }} className="mb-3" />
              <p className="text-sm" style={{ color: "#808080" }}>Select an agent to view details and execute tasks</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
