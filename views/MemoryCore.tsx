"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Brain, Search, Plus, RefreshCw, Archive, Trash2, Tag, Clock,
  Database, FileText, Lightbulb, AlertTriangle, BookOpen, Star,
  ChevronDown, ChevronUp, Loader2, Filter
} from "lucide-react";

const SUPABASE_URL = "https://nbjjfvzrjctsyixnhjzf.supabase.co";

interface Memory {
  id: string;
  agent_slug?: string;
  memory_type: string;
  content: string;
  summary?: string;
  tags: string[];
  importance: number;
  access_count: number;
  is_archived: boolean;
  created_at: string;
  relevance_score?: number;
}

export default function MemoryCoreView() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterAgent, setFilterAgent] = useState("");
  const [showStoreForm, setShowStoreForm] = useState(false);
  const [expandedMemory, setExpandedMemory] = useState<string | null>(null);

  // Store form
  const [newContent, setNewContent] = useState("");
  const [newType, setNewType] = useState("fact");
  const [newAgent, setNewAgent] = useState("");
  const [newTags, setNewTags] = useState("");
  const [newImportance, setNewImportance] = useState(3);
  const [storing, setStoring] = useState(false);

  const fetchMemories = useCallback(async () => {
    setLoading(true);
    try {
      const action = searchQuery || filterType || filterAgent ? "search" : "list";
      const body: any = { action, limit: 50 };
      if (searchQuery) body.query = searchQuery;
      if (filterType) body.memory_type = filterType;
      if (filterAgent) body.agent_slug = filterAgent;

      const res = await fetch(`${SUPABASE_URL}/functions/v1/jax-memory`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) setMemories(data.memories || []);
    } catch {}

    // Fetch stats
    try {
      const statsRes = await fetch(`${SUPABASE_URL}/functions/v1/jax-memory`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "stats" }),
      });
      const statsData = await statsRes.json();
      if (statsData.success) setStats(statsData);
    } catch {}

    setLoading(false);
  }, [searchQuery, filterType, filterAgent]);

  useEffect(() => { fetchMemories(); }, [fetchMemories]);

  const handleStoreMemory = async () => {
    if (!newContent.trim()) return;
    setStoring(true);
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/jax-memory`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "store",
          content: newContent,
          memory_type: newType,
          agent_slug: newAgent || undefined,
          tags: newTags.split(",").map(t => t.trim()).filter(Boolean),
          importance: newImportance,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setNewContent(""); setNewTags("");
        setShowStoreForm(false);
        fetchMemories();
      }
    } catch {}
    setStoring(false);
  };

  const handleDeleteMemory = async (memoryId: string, archive = false) => {
    await fetch(`${SUPABASE_URL}/functions/v1/jax-memory`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", memory_id: memoryId, archive }),
    });
    fetchMemories();
  };

  const typeIcons: Record<string, any> = {
    fact: FileText, decision: Lightbulb, lesson: BookOpen,
    observation: Search, conversation: Brain, preference: Star, context: Database,
  };

  const typeColors: Record<string, string> = {
    fact: "#4285f4", decision: "#00d97e", lesson: "#f59e0b",
    observation: "#d4a847", conversation: "#c0c0c0", preference: "#9b59b6", context: "#808080",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: "#e0e0e0" }}>Memory Core</h2>
          <p className="text-xs mt-1" style={{ color: "#808080" }}>Agent memory store — search, store, and manage persistent knowledge</p>
        </div>
        <button
          onClick={() => setShowStoreForm(!showStoreForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium"
          style={{ background: "rgba(212, 168, 71, 0.15)", color: "#d4a847", border: "1px solid rgba(212, 168, 71, 0.3)" }}
        >
          {showStoreForm ? <Trash2 size={12} /> : <Plus size={12} />}
          {showStoreForm ? "Cancel" : "Store Memory"}
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="jax-metric">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px]" style={{ color: "#808080" }}>Total Memories</span>
              <Database size={12} style={{ color: "#d4a847" }} />
            </div>
            <div className="text-2xl font-bold" style={{ color: "#e0e0e0" }}>{stats.total_memories}</div>
          </div>
          <div className="jax-metric">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px]" style={{ color: "#808080" }}>Memory Types</span>
              <Tag size={12} style={{ color: "#00d97e" }} />
            </div>
            <div className="text-2xl font-bold" style={{ color: "#e0e0e0" }}>{Object.keys(stats.by_type || {}).length}</div>
          </div>
          <div className="jax-metric">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px]" style={{ color: "#808080" }}>Agents with Memory</span>
              <Brain size={12} style={{ color: "#4285f4" }} />
            </div>
            <div className="text-2xl font-bold" style={{ color: "#e0e0e0" }}>{Object.keys(stats.by_agent || {}).length}</div>
          </div>
          <div className="jax-metric">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px]" style={{ color: "#808080" }}>Avg Importance</span>
              <Star size={12} style={{ color: "#f59e0b" }} />
            </div>
            <div className="text-2xl font-bold" style={{ color: "#e0e0e0" }}>{stats.avg_importance}/5</div>
          </div>
        </div>
      )}

      {/* Store Form */}
      {showStoreForm && (
        <div className="jax-glass p-5" style={{ borderColor: "rgba(212, 168, 71, 0.2)" }}>
          <h3 className="jax-section-title mb-4">Store New Memory</h3>
          <textarea value={newContent} onChange={e => setNewContent(e.target.value)} placeholder="Memory content..."
            rows={3} className="w-full px-3 py-2 rounded-lg text-xs resize-none mb-3"
            style={{ background: "rgba(10,10,10,0.6)", color: "#e0e0e0", border: "1px solid rgba(212,168,71,0.1)" }} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
            <div>
              <label className="text-[10px] mb-1 block" style={{ color: "#808080" }}>TYPE</label>
              <select value={newType} onChange={e => setNewType(e.target.value)}
                className="w-full px-2 py-1.5 rounded text-xs" style={{ background: "rgba(10,10,10,0.6)", color: "#e0e0e0", border: "1px solid rgba(255,255,255,0.05)" }}>
                {["fact", "decision", "lesson", "observation", "conversation", "preference", "context"].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] mb-1 block" style={{ color: "#808080" }}>AGENT</label>
              <select value={newAgent} onChange={e => setNewAgent(e.target.value)}
                className="w-full px-2 py-1.5 rounded text-xs" style={{ background: "rgba(10,10,10,0.6)", color: "#e0e0e0", border: "1px solid rgba(255,255,255,0.05)" }}>
                <option value="">Global</option>
                {["jax-core", "jax-planner", "jax-verifier", "jax-auditor", "jax-memory"].map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] mb-1 block" style={{ color: "#808080" }}>TAGS (comma-separated)</label>
              <input value={newTags} onChange={e => setNewTags(e.target.value)} placeholder="tag1, tag2"
                className="w-full px-2 py-1.5 rounded text-xs" style={{ background: "rgba(10,10,10,0.6)", color: "#e0e0e0", border: "1px solid rgba(255,255,255,0.05)" }} />
            </div>
            <div>
              <label className="text-[10px] mb-1 block" style={{ color: "#808080" }}>IMPORTANCE</label>
              <select value={newImportance} onChange={e => setNewImportance(Number(e.target.value))}
                className="w-full px-2 py-1.5 rounded text-xs" style={{ background: "rgba(10,10,10,0.6)", color: "#e0e0e0", border: "1px solid rgba(255,255,255,0.05)" }}>
                {[1,2,3,4,5].map(i => <option key={i} value={i}>{i} - {"⭐".repeat(i)}</option>)}
              </select>
            </div>
          </div>
          <button onClick={handleStoreMemory} disabled={storing || !newContent.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium"
            style={{ background: "rgba(212,168,71,0.15)", color: "#d4a847", border: "1px solid rgba(212,168,71,0.3)" }}>
            {storing ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
            {storing ? "Storing..." : "Store Memory"}
          </button>
        </div>
      )}

      {/* Search & Filter */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#808080" }} />
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search memories..."
            className="w-full pl-9 pr-3 py-2 rounded-lg text-xs" style={{ background: "rgba(10,10,10,0.6)", color: "#e0e0e0", border: "1px solid rgba(212,168,71,0.1)" }} />
        </div>
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          className="px-3 py-2 rounded-lg text-xs" style={{ background: "rgba(10,10,10,0.6)", color: "#808080", border: "1px solid rgba(212,168,71,0.1)" }}>
          <option value="">All types</option>
          {["fact", "decision", "lesson", "observation", "conversation", "preference", "context"].map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={filterAgent} onChange={e => setFilterAgent(e.target.value)}
          className="px-3 py-2 rounded-lg text-xs" style={{ background: "rgba(10,10,10,0.6)", color: "#808080", border: "1px solid rgba(212,168,71,0.1)" }}>
          <option value="">All agents</option>
          {["jax-core", "jax-planner", "jax-verifier", "jax-auditor", "jax-memory", "jax-coordinator", "jax-manager", "jax-commander"].map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      {/* Memory List */}
      <div className="jax-glass p-5">
        <h3 className="jax-section-title mb-3">
          Memories ({memories.length})
        </h3>
        {memories.length === 0 ? (
          <div className="text-center py-8">
            <Brain size={24} style={{ color: "#404040" }} className="mx-auto mb-2" />
            <p className="text-sm" style={{ color: "#808080" }}>No memories found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {memories.map((memory) => {
              const TypeIcon = typeIcons[memory.memory_type] || FileText;
              const typeColor = typeColors[memory.memory_type] || "#808080";
              const isExpanded = expandedMemory === memory.id;

              return (
                <div key={memory.id} className="rounded-lg overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.03)" }}>
                  <div className="flex items-start gap-3 p-3 cursor-pointer" style={{ background: "rgba(10,10,10,0.4)" }}
                    onClick={() => setExpandedMemory(isExpanded ? null : memory.id)}>
                    <TypeIcon size={14} style={{ color: typeColor, flexShrink: 0, marginTop: 2 }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs mb-1" style={{ color: "#e0e0e0" }}>
                        {memory.summary || memory.content.substring(0, 100)}
                      </div>
                      <div className="flex items-center gap-3 text-[10px]" style={{ color: "#808080" }}>
                        <span style={{ color: typeColor }}>{memory.memory_type}</span>
                        {memory.agent_slug && <span>Agent: {memory.agent_slug}</span>}
                        <span>{"⭐".repeat(memory.importance)}</span>
                        <span>{new Date(memory.created_at).toLocaleDateString("en-ZA")}</span>
                        {memory.relevance_score !== undefined && memory.relevance_score > 0 && (
                          <span style={{ color: "#d4a847" }}>Score: {memory.relevance_score}</span>
                        )}
                      </div>
                      {memory.tags && memory.tags.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {memory.tags.map((tag, i) => (
                            <span key={i} className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: "rgba(212,168,71,0.08)", color: "#d4a847" }}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={(e) => { e.stopPropagation(); handleDeleteMemory(memory.id, true); }}
                        className="p-1 rounded hover:bg-white/5" title="Archive">
                        <Archive size={10} style={{ color: "#808080" }} />
                      </button>
                      {isExpanded ? <ChevronUp size={12} style={{ color: "#808080" }} /> : <ChevronDown size={12} style={{ color: "#808080" }} />}
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="p-4 text-xs" style={{ background: "rgba(5,5,5,0.6)", color: "#c0c0c0", borderTop: "1px solid rgba(255,255,255,0.03)" }}>
                      <p className="whitespace-pre-wrap">{memory.content}</p>
                      <div className="flex justify-end mt-3 gap-2">
                        <button onClick={() => handleDeleteMemory(memory.id, true)}
                          className="text-[10px] px-2 py-1 rounded flex items-center gap-1" style={{ color: "#f59e0b", background: "rgba(245,158,11,0.1)" }}>
                          <Archive size={8} /> Archive
                        </button>
                        <button onClick={() => handleDeleteMemory(memory.id, false)}
                          className="text-[10px] px-2 py-1 rounded flex items-center gap-1" style={{ color: "#c41e3a", background: "rgba(196,30,58,0.1)" }}>
                          <Trash2 size={8} /> Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Type Distribution */}
      {stats?.by_type && (
        <div className="jax-glass p-5">
          <h3 className="jax-section-title mb-3">Memory Distribution</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {Object.entries(stats.by_type).map(([type, count]: [string, any]) => {
              const Icon = typeIcons[type] || FileText;
              const color = typeColors[type] || "#808080";
              return (
                <div key={type} className="text-center p-3 rounded-lg" style={{ background: "rgba(10,10,10,0.4)" }}>
                  <Icon size={16} style={{ color }} className="mx-auto mb-1" />
                  <div className="text-lg font-bold" style={{ color }}>{count}</div>
                  <div className="text-[10px]" style={{ color: "#808080" }}>{type}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
