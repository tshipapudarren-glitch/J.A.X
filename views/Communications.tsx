import React, { useState, useEffect, useCallback } from 'react';
const Communications = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [overview, setOverview] = useState<any>(null);
  const [showSend, setShowSend] = useState(false);
  const [newNotif, setNewNotif] = useState({ title: '', body: '', notification_type: 'info', priority: 'normal' });

  const fetchAll = useCallback(async () => {
    const [nRes, oRes] = await Promise.all([
      fetch('/jax-data-comms', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'notifications' }) }),
      fetch('/jax-data-comms', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'overview' }) }),
    ]);
    const [nData, oData] = await Promise.all([nRes.json(), oRes.json()]);
    if (nData.success) setNotifications(nData.notifications || []);
    if (oData.success) setOverview(oData);
  }, []);
  useEffect(() => { fetchAll(); }, [fetchAll]);

  const send = async () => {
    if (!newNotif.title) return;
    await fetch('/jax-data-comms', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'send_notification', ...newNotif }) });
    setShowSend(false); setNewNotif({ title: '', body: '', notification_type: 'info', priority: 'normal' }); fetchAll();
  };
  const markRead = async (id: string) => {
    await fetch('/jax-data-comms', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'mark_read', id }) }); fetchAll();
  };

  const typeIcons: Record<string, string> = { info: 'ℹ️', warning: '⚠️', alert: '🚨', success: '✅', system: '⚙️' };
  const priorityColors: Record<string, string> = { critical: 'border-red-500/30 bg-red-900/10', high: 'border-orange-500/30', normal: 'border-white/5', low: 'border-gray-500/30' };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold">Communications</h1><p className="text-sm text-gray-400 mt-1">JAX-DATA-ENGINEER • Notifications & Team Messaging</p></div>
        <button onClick={() => setShowSend(!showSend)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium">📤 Send Notification</button>
      </div>
      {overview && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-slate-800 rounded-lg p-4 border border-white/5"><div className="text-xs text-gray-400">Total Notifications</div><div className="text-2xl font-bold">{overview.notifications?.total || 0}</div></div>
          <div className="bg-slate-800 rounded-lg p-4 border border-blue-500/30"><div className="text-xs text-gray-400">Unread</div><div className="text-2xl font-bold text-blue-400">{overview.notifications?.unread || 0}</div></div>
          <div className="bg-slate-800 rounded-lg p-4 border border-white/5"><div className="text-xs text-gray-400">Data Pipelines</div><div className="text-2xl font-bold">{overview.pipelines?.total || 0}</div></div>
        </div>
      )}
      {showSend && (
        <div className="bg-slate-800 rounded-lg p-6 border border-blue-500/30">
          <h3 className="text-sm font-bold text-blue-300 mb-4">Send Notification</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div><label className="text-xs text-gray-400">Title</label><input type="text" value={newNotif.title} onChange={e => setNewNotif({...newNotif, title: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm text-white mt-1" /></div>
            <div><label className="text-xs text-gray-400">Type</label><select value={newNotif.notification_type} onChange={e => setNewNotif({...newNotif, notification_type: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm text-white mt-1"><option value="info">Info</option><option value="warning">Warning</option><option value="alert">Alert</option><option value="success">Success</option><option value="system">System</option></select></div>
          </div>
          <div className="mb-4"><label className="text-xs text-gray-400">Message</label><textarea value={newNotif.body} onChange={e => setNewNotif({...newNotif, body: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm text-white h-20 resize-none mt-1" /></div>
          <div className="flex gap-2"><button onClick={send} className="px-4 py-2 bg-blue-600 rounded text-sm">Send</button><button onClick={() => setShowSend(false)} className="px-4 py-2 bg-slate-700 rounded text-sm">Cancel</button></div>
        </div>
      )}
      <div className="bg-slate-800 rounded-lg border border-white/5">
        <div className="p-4 border-b border-slate-700"><h3 className="text-sm font-bold">Notification Feed</h3></div>
        {notifications.length === 0 ? <div className="p-8 text-center text-gray-500"><div className="text-4xl mb-3">📬</div><p>No notifications yet</p></div> :
          <div className="divide-y divide-slate-700">{notifications.map(n => (
            <div key={n.id} className={`p-4 flex items-center gap-3 border-l-2 ${priorityColors[n.priority] || 'border-white/5'} ${!n.is_read ? 'bg-blue-900/5' : ''}`}>
              <span className="text-xl">{typeIcons[n.notification_type] || '📋'}</span>
              <div className="flex-1">
                <div className="text-sm font-medium text-white">{n.title}</div>
                {n.body && <div className="text-xs text-gray-400 mt-0.5">{n.body}</div>}
                <div className="text-xs text-gray-500 mt-1">{new Date(n.created_at).toLocaleString()}</div>
              </div>
              {!n.is_read && <button onClick={() => markRead(n.id)} className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded text-xs">Mark Read</button>}
              {n.is_read && <span className="text-xs text-gray-500">Read</span>}
            </div>
          ))}</div>}
      </div>
    </div>
  );
};
export default Communications;
