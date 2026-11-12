import React, { useState, useEffect, useCallback } from 'react';

const TRIGGER_TYPES = ['schedule', 'webhook', 'event', 'manual'];
const ACTION_TYPES = ['send_notification', 'execute_function', 'update_record', 'create_report', 'run_analysis', 'send_alert'];

const AutomationHub = () => {
  const [automations, setAutomations] = useState<any[]>([]);
  const [runs, setRuns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newAuto, setNewAuto] = useState({ name: '', description: '', trigger_type: 'manual', actions: [{ type: 'send_notification' }] });

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [aRes, rRes] = await Promise.all([
        fetch('/jax-automation', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'list' }) }),
        fetch('/jax-automation', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'runs' }) }),
      ]);
      const [aData, rData] = await Promise.all([aRes.json(), rRes.json()]);
      if (aData.success) setAutomations(aData.automations || []);
      if (rData.success) setRuns(rData.runs || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  const createAutomation = async () => {
    if (!newAuto.name) return;
    try {
      const res = await fetch('/jax-automation', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', ...newAuto }),
      });
      const data = await res.json();
      if (data.success) { setShowCreate(false); setNewAuto({ name: '', description: '', trigger_type: 'manual', actions: [{ type: 'send_notification' }] }); fetchAll(); }
    } catch (e) { console.error(e); }
  };

  const toggleAutomation = async (id: string, is_active: boolean) => {
    await fetch('/jax-automation', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'toggle', id, is_active: !is_active }) });
    fetchAll();
  };

  const runAutomation = async (id: string) => {
    await fetch('/jax-automation', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'run', automation_id: id, trigger_data: { triggered_by: 'manual', timestamp: new Date().toISOString() } }) });
    fetchAll();
  };

  const deleteAutomation = async (id: string) => {
    if (!confirm('Delete this automation?')) return;
    await fetch('/jax-automation', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'delete', id }) });
    fetchAll();
  };

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const activeCount = automations.filter(a => a.is_active).length;
  const totalRuns = automations.reduce((s, a) => s + (a.run_count || 0), 0);
  const totalFailures = automations.reduce((s, a) => s + (a.failure_count || 0), 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Automation Hub</h1>
          <p className="text-sm text-gray-400 mt-1">JAX-AUTOMATION • Workflow Builder & Executor</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg text-sm font-medium transition">
          + New Automation
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-slate-800 rounded-lg p-4 border border-white/5">
          <div className="text-xs text-gray-400">Total Automations</div>
          <div className="text-2xl font-bold">{automations.length}</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border border-green-500/30">
          <div className="text-xs text-gray-400">Active</div>
          <div className="text-2xl font-bold text-green-400">{activeCount}</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border border-white/5">
          <div className="text-xs text-gray-400">Total Runs</div>
          <div className="text-2xl font-bold text-blue-400">{totalRuns}</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border border-white/5">
          <div className="text-xs text-gray-400">Failures</div>
          <div className={`text-2xl font-bold ${totalFailures > 0 ? 'text-red-400' : 'text-gray-400'}`}>{totalFailures}</div>
        </div>
      </div>

      {/* Create Form */}
      {showCreate && (
        <div className="bg-slate-800 rounded-lg p-6 border border-orange-500/30">
          <h3 className="text-sm font-bold text-orange-300 mb-4">Create New Automation</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs text-gray-400 block mb-1">Name</label>
              <input type="text" value={newAuto.name} onChange={(e) => setNewAuto({ ...newAuto, name: e.target.value })}
                placeholder="e.g. Daily Market Report" className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500" />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Trigger Type</label>
              <select value={newAuto.trigger_type} onChange={(e) => setNewAuto({ ...newAuto, trigger_type: e.target.value })}
                className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500">
                {TRIGGER_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>
          </div>
          <div className="mb-4">
            <label className="text-xs text-gray-400 block mb-1">Description</label>
            <textarea value={newAuto.description} onChange={(e) => setNewAuto({ ...newAuto, description: e.target.value })}
              placeholder="What does this automation do?" className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm text-white h-16 resize-none focus:outline-none focus:border-orange-500" />
          </div>
          <div className="mb-4">
            <label className="text-xs text-gray-400 block mb-1">Actions</label>
            <div className="flex gap-2 flex-wrap">
              {ACTION_TYPES.map(at => (
                <button key={at} onClick={() => setNewAuto({ ...newAuto, actions: [{ type: at }] })}
                  className={`text-xs px-3 py-1 rounded ${newAuto.actions[0]?.type === at ? 'bg-orange-600 text-white' : 'bg-slate-700 text-gray-400 hover:bg-slate-600'}`}>
                  {at.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={createAutomation} className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded text-sm font-medium transition">Create</button>
            <button onClick={() => setShowCreate(false)} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm transition">Cancel</button>
          </div>
        </div>
      )}

      {/* Automations List */}
      <div className="bg-slate-800 rounded-lg border border-white/5 overflow-hidden">
        <div className="p-4 border-b border-slate-700">
          <h3 className="text-sm font-bold text-gray-300">Workflows</h3>
        </div>
        {automations.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="text-4xl mb-3">⚡</div>
            <p>No automations yet. Create your first workflow!</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-700">
            {automations.map((auto: any) => (
              <div key={auto.id} className="p-4 flex items-center gap-4 hover:bg-slate-700/30">
                <div className={`w-3 h-3 rounded-full ${auto.is_active ? 'bg-green-500 shadow-lg shadow-green-500/50' : 'bg-gray-500'}`} />
                <div className="flex-1">
                  <div className="font-medium text-white">{auto.name}</div>
                  <div className="text-xs text-gray-400">{auto.description || 'No description'} • Trigger: {auto.trigger_type}</div>
                </div>
                <div className="text-right text-xs text-gray-400">
                  <div>Runs: {auto.run_count || 0}</div>
                  <div>Failures: {auto.failure_count || 0}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => runAutomation(auto.id)} className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded text-xs hover:bg-blue-600/30">▶ Run</button>
                  <button onClick={() => toggleAutomation(auto.id, auto.is_active)} className={`px-3 py-1 rounded text-xs ${auto.is_active ? 'bg-yellow-600/20 text-yellow-400' : 'bg-green-600/20 text-green-400'}`}>
                    {auto.is_active ? '⏸ Pause' : '▶ Enable'}
                  </button>
                  <button onClick={() => deleteAutomation(auto.id)} className="px-3 py-1 bg-red-600/20 text-red-400 rounded text-xs hover:bg-red-600/30">🗑</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Run History */}
      <div className="bg-slate-800 rounded-lg border border-white/5 overflow-hidden">
        <div className="p-4 border-b border-slate-700">
          <h3 className="text-sm font-bold text-gray-300">Run History</h3>
        </div>
        {runs.length === 0 ? (
          <div className="p-6 text-center text-gray-500 text-sm">No runs recorded yet.</div>
        ) : (
          <div className="divide-y divide-slate-700 max-h-60 overflow-y-auto">
            {runs.slice(0, 15).map((run: any, i: number) => (
              <div key={i} className="p-3 flex items-center gap-3 text-sm">
                <span className={`w-2 h-2 rounded-full ${run.status === 'completed' ? 'bg-green-500' : run.status === 'failed' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                <span className="text-xs text-gray-400 font-mono">{new Date(run.started_at).toLocaleString()}</span>
                <span className={`text-xs px-2 py-0.5 rounded ${run.status === 'completed' ? 'bg-green-500/20 text-green-400' : run.status === 'failed' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{run.status}</span>
                {run.error && <span className="text-xs text-red-400">{run.error}</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AutomationHub;
