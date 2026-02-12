import React, { useState, useEffect } from 'react';

function App() {
  const [status, setStatus] = useState('Disconnected');
  const [response, setResponse] = useState(null);

  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.onPythonResponse((data) => {
        console.log("Received:", data);
        setResponse(data);
        if (data.status === 'success' && data.message === 'pong') {
           setStatus('Connected');
        }
      });
    }
  }, []);

  const sendPing = () => {
    if (window.electronAPI) {
      window.electronAPI.sendToPython({ command: 'ping' });
    }
  };

  return (
    <div className="flex h-screen w-full flex-col bg-zinc-900 text-zinc-200 font-sans selection:bg-blue-500 selection:text-white">
      {/* Header - Industrial Style */}
      <header className="flex items-center justify-between px-6 py-4 bg-zinc-800 border-b border-zinc-700 select-none">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-sm ${status === 'Connected' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
          <h1 className="text-sm font-bold uppercase tracking-wider text-zinc-400">System Status: {status}</h1>
        </div>
        <div className="text-xs text-zinc-500 font-mono">v0.1.0-alpha</div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-8 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-semibold text-white">Local AI PII Redactor</h2>
          <p className="text-zinc-500 text-sm max-w-md mx-auto">
            Authorized Personnel Only. System operates in strict Offline Mode.
          </p>
        </div>

        {/* Action Panel */}
        <div className="w-full max-w-sm bg-zinc-800 border border-zinc-700 p-6 space-y-4 shadow-sm">
          <div className="flex justify-between items-center text-xs font-mono text-zinc-400 border-b border-zinc-700 pb-2">
            <span>INTERFACE_CHECK</span>
            <span>READY</span>
          </div>

          <button 
            onClick={sendPing}
            className="w-full py-2 bg-blue-700 hover:bg-blue-600 text-white font-medium text-sm transition-colors border border-blue-600 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            Initiate Connection Test
          </button>

          {response && (
            <div className="mt-4 bg-black border border-zinc-700 p-3 font-mono text-xs text-emerald-400 overflow-x-auto whitespace-pre-wrap">
              {JSON.stringify(response, null, 2)}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-3 bg-zinc-900 border-t border-zinc-800 text-center">
        <p className="text-[10px] text-zinc-600 uppercase tracking-widest">
          Secure Environment • No Network Activity Detected
        </p>
      </footer>
    </div>
  );
}

export default App;
