import React, { useState, useEffect, useCallback } from 'react';
const Backtesting = () => {
  const [backtests, setBacktests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);

  const fetchBacktests = useCallback(async () => {
    const res = await fetch('/jax-strategy', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'backtests' }) });
    const data = await res.json(); if (data.success) setBacktests(data.backtests || []); setLoading(false);
  }, []);
  useEffect(() => { fetchBacktests(); }, [fetchBacktests]);

  const avgWinRate = backtests.length > 0 ? (backtests.reduce((s, b) => s + (b.win_rate || 0), 0) / backtests.length) : 0;
  const avgPF = backtests.length > 0 ? (backtests.reduce((s, b) => s + (b.profit_factor || 0), 0) / backtests.length) : 0;
  const totalPnL = backtests.reduce((s, b) => s + (b.net_profit || 0), 0);

  return (
    <div className="p-6 space-y-6">
      <div><h1 className="text-3xl font-bold">Backtesting Engine</h1><p className="text-sm text-gray-400 mt-1">Historical performance analysis & trade-level results</p></div>
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-slate-800 rounded-lg p-4 border border-white/5"><div className="text-xs text-gray-400">Total Backtests</div><div className="text-2xl font-bold">{backtests.length}</div></div>
        <div className="bg-slate-800 rounded-lg p-4 border border-white/5"><div className="text-xs text-gray-400">Avg Win Rate</div><div className="text-2xl font-bold text-green-400">{avgWinRate.toFixed(1)}%</div></div>
        <div className="bg-slate-800 rounded-lg p-4 border border-white/5"><div className="text-xs text-gray-400">Avg Profit Factor</div><div className="text-2xl font-bold text-purple-400">{avgPF.toFixed(2)}</div></div>
        <div className="bg-slate-800 rounded-lg p-4 border border-white/5"><div className="text-xs text-gray-400">Total P&L (simulated)</div><div className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>${totalPnL.toFixed(0)}</div></div>
      </div>
      <div className="bg-slate-800 rounded-lg border border-white/5 overflow-hidden">
        <div className="p-4 border-b border-slate-700"><h3 className="text-sm font-bold">Backtest History</h3></div>
        {backtests.length === 0 ? <div className="p-8 text-center text-gray-500"><div className="text-4xl mb-3">📈</div><p>No backtests run yet. Go to Strategy Lab to run your first backtest.</p></div> :
          <table className="w-full text-sm">
            <thead><tr className="border-b border-slate-700 text-gray-400 text-xs"><th className="text-left p-3">Date</th><th className="text-right p-3">Trades</th><th className="text-right p-3">Win Rate</th><th className="text-right p-3">Net P&L</th><th className="text-right p-3">Profit Factor</th><th className="text-right p-3">Max DD</th><th className="text-right p-3">Sharpe</th><th className="text-center p-3">Status</th></tr></thead>
            <tbody>{backtests.map((bt, i) => (
              <tr key={i} className={`border-b border-slate-700/50 hover:bg-slate-700/30 cursor-pointer ${selected?.id === bt.id ? 'bg-slate-700/50' : ''}`} onClick={() => setSelected(bt)}>
                <td className="p-3 text-xs text-gray-400">{new Date(bt.created_at).toLocaleDateString()}</td>
                <td className="p-3 text-right font-mono">{bt.total_trades}</td>
                <td className="p-3 text-right font-mono text-green-400">{bt.win_rate?.toFixed(1)}%</td>
                <td className={`p-3 text-right font-mono ${(bt.net_profit||0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>${bt.net_profit?.toFixed(0)}</td>
                <td className="p-3 text-right font-mono text-purple-400">{bt.profit_factor?.toFixed(2)}</td>
                <td className="p-3 text-right font-mono text-red-400">${bt.max_drawdown?.toFixed(0)}</td>
                <td className="p-3 text-right font-mono">{bt.sharpe_ratio?.toFixed(2)}</td>
                <td className="p-3 text-center"><span className={`text-xs px-2 py-0.5 rounded ${bt.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{bt.status}</span></td>
              </tr>
            ))}</tbody>
          </table>}
      </div>
      {selected && (
        <div className="bg-slate-800 rounded-lg p-6 border border-white/5">
          <h3 className="text-sm font-bold mb-4">Backtest Details</h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-slate-900 rounded p-3"><div className="text-xs text-gray-400">Initial Balance</div><div className="text-lg font-bold">${selected.initial_balance?.toLocaleString()}</div></div>
            <div className="bg-slate-900 rounded p-3"><div className="text-xs text-gray-400">Final Balance</div><div className="text-lg font-bold text-green-400">${selected.final_balance?.toLocaleString()}</div></div>
            <div className="bg-slate-900 rounded p-3"><div className="text-xs text-gray-400">Recovery Factor</div><div className="text-lg font-bold">{selected.recovery_factor?.toFixed(2)}</div></div>
            <div className="bg-slate-900 rounded p-3"><div className="text-xs text-gray-400">DD %</div><div className="text-lg font-bold text-red-400">{selected.max_drawdown_percent?.toFixed(2)}%</div></div>
          </div>
          {selected.results && <div className="mt-4 bg-slate-900 rounded p-3"><div className="text-xs text-gray-400 mb-2">Trade Summary</div><div className="text-sm text-gray-300">Wins: {selected.results.wins} | Losses: {selected.results.losses} | Avg Win: ${selected.results.avg_win} | Avg Loss: ${selected.results.avg_loss}</div></div>}
        </div>
      )}
    </div>
  );
};
export default Backtesting;
