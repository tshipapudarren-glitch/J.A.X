import React, { useState, useEffect, useCallback } from 'react';
const StrategyLab = () => {
  const [strategies, setStrategies] = useState<any[]>([]);
  const [backtests, setBacktests] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [backtesting, setBacktesting] = useState(false);
  const [newStrat, setNewStrat] = useState({ name: '', strategy_type: 'trend', description: '' });
  const [selectedStrat, setSelectedStrat] = useState<any>(null);
  const [lastBacktest, setLastBacktest] = useState<any>(null);

  const fetchAll = useCallback(async () => {
    const [sRes, bRes] = await Promise.all([
      fetch('/jax-strategy', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'strategies' }) }),
      fetch('/jax-strategy', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'backtests' }) }),
    ]);
    const [sData, bData] = await Promise.all([sRes.json(), bRes.json()]);
    if (sData.success) setStrategies(sData.strategies || []);
    if (bData.success) setBacktests(bData.backtests || []);
  }, []);
  useEffect(() => { fetchAll(); }, [fetchAll]);

  const create = async () => {
    if (!newStrat.name) return;
    await fetch('/jax-strategy', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'create_strategy', ...newStrat }) });
    setShowCreate(false); setNewStrat({ name: '', strategy_type: 'trend', description: '' }); fetchAll();
  };
  const runBacktest = async (strategyId: string) => {
    setBacktesting(true);
    const res = await fetch('/jax-strategy', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'backtest', strategy_id: strategyId, symbol: 'AAPL', initial_balance: 10000 }) });
    const data = await res.json(); if (data.success) setLastBacktest(data); setBacktesting(false); fetchAll();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold">Strategy Lab</h1><p className="text-sm text-gray-400 mt-1">JAX-STRATEGIST • Strategy Builder & Backtesting</p></div>
        <button onClick={() => setShowCreate(!showCreate)} className="px-4 py-2 bg-violet-600 hover:bg-violet-700 rounded-lg text-sm font-medium">+ New Strategy</button>
      </div>
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-slate-800 rounded-lg p-4 border border-white/5"><div className="text-xs text-gray-400">Strategies</div><div className="text-2xl font-bold">{strategies.length}</div></div>
        <div className="bg-slate-800 rounded-lg p-4 border border-white/5"><div className="text-xs text-gray-400">Backtests Run</div><div className="text-2xl font-bold text-blue-400">{backtests.length}</div></div>
        <div className="bg-slate-800 rounded-lg p-4 border border-green-500/30"><div className="text-xs text-gray-400">Best Win Rate</div><div className="text-2xl font-bold text-green-400">{backtests.length > 0 ? Math.max(...backtests.map(b => b.win_rate || 0)).toFixed(1) + '%' : '—'}</div></div>
        <div className="bg-slate-800 rounded-lg p-4 border border-white/5"><div className="text-xs text-gray-400">Best Profit Factor</div><div className="text-2xl font-bold text-purple-400">{backtests.length > 0 ? Math.max(...backtests.map(b => b.profit_factor || 0)).toFixed(2) : '—'}</div></div>
      </div>
      {showCreate && (
        <div className="bg-slate-800 rounded-lg p-6 border border-violet-500/30">
          <h3 className="text-sm font-bold text-violet-300 mb-4">Create Strategy</h3>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div><label className="text-xs text-gray-400">Name</label><input type="text" value={newStrat.name} onChange={e => setNewStrat({...newStrat, name: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm text-white mt-1" /></div>
            <div><label className="text-xs text-gray-400">Type</label><select value={newStrat.strategy_type} onChange={e => setNewStrat({...newStrat, strategy_type: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm text-white mt-1"><option value="trend">Trend Following</option><option value="mean_reversion">Mean Reversion</option><option value="breakout">Breakout</option><option value="scalping">Scalping</option></select></div>
            <div><label className="text-xs text-gray-400">Description</label><input type="text" value={newStrat.description} onChange={e => setNewStrat({...newStrat, description: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm text-white mt-1" /></div>
          </div>
          <button onClick={create} className="px-4 py-2 bg-violet-600 rounded text-sm">Create</button>
        </div>
      )}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-slate-800 rounded-lg border border-white/5">
          <div className="p-4 border-b border-slate-700"><h3 className="text-sm font-bold">Strategies</h3></div>
          {strategies.length === 0 ? <div className="p-8 text-center text-gray-500"><div className="text-4xl mb-3">🧪</div><p>No strategies yet</p></div> :
            <div className="divide-y divide-slate-700">{strategies.map(s => (
              <div key={s.id} className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-slate-700/30 ${selectedStrat?.id === s.id ? 'bg-slate-700/50' : ''}`} onClick={() => setSelectedStrat(s)}>
                <span className="text-xl">🧪</span>
                <div className="flex-1"><div className="text-sm font-medium text-white">{s.name}</div><div className="text-xs text-gray-400">{s.strategy_type}</div></div>
                <button onClick={(ev) => { ev.stopPropagation(); runBacktest(s.id); }} disabled={backtesting} className="px-3 py-1 bg-orange-600/20 text-orange-400 rounded text-xs hover:bg-orange-600/30">{backtesting ? '⟳' : '▶ Backtest'}</button>
              </div>
            ))}</div>}
        </div>
        <div className="bg-slate-800 rounded-lg border border-white/5 p-4">
          <h3 className="text-sm font-bold mb-4">Latest Backtest Results</h3>
          {lastBacktest ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {[{ l: 'Trades', v: lastBacktest.summary?.trades }, { l: 'Win Rate', v: lastBacktest.summary?.win_rate + '%', c: 'text-green-400' }, { l: 'Net P&L', v: '$' + lastBacktest.summary?.net_pnl, c: parseFloat(lastBacktest.summary?.net_pnl) >= 0 ? 'text-green-400' : 'text-red-400' }, { l: 'Profit Factor', v: lastBacktest.summary?.profit_factor, c: 'text-purple-400' }, { l: 'Max Drawdown', v: '$' + lastBacktest.summary?.max_dd, c: 'text-red-400' }, { l: 'Final Balance', v: '$' + (lastBacktest.backtest?.final_balance || 0) }].map((m, i) => (
                  <div key={i} className="bg-slate-900 rounded p-3"><div className="text-xs text-gray-400">{m.l}</div><div className={`text-lg font-bold ${m.c || 'text-white'}`}>{m.v}</div></div>
                ))}
              </div>
            </div>
          ) : <div className="text-center text-gray-500 py-8"><p>Run a backtest to see results</p></div>}
        </div>
      </div>
    </div>
  );
};
export default StrategyLab;
