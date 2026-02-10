export default function SentimentBar({ positive, neutral, negative, labels }) {
  const total = (positive || 0) + (neutral || 0) + (negative || 0);
  if (total === 0) {
    return (
      <div className="h-3 w-full rounded-full bg-slate-700">
        <div className="h-full rounded-full bg-slate-600 w-0" />
      </div>
    );
  }

  const pPct = ((positive / total) * 100).toFixed(1);
  const nPct = ((neutral / total) * 100).toFixed(1);
  const negPct = ((negative / total) * 100).toFixed(1);

  const l = labels || {
    positive: 'Positive',
    neutral: 'Neutral',
    negative: 'Negative',
  };

  return (
    <div>
      <div className="flex h-3 w-full rounded-full overflow-hidden bg-slate-700">
        {positive > 0 && (
          <div
            className="bg-green-500 transition-all duration-500"
            style={{ width: `${pPct}%` }}
            title={`${l.positive}: ${pPct}%`}
          />
        )}
        {neutral > 0 && (
          <div
            className="bg-yellow-500 transition-all duration-500"
            style={{ width: `${nPct}%` }}
            title={`${l.neutral}: ${nPct}%`}
          />
        )}
        {negative > 0 && (
          <div
            className="bg-red-500 transition-all duration-500"
            style={{ width: `${negPct}%` }}
            title={`${l.negative}: ${negPct}%`}
          />
        )}
      </div>
      <div className="flex justify-between text-xs mt-1.5">
        <span className="text-green-400">
          {l.positive} {pPct}%
        </span>
        <span className="text-yellow-400">
          {l.neutral} {nPct}%
        </span>
        <span className="text-red-400">
          {l.negative} {negPct}%
        </span>
      </div>
    </div>
  );
}
