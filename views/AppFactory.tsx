import React, { useState, useEffect, useCallback } from 'react';

const TEMPLATE_ICONS: Record<string, string> = { business: '📊', marketing: '📣', utility: '🔧', dashboard: '📈', ecommerce: '🛒' };

const AppFactory = () => {
  const [templates, setTemplates] = useState<any[]>([]);
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateApp, setShowCreateApp] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [appName, setAppName] = useState('');
  const [deploying, setDeploying] = useState<string>('');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [tRes, aRes] = await Promise.all([
        fetch('/jax-app-factory', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'templates' }) }),
        fetch('/jax-app-factory', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'apps' }) }),
      ]);
      const [tData, aData] = await Promise.all([tRes.json(), aRes.json()]);
      if (tData.success) setTemplates(tData.templates || []);
      if (aData.success) setApps(aData.apps || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  const createApp = async () => {
    if (!appName) return;
    try {
      const res = await fetch('/jax-app-factory', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_app', name: appName, template_id: selectedTemplate || undefined }),
      });
      const data = await res.json();
      if (data.success) { setShowCreateApp(false); setAppName(''); setSelectedTemplate(''); fetchAll(); }
    } catch (e) { console.error(e); }
  };

  const deployApp = async (appId: string) => {
    setDeploying(appId);
    try {
      await fetch('/jax-app-factory', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'deploy', app_id: appId }) });
      fetchAll();
    } catch (e) { console.error(e); }
    finally { setDeploying(''); }
  };

  const deleteApp = async (id: string) => {
    if (!confirm('Delete this app?')) return;
    await fetch('/jax-app-factory', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'delete_app', id }) });
    fetchAll();
  };

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const statusColors: Record<string, string> = {
    building: 'bg-yellow-500/20 text-yellow-400',
    active: 'bg-green-500/20 text-green-400',
    paused: 'bg-gray-500/20 text-gray-400',
    archived: 'bg-red-500/20 text-red-400',
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">App Factory</h1>
          <p className="text-sm text-gray-400 mt-1">JAX-APP-BUILDER • Template-Based App Creation & Deployment</p>
        </div>
        <button onClick={() => setShowCreateApp(!showCreateApp)} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-medium transition">
          + Create App
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-slate-800 rounded-lg p-4 border border-white/5">
          <div className="text-xs text-gray-400">Templates</div>
          <div className="text-2xl font-bold text-indigo-400">{templates.length}</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border border-white/5">
          <div className="text-xs text-gray-400">Total Apps</div>
          <div className="text-2xl font-bold">{apps.length}</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border border-green-500/30">
          <div className="text-xs text-gray-400">Active</div>
          <div className="text-2xl font-bold text-green-400">{apps.filter(a => a.status === 'active').length}</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border border-yellow-500/30">
          <div className="text-xs text-gray-400">Building</div>
          <div className="text-2xl font-bold text-yellow-400">{apps.filter(a => a.status === 'building').length}</div>
        </div>
      </div>

      {/* Create App Form */}
      {showCreateApp && (
        <div className="bg-slate-800 rounded-lg p-6 border border-indigo-500/30">
          <h3 className="text-sm font-bold text-indigo-300 mb-4">Create New App</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs text-gray-400 block mb-1">App Name</label>
              <input type="text" value={appName} onChange={(e) => setAppName(e.target.value)}
                placeholder="My Application" className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Template (optional)</label>
              <select value={selectedTemplate} onChange={(e) => setSelectedTemplate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500">
                <option value="">No template (blank)</option>
                {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={createApp} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded text-sm font-medium">Create App</button>
            <button onClick={() => setShowCreateApp(false)} className="px-4 py-2 bg-slate-700 rounded text-sm">Cancel</button>
          </div>
        </div>
      )}

      {/* Template Gallery */}
      <div>
        <h3 className="text-sm font-bold text-gray-300 mb-3">📦 Template Gallery</h3>
        <div className="grid grid-cols-3 gap-4">
          {templates.map((t: any) => (
            <div key={t.id} className="bg-slate-800 rounded-lg p-4 border border-white/5 hover:border-indigo-500/30 transition cursor-pointer"
              onClick={() => { setSelectedTemplate(t.id); setAppName(t.name + ' - Copy'); setShowCreateApp(true); }}>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{TEMPLATE_ICONS[t.category] || '📄'}</span>
                <div>
                  <div className="font-medium text-white">{t.name}</div>
                  <div className="text-xs text-gray-400">{t.category}</div>
                </div>
              </div>
              <p className="text-xs text-gray-500">{t.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* My Apps */}
      <div>
        <h3 className="text-sm font-bold text-gray-300 mb-3">🚀 My Apps</h3>
        {apps.length === 0 ? (
          <div className="bg-slate-800 rounded-lg p-8 text-center text-gray-500 border border-white/5">
            <div className="text-4xl mb-3">🏭</div>
            <p>No apps created yet. Choose a template or create a blank app!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {apps.map((app: any) => (
              <div key={app.id} className="bg-slate-800 rounded-lg p-4 border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-white">{app.name}</h4>
                  <span className={`text-xs px-2 py-0.5 rounded ${statusColors[app.status] || 'bg-gray-500/20 text-gray-400'}`}>{app.status}</span>
                </div>
                {app.deploy_url && (
                  <div className="text-xs text-cyan-400 font-mono mb-2">{app.deploy_url}</div>
                )}
                <div className="text-xs text-gray-500 mb-3">Created: {new Date(app.created_at).toLocaleDateString()}</div>
                <div className="flex gap-2">
                  {app.status !== 'active' && (
                    <button onClick={() => deployApp(app.id)} disabled={deploying === app.id}
                      className="px-3 py-1 bg-green-600/20 text-green-400 rounded text-xs hover:bg-green-600/30 disabled:opacity-50">
                      {deploying === app.id ? '⟳ Deploying...' : '🚀 Deploy'}
                    </button>
                  )}
                  {app.deploy_url && (
                    <span className="px-3 py-1 bg-cyan-600/20 text-cyan-400 rounded text-xs">🌐 Live</span>
                  )}
                  <button onClick={() => deleteApp(app.id)} className="px-3 py-1 bg-red-600/20 text-red-400 rounded text-xs hover:bg-red-600/30 ml-auto">🗑</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AppFactory;
