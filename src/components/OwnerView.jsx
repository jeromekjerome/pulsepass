import { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import CustomerRow from './CustomerRow.jsx';

export default function OwnerView() {
  const { customers, getAtRiskCustomers, getDaysSince } = useApp();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const atRisk = getAtRiskCustomers();
  const totalVisitsToday = customers.reduce((acc, c) => {
    const today = new Date().toDateString();
    return acc + c.visits.filter(v => new Date(v.date).toDateString() === today).length;
  }, 0);

  const handleGenerate = async () => {
    setLoading(true);
    setMessages([]);
    const payload = atRisk.map(c => ({
      id: c.id,
      name: c.name,
      favoriteItem: c.visits.length > 0 ? c.visits[c.visits.length - 1].item : 'our smoothies',
      daysSince: getDaysSince(c),
      visitCount: c.visits.length,
    }));
    try {
      const res = await fetch('/api/reengage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customers: payload })
      });
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const text = messages.map(m => `${m.customerName}:\n${m.message}`).join('\n\n---\n\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-extrabold text-white">Staff Dashboard</h2>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Customers', value: customers.length },
          { label: 'Visits Today', value: totalVisitsToday },
          { label: 'At-Risk (14d+)', value: atRisk.length, warn: atRisk.length > 0 },
        ].map(s => (
          <div key={s.label} className="bg-teal-900/20 border border-teal-800/30 rounded-xl p-3 text-center">
            <p className={`text-2xl font-extrabold ${s.warn ? 'text-red-400' : 'text-teal-400'}`}>{s.value}</p>
            <p className="text-teal-700 text-xs mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* At-risk section */}
      {atRisk.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-bold">At-Risk Customers</h3>
            <button onClick={handleGenerate} disabled={loading} className="bg-teal-500 disabled:bg-teal-900/50 disabled:text-teal-700 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-teal-400 transition-all">
              {loading ? 'Generating...' : '✨ Generate Messages'}
            </button>
          </div>
          <div className="bg-teal-900/10 border border-teal-900/30 rounded-xl overflow-hidden">
            {atRisk.map(c => (
              <div key={c.id} className="flex items-center justify-between px-4 py-3 border-b border-teal-900/20 last:border-0">
                <div>
                  <p className="text-white text-sm font-medium">{c.name}</p>
                  <p className="text-teal-700 text-xs">{c.goals}</p>
                </div>
                <span className="text-red-400 text-xs font-medium bg-red-500/10 px-2 py-0.5 rounded-full">
                  {getDaysSince(c)}d inactive
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generated messages */}
      {messages.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-bold">Re-Engagement Messages</h3>
            <button onClick={handleExport} className="text-sm text-teal-400 border border-teal-800/40 px-3 py-1.5 rounded-xl hover:bg-teal-900/30 transition-all">
              {copied ? '✓ Copied!' : '📋 Export All'}
            </button>
          </div>
          <div className="space-y-3">
            {messages.map((m, i) => (
              <div key={i} className="bg-teal-900/20 border border-teal-800/30 rounded-xl p-4">
                <p className="text-teal-400 text-xs font-semibold mb-1">{m.customerName}</p>
                <p className="text-white text-sm leading-relaxed">{m.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All customers table */}
      <div>
        <h3 className="text-white font-bold mb-3">All Customers</h3>
        <div className="bg-teal-900/10 border border-teal-900/30 rounded-xl overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-teal-900/30">
                <th className="px-4 py-2 text-teal-600 text-xs font-semibold uppercase">Name</th>
                <th className="px-4 py-2 text-teal-600 text-xs font-semibold uppercase">Visits</th>
                <th className="px-4 py-2 text-teal-600 text-xs font-semibold uppercase">Last Order</th>
                <th className="px-4 py-2 text-teal-600 text-xs font-semibold uppercase">Last Visit</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(c => (
                <CustomerRow key={c.id} customer={c} daysSince={getDaysSince(c)} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
