import React, { useState, useEffect, useCallback } from 'react';

const RiskManagement = () => {
  const [profile, setProfile] = useState<any>(null);
  const [exposure, setExposure] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Position calculator
  const [calcInput, setCalcInput] = useState({ entry_price: '', stop_loss: '', take_profit: '', balance: '10000' });
  const [calcResult, setCalcResult] = useState<any>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, eRes, evRes] = await Promise.all([
        fetch('/jax-risk', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'profile' }) }),
        fetch('/jax-risk', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'check' }) }),
        fetch('/jax-risk', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'events' }) }),
      ]);
      const [pData, eData, evData] = await Promise.all([pRes.json(), eRes.json(), evRes.json()]);
      if (pData.success) setProfile(pData.profile);
      if (eData.success) setExposure(eData);
      if (evData.success) setEvents(evData.events || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  const calculatePosition = async () => {
    if (!calcInput.entry_price || !calcInput.stop_loss) return;
    try {
      const res = await fetch('/jax-risk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'calculate',
          entry_price: parseFloat(calcInput.entry_price),
          stop_loss: parseFloat(calcInput.stop_loss),
          take_profit: calcInput.take_profit ? parseFloat(calcInput.take_profit) : undefined,
          balance: parseFloat(calcInput.balance) || undefined,
        }),
      });
      const data = await res.json();
      if (data.success !== false) setCalcResult(data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const exposurePct = exposure?.exposure_pct || 0;
  const maxExposure = exposure?.max_exposure_pct || 80;
  const drawdownPct = exposure?.drawdown_pct || 0;
  const maxDrawdown = exposure?.max_drawdown_pct || 10;
  const riskStatus = exposure?.status || 'OK';
  const breaches = exposure?.breaches || [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Risk Management</h1>
          <p className="text-sm text-gray-400 mt-1">JAX-RISK-OFFICER • Position Sizing & Exposure Control</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`px-4 py-2 rounded-lg font-bold text-sm ${riskStatus === 'OK' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse'}`}>
            {riskStatus === 'OK' ? '✅ RISK OK' : '⚠️ RISK BREACH'}
          </div>
        </div>
      </div>

      {/* Risk Profile Summary */}
      {profile && (
        <div className="grid grid-cols-5 gap-4">
          <div className="bg-slate-800 rounded-lg p-4 border border-white/5">
            <div className="text-xs text-gray-400">Risk / Trade</div>
            <div className="text-2xl font-bold text-yellow-400">{profile.risk_per_trade_pct || 1}%</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-white/5">
            <div className="text-xs text-gray-400">Max Daily Risk</div>
            <div className="text-2xl font-bold text-orange-400">{profile.max_daily_risk_pct || 3}%</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-white/5">
            <div className="text-xs text-gray-400">Max Open Trades</div>
            <div className="text-2xl font-bold text-blue-400">{profile.max_open_trades || 2}</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-white/5">
            <div className="text-xs text-gray-400">Max Exposure</div>
            <div className="text-2xl font-bold text-purple-400">{profile.max_portfolio_exposure_pct || 80}%</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-white/5">
            <div className="text-xs text-gray-400">Max Drawdown</div>
            <div className="text-2xl font-bold text-red-400">{profile.max_drawdown_pct || 10}%</div>
          </div>
        </div>
      )}

      {/* Exposure Dashboard */}
      <div className="grid grid-cols-2 gap-6">
        {/* Portfolio Exposure Gauge */}
        <div className="bg-slate-800 rounded-lg p-6 border border-white/5">
          <h3 className="text-sm font-bold text-gray-300 mb-4">Portfolio Exposure</h3>
          <div className="relative h-8 bg-slate-900 rounded-full overflow-hidden mb-2">
            <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(exposurePct, 100)}%`,
                background: exposurePct > maxExposure ? 'linear-gradient(90deg, #ef4444, #dc2626)' : exposurePct > maxExposure * 0.7 ? 'linear-gradient(90deg, #f59e0b, #d97706)' : 'linear-gradient(90deg, #22c55e, #16a34a)',
              }} />
            <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
              {exposurePct.toFixed(1)}% / {maxExposure}%
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>$0</span>
            <span>Exposure: ${exposure?.total_exposure?.toLocaleString() || '0'}</span>
            <span>Limit: {maxExposure}%</span>
          </div>
        </div>

        {/* Drawdown Gauge */}
        <div className="bg-slate-800 rounded-lg p-6 border border-white/5">
          <h3 className="text-sm font-bold text-gray-300 mb-4">Drawdown Monitor</h3>
          <div className="relative h-8 bg-slate-900 rounded-full overflow-hidden mb-2">
            <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
              style={{
                width: `${Math.min((drawdownPct / maxDrawdown) * 100, 100)}%`,
                background: drawdownPct > maxDrawdown ? 'linear-gradient(90deg, #ef4444, #dc2626)' : drawdownPct > maxDrawdown * 0.7 ? 'linear-gradient(90deg, #f59e0b, #d97706)' : 'linear-gradient(90deg, #3b82f6, #2563eb)',
              }} />
            <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
              {drawdownPct.toFixed(1)}% / {maxDrawdown}%
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>0%</span>
            <span>P&L: ${exposure?.total_pnl?.toLocaleString() || '0'}</span>
            <span>Max: {maxDrawdown}%</span>
          </div>
        </div>
      </div>

      {/* Breaches */}
      {breaches.length > 0 && (
        <div className="bg-red-900/20 rounded-lg p-4 border border-red-500/30">
          <h3 className="text-sm font-bold text-red-400 mb-2">⚠️ Active Breaches ({breaches.length})</h3>
          {breaches.map((b: any, i: number) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <span className={`w-2 h-2 rounded-full ${b.severity === 'critical' ? 'bg-red-500' : 'bg-yellow-500'} animate-pulse`} />
              <span className="text-gray-300">{b.message}</span>
              <span className={`text-xs px-2 py-0.5 rounded ${b.severity === 'critical' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{b.severity}</span>
            </div>
          ))}
        </div>
      )}

      {/* Position Size Calculator */}
      <div className="bg-gradient-to-r from-yellow-900/20 to-slate-800 rounded-lg p-6 border border-yellow-500/20">
        <h3 className="text-lg font-bold text-yellow-300 mb-4">📐 Position Size Calculator</h3>
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div>
            <label className="text-xs text-gray-400 block mb-1">Entry Price</label>
            <input type="number" value={calcInput.entry_price} onChange={(e) => setCalcInput({ ...calcInput, entry_price: e.target.value })}
              placeholder="355.00" className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-500" />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Stop Loss</label>
            <input type="number" value={calcInput.stop_loss} onChange={(e) => setCalcInput({ ...calcInput, stop_loss: e.target.value })}
              placeholder="350.00" className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-500" />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Take Profit</label>
            <input type="number" value={calcInput.take_profit} onChange={(e) => setCalcInput({ ...calcInput, take_profit: e.target.value })}
              placeholder="365.00" className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-500" />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Balance ($)</label>
            <input type="number" value={calcInput.balance} onChange={(e) => setCalcInput({ ...calcInput, balance: e.target.value })}
              placeholder="10000" className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-500" />
          </div>
        </div>
        <button onClick={calculatePosition}
          className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg text-sm font-medium transition">
          Calculate Position Size
        </button>

        {calcResult && (
          <div className="mt-4 grid grid-cols-4 gap-4">
            <div className="bg-slate-900 rounded p-3">
              <div className="text-xs text-gray-400">Position Size</div>
              <div className="text-xl font-bold text-white">{calcResult.position_size}</div>
              <div className="text-xs text-gray-500">units</div>
            </div>
            <div className="bg-slate-900 rounded p-3">
              <div className="text-xs text-gray-400">Position Value</div>
              <div className="text-xl font-bold text-blue-400">${calcResult.position_value?.toLocaleString()}</div>
            </div>
            <div className="bg-slate-900 rounded p-3">
              <div className="text-xs text-gray-400">Risk Amount</div>
              <div className="text-xl font-bold text-red-400">${calcResult.risk_amount}</div>
              <div className="text-xs text-gray-500">{calcResult.risk_pct}% of balance</div>
            </div>
            <div className="bg-slate-900 rounded p-3">
              <div className="text-xs text-gray-400">Risk:Reward</div>
              <div className="text-xl font-bold text-green-400">{calcResult.risk_reward_ratio ? `1:${calcResult.risk_reward_ratio}` : 'N/A'}</div>
              <div className="text-xs text-gray-500">Stop: {calcResult.stop_distance_pct}%</div>
            </div>
          </div>
        )}
      </div>

      {/* Risk Events Log */}
      <div className="bg-slate-800 rounded-lg p-6 border border-white/5">
        <h3 className="text-sm font-bold text-gray-300 mb-4">Risk Event Log</h3>
        {events.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-6">No risk events recorded. All systems nominal.</p>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {events.slice(0, 10).map((ev: any, i: number) => (
              <div key={i} className="flex items-center gap-3 text-sm bg-slate-900 rounded p-3">
                <span className={`w-2 h-2 rounded-full ${ev.severity === 'critical' ? 'bg-red-500' : ev.severity === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'}`} />
                <span className="text-gray-400 text-xs font-mono">{new Date(ev.created_at).toLocaleString()}</span>
                <span className={`text-xs px-2 py-0.5 rounded ${ev.severity === 'critical' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{ev.severity}</span>
                <span className="text-gray-300 flex-1">{ev.description}</span>
                <span className="text-xs text-gray-500">{ev.event_type}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Warning Banner */}
      <div className="bg-yellow-900/20 rounded-lg p-4 border border-yellow-500/20 text-xs text-yellow-300">
        ⚡ <strong>Deterministic Limits:</strong> Risk parameters are enforced by the system. AI cannot override risk limits. All breaches are logged and can trigger automatic position freezes.
      </div>
    </div>
  );
};

export default RiskManagement;
