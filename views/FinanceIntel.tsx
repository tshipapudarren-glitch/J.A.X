import React, { useState } from 'react';
const FinanceIntel = () => {
  const [symbol, setSymbol] = useState('AAPL');
  const [company, setCompany] = useState<any>(null);
  const [finance, setFinance] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const lookup = async () => {
    setLoading(true); setCompany(null); setFinance(null);
    const [cRes, fRes] = await Promise.all([
      fetch('/jax-business-intel', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'company', symbol }) }),
      fetch('/jax-business-intel', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'finance', symbol }) }),
    ]);
    const [cData, fData] = await Promise.all([cRes.json(), fRes.json()]);
    if (cData.success) setCompany(cData);
    if (fData.success) setFinance(fData);
    setLoading(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div><h1 className="text-3xl font-bold">Finance Intelligence</h1><p className="text-sm text-gray-400 mt-1">Financial Statements, Ratios & Company Analysis</p></div>
      <div className="flex gap-3 items-center">
        <input type="text" value={symbol} onChange={e => setSymbol(e.target.value.toUpperCase())} placeholder="Symbol" className="bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-sm text-white w-32 focus:outline-none focus:border-emerald-500" onKeyDown={e => e.key === 'Enter' && lookup()} />
        <button onClick={lookup} disabled={loading} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-sm font-medium">{loading ? '⟳' : '🔍 Lookup'}</button>
      </div>
      {company && (
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-slate-800 rounded-lg p-6 border border-white/5">
            <h3 className="text-sm font-bold text-gray-300 mb-4">{company.company?.name}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-400">Sector</span><span className="text-white">{company.company?.sector}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Industry</span><span className="text-white">{company.company?.industry}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Market Cap</span><span className="text-white">${company.company?.market_cap?.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Price</span><span className="text-white font-mono">${company.quote?.price}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Change</span><span className={`font-mono ${(company.quote?.change_pct||0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>{company.quote?.change_pct?.toFixed(2)}%</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Volume</span><span className="text-white font-mono">{company.quote?.volume?.toLocaleString()}</span></div>
            </div>
            {company.company?.description && <p className="text-xs text-gray-400 mt-4">{company.company.description}</p>}
          </div>
          {finance && (
            <div className="bg-slate-800 rounded-lg p-6 border border-white/5">
              <h3 className="text-sm font-bold text-gray-300 mb-4">Financial Ratios</h3>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(finance.metrics || {}).map(([k, v]) => (
                  <div key={k} className="bg-slate-900 rounded p-3"><div className="text-xs text-gray-400">{k.replace(/_/g, ' ').toUpperCase()}</div><div className="text-lg font-bold text-emerald-400">{String(v)}</div></div>
                ))}
              </div>
              <h4 className="text-xs font-bold text-gray-400 mt-4 mb-2">INCOME</h4>
              <div className="grid grid-cols-2 gap-2">{Object.entries(finance.income || {}).map(([k, v]) => (<div key={k} className="text-xs"><span className="text-gray-400">{k.replace(/_/g, ' ')}: </span><span className="text-white">{v as string}</span></div>))}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default FinanceIntel;
