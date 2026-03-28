import { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext.jsx';
import CustomerView from './components/CustomerView.jsx';
import OwnerView from './components/OwnerView.jsx';

function Inner() {
  const { view, setView } = useApp();
  const [showPwPrompt, setShowPwPrompt] = useState(false);
  const [pw, setPw] = useState('');
  const [pwError, setPwError] = useState(false);

  const handleOwnerClick = () => {
    if (view === 'owner') { setView('customer'); return; }
    setShowPwPrompt(true);
  };

  const handlePwSubmit = (e) => {
    e.preventDefault();
    if (pw === 'admin') { setView('owner'); setShowPwPrompt(false); setPw(''); setPwError(false); }
    else { setPwError(true); }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0a1510' }}>
      <header className="flex items-center justify-between px-4 py-4 border-b border-teal-900/40">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🔄</span>
          <span className="font-bold text-teal-400 text-lg">PulsePass</span>
        </div>
        <button onClick={handleOwnerClick} className="text-xs text-teal-700 hover:text-teal-400 font-medium transition-colors">
          {view === 'owner' ? '← Customer View' : 'Staff Login'}
        </button>
      </header>

      {showPwPrompt && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="bg-teal-950 border border-teal-800/40 rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-white font-bold text-lg mb-4">Staff Access</h3>
            <form onSubmit={handlePwSubmit} className="space-y-3">
              <input
                type="password"
                value={pw}
                onChange={e => { setPw(e.target.value); setPwError(false); }}
                placeholder="Password"
                className="w-full bg-teal-900/30 border border-teal-800/40 rounded-xl px-4 py-3 text-white placeholder-teal-700 focus:outline-none focus:border-teal-500"
              />
              {pwError && <p className="text-red-400 text-sm">Incorrect password</p>}
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-teal-500 text-white font-semibold py-2.5 rounded-xl hover:bg-teal-400 transition-colors">Enter</button>
                <button type="button" onClick={() => { setShowPwPrompt(false); setPw(''); setPwError(false); }} className="flex-1 border border-teal-800/40 text-teal-400 font-semibold py-2.5 rounded-xl">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <main className="max-w-2xl mx-auto px-4 py-6">
        {view === 'customer' ? <CustomerView /> : <OwnerView />}
      </main>
    </div>
  );
}

export default function App() {
  return <AppProvider><Inner /></AppProvider>;
}
