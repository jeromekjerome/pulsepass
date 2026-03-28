import { useState } from 'react';

const DRINK_OPTIONS = [
  'Green Goddess', 'Tropical Detox', 'Protein Power', 'Citrus Surge',
  'Elderberry Boost', 'Matcha Burn', 'Prebiotic Glow', 'Ginger Shot',
  'Acai Bowl', 'Spirulina Splash', 'Other'
];

export default function VisitLogger({ onLog, loading }) {
  const [item, setItem] = useState('');
  const [custom, setCustom] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const order = item === 'Other' ? custom : item;
    if (!order) return;
    onLog(order);
    setItem('');
    setCustom('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <select
        value={item}
        onChange={e => setItem(e.target.value)}
        className="w-full bg-teal-900/30 border border-teal-800/40 rounded-xl px-4 py-3 text-white appearance-none focus:outline-none focus:border-teal-500"
      >
        <option value="" disabled>What did you order?</option>
        {DRINK_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
      </select>
      {item === 'Other' && (
        <input
          value={custom}
          onChange={e => setCustom(e.target.value)}
          placeholder="Type your order..."
          className="w-full bg-teal-900/30 border border-teal-800/40 rounded-xl px-4 py-3 text-white placeholder-teal-700 focus:outline-none focus:border-teal-500"
        />
      )}
      <button
        type="submit"
        disabled={!item || loading}
        className="w-full py-3 rounded-xl bg-teal-500 disabled:bg-teal-900/50 disabled:text-teal-700 text-white font-semibold transition-all active:scale-95"
      >
        {loading ? 'Logging...' : 'Log Visit & Get Suggestion →'}
      </button>
    </form>
  );
}
