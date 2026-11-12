"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Target, Play, Pause, CheckCircle2, XCircle, Clock, AlertCircle,
  Plus, ChevronRight, Loader2, RefreshCw, Shield, Zap, Eye,
  ArrowRight, ListChecks, Timer
} from "lucide-react";

const SUPABASE_URL = "https://nbjjfvzrjctsyixnhjzf.supabase.co";

interface Mission {
  id: string;
  name: string;
  title?: string;
  objective?: string;
  goal?: string;
  mission_type?: string;
  status: string;
  priority: string;
  total_steps: number;
  completed_steps: number;
  progress?: number;
  created_at: string;
  started_at?: string;
  completed_at?: string;
}

interface MissionStep {
  id: string;
  step_order: number;
  title: string;
  description?: string;
  agent_slug?: string;
  status: string;
  requires_approval: boolean;
  completed_at?: string;
}

export default function MissionControlView() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [steps, setSteps] = useState<MissionStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Create form state
  const [newTitle, setNewTitle] = useState("");
  const [newGoal, setNewGoal] = useState("");
  const [newType, setNewType] = useState("analysis");
  const [newPriority, setNewPriority] = useState(3);
  const [newSteps, setNewSteps] = useState([{ title: "", agent_slug: "", requires_approval: false }]);

  const fetchMissions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/jax-missions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "list" }),
      });
      const data = await res.json();
      if (data.success) setMissions(data.missions || []);
    } catch {}
    setLoading(false);
  }, []);

  const fetchMissionDetails = useCallback(async (missionId: string) => {
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/jax-missions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "get", mission_id: missionId }),
      });
      const data = await res.json();
      if (data.success) {
        setSteps(data.steps || []);
      }
    } catch {}
  }, []);

  useEffect(() => { fetchMissions(); }, [fetchMissions]);

  const handleSelectMission = (mission: Mission) => {
    setSelectedMission(mission);
    fetchMissionDetails(mission.id);
  };

  const handleCreateMission = async () => {
    if (!newTitle.trim()) return;
    setCreating(true);
    try {
      const stepsPayload = newSteps
        .filter(s => s.title.trim())
        .map(s => ({
          title: s.title,
          agent_slug: s.agent_slug || undefined,
          requires_approval: s.requires_approval,
        }));

      const res = await fetch(`${SUPABASE_URL}/functions/v1/jax-missions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          title: newTitle,
          goal: newGoal,
          mission_type: newType,
          priority: newPriority,
          steps: stepsPayload,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowCreateForm(false);
        setNewTitle(""); setNewGoal(""); setNewType("analysis"); setNewPriority(3);
        setNewSteps([{ title: "", agent_slug: "", requires_approval: false }]);
        fetchMissions();
      }
    } catch {}
    setCreating(false);
  };

  const handleUpdateStatus = async (missionId: string, status: string) => {
    await fetch(`${SUPABASE_URL}/functions/v1/jax-missions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update", mission_id: missionId, status }),
    });
    fetchMissions();
    if (selectedMission?.id === missionId) fetchMissionDetails(missionId);
  };

  const statusColors: Record<string, string> = {
    planning: "#f59e0b", approved: "#4285f4", running: "#00d97e",
    paused: "#f59e0b", completed: "#00d97e", failed: "#c41e3a", cancelled: "#808080",
  };

  const stepStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle2 size={12} style={{ color: "#00d97e" }} />;
      case "running": return <Loader2 size={12} style={{ color: "#00d97e" }} className="animate-spin" />;
      case "failed": return <XCircle size={12} style={{ color: "#c41e3a" }} />;
      case "awaiting_approval": return <Shield size={12} style={{ color: "#f59e0b" }} />;
      default: return <Clock size={12} style={{ color: "#808080" }} />;
    }
  };

  const addStep = () => setNewSteps([...newSteps, { title: "", agent_slug: "", requires_approval: false }]);
  const removeStep = (i: number) => setNewSteps(newSteps.filter((_, idx) => idx !== i));
  const updateStep = (i: number, field: string, value: any) => {
    const updated = [...newSteps];
    (updated[i] as any)[field] = value;
    setNewSteps(updated);
  };

  const stats = {
    total: missions.length,
    running: missions.filter(m => m.status === "running").length,
    completed: missions.filter(m => m.status === "completed").length,
    planning: missions.filter(m => m.status === "planning").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: "#e0e0e0" }}>Mission Control</h2>
          <p className="text-xs mt-1" style={{ color: "#808080" }}>Create, plan, execute, and track multi-step agent missions</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchMissions} className="p-2 rounded-lg hover:bg-white/5 transition-colors" style={{ color: "#808080" }}>
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium"
            style={{ background: "rgba(212, 168, 71, 0.15)", color: "#d4a847", border: "1px solid rgba(212, 168, 71, 0.3)" }}
          >
            {showCreateForm ? <XCircle size={12} /> : <Plus size={12} />}
            {showCreateForm ? "Cancel" : "New Mission"}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Missions", value: stats.total, icon: Target, color: "#d4a847" },
          { label: "Running", value: stats.running, icon: Play, color: "#00d97e" },
          { label: "Planning", value: stats.planning, icon: ListChecks, color: "#f59e0b" },
          { label: "Completed", value: stats.completed, icon: CheckCircle2, color: "#00d97e" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="jax-metric">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px]" style={{ color: "#808080" }}>{stat.label}</span>
                <Icon size={12} style={{ color: stat.color }} />
              </div>
              <div className="text-2xl font-bold" style={{ color: "#e0e0e0" }}>{stat.value}</div>
            </div>
          );
        })}
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="jax-glass p-5" style={{ borderColor: "rgba(212, 168, 71, 0.2)" }}>
          <h3 className="jax-section-title mb-4">Create New Mission</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-[10px] font-medium mb-1 block" style={{ color: "#808080" }}>MISSION TITLE</label>
              <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="e.g. Gold Market Analysis"
                className="w-full px-3 py-2 rounded-lg text-xs" style={{ background: "rgba(10,10,10,0.6)", color: "#e0e0e0", border: "1px solid rgba(212,168,71,0.15)" }} />
            </div>
            <div>
              <label className="text-[10px] font-medium mb-1 block" style={{ color: "#808080" }}>MISSION TYPE</label>
              <select value={newType} onChange={e => setNewType(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-xs" style={{ background: "rgba(10,10,10,0.6)", color: "#e0e0e0", border: "1px solid rgba(212,168,71,0.15)" }}>
                {["analysis", "trading", "research", "development", "security", "general"].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="mb-4">
            <label className="text-[10px] font-medium mb-1 block" style={{ color: "#808080" }}>OBJECTIVE</label>
            <textarea value={newGoal} onChange={e => setNewGoal(e.target.value)} placeholder="Describe the mission objective..." rows={2}
              className="w-full px-3 py-2 rounded-lg text-xs resize-none" style={{ background: "rgba(10,10,10,0.6)", color: "#e0e0e0", border: "1px solid rgba(212,168,71,0.1)" }} />
          </div>

          {/* Steps */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] font-medium" style={{ color: "#808080" }}>MISSION STEPS</label>
              <button onClick={addStep} className="text-[10px] px-2 py-0.5 rounded" style={{ color: "#d4a847", background: "rgba(212,168,71,0.1)" }}>+ Add Step</button>
            </div>
            <div className="space-y-2">
              {newSteps.map((step, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-[10px] font-mono w-5 text-center" style={{ color: "#808080" }}>{i + 1}</span>
                  <input value={step.title} onChange={e => updateStep(i, "title", e.target.value)} placeholder="Step title"
                    className="flex-1 px-2 py-1.5 rounded text-xs" style={{ background: "rgba(10,10,10,0.4)", color: "#e0e0e0", border: "1px solid rgba(255,255,255,0.05)" }} />
                  <select value={step.agent_slug} onChange={e => updateStep(i, "agent_slug", e.target.value)}
                    className="px-2 py-1.5 rounded text-xs" style={{ background: "rgba(10,10,10,0.4)", color: "#808080", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <option value="">Any agent</option>
                    {["jax-core", "jax-planner", "jax-verifier", "jax-auditor", "jax-manager"].map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                  <label className="flex items-center gap-1 text-[10px] cursor-pointer" style={{ color: "#808080" }}>
                    <input type="checkbox" checked={step.requires_approval} onChange={e => updateStep(i, "requires_approval", e.target.checked)} />
                    <Shield size={10} />
                  </label>
                  {newSteps.length > 1 && (
                    <button onClick={() => removeStep(i)} className="text-[10px]" style={{ color: "#c41e3a" }}><XCircle size={12} /></button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button onClick={handleCreateMission} disabled={creating || !newTitle.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium"
            style={{ background: creating ? "rgba(212,168,71,0.05)" : "rgba(212,168,71,0.15)", color: "#d4a847", border: "1px solid rgba(212,168,71,0.3)" }}>
            {creating ? <Loader2 size={12} className="animate-spin" /> : <Zap size={12} />}
            {creating ? "Creating..." : "Launch Mission"}
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mission List */}
        <div className="lg:col-span-1 jax-glass p-5">
          <h3 className="jax-section-title mb-3">Missions</h3>
          <div className="space-y-2">
            {missions.length === 0 ? (
              <div className="text-center py-8">
                <Target size={24} style={{ color: "#404040" }} className="mx-auto mb-2" />
                <p className="text-xs" style={{ color: "#808080" }}>No missions yet</p>
              </div>
            ) : missions.map((mission) => (
              <div key={mission.id}
                onClick={() => handleSelectMission(mission)}
                className="p-3 rounded-lg cursor-pointer transition-all"
                style={{
                  background: selectedMission?.id === mission.id ? "rgba(212,168,71,0.08)" : "rgba(10,10,10,0.4)",
                  border: `1px solid ${selectedMission?.id === mission.id ? "rgba(212,168,71,0.2)" : "rgba(255,255,255,0.03)"}`,
                }}>
                <div className="flex items-start justify-between mb-1">
                  <span className="text-xs font-medium" style={{ color: "#e0e0e0" }}>{mission.title || mission.name}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded" style={{
                    background: `${statusColors[mission.status] || "#808080"}15`,
                    color: statusColors[mission.status] || "#808080",
                    border: `1px solid ${statusColors[mission.status] || "#808080"}30`,
                  }}>{mission.status}</span>
                </div>
                <div className="flex items-center gap-3 text-[10px]" style={{ color: "#808080" }}>
                  <span>{mission.mission_type || "general"}</span>
                  <span>{mission.completed_steps}/{mission.total_steps} steps</span>
                  <span>{new Date(mission.created_at).toLocaleDateString("en-ZA")}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mission Details */}
        <div className="lg:col-span-2 jax-glass p-5">
          {selectedMission ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold" style={{ color: "#e0e0e0" }}>{selectedMission.title || selectedMission.name}</h3>
                  <p className="text-xs mt-1" style={{ color: "#808080" }}>{selectedMission.goal || selectedMission.objective}</p>
                </div>
                <div className="flex gap-2">
                  {selectedMission.status === "planning" && (
                    <button onClick={() => handleUpdateStatus(selectedMission.id, "running")}
                      className="flex items-center gap-1 px-3 py-1.5 rounded text-[10px] font-medium"
                      style={{ background: "rgba(0,217,126,0.1)", color: "#00d97e", border: "1px solid rgba(0,217,126,0.2)" }}>
                      <Play size={10} /> Start
                    </button>
                  )}
                  {selectedMission.status === "running" && (
                    <>
                      <button onClick={() => handleUpdateStatus(selectedMission.id, "paused")}
                        className="flex items-center gap-1 px-3 py-1.5 rounded text-[10px] font-medium"
                        style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.2)" }}>
                        <Pause size={10} /> Pause
                      </button>
                      <button onClick={() => handleUpdateStatus(selectedMission.id, "completed")}
                        className="flex items-center gap-1 px-3 py-1.5 rounded text-[10px] font-medium"
                        style={{ background: "rgba(0,217,126,0.1)", color: "#00d97e", border: "1px solid rgba(0,217,126,0.2)" }}>
                        <CheckCircle2 size={10} /> Complete
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-[10px] mb-1">
                  <span style={{ color: "#808080" }}>Progress</span>
                  <span style={{ color: "#d4a847" }}>{selectedMission.completed_steps}/{selectedMission.total_steps} steps</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(212,168,71,0.1)" }}>
                  <div className="h-full rounded-full transition-all" style={{
                    width: `${selectedMission.total_steps > 0 ? (selectedMission.completed_steps / selectedMission.total_steps) * 100 : 0}%`,
                    background: "linear-gradient(90deg, #d4a847, #00d97e)",
                  }} />
                </div>
              </div>

              {/* Steps */}
              <div className="text-xs font-medium mb-3" style={{ color: "#d4a847" }}>MISSION STEPS</div>
              <div className="space-y-2">
                {steps.map((step, i) => (
                  <div key={step.id} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: "rgba(10,10,10,0.4)" }}>
                    {stepStatusIcon(step.status)}
                    <span className="text-[10px] font-mono" style={{ color: "#808080" }}>{step.step_order}</span>
                    <div className="flex-1">
                      <div className="text-xs font-medium" style={{ color: "#e0e0e0" }}>{step.title}</div>
                      {step.agent_slug && <div className="text-[10px]" style={{ color: "#808080" }}>Agent: {step.agent_slug}</div>}
                    </div>
                    <div className="flex items-center gap-2">
                      {step.requires_approval && <Shield size={10} style={{ color: "#f59e0b" }} />}
                      <span className="text-[9px] px-1.5 py-0.5 rounded" style={{
                        background: `${statusColors[step.status] || "#808080"}15`,
                        color: statusColors[step.status] || "#808080",
                      }}>{step.status}</span>
                    </div>
                  </div>
                ))}
                {steps.length === 0 && (
                  <div className="text-center py-4 text-xs" style={{ color: "#808080" }}>No steps defined</div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64">
              <Eye size={24} style={{ color: "#404040" }} className="mb-2" />
              <p className="text-sm" style={{ color: "#808080" }}>Select a mission to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
