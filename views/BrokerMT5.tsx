import React, { useState, useEffect, useCallback } from 'react';

const BrokerMT5 = () => {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [newAccount, setNewAccount] = useState({ alias: '', broker_name: 'MetaTrader 5', account_type: 'demo', balance: '10000', leverage: '100' });
  const [newOrder, setNewOrder] = useState({ symbol: '', direction: 'buy', order_type: 'market', quantity: '', price: '', stop_loss: '', take_profit: '' });
  const [selectedAccount, setSelectedAccount] = useState<string>('');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [aRes, oRes] = await Promise.all([
        fetch('/jax-broker', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'accounts' }) }),
        fetch('/jax-broker', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'orders' }) }),
      ]);
      const [aData, oData] = await Promise.all([aRes.json(), oRes.json()]);
      if (aData.success) setAccounts(aData.accounts || []);
      if (oData.success) setOrders(oData.orders || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  const addAccount = async () => {
    if (!newAccount.alias || !newAccount.broker_name) return;
    try {
      const res = await fetch('/jax-broker', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_account', ...newAccount, balance: parseFloat(newAccount.balance), leverage: parseInt(newAccount.leverage) }),
      });
      const data = await res.json();
      if (data.success) { setShowAddAccount(false); setNewAccount({ alias: '', broker_name: 'MetaTrader 5', account_type: 'demo', balance: '10000', leverage: '100' }); fetchAll(); }
    } catch (e) { console.error(e); }
  };

  const connectAccount = async (id: string) => {
    try {
      await fetch('/jax-broker', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'connect', account_id: id }) });
      fetchAll();
    } catch (e) { console.error(e); }
  };

  const disconnectAccount = async (id: string) => {
    try {
      await fetch('/jax-broker', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'disconnect', account_id: id }) });
      fetchAll();
    } catch (e) { console.error(e); }
  };

  const placeOrder = async () => {
    if (!newOrder.symbol || !newOrder.quantity) return;
    try {
      const res = await fetch('/jax-broker', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'place_order', account_id: selectedAccount || undefined, ...newOrder,
          quantity: parseFloat(newOrder.quantity),
          price: newOrder.price ? parseFloat(newOrder.price) : undefined,
          stop_loss: newOrder.stop_loss ? parseFloat(newOrder.stop_loss) : undefined,
          take_profit: newOrder.take_profit ? parseFloat(newOrder.take_profit) : undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setNewOrder({ symbol: '', direction: 'buy', order_type: 'market', quantity: '', price: '', stop_loss: '', take_profit: '' });
        setShowOrderForm(false);
        fetchAll();
      } else if (data.blocked_by_risk) {
        alert('⚠️ Risk Limit: ' + data.error);
      }
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const connectedCount = accounts.filter(a => a.is_connected).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Broker & MT5</h1>
          <p className="text-sm text-gray-400 mt-1">JAX-BROKER-LIAISON • Account Management & Order Bridge</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowOrderForm(!showOrderForm)}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium transition">
            📝 Place Order
          </button>
          <button onClick={() => setShowAddAccount(!showAddAccount)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition">
            + Add Account
          </button>
        </div>
      </div>

      {/* Account Summary */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-slate-800 rounded-lg p-4 border border-white/5">
          <div className="text-xs text-gray-400">Total Accounts</div>
          <div className="text-2xl font-bold">{accounts.length}</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border border-green-500/30">
          <div className="text-xs text-gray-400">Connected</div>
          <div className="text-2xl font-bold text-green-400">{connectedCount}</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border border-white/5">
          <div className="text-xs text-gray-400">Total Balance</div>
          <div className="text-2xl font-bold">${accounts.reduce((s, a) => s + (a.balance || 0), 0).toLocaleString()}</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border border-white/5">
          <div className="text-xs text-gray-400">Orders Today</div>
          <div className="text-2xl font-bold">{orders.filter(o => new Date(o.created_at).toDateString() === new Date().toDateString()).length}</div>
        </div>
      </div>

      {/* Add Account Form */}
      {showAddAccount && (
        <div className="bg-slate-800 rounded-lg p-6 border border-blue-500/30">
          <h3 className="text-sm font-bold text-blue-300 mb-4">Add Broker Account</h3>
          <div className="grid grid-cols-5 gap-4">
            <div>
              <label className="text-xs text-gray-400 block mb-1">Alias</label>
              <input type="text" value={newAccount.alias} onChange={(e) => setNewAccount({ ...newAccount, alias: e.target.value })}
                placeholder="My Demo" className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Broker</label>
              <select value={newAccount.broker_name} onChange={(e) => setNewAccount({ ...newAccount, broker_name: e.target.value })}
                className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500">
                <option>MetaTrader 5</option>
                <option>MetaTrader 4</option>
                <option>cTrader</option>
                <option>Interactive Brokers</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Type</label>
              <select value={newAccount.account_type} onChange={(e) => setNewAccount({ ...newAccount, account_type: e.target.value })}
                className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500">
                <option value="demo">Demo</option>
                <option value="live">Live</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Balance</label>
              <input type="number" value={newAccount.balance} onChange={(e) => setNewAccount({ ...newAccount, balance: e.target.value })}
                className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
            </div>
            <div className="flex items-end">
              <button onClick={addAccount} className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium transition">
                Add Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Form */}
      {showOrderForm && (
        <div className="bg-slate-800 rounded-lg p-6 border border-green-500/30">
          <h3 className="text-sm font-bold text-green-300 mb-4">Place Order</h3>
          <div className="grid grid-cols-7 gap-3">
            <input type="text" value={newOrder.symbol} onChange={(e) => setNewOrder({ ...newOrder, symbol: e.target.value.toUpperCase() })}
              placeholder="Symbol" className="bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-green-500" />
            <select value={newOrder.direction} onChange={(e) => setNewOrder({ ...newOrder, direction: e.target.value })}
              className="bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-green-500">
              <option value="buy">BUY</option>
              <option value="sell">SELL</option>
            </select>
            <select value={newOrder.order_type} onChange={(e) => setNewOrder({ ...newOrder, order_type: e.target.value })}
              className="bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-green-500">
              <option value="market">Market</option>
              <option value="limit">Limit</option>
              <option value="stop">Stop</option>
            </select>
            <input type="number" value={newOrder.quantity} onChange={(e) => setNewOrder({ ...newOrder, quantity: e.target.value })}
              placeholder="Qty" className="bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-green-500" />
            <input type="number" value={newOrder.stop_loss} onChange={(e) => setNewOrder({ ...newOrder, stop_loss: e.target.value })}
              placeholder="Stop Loss" className="bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-green-500" />
            <input type="number" value={newOrder.take_profit} onChange={(e) => setNewOrder({ ...newOrder, take_profit: e.target.value })}
              placeholder="Take Profit" className="bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-green-500" />
            <button onClick={placeOrder} className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-sm font-bold transition">
              🚀 Submit
            </button>
          </div>
          <div className="flex gap-2 mt-3">
            {accounts.filter(a => a.is_connected).map(a => (
              <button key={a.id} onClick={() => setSelectedAccount(selectedAccount === a.id ? '' : a.id)}
                className={`text-xs px-3 py-1 rounded ${selectedAccount === a.id ? 'bg-green-600 text-white' : 'bg-slate-700 text-gray-400'}`}>
                {a.alias || a.broker_name}
              </button>
            ))}
            {accounts.filter(a => a.is_connected).length === 0 && (
              <span className="text-xs text-gray-500">No connected accounts — connect one first</span>
            )}
          </div>
        </div>
      )}

      {/* Accounts List */}
      <div className="bg-slate-800 rounded-lg border border-white/5 overflow-hidden">
        <div className="p-4 border-b border-slate-700">
          <h3 className="text-sm font-bold text-gray-300">Broker Accounts</h3>
        </div>
        {accounts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="text-4xl mb-3">🏦</div>
            <p>No broker accounts configured.</p>
            <p className="text-xs mt-1">Click "Add Account" to connect your first broker.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-700">
            {accounts.map((account: any) => (
              <div key={account.id} className="p-4 flex items-center gap-4 hover:bg-slate-700/30">
                <div className={`w-3 h-3 rounded-full ${account.is_connected ? 'bg-green-500 shadow-lg shadow-green-500/50' : 'bg-gray-500'}`} />
                <div className="flex-1">
                  <div className="font-medium text-white">{account.alias || 'Unnamed'}</div>
                  <div className="text-xs text-gray-400">{account.broker_name} • {account.account_type?.toUpperCase()} • {account.currency || 'USD'}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-white">${account.balance?.toLocaleString() || '0'}</div>
                  <div className="text-xs text-gray-400">Equity: ${account.equity?.toLocaleString() || '0'}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-400">Leverage</div>
                  <div className="font-mono text-white">1:{account.leverage || 100}</div>
                </div>
                <div>
                  {account.is_connected ? (
                    <button onClick={() => disconnectAccount(account.id)} className="px-3 py-1 bg-red-600/20 text-red-400 rounded text-xs hover:bg-red-600/30 transition">
                      Disconnect
                    </button>
                  ) : (
                    <button onClick={() => connectAccount(account.id)} className="px-3 py-1 bg-green-600/20 text-green-400 rounded text-xs hover:bg-green-600/30 transition">
                      Connect
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order History */}
      <div className="bg-slate-800 rounded-lg border border-white/5 overflow-hidden">
        <div className="p-4 border-b border-slate-700">
          <h3 className="text-sm font-bold text-gray-300">Order History</h3>
        </div>
        {orders.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="text-4xl mb-3">📋</div>
            <p>No orders yet.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-gray-400 text-xs">
                <th className="text-left p-3">Time</th>
                <th className="text-left p-3">Symbol</th>
                <th className="text-left p-3">Type</th>
                <th className="text-left p-3">Direction</th>
                <th className="text-right p-3">Qty</th>
                <th className="text-right p-3">Price</th>
                <th className="text-center p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 20).map((order: any, i: number) => (
                <tr key={i} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                  <td className="p-3 text-xs text-gray-400">{new Date(order.created_at).toLocaleString()}</td>
                  <td className="p-3 font-mono font-bold">{order.symbol}</td>
                  <td className="p-3 text-xs">{order.order_type}</td>
                  <td className="p-3">
                    <span className={`text-xs px-2 py-0.5 rounded ${order.direction === 'buy' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {order.direction?.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-3 text-right font-mono">{order.quantity}</td>
                  <td className="p-3 text-right font-mono">${order.price || order.filled_price || '-'}</td>
                  <td className="p-3 text-center">
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      order.status === 'filled' ? 'bg-green-500/20 text-green-400' :
                      order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                      order.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>{order.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Security Notice */}
      <div className="bg-slate-900 rounded-lg p-4 border border-slate-700 text-xs text-gray-400">
        🔒 <strong className="text-gray-300">Security:</strong> All broker credentials are encrypted at rest. MT5 connections use secure bridge protocol. Orders are validated against risk limits before execution. AI cannot bypass risk controls.
      </div>
    </div>
  );
};

export default BrokerMT5;
