import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({ label, value, icon: Icon, color = 'white', trend, subtitle }) {
  const colors = {
    white: 'bg-neutral-900/90 text-white border-neutral-800',
    indigo: 'bg-zinc-900/90 text-zinc-100 border-zinc-800',
    green: 'bg-emerald-950/30 text-emerald-300 border-emerald-800/40',
    yellow: 'bg-amber-950/30 text-amber-300 border-amber-800/40',
    red: 'bg-rose-950/30 text-rose-300 border-rose-800/40',
    blue: 'bg-zinc-900/90 text-zinc-200 border-zinc-800',
    purple: 'bg-zinc-900/90 text-zinc-200 border-zinc-800',
  };

  return (
    <div className={`rounded-2xl border p-5 ${colors[color] || colors.white} backdrop-blur-xl hover:scale-[1.01] transition-transform duration-200 shadow-xl shadow-black/40`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{label}</p>
          <div className="flex items-baseline gap-2.5 mt-1.5">
            <p className="text-2xl font-bold tracking-tight text-white">{value}</p>
            {trend !== undefined && trend !== null && (
              <span className={`flex items-center gap-0.5 text-xs font-semibold ${
                trend >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {trend >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                {Math.abs(trend)}%
              </span>
            )}
          </div>
          {subtitle && <p className="text-xs text-zinc-400 mt-1">{subtitle}</p>}
        </div>
        {Icon && (
          <div className="w-10 h-10 rounded-xl bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center text-zinc-300 shrink-0">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
}
