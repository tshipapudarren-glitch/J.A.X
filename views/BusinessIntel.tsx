import React, { useState, useEffect, useCallback } from 'react';
const BusinessIntel = () => {
  const [kpis, setKpis] = useState<any>(null);
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [query, setQuery] = useState('');

  const fetchOverview = useCallback(async () => {
    const res = await fetch('/jax-business-intel', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'overview' }) });
    const data = await res.json(); if (data.success) setKpis(data); setLoading(false);
  }, []);
  useEffect(() => { fetchOverview(); }, [fetchOverview]);

  const analyze = async () => {
    if (!query.trim()) return;
    setAnalyzing(true); setAnalysis('');
    const res = await fetch('/jax-business-intel', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'analyze', text: query }) });
    const data = await res.json(); if (data.success) setAnalysis(data.analysis); setAnalyzing(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div><h1 className="text-3xl font-bold">Business Intelligence</h1><p className="text-sm text-gray-400 mt-1">JAX-BUSINESS-ANALYST • KPIs & Strategic Analysis</p></div>
      {kpis && (
        <div className="grid grid-cols-4 gap-4">
          {Object.entries(kpis.kpis || {}).map(([key, val]: any) => (
            <div key={key} className="bg-slate-800 rounded-lg p-4 border border-white/5">
              <div className="text-xs text-gray-400 capitalize">{key.replace(/_/g, ' ')}</div>
              <div className="text-2xl font-bold text-white">{val.value}</div>
              <div className={`text-sm ${val.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>{val.change >= 0 ? '↑' : '↓'} {Math.abs(val.change)}%</div>
            </div>
          ))}
        </div>
      )}
      {kpis?.alerts && kpis.alerts.length > 0 && (
        <div className="bg-slate-800 rounded-lg p-4 border border-white/5">
          <h3 className="text-sm font-bold mb-2">📢 Alerts</h3>
          {kpis.alerts.map((a: any, i: number) => (
            <div key={i} className="flex items-center gap-2 text-sm py-1"><span className={`w-2 h-2 rounded-full ${a.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'}`} /><span className="text-gray-300">{a.message}</span></div>
          ))}
        </div>
      )}
      <div className="bg-gradient-to-r from-indigo-900/30 to-slate-800 rounded-lg p-6 border border-indigo-500/30">
        <h3 className="text-lg font-bold text-indigo-300 mb-4">🔍 AI Business Analysis</h3>
        <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="e.g. Analyze AAPL competitive position, or tech sector outlook..." className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500" onKeyDown={e => e.key === 'Enter' && analyze()} />
        <button onClick={analyze} disabled={analyzing || !query.trim()} className="mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 rounded-lg text-sm">{analyzing ? '⟳ Analyzing...' : 'Analyze'}</button>
        {analysis && <div className="mt-4 bg-slate-900 rounded-lg p-4 text-sm text-gray-300 whitespace-pre-wrap">{analysis}</div>}
      </div>
    </div>
  );
};
export default BusinessIntel;
