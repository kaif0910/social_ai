import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ text = 'Loading...' }) {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="w-6 h-6 text-indigo-400 animate-spin mr-3" />
      <span className="text-slate-400">{text}</span>
    </div>
  );
}
