import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({ label, value, icon: Icon, color = 'indigo', trend, subtitle }) {
  const colors = {
    indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    green: 'bg-green-500/10 text-green-400 border-green-500/20',
    yellow: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    red: 'bg-red-500/10 text-red-400 border-red-500/20',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  };

  return (
    <div className={`rounded-xl border p-5 ${colors[color]} hover:scale-[1.02] transition-transform duration-200`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-80">{label}</p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-2xl font-bold">{value}</p>
            {trend !== undefined && trend !== null && (
              <span className={`flex items-center gap-0.5 text-xs font-medium ${
                trend >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {Math.abs(trend)}%
              </span>
            )}
          </div>
          {subtitle && <p className="text-xs opacity-60 mt-0.5">{subtitle}</p>}
        </div>
        {Icon && <Icon className="w-8 h-8 opacity-60" />}
      </div>
    </div>
  );
}
