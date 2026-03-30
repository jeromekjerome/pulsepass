import { useState } from 'react';
import { track } from '../analytics.js';
import { useApp } from '../context/AppContext.jsx';
import PunchCard from './PunchCard.jsx';
import VisitLogger from './VisitLogger.jsx';

const GOALS = ['Energy Boost', 'Weight Loss', 'Immunity', 'Gut Health', 'Recovery', 'General Wellness'];

export default function CustomerView() {
  const { currentCustomer, findOrCreateCustomer, logVisit } = useApp();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('');
  const [step, setStep] = useState('signin'); // signin | profile | home
  const [nudge, setNudge] = useState(null);
  const [rewardEarned, setRewardEarned] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignIn = (e) => {
    e.preventDefault();
    if (!email) return;
    const existing = findOrCreateCustomer(email, name || email.split('@')[0], goal || 'General Wellness');
    if (existing.visits.length === 0 && !name) {
      setStep('profile');
    } else {
      setStep('home');
    }
  };

  const handleProfileSave = (e) => {
    e.preventDefault();
    findOrCreateCustomer(email, name || email.split('@')[0], goal || 'General Wellness');
    setStep('home');
  };

  const handleLog = async (item) => {
    setLoading(true);
    setRewardEarned(false);
    setNudge(null);
    const earned = logVisit(currentCustomer.id, item);
    setRewardEarned(earned);
    track('nudge_requested');
    try {
      const res = await fetch('/api/nudge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer: { ...currentCustomer, visits: [...currentCustomer.visits, { item, date: new Date().toISOString() }] } })
      });
      if (res.ok) {
        const data = await res.json();
        track('nudge_received');
        setNudge(data.message);
      }
    } catch (err) {
      console.error('Nudge error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (step === 'signin') {
    return (
      <div>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-white mb-2">Welcome Back <span className="text-teal-400">🔄</span></h1>
          <p className="text-teal-700 text-sm">Enter your email to check in</p>
        </div>
        <form onSubmit={handleSignIn} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="w-full bg-teal-900/30 border border-teal-800/40 rounded-xl px-4 py-4 text-white placeholder-teal-700 text-lg focus:outline-none focus:border-teal-500"
          />
          <button type="submit" className="w-full py-4 rounded-xl bg-teal-500 text-white font-bold text-lg hover:bg-teal-400 transition-all active:scale-95">
            Check In →
          </button>
        </form>
        <p className="text-center text-teal-800 text-xs mt-4">New? We'll create your loyalty profile automatically.</p>
      </div>
    );
  }

  if (step === 'profile') {
    return (
      <div>
        <div className="text-center mb-6">
          <h2 className="text-2xl font-extrabold text-white mb-1">Welcome! 👋</h2>
          <p className="text-teal-600 text-sm">Tell us a bit about yourself</p>
        </div>
        <form onSubmit={handleProfileSave} className="space-y-4">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Your name"
            className="w-full bg-teal-900/30 border border-teal-800/40 rounded-xl px-4 py-3 text-white placeholder-teal-700 focus:outline-none focus:border-teal-500"
          />
          <div>
            <p className="text-teal-600 text-sm mb-2">Health goal:</p>
            <div className="flex flex-wrap gap-2">
              {GOALS.map(g => (
                <button key={g} type="button" onClick={() => setGoal(g)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-all ${goal === g ? 'bg-teal-500 border-teal-400 text-white' : 'bg-teal-900/30 border-teal-800/40 text-teal-300'}`}>
                  {g}
                </button>
              ))}
            </div>
          </div>
          <button type="submit" className="w-full py-3 rounded-xl bg-teal-500 text-white font-semibold hover:bg-teal-400 transition-all">
            Save & Continue →
          </button>
        </form>
      </div>
    );
  }

  // Home
  const customer = currentCustomer;
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Hey, {customer?.name?.split(' ')[0]}! 👋</h2>
          <p className="text-teal-600 text-sm">{customer?.visits?.length || 0} total visit{(customer?.visits?.length || 0) !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => { setStep('signin'); setNudge(null); setRewardEarned(false); }} className="text-teal-700 text-xs hover:text-teal-400">Sign out</button>
      </div>

      <PunchCard stamps={customer?.stamps || 0} rewardCount={customer?.rewardCount || 0} />

      {rewardEarned && (
        <div className="bg-amber-500/20 border border-amber-500/30 rounded-xl p-4 text-center">
          <p className="text-amber-400 font-bold text-lg">🎉 You earned a free drink!</p>
          <p className="text-amber-200/70 text-sm">Show this to a staff member to redeem.</p>
        </div>
      )}

      {nudge && (
        <div className="bg-teal-900/30 border border-teal-500/20 rounded-xl p-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-teal-500 mb-1">Your Next Blend Suggestion</p>
          <p className="text-teal-100 text-sm leading-relaxed">{nudge}</p>
        </div>
      )}

      <div>
        <p className="text-teal-600 text-sm mb-3 font-medium">Log today's order:</p>
        <VisitLogger onLog={handleLog} loading={loading} />
      </div>
    </div>
  );
}
