import { useState } from 'react';

export default function SentimentBar({ positive, neutral, negative, labels, size = 'default' }) {
  const [hoveredSegment, setHoveredSegment] = useState(null);
  const total = (positive || 0) + (neutral || 0) + (negative || 0);

  if (total === 0) {
    return (
      <div>
        <div className={`${size === 'sm' ? 'h-2' : 'h-3'} w-full rounded-full bg-slate-700`}>
          <div className="h-full rounded-full bg-slate-600 w-0" />
        </div>
        <p className="text-xs text-slate-500 mt-1.5 text-center">No data</p>
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

  const segments = [
    { key: 'positive', value: positive, pct: pPct, label: l.positive, color: 'bg-green-500', textColor: 'text-green-400', count: positive },
    { key: 'neutral', value: neutral, pct: nPct, label: l.neutral, color: 'bg-yellow-500', textColor: 'text-yellow-400', count: neutral },
    { key: 'negative', value: negative, pct: negPct, label: l.negative, color: 'bg-red-500', textColor: 'text-red-400', count: negative },
  ];

  const barHeight = size === 'sm' ? 'h-2' : size === 'lg' ? 'h-4' : 'h-3';

  return (
    <div>
      <div className={`flex ${barHeight} w-full rounded-full overflow-hidden bg-slate-700 relative`}>
        {segments.map(({ key, value, pct, label, color }) =>
          value > 0 ? (
            <div
              key={key}
              className={`${color} transition-all duration-700 ease-out relative cursor-pointer hover:brightness-110`}
              style={{ width: `${pct}%` }}
              onMouseEnter={() => setHoveredSegment(key)}
              onMouseLeave={() => setHoveredSegment(null)}
            >
              {hoveredSegment === key && (
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-600 shadow-xl text-xs text-white whitespace-nowrap z-10 pointer-events-none">
                  {label}: {value} ({pct}%)
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 border-r border-b border-slate-600 rotate-45" />
                </div>
              )}
            </div>
          ) : null
        )}
      </div>
      <div className="flex justify-between text-xs mt-1.5">
        {segments.map(({ key, pct, label, textColor, count }) => (
          <span key={key} className={`${textColor} flex items-center gap-1`}>
            <span className={`inline-block w-1.5 h-1.5 rounded-full ${key === 'positive' ? 'bg-green-400' : key === 'neutral' ? 'bg-yellow-400' : 'bg-red-400'}`} />
            {label} {pct}%{count > 0 && <span className="text-slate-500">({count})</span>}
          </span>
        ))}
      </div>
    </div>
  );
}
