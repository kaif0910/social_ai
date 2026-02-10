import { useState, useEffect } from 'react';
import { analyzePostFeedback, getProjects } from '../api';
import Card from '../components/Card';
import SentimentBar from '../components/SentimentBar';
import EmptyState from '../components/EmptyState';
import { MessageSquare, Search, Loader2, LinkIcon, Lightbulb, AlertTriangle, ArrowUpRight } from 'lucide-react';
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
      .then((res) => setProjects(res.data))
      .catch(console.error);
  }, []);

  const handleAnalyze = async () => {
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await analyzePostFeedback(form);
      setResult(res.data);
      setHistory((h) => [
        {
          ...res.data,
          projectName:
            projects.find((p) => String(p.id) === String(form.projectId))
              ?.name || `Project #${form.projectId}`,
          postUrl: form.postUrl,
          analyzedAt: new Date().toISOString(),
        },
        ...h,
      ]);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.error ||
          'Failed to analyze. Check your inputs and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const sentimentData = result?.sentiment
    ? [
        {
          name: 'Agreement',
          value: result.sentiment.agreement,
          color: '#22c55e',
        },
        { name: 'Neutral', value: result.sentiment.neutral, color: '#eab308' },
        {
          name: 'Disagreement',
          value: result.sentiment.disagreement,
          color: '#ef4444',
        },
      ]
    : [];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Post Feedback</h1>
          <p className="text-slate-400 mt-1">
            Analyze community reactions to a specific Reddit post about your
            feature
          </p>
        </div>
      </div>

      {/* Analyze Form */}
      <Card className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-purple-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">Analyze a Post</h3>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Project *
            </label>
            <select
              value={form.projectId}
              onChange={(e) =>
                setForm({ ...form, projectId: e.target.value })
              }
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="">Select a project...</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Reddit Post URL *
            </label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                placeholder="https://www.reddit.com/r/subreddit/comments/..."
                value={form.postUrl}
                onChange={(e) =>
                  setForm({ ...form, postUrl: e.target.value })
                }
                className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Feature Context *
            </label>
            <textarea
              placeholder="Describe the feature being discussed (e.g., 'Dark mode for the mobile app')"
              value={form.featureContext}
              onChange={(e) =>
                setForm({ ...form, featureContext: e.target.value })
              }
              rows={3}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>
          <button
            onClick={handleAnalyze}
            disabled={
              loading ||
              !form.projectId ||
              !form.postUrl ||
              !form.featureContext
            }
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Fetching comments & analyzing...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Analyze Post Feedback
              </>
            )}
          </button>
        </div>
        {error && (
          <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
      </Card>

      {/* Result */}
      {result && (
        <div className="space-y-6 mb-6">
          {/* Sentiment Overview */}
          <Card title="Sentiment Overview">
            <div className="mb-4">
              <SentimentBar
                positive={result.sentiment?.agreement || 0}
                neutral={result.sentiment?.neutral || 0}
                negative={result.sentiment?.disagreement || 0}
              />
            </div>
            {sentimentData.length > 0 && (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={sentimentData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {sentimentData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>

          {/* Insights Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Requested Change */}
            {result.top_requested_change && (
              <Card>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0">
                    <ArrowUpRight className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-xs text-indigo-400 font-semibold mb-1 uppercase tracking-wide">
                      Top Requested Change
                    </p>
                    <p className="text-white text-sm leading-relaxed">
                      {result.top_requested_change}
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Recommended Next Feature */}
            {result.recommended_next_feature && (
              <Card>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center shrink-0">
                    <Lightbulb className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-xs text-green-400 font-semibold mb-1 uppercase tracking-wide">
                      Recommended Next Feature
                    </p>
                    <p className="text-white text-sm leading-relaxed">
                      {result.recommended_next_feature}
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Confusions */}
          {result.confusions && result.confusions.length > 0 && (
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-yellow-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">
                  User Confusions ({result.confusions.length})
                </h3>
              </div>
              <div className="space-y-2">
                {result.confusions.map((c, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg bg-yellow-500/5 border-l-2 border-yellow-500/40"
                  >
                    <p className="text-sm text-slate-300">{c}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Session History */}
      {history.length > 0 && (
        <Card title={`Session History (${history.length})`}>
          <div className="space-y-2">
            {history.map((h, i) => (
              <div
                key={i}
                className="p-4 rounded-lg bg-slate-700/50 border border-slate-600/50"
              >
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sm text-white font-medium">
                    {h.projectName}
                  </p>
                  <span className="text-xs text-slate-500">
                    {new Date(h.analyzedAt).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-xs text-slate-400 truncate mb-2">
                  {h.postUrl}
                </p>
                {h.sentiment && (
                  <SentimentBar
                    positive={h.sentiment.agreement || 0}
                    neutral={h.sentiment.neutral || 0}
                    negative={h.sentiment.disagreement || 0}
                  />
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {!result && history.length === 0 && (
        <Card>
          <EmptyState
            icon={MessageSquare}
            title="No feedback analyzed yet"
            description="Select a project, paste a Reddit post URL, and describe the feature to get AI-powered feedback analysis."
          />
        </Card>
      )}
    </div>
  );
}
