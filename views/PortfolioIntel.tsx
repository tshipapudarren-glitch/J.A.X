import React, { useState, useEffect, useCallback } from 'react';

const PortfolioIntel = () => {
  const [overview, setOverview] = useState<any>(null);
  const [performance, setPerformance] = useState<any>(null);
  const [positions, setPositions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'positions' | 'performance'>('overview');

  // Add position form
  const [newPos, setNewPos] = useState({ symbol: '', direction: 'long', entry_price: '', lot_size: '', stop_loss: '', take_profit: '' });
  const [adding, setAdding] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [oRes, pRes, perfRes] = await Promise.all([
        fetch('/jax-portfolio', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'overview' }) }),
        fetch('/jax-portfolio', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'positions', status: 'open' }) }),
        fetch('/jax-portfolio', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'performance' }) }),
      ]);
      const [oData, pData, perfData] = await Promise.all([oRes.json(), pRes.json(), perfRes.json()]);
      if (oData.success) setOverview(oData);
      if (pData.success) setPositions(pData.positions || []);
      if (perfData.success) setPerformance(perfData);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  const addPosition = async () => {
    if (!newPos.symbol || !newPos.entry_price) return;
    setAdding(true);
    try {
      const res = await fetch('/jax-portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_position', ...newPos, entry_price: parseFloat(newPos.entry_price), lot_size: parseFloat(newPos.lot_size) || 1 }),
      });
      const data = await res.json();
      if (data.success) {
        setNewPos({ symbol: '', direction: 'long', entry_price: '', lot_size: '', stop_loss: '', take_profit: '' });
        fetchAll();
      }
    } catch (e) { console.error(e); }
    finally { setAdding(false); }
  };

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const pnl = overview?.pnl || {};
  const posStats = overview?.positions || {};
  const alloc = overview?.allocation || {};
  const totalExposure = (alloc.long || 0) + (alloc.short || 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Portfolio Intelligence</h1>
          <p className="text-sm text-gray-400 mt-1">JAX-PORTFOLIO-ANALYST • Composition & P&L Analytics</p>
        </div>
        <button onClick={fetchAll} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium transition">
          ⟳ Refresh
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-slate-800 rounded-lg p-4 border border-white/5">
          <div className="text-xs text-gray-400">Total Capital</div>
          <div className="text-2xl font-bold text-white">${overview?.portfolios?.total_capital?.toLocaleString() || '0'}</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border border-white/5">
          <div className="text-xs text-gray-400">Current Value</div>
          <div className="text-2xl font-bold text-white">${overview?.portfolios?.current_value?.toLocaleString() || '0'}</div>
        </div>
        <div className={`bg-slate-800 rounded-lg p-4 border ${pnl.total >= 0 ? 'border-green-500/30' : 'border-red-500/30'}`}>
          <div className="text-xs text-gray-400">Total P&L</div>
          <div className={`text-2xl font-bold ${pnl.total >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {pnl.total >= 0 ? '+' : ''}${pnl.total?.toLocaleString() || '0'}
          </div>
          <div className={`text-xs ${pnl.return_pct >= 0 ? 'text-green-500' : 'text-red-500'}`}>{pnl.return_pct >= 0 ? '+' : ''}{pnl.return_pct || 0}%</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border border-white/5">
          <div className="text-xs text-gray-400">Open Positions</div>
          <div className="text-2xl font-bold text-blue-400">{posStats.open || 0}</div>
          <div className="text-xs text-gray-500">{posStats.closed || 0} closed</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border border-white/5">
          <div className="text-xs text-gray-400">Win Rate</div>
          <div className="text-2xl font-bold text-green-400">{performance?.win_rate || 0}%</div>
          <div className="text-xs text-gray-500">PF: {performance?.profit_factor || 0}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-700 pb-2">
        {(['overview', 'positions', 'performance'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === tab ? 'bg-purple-600 text-white' : 'bg-slate-700 text-gray-400 hover:bg-slate-600'}`}>
            {tab === 'overview' ? '📊 Overview' : tab === 'positions' ? '📋 Positions' : '📈 Performance'}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-2 gap-6">
          {/* Allocation Breakdown */}
          <div className="bg-slate-800 rounded-lg p-6 border border-white/5">
            <h3 className="text-sm font-bold text-gray-300 mb-4">Direction Allocation</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-green-400">📈 Long</span>
                  <span className="text-gray-400">${alloc.long?.toLocaleString() || '0'}</span>
                </div>
                <div className="h-4 bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full" style={{ width: totalExposure > 0 ? `${(alloc.long / totalExposure) * 100}%` : '0%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-red-400">📉 Short</span>
                  <span className="text-gray-400">${alloc.short?.toLocaleString() || '0'}</span>
                </div>
                <div className="h-4 bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full" style={{ width: totalExposure > 0 ? `${(alloc.short / totalExposure) * 100}%` : '0%' }} />
                </div>
              </div>
              <div className="pt-2 border-t border-slate-700">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Long/Short Ratio</span>
                  <span className="text-gray-300">{alloc.short > 0 ? (alloc.long / alloc.short).toFixed(2) : alloc.long > 0 ? '∞' : '0'} : 1</span>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-slate-800 rounded-lg p-6 border border-white/5">
            <h3 className="text-sm font-bold text-gray-300 mb-4">Trading Performance</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900 rounded p-3">
                <div className="text-xs text-gray-400">Total Trades</div>
                <div className="text-xl font-bold">{performance?.total_trades || 0}</div>
              </div>
              <div className="bg-slate-900 rounded p-3">
                <div className="text-xs text-gray-400">Win/Loss</div>
                <div className="text-xl font-bold"><span className="text-green-400">{performance?.wins || 0}</span> / <span className="text-red-400">{performance?.losses || 0}</span></div>
              </div>
              <div className="bg-slate-900 rounded p-3">
                <div className="text-xs text-gray-400">Avg Win</div>
                <div className="text-xl font-bold text-green-400">${performance?.avg_win || 0}</div>
              </div>
              <div className="bg-slate-900 rounded p-3">
                <div className="text-xs text-gray-400">Avg Loss</div>
                <div className="text-xl font-bold text-red-400">${performance?.avg_loss || 0}</div>
              </div>
              <div className="bg-slate-900 rounded p-3">
                <div className="text-xs text-gray-400">Net P&L</div>
                <div className={`text-xl font-bold ${(performance?.net_pnl || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>${performance?.net_pnl || 0}</div>
              </div>
              <div className="bg-slate-900 rounded p-3">
                <div className="text-xs text-gray-400">Profit Factor</div>
                <div className="text-xl font-bold text-purple-400">{performance?.profit_factor || 0}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Positions Tab */}
      {activeTab === 'positions' && (
        <div className="space-y-4">
          {/* Add Position Form */}
          <div className="bg-slate-800 rounded-lg p-4 border border-white/5">
            <h3 className="text-sm font-bold text-gray-300 mb-3">Open New Position</h3>
            <div className="grid grid-cols-6 gap-3">
              <input type="text" value={newPos.symbol} onChange={(e) => setNewPos({ ...newPos, symbol: e.target.value.toUpperCase() })}
                placeholder="Symbol" className="bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500" />
              <select value={newPos.direction} onChange={(e) => setNewPos({ ...newPos, direction: e.target.value })}
                className="bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500">
                <option value="long">Long</option>
                <option value="short">Short</option>
              </select>
              <input type="number" value={newPos.entry_price} onChange={(e) => setNewPos({ ...newPos, entry_price: e.target.value })}
                placeholder="Entry" className="bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500" />
              <input type="number" value={newPos.lot_size} onChange={(e) => setNewPos({ ...newPos, lot_size: e.target.value })}
                placeholder="Size" className="bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500" />
              <input type="number" value={newPos.stop_loss} onChange={(e) => setNewPos({ ...newPos, stop_loss: e.target.value })}
                placeholder="Stop Loss" className="bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500" />
              <button onClick={addPosition} disabled={adding}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 rounded text-sm font-medium transition">
                {adding ? '...' : '+ Add'}
              </button>
            </div>
          </div>

          {/* Positions Table */}
          <div className="bg-slate-800 rounded-lg border border-white/5 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-gray-400 text-xs">
                  <th className="text-left p-3">Symbol</th>
                  <th className="text-left p-3">Direction</th>
                  <th className="text-right p-3">Entry</th>
                  <th className="text-right p-3">Current</th>
                  <th className="text-right p-3">Size</th>
                  <th className="text-right p-3">P&L</th>
                  <th className="text-right p-3">Stop</th>
                  <th className="text-right p-3">TP</th>
                  <th className="text-center p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {positions.length === 0 ? (
                  <tr><td colSpan={9} className="text-center text-gray-500 p-8">No open positions</td></tr>
                ) : positions.map((pos: any, i: number) => (
                  <tr key={i} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                    <td className="p-3 font-mono font-bold">{pos.symbol}</td>
                    <td className="p-3">
                      <span className={`text-xs px-2 py-0.5 rounded ${pos.direction === 'long' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {pos.direction?.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3 text-right font-mono">${pos.entry_price}</td>
                    <td className="p-3 text-right font-mono">${pos.current_price || '-'}</td>
                    <td className="p-3 text-right font-mono">{pos.lot_size}</td>
                    <td className={`p-3 text-right font-mono ${(pos.profit_loss || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {pos.profit_loss >= 0 ? '+' : ''}${pos.profit_loss || '0'}
                    </td>
                    <td className="p-3 text-right font-mono text-gray-400">${pos.stop_loss || '-'}</td>
                    <td className="p-3 text-right font-mono text-gray-400">${pos.take_profit || '-'}</td>
                    <td className="p-3 text-center">
                      <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">{pos.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Performance Tab */}
      {activeTab === 'performance' && (
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-slate-800 rounded-lg p-6 border border-white/5">
            <h3 className="text-sm font-bold text-gray-300 mb-4">Win/Loss Distribution</h3>
            <div className="flex items-center justify-center gap-8 py-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-green-400">{performance?.wins || 0}</div>
                <div className="text-sm text-gray-400">Wins</div>
              </div>
              <div className="w-32 h-32 rounded-full relative" style={{
                background: `conic-gradient(#22c55e 0% ${performance?.win_rate || 0}%, #ef4444 ${performance?.win_rate || 0}% 100%)`,
              }}>
                <div className="absolute inset-3 rounded-full bg-slate-800 flex items-center justify-center">
                  <span className="text-lg font-bold">{performance?.win_rate || 0}%</span>
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-red-400">{performance?.losses || 0}</div>
                <div className="text-sm text-gray-400">Losses</div>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 border border-white/5">
            <h3 className="text-sm font-bold text-gray-300 mb-4">Key Metrics</h3>
            <div className="space-y-3">
              {[
                { label: 'Profit Factor', value: performance?.profit_factor, color: 'text-purple-400' },
                { label: 'Total Profit', value: `$${performance?.total_profit || 0}`, color: 'text-green-400' },
                { label: 'Total Loss', value: `$${performance?.total_loss || 0}`, color: 'text-red-400' },
                { label: 'Net P&L', value: `$${performance?.net_pnl || 0}`, color: (performance?.net_pnl || 0) >= 0 ? 'text-green-400' : 'text-red-400' },
                { label: 'Avg Win', value: `$${performance?.avg_win || 0}`, color: 'text-green-400' },
                { label: 'Avg Loss', value: `$${performance?.avg_loss || 0}`, color: 'text-red-400' },
              ].map((m, i) => (
                <div key={i} className="flex justify-between items-center bg-slate-900 rounded p-3">
                  <span className="text-sm text-gray-400">{m.label}</span>
                  <span className={`text-lg font-bold ${m.color}`}>{m.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioIntel;
