import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ text = 'Loading...', fullPage = false }) {
  const content = (
    <div className="flex flex-col items-center justify-center py-12 gap-4">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-2 border-slate-700" />
        <div className="absolute inset-0 w-12 h-12 rounded-full border-2 border-transparent border-t-indigo-500 animate-spin" />
      </div>
      <span className="text-slate-400 text-sm">{text}</span>
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return content;
}

export function LoadingSkeleton({ lines = 3 }) {
  return (
    <div className="animate-pulse space-y-3">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="flex gap-3">
          <div className={`h-4 bg-slate-700 rounded ${
            i === 0 ? 'w-3/4' : i === lines - 1 ? 'w-1/3' : 'w-1/2'
          }`} />
        </div>
      ))}
    </div>
  );
}
