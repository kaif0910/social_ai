import { useState } from 'react';
import { clusterFeatures, clusterFromUrl } from '../api';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import {
  GitBranch,
  Link2,
  MessageSquare,
  Loader2,
  Layers,
  Star,
  TrendingUp,
  AlertCircle,
  Copy,
  Check,
  Hash,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const SENTIMENT_CONFIG = {
  positive: { bg: 'bg-green-500/15', text: 'text-green-400', border: 'border-green-500/20' },
  negative: { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/20' },
  mixed: { bg: 'bg-yellow-500/15', text: 'text-yellow-400', border: 'border-yellow-500/20' },
  confusion: { bg: 'bg-orange-500/15', text: 'text-orange-400', border: 'border-orange-500/20' },
  neutral: { bg: 'bg-slate-500/15', text: 'text-slate-400', border: 'border-slate-500/20' },
};

export default function Cluster() {
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
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.error || 'Failed to cluster features. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const canSubmit =
    !loading &&
    (mode === 'url' ? postUrl.trim() : commentsText.trim());

  const copyResult = () => {
    if (!result) return;
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const features = result?.features || [];
  const topPriority = result?.top_priority;
  const totalComments = result?.totalCommentsFetched;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Feature Clustering</h1>
          <p className="text-slate-400 mt-1">
            Group user feedback into feature clusters using AI
          </p>
        </div>
      </div>

      {/* Input Card */}
      <Card className="mb-6">
        {/* Mode Toggle */}
        <div className="flex items-center gap-1 p-1 bg-slate-700/50 rounded-lg mb-5 w-fit">
          <button
            onClick={() => setMode('url')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              mode === 'url'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Link2 className="w-4 h-4" />
            Reddit URL
          </button>
          <button
            onClick={() => setMode('manual')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              mode === 'manual'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Manual Input
          </button>
        </div>

        <div className="space-y-3">
          {mode === 'url' ? (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Reddit Post URL
              </label>
              <div className="relative">
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  placeholder="https://www.reddit.com/r/subreddit/comments/..."
                  value={postUrl}
                  onChange={(e) => setPostUrl(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <p className="text-xs text-slate-500 mt-1.5">
                Comments will be fetched automatically and clustered into feature groups
              </p>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Comments (one per line)
              </label>
              <textarea
                placeholder={"I wish it had dark mode\nPlease add export to PDF\nDark theme would be great\nNeed better mobile support\n..."}
                value={commentsText}
                onChange={(e) => setCommentsText(e.target.value)}
                rows={8}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 resize-none font-mono text-sm"
              />
            </div>
          )}
          <button
            onClick={handleCluster}
            disabled={!canSubmit}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {mode === 'url'
                  ? 'Fetching comments & clustering...'
                  : 'Clustering features...'}
              </>
            ) : (
              <>
                <GitBranch className="w-4 h-4" />
                Cluster Features
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
      </Card>

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-800 border border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                  <Layers className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{features.length}</p>
                  <p className="text-xs text-slate-400">Feature Clusters</p>
                </div>
              </div>
            </div>
            {totalComments && (
              <div className="p-4 rounded-xl bg-slate-800 border border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{totalComments}</p>
                    <p className="text-xs text-slate-400">Comments Fetched</p>
                  </div>
                </div>
              </div>
            )}
            <div className="p-4 rounded-xl bg-slate-800 border border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <Hash className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {features.reduce((sum, f) => sum + (f.mentions || 0), 0)}
                  </p>
                  <p className="text-xs text-slate-400">Total Mentions</p>
                </div>
              </div>
            </div>
          </div>

          {/* Top Priority */}
          {topPriority && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0">
                  <Star className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-xs text-amber-400 font-semibold uppercase tracking-wide mb-1">
                    Top Priority — Build This Next
                  </p>
                  <p className="text-white font-medium leading-relaxed">
                    {topPriority}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Feature Clusters */}
          <Card>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                  <GitBranch className="w-4 h-4 text-indigo-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">
                  Feature Clusters
                </h3>
              </div>
              <button
                onClick={copyResult}
                className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-700 transition-colors"
                title="Copy as JSON"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>

            {features.length > 0 ? (
              <div className="space-y-3">
                {features.map((cluster, i) => {
                  const sentiment = cluster.sentiment?.toLowerCase() || 'neutral';
                  const sc = SENTIMENT_CONFIG[sentiment] || SENTIMENT_CONFIG.neutral;
                  const isExpanded = expandedCluster === i;
                  const barMax = Math.max(...features.map((f) => f.mentions || 1));
                  const barWidth = ((cluster.mentions || 1) / barMax) * 100;

                  return (
                    <div
                      key={i}
                      className="rounded-xl bg-slate-700/40 border border-slate-600/50 overflow-hidden hover:border-slate-500/50 transition-colors"
                    >
                      <button
                        onClick={() =>
                          setExpandedCluster(isExpanded ? null : i)
                        }
                        className="w-full p-4 text-left"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <span className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-300 text-xs flex items-center justify-center font-bold shrink-0 mt-0.5">
                              {i + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-white font-semibold truncate">
                                  {cluster.name || `Cluster ${i + 1}`}
                                </h4>
                                <span
                                  className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wide ${sc.bg} ${sc.text} ${sc.border} border`}
                                >
                                  {sentiment}
                                </span>
                              </div>
                              {cluster.description && (
                                <p className="text-sm text-slate-400 leading-relaxed line-clamp-2">
                                  {cluster.description}
                                </p>
                              )}
                              {/* Mentions bar */}
                              <div className="flex items-center gap-3 mt-2.5">
                                <div className="flex-1 h-2 bg-slate-600/50 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                                    style={{ width: `${barWidth}%` }}
                                  />
                                </div>
                                <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
                                  {cluster.mentions || 0} mentions
                                </span>
                              </div>
                            </div>
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
                          )}
                        </div>
                      </button>
                      {isExpanded && (
                        <div className="px-4 pb-4 pt-0 border-t border-slate-600/30">
                          <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="p-3 rounded-lg bg-slate-800/50">
                              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide mb-1">
                                Description
                              </p>
                              <p className="text-sm text-slate-300">
                                {cluster.description || 'No description available'}
                              </p>
                            </div>
                            <div className="p-3 rounded-lg bg-slate-800/50">
                              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide mb-1">
                                Sentiment
                              </p>
                              <div className="flex items-center gap-2">
                                <span
                                  className={`w-2.5 h-2.5 rounded-full ${
                                    sentiment === 'positive'
                                      ? 'bg-green-400'
                                      : sentiment === 'negative'
                                      ? 'bg-red-400'
                                      : sentiment === 'mixed'
                                      ? 'bg-yellow-400'
                                      : sentiment === 'confusion'
                                      ? 'bg-orange-400'
                                      : 'bg-slate-400'
                                  }`}
                                />
                                <p className="text-sm text-slate-300 capitalize">
                                  {sentiment}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                icon={GitBranch}
                title="No clusters found"
                description="Try providing more comments or a different Reddit post."
              />
            )}
          </Card>
        </div>
      )}

      {/* Empty State */}
      {!result && !loading && (
        <Card>
          <EmptyState
            icon={GitBranch}
            title="No clusters yet"
            description="Paste a Reddit post URL or enter comments manually to discover feature patterns in user feedback."
          />
        </Card>
      )}
    </div>
  );
}
