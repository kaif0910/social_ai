import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { runAnalysis, getAnalyses } from '../api';
import Card from '../components/Card';
import SentimentBar from '../components/SentimentBar';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import { BarChart3, Search, ArrowRight, Clock, Loader2 } from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const COLORS = ['#22c55e', '#eab308', '#ef4444'];

export default function Analyze() {
  const [form, setForm] = useState({ productIdea: '', subreddit: '' });
  const [result, setResult] = useState(null);
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState({ run: false, list: true });
  const [error, setError] = useState(null);

  useEffect(() => {
    getAnalyses()
      .then((res) => setAnalyses(res.data))
      .catch(console.error)
      .finally(() => setLoading((l) => ({ ...l, list: false })));
  }, []);

  const handleAnalyze = async () => {
    setLoading((l) => ({ ...l, run: true }));
    setResult(null);
    setError(null);
    try {
      const res = await runAnalysis(form);
      setResult(res.data);
      setForm({ productIdea: '', subreddit: '' });
      const listRes = await getAnalyses();
      setAnalyses(listRes.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Analysis failed. Please try again.');
    } finally {
      setLoading((l) => ({ ...l, run: false }));
    }
  };

  const sentimentData = result?.insights?.sentiment
    ? [
        { name: 'Positive', value: result.insights.sentiment.positive },
        { name: 'Neutral', value: result.insights.sentiment.neutral },
        { name: 'Negative', value: result.insights.sentiment.negative },
      ]
    : [];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Feedback Analyzer</h1>
          <p className="text-slate-400 mt-1">
            Search Reddit for community feedback on your product ideas
          </p>
        </div>
      </div>

      {/* Run Analysis */}
      <Card className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
            <Search className="w-4 h-4 text-indigo-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">New Analysis</h3>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Product Idea *
            </label>
            <input
              placeholder="e.g., AI writing assistant, meal planning app"
              value={form.productIdea}
              onChange={(e) =>
                setForm({ ...form, productIdea: e.target.value })
              }
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Subreddit (optional)
            </label>
            <input
              placeholder="e.g., SaaS, startups (default: all)"
              value={form.subreddit}
              onChange={(e) =>
                setForm({ ...form, subreddit: e.target.value })
              }
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <button
            onClick={handleAnalyze}
            disabled={loading.run || !form.productIdea}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
          >
            {loading.run ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Searching Reddit & analyzing...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Analyze Feedback
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

      {/* Analysis Result */}
      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card title="Sentiment Breakdown">
            {sentimentData.length > 0 && sentimentData.some((d) => d.value > 0) ? (
              <>
                <div className="mb-4">
                  <SentimentBar
                    positive={result.insights.sentiment.positive}
                    neutral={result.insights.sentiment.neutral}
                    negative={result.insights.sentiment.negative}
                  />
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={sentimentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {sentimentData.map((_, index) => (
                        <Cell key={index} fill={COLORS[index]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </>
            ) : (
              <p className="text-slate-400 text-sm">No sentiment data</p>
            )}
          </Card>

          <Card title="Analysis Results">
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-slate-700/50">
                <p className="text-xs text-slate-400 mb-1">
                  Comments Analyzed
                </p>
                <p className="text-2xl font-bold text-white">
                  {result.totalCommentsAnalyzed}
                </p>
              </div>
              {result.insights?.top_features &&
                result.insights.top_features.length > 0 && (
                  <div>
                    <p className="text-xs text-slate-400 mb-2 font-medium uppercase tracking-wide">
                      Top Features Mentioned
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {result.insights.top_features.map((f, i) => (
                        <span
                          key={i}
                          className="px-3 py-1.5 rounded-lg bg-indigo-500/15 text-indigo-300 text-xs font-medium border border-indigo-500/20"
                        >
                          {typeof f === 'string'
                            ? f
                            : f.feature || JSON.stringify(f)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              {result.insights?.insights && (
                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                  <p className="text-xs text-green-400 font-semibold mb-2 uppercase tracking-wide">
                    Key Insight
                  </p>
                  <p className="text-sm text-white leading-relaxed">
                    {result.insights.insights}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Past Analyses */}
      <Card title={`Past Analyses (${analyses.length})`}>
        {loading.list ? (
          <LoadingSpinner text="Loading analyses..." />
        ) : analyses.length === 0 ? (
          <EmptyState
            icon={BarChart3}
            title="No analyses yet"
            description="Run your first analysis above to see results here."
          />
        ) : (
          <div className="space-y-2">
            {analyses.map((a) => (
              <Link
                key={a.id}
                to={`/analyze/${a.id}`}
                className="flex items-center justify-between p-4 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors group"
              >
                <div className="flex-1 min-w-0 mr-4">
                  <p className="text-white font-medium text-sm truncate">
                    {a.product_idea}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                    <span>r/{a.subreddit}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(a.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="mt-2">
                    <SentimentBar
                      positive={a.sentiment_positive}
                      neutral={a.sentiment_neutral}
                      negative={a.sentiment_negative}
                    />
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 shrink-0 transition-colors" />
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
