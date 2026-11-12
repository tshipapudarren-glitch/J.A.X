import React, { useState, useEffect, useCallback } from 'react';

const DeveloperStudio = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [editorContent, setEditorContent] = useState('');
  const [consoleOutput, setConsoleOutput] = useState('');
  const [executing, setExecuting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showNewProject, setShowNewProject] = useState(false);
  const [showNewFile, setShowNewFile] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', language: 'javascript', description: '' });
  const [newFile, setNewFile] = useState({ file_name: '', content: '' });

  const fetchProjects = useCallback(async () => {
    const res = await fetch('/jax-dev', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'projects' }) });
    const data = await res.json();
    if (data.success) setProjects(data.projects || []);
    setLoading(false);
  }, []);

  const fetchFiles = useCallback(async (projectId: string) => {
    const res = await fetch('/jax-dev', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'files', project_id: projectId }) });
    const data = await res.json();
    if (data.success) setFiles(data.files || []);
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);
  useEffect(() => { if (selectedProject) fetchFiles(selectedProject); }, [selectedProject, fetchFiles]);

  const selectFile = (file: any) => {
    setSelectedFile(file);
    setEditorContent(file.content || '');
  };

  const executeCode = async () => {
    if (!editorContent.trim()) return;
    setExecuting(true);
    setConsoleOutput('');
    try {
      const res = await fetch('/jax-dev', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'execute', code: editorContent, language: selectedProject ? projects.find(p => p.id === selectedProject)?.language || 'javascript' : 'javascript' }),
      });
      const data = await res.json();
      setConsoleOutput(data.error ? `Error: ${data.error}` : data.output || 'Executed successfully');
      if (selectedFile) {
        await fetch('/jax-dev', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'update_file', file_id: selectedFile.id, content: editorContent }) });
      }
    } catch (e: any) { setConsoleOutput('Error: ' + e.message); }
    finally { setExecuting(false); }
  };

  const createProject = async () => {
    if (!newProject.name) return;
    const res = await fetch('/jax-dev', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'create_project', ...newProject }) });
    const data = await res.json();
    if (data.success) { setShowNewProject(false); setNewProject({ name: '', language: 'javascript', description: '' }); fetchProjects(); }
  };

  const createFile = async () => {
    if (!newFile.file_name || !selectedProject) return;
    const res = await fetch('/jax-dev', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'create_file', project_id: selectedProject, ...newFile }) });
    const data = await res.json();
    if (data.success) { setShowNewFile(false); setNewFile({ file_name: '', content: '' }); fetchFiles(selectedProject); }
  };

  const saveFile = async () => {
    if (!selectedFile) return;
    await fetch('/jax-dev', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'update_file', file_id: selectedFile.id, content: editorContent }) });
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Developer Studio</h1>
          <p className="text-sm text-gray-400 mt-1">JAX-DEVELOPER • Code Editor & Project Management</p>
        </div>
        <button onClick={() => setShowNewProject(!showNewProject)} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-sm font-medium transition">
          + New Project
        </button>
      </div>

      {showNewProject && (
        <div className="bg-slate-800 rounded-lg p-4 border border-cyan-500/30">
          <div className="grid grid-cols-3 gap-3">
            <input type="text" value={newProject.name} onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
              placeholder="Project name" className="bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500" />
            <select value={newProject.language} onChange={(e) => setNewProject({ ...newProject, language: e.target.value })}
              className="bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm text-white">
              <option value="javascript">JavaScript</option><option value="python">Python</option><option value="typescript">TypeScript</option>
            </select>
            <button onClick={createProject} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded text-sm font-medium">Create</button>
          </div>
        </div>
      )}

      <div className="flex gap-4 h-[calc(100vh-200px)]">
        {/* Sidebar - Projects & Files */}
        <div className="w-64 bg-slate-800 rounded-lg border border-white/5 flex flex-col overflow-hidden">
          <div className="p-3 border-b border-slate-700">
            <h3 className="text-xs font-bold text-gray-400 uppercase">Projects</h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            {projects.length === 0 ? (
              <div className="p-4 text-xs text-gray-500 text-center">No projects yet</div>
            ) : projects.map((p: any) => (
              <div key={p.id}>
                <button onClick={() => setSelectedProject(selectedProject === p.id ? '' : p.id)}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-700/50 ${selectedProject === p.id ? 'bg-slate-700 text-cyan-400' : 'text-gray-300'}`}>
                  📁 {p.name}
                  <span className="text-xs text-gray-500 ml-1">{p.language}</span>
                </button>
                {selectedProject === p.id && (
                  <div className="pl-4 pb-2">
                    <button onClick={() => setShowNewFile(true)} className="text-xs text-cyan-400 hover:text-cyan-300 mb-1">+ New File</button>
                    {files.map((f: any) => (
                      <button key={f.id} onClick={() => selectFile(f)}
                        className={`block w-full text-left px-2 py-1 text-xs rounded ${selectedFile?.id === f.id ? 'bg-cyan-600/20 text-cyan-300' : 'text-gray-400 hover:text-gray-300'}`}>
                        📄 {f.file_name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main - Code Editor */}
        <div className="flex-1 flex flex-col">
          <div className="bg-slate-800 rounded-t-lg border border-white/5 border-b-0 p-2 flex items-center gap-2">
            <span className="text-sm text-gray-300 flex-1">{selectedFile ? `📄 ${selectedFile.file_name}` : 'No file selected'}</span>
            {selectedFile && (
              <>
                <button onClick={saveFile} className="px-3 py-1 bg-green-600/20 text-green-400 rounded text-xs hover:bg-green-600/30">💾 Save</button>
                <button onClick={executeCode} disabled={executing} className="px-3 py-1 bg-cyan-600/20 text-cyan-400 rounded text-xs hover:bg-cyan-600/30">
                  {executing ? '⟳' : '▶'} Run
                </button>
              </>
            )}
          </div>
          <div className="flex-1 bg-slate-900 border border-white/5 rounded-b-lg overflow-hidden">
            <textarea value={editorContent} onChange={(e) => setEditorContent(e.target.value)}
              placeholder={selectedFile ? '// Write your code here...' : 'Select or create a file to start coding'}
              className="w-full h-full bg-transparent text-sm text-gray-100 font-mono p-4 resize-none focus:outline-none placeholder-gray-600"
              spellCheck={false} />
          </div>
        </div>

        {/* Console */}
        <div className="w-80 flex flex-col">
          <div className="bg-slate-800 rounded-t-lg border border-white/5 border-b-0 p-2">
            <h3 className="text-xs font-bold text-gray-400 uppercase">Console Output</h3>
          </div>
          <div className="flex-1 bg-black border border-white/5 rounded-b-lg p-3 overflow-y-auto">
            <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap">{consoleOutput || '// Run code to see output here'}</pre>
          </div>
        </div>
      </div>

      {/* New File Modal */}
      {showNewFile && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 w-96 border border-cyan-500/30">
            <h3 className="text-sm font-bold text-cyan-300 mb-4">New File</h3>
            <input type="text" value={newFile.file_name} onChange={(e) => setNewFile({ ...newFile, file_name: e.target.value })}
              placeholder="filename.js" className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm text-white mb-3 focus:outline-none focus:border-cyan-500" />
            <textarea value={newFile.content} onChange={(e) => setNewFile({ ...newFile, content: e.target.value })}
              placeholder="// Initial code..." className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm text-white font-mono h-32 resize-none mb-3 focus:outline-none focus:border-cyan-500" />
            <div className="flex gap-2">
              <button onClick={createFile} className="px-4 py-2 bg-cyan-600 rounded text-sm text-white">Create</button>
              <button onClick={() => setShowNewFile(false)} className="px-4 py-2 bg-slate-700 rounded text-sm text-gray-300">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeveloperStudio;
