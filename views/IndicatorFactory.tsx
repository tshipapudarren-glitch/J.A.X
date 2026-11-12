import React, { useState, useEffect, useCallback } from 'react';
const IndicatorFactory = () => {
  const [indicators, setIndicators] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newInd, setNewInd] = useState({ name: '', description: '', category: 'custom', formula: 'data.close - data.open' });
  const [selectedInd, setSelectedInd] = useState<any>(null);
  const [computeResult, setComputeResult] = useState<any>(null);

  const fetchIndicators = useCallback(async () => {
    const res = await fetch('/jax-indicator', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'list' }) });
    const data = await res.json(); if (data.success) setIndicators(data.indicators || []);
  }, []);
  useEffect(() => { fetchIndicators(); }, [fetchIndicators]);

  const create = async () => {
    if (!newInd.name) return;
    await fetch('/jax-indicator', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'create', ...newInd }) });
    setShowCreate(false); setNewInd({ name: '', description: '', category: 'custom', formula: 'data.close - data.open' }); fetchIndicators();
  };
  const compute = async () => {
    if (!selectedInd?.formula) return;
    const mockData = Array.from({ length: 10 }, (_, i) => ({ close: 100 + Math.random() * 20, open: 100 + Math.random() * 20, high: 120 + Math.random() * 10, low: 90 + Math.random() * 10, volume: 1000000 + i * 10000 }));
    const res = await fetch('/jax-indicator', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'compute', formula: selectedInd.formula, data_points: mockData }) });
    const data = await res.json(); setComputeResult(data);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold">Indicator Factory</h1><p className="text-sm text-gray-400 mt-1">JAX-INDICATOR-BUILDER • Custom Indicator Creation</p></div>
        <button onClick={() => setShowCreate(!showCreate)} className="px-4 py-2 bg-teal-600 hover:bg-teal-700 rounded-lg text-sm font-medium">+ New Indicator</button>
      </div>
      {showCreate && (
        <div className="bg-slate-800 rounded-lg p-6 border border-teal-500/30">
          <h3 className="text-sm font-bold text-teal-300 mb-4">Create Custom Indicator</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div><label className="text-xs text-gray-400">Name</label><input type="text" value={newInd.name} onChange={e => setNewInd({...newInd, name: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm text-white mt-1" /></div>
            <div><label className="text-xs text-gray-400">Category</label><select value={newInd.category} onChange={e => setNewInd({...newInd, category: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm text-white mt-1"><option value="trend">Trend</option><option value="momentum">Momentum</option><option value="volatility">Volatility</option><option value="volume">Volume</option><option value="custom">Custom</option></select></div>
          </div>
          <div className="mb-4"><label className="text-xs text-gray-400">Formula (JS expression using data.close, data.open, data.high, data.low, data.volume)</label><input type="text" value={newInd.formula} onChange={e => setNewInd({...newInd, formula: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm text-white font-mono mt-1" /></div>
          <button onClick={create} className="px-4 py-2 bg-teal-600 rounded text-sm">Create</button>
        </div>
      )}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-slate-800 rounded-lg border border-white/5">
          <div className="p-4 border-b border-slate-700"><h3 className="text-sm font-bold">Custom Indicators ({indicators.length})</h3></div>
          {indicators.length === 0 ? <div className="p-8 text-center text-gray-500"><div className="text-4xl mb-3">📊</div><p>No custom indicators yet</p></div> :
            <div className="divide-y divide-slate-700">{indicators.map(ind => (
              <div key={ind.id} className={`p-4 cursor-pointer hover:bg-slate-700/30 ${selectedInd?.id === ind.id ? 'bg-slate-700/50' : ''}`} onClick={() => { setSelectedInd(ind); setComputeResult(null); }}>
                <div className="font-medium text-white text-sm">{ind.name}</div>
                <div className="text-xs text-gray-400 mt-1">{ind.category} • <span className="font-mono">{ind.formula?.substring(0, 40)}</span></div>
              </div>
            ))}</div>}
        </div>
        <div className="bg-slate-800 rounded-lg border border-white/5 p-4">
          <h3 className="text-sm font-bold mb-4">{selectedInd ? selectedInd.name : 'Select an Indicator'}</h3>
          {selectedInd && (
            <div className="space-y-4">
              <div className="bg-slate-900 rounded p-3"><div className="text-xs text-gray-400 mb-1">Formula</div><code className="text-sm text-teal-400">{selectedInd.formula}</code></div>
              <button onClick={compute} className="px-4 py-2 bg-teal-600 rounded text-sm">▶ Compute on Sample Data</button>
              {computeResult && (
                <div className="bg-slate-900 rounded p-3"><div className="text-xs text-gray-400 mb-2">Results (10 data points)</div>
                  {computeResult.success ? <div className="space-y-1">{computeResult.results?.slice(0, 5).map((r: any, i: number) => <div key={i} className="text-xs font-mono text-gray-300">Point {i+1}: close={r.close?.toFixed(2)} → value={typeof r.value === 'number' ? r.value.toFixed(4) : r.value}</div>)}</div> : <div className="text-xs text-red-400">{computeResult.error}</div>}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default IndicatorFactory;
