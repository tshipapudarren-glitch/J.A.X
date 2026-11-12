import React, { useState, useEffect, useCallback } from 'react';
const DataIntel = () => {
  const [pipelines, setPipelines] = useState<any[]>([]);
  const [overview, setOverview] = useState<any>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newPipe, setNewPipe] = useState({ name: '', source_type: 'api', target_type: 'database', schedule: 'hourly' });

  const fetchAll = useCallback(async () => {
    const [pRes, oRes] = await Promise.all([
      fetch('/jax-data-comms', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'pipelines' }) }),
      fetch('/jax-data-comms', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'overview' }) }),
    ]);
    const [pData, oData] = await Promise.all([pRes.json(), oRes.json()]);
    if (pData.success) setPipelines(pData.pipelines || []);
    if (oData.success) setOverview(oData);
  }, []);
  useEffect(() => { fetchAll(); }, [fetchAll]);

  const create = async () => {
    if (!newPipe.name) return;
    await fetch('/jax-data-comms', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'create_pipeline', ...newPipe }) });
    setShowCreate(false); setNewPipe({ name: '', source_type: 'api', target_type: 'database', schedule: 'hourly' }); fetchAll();
  };
  const runPipeline = async (id: string) => {
    await fetch('/jax-data-comms', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'run_pipeline', id }) });
    setTimeout(fetchAll, 3000);
  };

  const statusColor: Record<string, string> = { active: 'bg-green-500', inactive: 'bg-gray-500', error: 'bg-red-500', running: 'bg-blue-500 animate-pulse' };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold">Data Intelligence</h1><p className="text-sm text-gray-400 mt-1">JAX-DATA-ENGINEER • Pipeline Management & ETL</p></div>
        <button onClick={() => setShowCreate(!showCreate)} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-sm font-medium">+ New Pipeline</button>
      </div>
      {overview && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-slate-800 rounded-lg p-4 border border-white/5"><div className="text-xs text-gray-400">Total Pipelines</div><div className="text-2xl font-bold">{overview.pipelines?.total || 0}</div></div>
          <div className="bg-slate-800 rounded-lg p-4 border border-green-500/30"><div className="text-xs text-gray-400">Active</div><div className="text-2xl font-bold text-green-400">{overview.pipelines?.active || 0}</div></div>
          <div className="bg-slate-800 rounded-lg p-4 border border-red-500/30"><div className="text-xs text-gray-400">Errors</div><div className="text-2xl font-bold text-red-400">{overview.pipelines?.error || 0}</div></div>
        </div>
      )}
      {showCreate && (
        <div className="bg-slate-800 rounded-lg p-6 border border-cyan-500/30">
          <h3 className="text-sm font-bold text-cyan-300 mb-4">Create Data Pipeline</h3>
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div><label className="text-xs text-gray-400">Name</label><input type="text" value={newPipe.name} onChange={e => setNewPipe({...newPipe, name: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm text-white mt-1" /></div>
            <div><label className="text-xs text-gray-400">Source</label><select value={newPipe.source_type} onChange={e => setNewPipe({...newPipe, source_type: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm text-white mt-1"><option value="api">API</option><option value="database">Database</option><option value="file">File</option><option value="stream">Stream</option></select></div>
            <div><label className="text-xs text-gray-400">Target</label><select value={newPipe.target_type} onChange={e => setNewPipe({...newPipe, target_type: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm text-white mt-1"><option value="database">Database</option><option value="cache">Cache</option><option value="warehouse">Warehouse</option></select></div>
            <div><label className="text-xs text-gray-400">Schedule</label><select value={newPipe.schedule} onChange={e => setNewPipe({...newPipe, schedule: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm text-white mt-1"><option value="hourly">Hourly</option><option value="daily">Daily</option><option value="weekly">Weekly</option><option value="manual">Manual</option></select></div>
          </div>
          <button onClick={create} className="px-4 py-2 bg-cyan-600 rounded text-sm">Create</button>
        </div>
      )}
      <div className="bg-slate-800 rounded-lg border border-white/5">
        <div className="p-4 border-b border-slate-700"><h3 className="text-sm font-bold">Pipelines</h3></div>
        {pipelines.length === 0 ? <div className="p-8 text-center text-gray-500"><div className="text-4xl mb-3">🔄</div><p>No data pipelines configured</p></div> :
          <div className="divide-y divide-slate-700">{pipelines.map(p => (
            <div key={p.id} className="p-4 flex items-center gap-4 hover:bg-slate-700/30">
              <div className={`w-3 h-3 rounded-full ${statusColor[p.status] || 'bg-gray-500'}`} />
              <div className="flex-1"><div className="text-sm font-medium text-white">{p.name}</div><div className="text-xs text-gray-400">{p.source_type} → {p.target_type} • {p.schedule} • Runs: {p.run_count || 0}</div></div>
              <span className={`text-xs px-2 py-0.5 rounded ${p.status === 'active' ? 'bg-green-500/20 text-green-400' : p.status === 'error' ? 'bg-red-500/20 text-red-400' : p.status === 'running' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'}`}>{p.status}</span>
              <button onClick={() => runPipeline(p.id)} className="px-3 py-1 bg-cyan-600/20 text-cyan-400 rounded text-xs">▶ Run</button>
            </div>
          ))}</div>}
      </div>
    </div>
  );
};
export default DataIntel;
