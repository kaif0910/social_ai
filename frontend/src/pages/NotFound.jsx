import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center max-w-md mx-auto">
        <div className="w-20 h-20 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center mx-auto mb-6 shadow-xl">
          <Search className="w-10 h-10 text-zinc-500" />
        </div>
        <h1 className="text-6xl font-bold text-white mb-2 tracking-tight">404</h1>
        <p className="text-xl text-zinc-300 mb-2 font-medium">Page not found</p>
        <p className="text-sm text-zinc-500 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            to="/"
            className="px-5 py-2.5 bg-white hover:bg-zinc-200 text-black font-semibold rounded-xl flex items-center gap-2 transition-all shadow-xl shadow-white/5"
          >
            <Home className="w-4 h-4 text-black" />
            Dashboard
          </Link>
          <button
            onClick={() => window.history.back()}
            className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-medium flex items-center gap-2 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
