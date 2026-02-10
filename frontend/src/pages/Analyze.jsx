import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { runAnalysis, getAnalyses } from '../api';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import { BarChart3, Search, ArrowRight } from 'lucide-react';
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

  useEffect(() => {
    getAnalyses()
      .then((res) => setAnalyses(res.data))
      .catch(console.error)
      .finally(() => setLoading((l) => ({ ...l, list: false })));
  }, []);

  const handleAnalyze = async () => {
    setLoading((l) => ({ ...l, run: true }));
    setResult(null);
    try {
      const res = await runAnalysis(form);
      setResult(res.data);
      // Refresh list
      const listRes = await getAnalyses();
      setAnalyses(listRes.data);
    } catch (err) {
      console.error(err);
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
      <h1 className="text-3xl font-bold text-white mb-2">Analyze</h1>
      <p className="text-slate-400 mb-8">
        Analyze Reddit feedback for your product ideas
      </p>

      {/* Run Analysis */}
      <Card title="New Analysis" className="mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            placeholder="Product idea (e.g., AI writing assistant)"
            value={form.productIdea}
            onChange={(e) => setForm({ ...form, productIdea: e.target.value })}
            className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
          <input
            placeholder="Subreddit (optional, default: all)"
            value={form.subreddit}
            onChange={(e) => setForm({ ...form, subreddit: e.target.value })}
            className="w-full sm:w-48 bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
          <button
            onClick={handleAnalyze}
            disabled={loading.run || !form.productIdea}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
          >
            <Search className="w-4 h-4" />
            {loading.run ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>
      </Card>

      {/* Analysis Result */}
      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card title="Sentiment Breakdown">
            {sentimentData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={sentimentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
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
            ) : (
              <p className="text-slate-400 text-sm">No sentiment data</p>
            )}
          </Card>

          <Card title="Insights">
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-slate-700/50">
                <p className="text-xs text-slate-400 mb-1">Comments Analyzed</p>
                <p className="text-xl font-bold text-white">
                  {result.totalCommentsAnalyzed}
                </p>
              </div>
              {result.insights?.top_features && (
                <div>
                  <p className="text-xs text-slate-400 mb-2">Top Features</p>
                  <div className="flex flex-wrap gap-2">
                    {result.insights.top_features.map((f, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs"
                      >
                        {typeof f === 'string' ? f : f.feature || JSON.stringify(f)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {result.insights?.insights && (
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <p className="text-xs text-green-400 font-medium mb-1">Key Insight</p>
                  <p className="text-sm text-white">{result.insights.insights}</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Past Analyses */}
      <Card title="Past Analyses">
        {loading.list ? (
          <LoadingSpinner text="Loading analyses..." />
        ) : analyses.length === 0 ? (
          <div className="text-center py-6">
            <BarChart3 className="w-10 h-10 text-slate-500 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No analyses yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {analyses.map((a) => (
              <Link
                key={a.id}
                to={`/analyze/${a.id}`}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors"
              >
                <div>
                  <p className="text-white font-medium">{a.product_idea}</p>
                  <p className="text-xs text-slate-400">
                    r/{a.subreddit} &middot;{' '}
                    {new Date(a.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex gap-2 text-xs">
                    <span className="text-green-400">+{a.sentiment_positive}</span>
                    <span className="text-yellow-400">~{a.sentiment_neutral}</span>
                    <span className="text-red-400">-{a.sentiment_negative}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
