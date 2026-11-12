import React, { useState, useEffect, useCallback } from 'react';
const EAFactory = () => {
  const [eas, setEAs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [compiling, setCompiling] = useState<string>('');
  const [newEA, setNewEA] = useState({ name: '', lot_size: '0.1', stop_loss: '50', take_profit: '100' });
  const [selectedEA, setSelectedEA] = useState<any>(null);

  const fetchEAs = useCallback(async () => {
    const res = await fetch('/jax-ea', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'list' }) });
    const data = await res.json(); if (data.success) setEAs(data.eas || []); setLoading(false);
  }, []);
  useEffect(() => { fetchEAs(); }, [fetchEAs]);

  const createEA = async () => {
    if (!newEA.name) return;
    await fetch('/jax-ea', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'create', name: newEA.name, parameters: { lot_size: parseFloat(newEA.lot_size), stop_loss: parseInt(newEA.stop_loss), take_profit: parseInt(newEA.take_profit) } }) });
    setShowCreate(false); setNewEA({ name: '', lot_size: '0.1', stop_loss: '50', take_profit: '100' }); fetchEAs();
  };
  const compileEA = async (id: string) => {
    setCompiling(id);
    const res = await fetch('/jax-ea', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'compile', id }) });
    const data = await res.json(); if (data.success) { setSelectedEA({ ...eas.find(e => e.id === id), mql5_code: data.mql5_code, compilation_status: 'compiled' }); fetchEAs(); }
    setCompiling('');
  };
  const deleteEA = async (id: string) => { if (confirm('Delete?')) { await fetch('/jax-ea', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'delete', id }) }); fetchEAs(); } };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold">EA Factory</h1><p className="text-sm text-gray-400 mt-1">JAX-EA-BUILDER • Expert Advisor Creation & MQL5 Export</p></div>
        <button onClick={() => setShowCreate(!showCreate)} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-sm font-medium">+ New EA</button>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-800 rounded-lg p-4 border border-white/5"><div className="text-xs text-gray-400">Total EAs</div><div className="text-2xl font-bold">{eas.length}</div></div>
        <div className="bg-slate-800 rounded-lg p-4 border border-green-500/30"><div className="text-xs text-gray-400">Compiled</div><div className="text-2xl font-bold text-green-400">{eas.filter(e => e.compilation_status === 'compiled').length}</div></div>
        <div className="bg-slate-800 rounded-lg p-4 border border-white/5"><div className="text-xs text-gray-400">Active</div><div className="text-2xl font-bold text-blue-400">{eas.filter(e => e.is_active).length}</div></div>
      </div>
      {showCreate && (
        <div className="bg-slate-800 rounded-lg p-6 border border-emerald-500/30">
          <h3 className="text-sm font-bold text-emerald-300 mb-4">Create Expert Advisor</h3>
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div><label className="text-xs text-gray-400">Name</label><input type="text" value={newEA.name} onChange={e => setNewEA({...newEA, name: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm text-white mt-1" /></div>
            <div><label className="text-xs text-gray-400">Lot Size</label><input type="number" value={newEA.lot_size} onChange={e => setNewEA({...newEA, lot_size: e.target.value})} step="0.01" className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm text-white mt-1" /></div>
            <div><label className="text-xs text-gray-400">Stop Loss (pips)</label><input type="number" value={newEA.stop_loss} onChange={e => setNewEA({...newEA, stop_loss: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm text-white mt-1" /></div>
            <div><label className="text-xs text-gray-400">Take Profit (pips)</label><input type="number" value={newEA.take_profit} onChange={e => setNewEA({...newEA, take_profit: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm text-white mt-1" /></div>
          </div>
          <button onClick={createEA} className="px-4 py-2 bg-emerald-600 rounded text-sm">Create EA</button>
        </div>
      )}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-slate-800 rounded-lg border border-white/5">
          <div className="p-4 border-b border-slate-700"><h3 className="text-sm font-bold">Expert Advisors</h3></div>
          {eas.length === 0 ? <div className="p-8 text-center text-gray-500"><div className="text-4xl mb-3">🤖</div><p>No EAs yet. Create your first!</p></div> :
            <div className="divide-y divide-slate-700">{eas.map(ea => (
              <div key={ea.id} className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-slate-700/30 ${selectedEA?.id === ea.id ? 'bg-slate-700/50' : ''}`} onClick={() => setSelectedEA(ea)}>
                <span className="text-xl">🤖</span>
                <div className="flex-1"><div className="font-medium text-white text-sm">{ea.name}</div><div className="text-xs text-gray-400">v{ea.version} • {ea.compilation_status}</div></div>
                <button onClick={(ev) => { ev.stopPropagation(); compileEA(ea.id); }} disabled={compiling === ea.id} className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded text-xs">{compiling === ea.id ? '⟳' : '⚙️ Compile'}</button>
                <button onClick={(ev) => { ev.stopPropagation(); deleteEA(ea.id); }} className="px-2 py-1 bg-red-600/20 text-red-400 rounded text-xs">🗑</button>
              </div>
            ))}</div>}
        </div>
        <div className="bg-slate-800 rounded-lg border border-white/5">
          <div className="p-4 border-b border-slate-700"><h3 className="text-sm font-bold">MQL5 Code Preview</h3></div>
          <pre className="p-4 text-xs text-green-400 font-mono overflow-auto max-h-96 whitespace-pre-wrap">{selectedEA?.mql5_code || '// Select an EA and compile to see MQL5 code'}</pre>
        </div>
      </div>
    </div>
  );
};
export default EAFactory;
