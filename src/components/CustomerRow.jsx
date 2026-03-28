export default function CustomerRow({ customer, daysSince }) {
  const lastItem = customer.visits.length > 0 ? customer.visits[customer.visits.length - 1].item : '—';
  const isAtRisk = daysSince !== null && daysSince >= 14;

  return (
    <tr className="border-b border-teal-900/30 hover:bg-teal-900/10 transition-colors">
      <td className="py-3 pr-4">
        <p className="text-white font-medium text-sm">{customer.name}</p>
        <p className="text-teal-700 text-xs">{customer.email}</p>
      </td>
      <td className="py-3 pr-4 text-teal-400 text-sm">{customer.visits.length}</td>
      <td className="py-3 pr-4 text-teal-300 text-sm">{lastItem}</td>
      <td className="py-3 pr-4">
        {daysSince === null ? (
          <span className="text-teal-700 text-xs">never</span>
        ) : (
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${isAtRisk ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
            {daysSince}d ago
          </span>
        )}
      </td>
    </tr>
  );
}
