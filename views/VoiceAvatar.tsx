import React, { useState, useEffect, useCallback } from 'react';

const VoiceAvatar = () => {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [avatars, setAvatars] = useState<any[]>([]);
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [textInput, setTextInput] = useState('');
  const [speechOutput, setSpeechOutput] = useState('');
  const [synthesizing, setSynthesizing] = useState(false);
  const [showCreateVoice, setShowCreateVoice] = useState(false);
  const [showCreateAvatar, setShowCreateAvatar] = useState(false);
  const [newVoice, setNewVoice] = useState({ name: '', language: 'en', speed: '1.0', pitch: '1.0' });
  const [newAvatar, setNewAvatar] = useState({ name: '', avatar_type: 'abstract' });

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, aRes, sRes] = await Promise.all([
        fetch('/jax-voice', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'profiles' }) }),
        fetch('/jax-voice', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'avatars' }) }),
        fetch('/jax-voice', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'status' }) }),
      ]);
      const [pData, aData, sData] = await Promise.all([pRes.json(), aRes.json(), sRes.json()]);
      if (pData.success) setProfiles(pData.profiles || []);
      if (aData.success) setAvatars(aData.avatars || []);
      if (sData.success) setStatus(sData);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  const synthesize = async () => {
    if (!textInput.trim()) return;
    setSynthesizing(true);
    setSpeechOutput('');
    try {
      const res = await fetch('/jax-voice', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'synthesize', text: textInput }),
      });
      const data = await res.json();
      if (data.success) setSpeechOutput(data.speech_text);
    } catch (e) { console.error(e); }
    finally { setSynthesizing(false); }
  };

  const createVoiceProfile = async () => {
    if (!newVoice.name) return;
    await fetch('/jax-voice', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'create_profile', ...newVoice, speed: parseFloat(newVoice.speed), pitch: parseFloat(newVoice.pitch) }) });
    setShowCreateVoice(false); setNewVoice({ name: '', language: 'en', speed: '1.0', pitch: '1.0' }); fetchAll();
  };

  const createAvatar = async () => {
    if (!newAvatar.name) return;
    await fetch('/jax-voice', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'create_avatar', ...newAvatar, config: { type: newAvatar.avatar_type } }) });
    setShowCreateAvatar(false); setNewAvatar({ name: '', avatar_type: 'abstract' }); fetchAll();
  };

  useEffect(() => { fetchAll(); }, [fetchAll]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Voice & Avatar</h1>
          <p className="text-sm text-gray-400 mt-1">JAX-VOICE • Voice Synthesis & Avatar Interaction</p>
        </div>
      </div>

      {/* Status */}
      {status && (
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-slate-800 rounded-lg p-4 border border-white/5">
            <div className="text-xs text-gray-400">Voice Profiles</div>
            <div className="text-2xl font-bold text-purple-400">{status.voice_profiles || 0}</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-white/5">
            <div className="text-xs text-gray-400">Avatars</div>
            <div className="text-2xl font-bold text-blue-400">{status.avatars || 0}</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-white/5">
            <div className="text-xs text-gray-400">Default Voice</div>
            <div className="text-lg font-bold text-white">{status.default_voice || 'None'}</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-white/5">
            <div className="text-xs text-gray-400">Active Avatar</div>
            <div className="text-lg font-bold text-white">{status.active_avatar || 'None'}</div>
          </div>
        </div>
      )}

      {/* Voice Interaction Panel */}
      <div className="bg-gradient-to-r from-purple-900/30 to-slate-800 rounded-lg p-6 border border-purple-500/30">
        <h3 className="text-lg font-bold text-purple-300 mb-4">🎙️ Voice Synthesis</h3>
        <textarea value={textInput} onChange={(e) => setTextInput(e.target.value)}
          placeholder="Enter text to synthesize speech..."
          className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-sm text-white placeholder-gray-500 h-24 resize-none focus:outline-none focus:border-purple-500" />
        <button onClick={synthesize} disabled={synthesizing || !textInput.trim()}
          className="mt-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 rounded-lg text-sm font-medium transition">
          {synthesizing ? '⟳ Processing...' : '🔊 Synthesize Speech'}
        </button>
        {speechOutput && (
          <div className="mt-4 bg-slate-900 rounded-lg p-4 border border-purple-500/20">
            <div className="text-xs text-purple-400 mb-2">Synthesized Output:</div>
            <p className="text-sm text-gray-300">{speechOutput}</p>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full animate-pulse" style={{ width: '60%' }} />
              </div>
              <span className="text-xs text-gray-400">Ready for TTS</span>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Voice Profiles */}
        <div className="bg-slate-800 rounded-lg border border-white/5 overflow-hidden">
          <div className="p-4 border-b border-slate-700 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-300">Voice Profiles</h3>
            <button onClick={() => setShowCreateVoice(!showCreateVoice)} className="text-xs px-2 py-1 bg-purple-600/20 text-purple-400 rounded hover:bg-purple-600/30">+ Add</button>
          </div>
          {showCreateVoice && (
            <div className="p-4 border-b border-slate-700 bg-slate-900/50 space-y-2">
              <input type="text" value={newVoice.name} onChange={(e) => setNewVoice({ ...newVoice, name: e.target.value })}
                placeholder="Voice name" className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-purple-500" />
              <div className="grid grid-cols-3 gap-2">
                <select value={newVoice.language} onChange={(e) => setNewVoice({ ...newVoice, language: e.target.value })}
                  className="bg-slate-900 border border-slate-600 rounded px-2 py-1.5 text-xs text-white">
                  <option value="en">English</option><option value="es">Spanish</option><option value="fr">French</option>
                </select>
                <input type="number" value={newVoice.speed} onChange={(e) => setNewVoice({ ...newVoice, speed: e.target.value })}
                  step="0.1" min="0.5" max="2" placeholder="Speed" className="bg-slate-900 border border-slate-600 rounded px-2 py-1.5 text-xs text-white" />
                <input type="number" value={newVoice.pitch} onChange={(e) => setNewVoice({ ...newVoice, pitch: e.target.value })}
                  step="0.1" min="0.5" max="2" placeholder="Pitch" className="bg-slate-900 border border-slate-600 rounded px-2 py-1.5 text-xs text-white" />
              </div>
              <button onClick={createVoiceProfile} className="px-3 py-1 bg-purple-600 rounded text-xs text-white">Create</button>
            </div>
          )}
          {profiles.length === 0 ? (
            <div className="p-6 text-center text-gray-500 text-sm">No voice profiles</div>
          ) : (
            <div className="divide-y divide-slate-700">
              {profiles.map((p: any) => (
                <div key={p.id} className="p-3 flex items-center gap-3">
                  <span className="text-xl">🎤</span>
                  <div className="flex-1">
                    <div className="text-sm text-white font-medium">{p.name}</div>
                    <div className="text-xs text-gray-400">{p.language} • Speed: {p.speed}x • Pitch: {p.pitch}</div>
                  </div>
                  {p.is_default && <span className="text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-400">Default</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Avatar Configs */}
        <div className="bg-slate-800 rounded-lg border border-white/5 overflow-hidden">
          <div className="p-4 border-b border-slate-700 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-300">Avatar Configs</h3>
            <button onClick={() => setShowCreateAvatar(!showCreateAvatar)} className="text-xs px-2 py-1 bg-blue-600/20 text-blue-400 rounded hover:bg-blue-600/30">+ Add</button>
          </div>
          {showCreateAvatar && (
            <div className="p-4 border-b border-slate-700 bg-slate-900/50 space-y-2">
              <input type="text" value={newAvatar.name} onChange={(e) => setNewAvatar({ ...newAvatar, name: e.target.value })}
                placeholder="Avatar name" className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500" />
              <select value={newAvatar.avatar_type} onChange={(e) => setNewAvatar({ ...newAvatar, avatar_type: e.target.value })}
                className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-1.5 text-sm text-white">
                <option value="abstract">Abstract</option><option value="3d">3D Character</option><option value="minimal">Minimal</option>
              </select>
              <button onClick={createAvatar} className="px-3 py-1 bg-blue-600 rounded text-xs text-white">Create</button>
            </div>
          )}
          {avatars.length === 0 ? (
            <div className="p-6 text-center text-gray-500 text-sm">No avatars configured</div>
          ) : (
            <div className="divide-y divide-slate-700">
              {avatars.map((a: any) => (
                <div key={a.id} className="p-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${a.config?.color || '#8b5cf6'}, #1e1e2e)` }}>
                    <span className="text-xl">{a.avatar_type === 'abstract' ? '🔮' : a.avatar_type === '3d' ? '🤖' : '⚡'}</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-white font-medium">{a.name}</div>
                    <div className="text-xs text-gray-400">Type: {a.avatar_type}</div>
                  </div>
                  {a.is_active && <span className="text-xs px-2 py-0.5 rounded bg-green-500/20 text-green-400">Active</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Avatar Preview */}
      {avatars.length > 0 && (
        <div className="bg-slate-800 rounded-lg p-6 border border-white/5">
          <h3 className="text-sm font-bold text-gray-300 mb-4">Avatar Preview</h3>
          <div className="flex items-center justify-center py-8">
            <div className="relative">
              <div className="w-32 h-32 rounded-full flex items-center justify-center animate-pulse"
                style={{ background: `radial-gradient(circle, ${avatars.find(a => a.is_active)?.config?.color || '#8b5cf6'}40, transparent)`, border: `2px solid ${avatars.find(a => a.is_active)?.config?.color || '#8b5cf6'}` }}>
                <div className="text-6xl">🔮</div>
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-slate-900 px-3 py-1 rounded-full text-xs text-gray-400">
                {avatars.find(a => a.is_active)?.name || 'No active avatar'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceAvatar;
