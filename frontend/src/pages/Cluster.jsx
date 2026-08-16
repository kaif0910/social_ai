import { useState } from 'react';
import { clusterFeatures, clusterFromUrl } from '../api';
import { useToast } from '../components/useToast';
import EmptyState from '../components/EmptyState';
import {
  GitBranch,
  Link2,
  MessageSquare,
  Loader2,
  Layers,
  Star,
  AlertCircle,
  Copy,
  Check,
  Hash,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';

const SENTIMENT_CONFIG = {
  positive: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  negative: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20' },
  mixed: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  confusion: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20' },
  neutral: { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20' },
};

export default function Cluster() {
  const toast = useToast();
  const [mode, setMode] = useState('url'); // 'url' | 'manual'
  const [postUrl, setPostUrl] = useState('');
  const [commentsText, setCommentsText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [expandedCluster, setExpandedCluster] = useState(null);

  const handleCluster = async () => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      let res;
      if (mode === 'url') {
        res = await clusterFromUrl(postUrl);
      } else {
        const comments = commentsText
          .split('\n')
          .map((c) => c.trim())
          .filter(Boolean);
        if (comments.length === 0) return;
        res = await clusterFeatures(comments);
      }
      setResult(res.data);
      toast.success('Feature clustering completed!');
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.error || 'Failed to cluster features. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = !loading && (mode === 'url' ? postUrl.trim() : commentsText.trim());

  const copyResult = () => {
    if (!result) return;
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true);
    toast.success('Copied JSON payload!');
    setTimeout(() => setCopied(false), 2000);
  };

  const features = result?.features || [];
  const topPriority = result?.top_priority;
  const totalComments = result?.totalCommentsFetched;

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Feature Feedback Clustering
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Group unstructured community discussions into prioritized feature themes using AI.
        </p>
      </div>

      {/* Input Form Card */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-sm">
        {/* Toggle bar */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950/60 border border-slate-800/80 rounded-xl mb-6 w-fit">
          <button
            onClick={() => setMode('url')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              mode === 'url'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Link2 className="w-3.5 h-3.5" />
            Reddit URL
          </button>
          <button
            onClick={() => setMode('manual')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              mode === 'manual'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Manual Comments
          </button>
        </div>

        <div className="space-y-4">
          {mode === 'url' ? (
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Reddit Discussion URL *
              </label>
              <div className="relative">
                <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  placeholder="https://www.reddit.com/r/SaaS/comments/..."
                  value={postUrl}
                  onChange={(e) => setPostUrl(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                User Feedback Lines (One per line) *
              </label>
              <textarea
                placeholder={"Dark mode toggle is badly needed\nPlease add PDF export feature\nDark mode would make this app 10x better\nAdd team member permissions..."}
                value={commentsText}
                onChange={(e) => setCommentsText(e.target.value)}
                rows={6}
                className="w-full bg-slate-950/60 border border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl px-4 py-3 text-xs text-slate-100 placeholder-slate-500 outline-none transition-all resize-none font-mono"
              />
            </div>
          )}

          <button
            onClick={handleCluster}
            disabled={!canSubmit}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing feedback & clustering themes...
              </>
            ) : (
              <>
                <GitBranch className="w-4 h-4" />
                Cluster Feedback Themes
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Cluster Output */}
      {result && (
        <div className="space-y-6">
          {/* Summary Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-bold text-white">{features.length}</p>
                <p className="text-xs text-slate-400">Clustered Themes</p>
              </div>
            </div>
            {totalComments && (
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xl font-bold text-white">{totalComments}</p>
                  <p className="text-xs text-slate-400">Comments Scraped</p>
                </div>
              </div>
            )}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Hash className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-bold text-white">{features.reduce((sum, f) => sum + (f.mentions || 0), 0)}</p>
                <p className="text-xs text-slate-400">Total Mention Count</p>
              </div>
            </div>
          </div>

          {/* Top Actionable Recommendation */}
          {topPriority && (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-orange-500/10 border border-amber-500/20 flex items-start gap-3.5 shadow-sm">
              <Star className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block mb-1">
                  Highest Priority Action Item
                </span>
                <p className="text-sm font-medium text-slate-100">{topPriority}</p>
              </div>
            </div>
          )}

          {/* Cluster List */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-indigo-400" />
                Feature Clusters Breakdown
              </h2>
              <button
                onClick={copyResult}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                title="Copy payload as JSON"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="space-y-3">
              {features.map((cluster, i) => {
                const sentiment = cluster.sentiment?.toLowerCase() || 'neutral';
                const sc = SENTIMENT_CONFIG[sentiment] || SENTIMENT_CONFIG.neutral;
                const isExpanded = expandedCluster === i;

                return (
                  <div key={i} className="rounded-xl bg-slate-950/60 border border-slate-800/80 overflow-hidden">
                    <button
                      onClick={() => setExpandedCluster(isExpanded ? null : i)}
                      className="w-full p-4 text-left flex items-start justify-between gap-3 hover:bg-slate-900/60 transition-colors cursor-pointer"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-5 h-5 rounded-md bg-indigo-500/10 text-indigo-400 text-[11px] font-bold flex items-center justify-center border border-indigo-500/20">
                            {i + 1}
                          </span>
                          <h3 className="text-sm font-bold text-slate-100 truncate">{cluster.name || `Cluster #${i + 1}`}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${sc.bg} ${sc.text} ${sc.border} border`}>
                            {sentiment}
                          </span>
                        </div>
                        {cluster.description && (
                          <p className="text-xs text-slate-400 line-clamp-2 mt-1">{cluster.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs font-mono text-indigo-400 font-semibold">{cluster.mentions || 0} mentions</span>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
