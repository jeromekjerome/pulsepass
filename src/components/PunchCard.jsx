export default function PunchCard({ stamps, rewardCount }) {
  return (
    <div className="bg-teal-900/20 border border-teal-800/30 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-teal-600">Loyalty Card</p>
        {rewardCount > 0 && (
          <span className="bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs px-2 py-0.5 rounded-full">
            {rewardCount} reward{rewardCount > 1 ? 's' : ''} earned!
          </span>
        )}
      </div>
      <div className="flex gap-2 justify-center my-2">
        {[0,1,2,3,4].map(i => (
          <div key={i} className={`w-11 h-11 rounded-full border-2 flex items-center justify-center text-lg transition-all duration-300 ${
            i < stamps
              ? 'bg-teal-500 border-teal-400 shadow-lg shadow-teal-500/30'
              : 'bg-teal-900/30 border-teal-800/40'
          }`}>
            {i < stamps ? '🥤' : ''}
          </div>
        ))}
      </div>
      <p className="text-center text-teal-600 text-xs mt-2">
        {stamps === 0 ? 'Start earning — every visit counts!' :
         stamps < 5 ? `${5 - stamps} more visit${5 - stamps > 1 ? 's' : ''} until your free drink!` :
         '🎉 Free drink reward ready!'}
      </p>
    </div>
  );
}
