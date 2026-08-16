import { useState, useEffect } from 'react';
import { analyzePostFeedback, getProjects } from '../api';
import SentimentBar from '../components/SentimentBar';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../components/useToast';
import { MessageSquare, Search, Loader2, LinkIcon, Lightbulb, AlertTriangle, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

export default function PostFeedback() {
  const toast = useToast();
  const [form, setForm] = useState({
    projectId: '',
    postUrl: '',
    featureContext: '',
  });
  const [projects, setProjects] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    getProjects()
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : [];
        setProjects(list);
        if (list.length > 0) {
          setForm((f) => ({ ...f, projectId: String(list[0].id) }));
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const handleAnalyze = async () => {
    if (!form.projectId || !form.postUrl.trim() || !form.featureContext.trim()) return;
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await analyzePostFeedback(form);
      setResult(res.data);
      toast.success('Post feedback evaluated successfully!');
      setHistory((h) => [
        {
          ...res.data,
          projectName: projects.find((p) => String(p.id) === String(form.projectId))?.name || `Project #${form.projectId}`,
          postUrl: form.postUrl,
          featureContext: form.featureContext,
          analyzedAt: new Date().toISOString(),
        },
        ...h,
      ]);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.error || 'Failed to analyze post feedback.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const sentimentData = result?.sentiment
    ? [
        { name: 'Agreement', value: result.sentiment.agreement || 0, color: '#10b981' },
        { name: 'Neutral', value: result.sentiment.neutral || 0, color: '#f59e0b' },
        { name: 'Disagreement', value: result.sentiment.disagreement || 0, color: '#ef4444' },
      ]
    : [];

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Post Feedback Inspector
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Measure user consensus, confusions, and feature requests on specific Reddit announcements.
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-xl backdrop-blur-xl">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-base font-bold text-white tracking-tight">Evaluate Post Reaction</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
              Select Workspace Project *
            </label>
            <select
              value={form.projectId}
              onChange={(e) => setForm({ ...form, projectId: e.target.value })}
              className="w-full bg-black/60 border border-zinc-800 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-400/20 rounded-xl px-4 py-2.5 text-sm text-white outline-none transition-all"
            >
              <option value="">Choose project workspace...</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
              Reddit Post URL *
            </label>
            <div className="relative">
              <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                placeholder="https://www.reddit.com/r/SaaS/comments/..."
                value={form.postUrl}
                onChange={(e) => setForm({ ...form, postUrl: e.target.value })}
                className="w-full bg-black/60 border border-zinc-800 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-400/20 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
              Feature Context / Announcement *
            </label>
            <textarea
              placeholder="e.g., Announced new dark mode UI and 2-factor authentication feature..."
              value={form.featureContext}
              onChange={(e) => setForm({ ...form, featureContext: e.target.value })}
              rows={3}
              className="w-full bg-black/60 border border-zinc-800 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-400/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition-all resize-none"
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={loading || !form.projectId || !form.postUrl.trim() || !form.featureContext.trim()}
            className="w-full py-3 bg-white hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-xl shadow-white/5 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-black" />
                Retrieving comments & parsing sentiment...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 text-black" />
                Analyze Post Feedback
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
            {error}
          </div>
        )}
      </div>

      {/* Analysis Output Result */}
      {result && (
        <div className="space-y-6">
          {/* Sentiment Bar */}
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 shadow-xl backdrop-blur-xl">
            <h3 className="text-sm font-bold text-white mb-3 tracking-tight">Community Consensus</h3>
            <SentimentBar
              positive={result.sentiment?.agreement || 0}
              neutral={result.sentiment?.neutral || 0}
              negative={result.sentiment?.disagreement || 0}
              labels={{ positive: 'Agreement', neutral: 'Neutral', negative: 'Disagreement' }}
            />
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {result.top_requested_change && (
              <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 shadow-xl backdrop-blur-xl">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowUpRight className="w-4 h-4 text-white" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Top Requested Change</span>
                </div>
                <p className="text-sm text-zinc-200 font-medium">{result.top_requested_change}</p>
              </div>
            )}

            {result.recommended_next_feature && (
              <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 shadow-xl backdrop-blur-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Recommended Action</span>
                </div>
                <p className="text-sm text-zinc-200 font-medium">{result.recommended_next_feature}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
