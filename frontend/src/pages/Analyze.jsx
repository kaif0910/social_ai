import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { runAnalysis, getAnalyses } from '../api';
import SentimentBar from '../components/SentimentBar';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../components/useToast';
import { BarChart3, Search, ArrowRight, Clock, Loader2, Sparkles, Tag, CheckCircle2 } from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

const QUICK_PRESETS = [
  { idea: 'AI Code Assistant for VS Code', sub: 'SaaS' },
  { idea: 'Automated Social Media Scheduler', sub: 'marketing' },
  { idea: 'Privacy focused Analytics Tool', sub: 'webdev' },
];

export default function Analyze() {
  const [form, setForm] = useState({ productIdea: '', subreddit: '' });
  const [result, setResult] = useState(null);
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState({ run: false, list: true });
  const [error, setError] = useState(null);
  const toast = useToast();

  useEffect(() => {
    getAnalyses()
      .then((res) => setAnalyses(Array.isArray(res.data) ? res.data : []))
      .catch((err) => console.error(err))
      .finally(() => setLoading((l) => ({ ...l, list: false })));
  }, []);

  const handleAnalyze = async () => {
    if (!form.productIdea.trim()) return;
    setLoading((l) => ({ ...l, run: true }));
    setResult(null);
    setError(null);
    try {
      const res = await runAnalysis(form);
      setResult(res.data);
      setForm({ productIdea: '', subreddit: '' });
      toast.success('Market feedback analysis completed!');
      const listRes = await getAnalyses();
      setAnalyses(Array.isArray(listRes.data) ? listRes.data : []);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.error || 'Analysis failed. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading((l) => ({ ...l, run: false }));
    }
  };

  const sentimentData = result?.insights?.sentiment
    ? [
        { name: 'Positive', value: result.insights.sentiment.positive || 0 },
        { name: 'Neutral', value: result.insights.sentiment.neutral || 0 },
        { name: 'Negative', value: result.insights.sentiment.negative || 0 },
      ]
    : [];

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Market Feedback Analyzer
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Scrape Reddit discussions to extract community sentiment, feature demands, and user pain points.
        </p>
      </div>

      {/* Analysis Form Card */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <Search className="w-4 h-4 text-indigo-400" />
          </div>
          <h2 className="text-base font-bold text-white">Execute Community Search</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Product Concept or Target Feature *
            </label>
            <input
              placeholder="e.g., AI Code Review Assistant, Notion alternative"
              value={form.productIdea}
              onChange={(e) => setForm({ ...form, productIdea: e.target.value })}
              className="w-full bg-slate-950/60 border border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Subreddit Filter (optional)
            </label>
            <input
              placeholder="e.g., SaaS, Startups, Webdev (default: all)"
              value={form.subreddit}
              onChange={(e) => setForm({ ...form, subreddit: e.target.value })}
              className="w-full bg-slate-950/60 border border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all"
            />
          </div>

          {/* Quick presets */}
          <div className="flex items-center gap-2 pt-1 flex-wrap">
            <span className="text-xs text-slate-500 font-medium">Quick presets:</span>
            {QUICK_PRESETS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setForm({ productIdea: p.idea, subreddit: p.sub })}
                className="text-[11px] bg-slate-800/80 hover:bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700/60 transition-colors cursor-pointer"
              >
                {p.idea}
              </button>
            ))}
          </div>

          <button
            onClick={handleAnalyze}
            disabled={loading.run || !form.productIdea.trim()}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20 cursor-pointer"
          >
            {loading.run ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Retrieving comments & compiling sentiment...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Analyze Community Feedback
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
            {error}
          </div>
        )}
      </div>

      {/* Active Analysis Output Result */}
      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sentiment Breakdown */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-white mb-4">Sentiment Distribution</h3>
            {sentimentData.length > 0 && sentimentData.some((d) => d.value > 0) ? (
              <>
                <div className="mb-4">
                  <SentimentBar
                    positive={result.insights?.sentiment?.positive || 0}
                    neutral={result.insights?.sentiment?.neutral || 0}
                    negative={result.insights?.sentiment?.negative || 0}
                  />
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={sentimentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {sentimentData.map((_, index) => (
                        <Cell key={index} fill={COLORS[index]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #334155', color: '#fff' }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </>
            ) : (
              <p className="text-xs text-slate-400">No sentiment values computed.</p>
            )}
          </div>

          {/* Key Insights Output */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-white">Extracted Insights</h3>
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-0.5">Comments Processed</span>
              <span className="text-xl font-bold text-white">{result.totalCommentsAnalyzed}</span>
            </div>

            {result.insights?.top_features && result.insights.top_features.length > 0 && (
              <div>
                <span className="text-xs font-semibold text-slate-400 block mb-2">High Demand Features</span>
                <div className="flex flex-wrap gap-2">
                  {result.insights.top_features.map((f, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 text-xs border border-indigo-500/20 font-medium">
                      {typeof f === 'string' ? f : f.feature || JSON.stringify(f)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {result.insights?.insights && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-1">Key Summary</span>
                <p className="text-xs text-slate-200 leading-relaxed">{result.insights.insights}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Historical Analyses List */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-400" />
            Analysis History ({analyses.length})
          </h2>
        </div>

        {loading.list ? (
          <LoadingSpinner message="Fetching past analysis history..." />
        ) : analyses.length === 0 ? (
          <EmptyState
            icon={BarChart3}
            title="No past analyses"
            description="Run a new search above to store community sentiment records."
          />
        ) : (
          <div className="space-y-3">
            {analyses.map((a) => (
              <Link
                key={a.id}
                to={`/analyze/${a.id}`}
                className="flex items-center justify-between p-4 rounded-xl bg-slate-800/30 hover:bg-slate-800/70 border border-slate-800/60 transition-all group"
              >
                <div className="flex-1 min-w-0 pr-4">
                  <span className="text-sm font-semibold text-slate-200 group-hover:text-white block truncate">
                    {a.product_idea}
                  </span>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                    <span className="font-mono text-indigo-400">r/{a.subreddit || 'all'}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {new Date(a.created_at || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="mt-2.5">
                    <SentimentBar
                      positive={a.sentiment_positive || 0}
                      neutral={a.sentiment_neutral || 0}
                      negative={a.sentiment_negative || 0}
                    />
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 shrink-0 transition-colors" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
