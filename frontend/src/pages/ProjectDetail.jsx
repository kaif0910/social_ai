import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  getProjectSummary,
  getProjectAnalysis,
  getSentimentTrend,
  runFullAnalysis,
} from '../api';
import Card from '../components/Card';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  BarChart3,
  MessageSquare,
  TrendingUp,
  Lightbulb,
  Play,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export default function ProjectDetail() {
  const { id } = useParams();
  const [summary, setSummary] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [trend, setTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [runningAnalysis, setRunningAnalysis] = useState(false);
  const [redditUrl, setRedditUrl] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [sumRes, analRes, trendRes] = await Promise.all([
          getProjectSummary(id),
          getProjectAnalysis(id),
          getSentimentTrend(id),
        ]);
        setSummary(sumRes.data);
        setAnalysis(analRes.data);
        setTrend(trendRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleFullAnalysis = async () => {
    if (!redditUrl.trim()) return;
    setRunningAnalysis(true);
    setAnalysisResult(null);
    try {
      const res = await runFullAnalysis(id, redditUrl);
      setAnalysisResult(res.data);
      // Refresh data
      const [sumRes, analRes, trendRes] = await Promise.all([
        getProjectSummary(id),
        getProjectAnalysis(id),
        getSentimentTrend(id),
      ]);
      setSummary(sumRes.data);
      setAnalysis(analRes.data);
      setTrend(trendRes.data);
    } catch (err) {
      console.error(err);
      setAnalysisResult({ error: err.response?.data?.error || 'Analysis failed' });
    } finally {
      setRunningAnalysis(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-2">
        Project #{id}
      </h1>
      <p className="text-slate-400 mb-8">Project details and AI analysis</p>

      {/* Summary Stats */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Total Analyses"
            value={summary.totalAnalyses}
            icon={BarChart3}
            color="indigo"
          />
          <StatCard
            label="Feedback Posts"
            value={summary.totalFeedbackPosts}
            icon={MessageSquare}
            color="blue"
          />
          <StatCard
            label="Agreement"
            value={summary.sentiment?.agreement || 0}
            icon={TrendingUp}
            color="green"
          />
          <StatCard
            label="Disagreement"
            value={summary.sentiment?.disagreement || 0}
            icon={TrendingUp}
            color="red"
          />
        </div>
      )}

      {/* Full Analysis Runner */}
      <Card title="Run Full Analysis" className="mb-6">
        <div className="flex gap-3">
          <input
            type="text"
            value={redditUrl}
            onChange={(e) => setRedditUrl(e.target.value)}
            placeholder="Reddit post URL..."
            className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
          <button
            onClick={handleFullAnalysis}
            disabled={runningAnalysis || !redditUrl.trim()}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <Play className="w-4 h-4" />
            {runningAnalysis ? 'Running...' : 'Run Analysis'}
          </button>
        </div>
        {analysisResult && (
          <div className="mt-4 p-4 rounded-lg bg-slate-700/50">
            <pre className="text-sm text-slate-300 whitespace-pre-wrap overflow-auto max-h-64">
              {JSON.stringify(analysisResult, null, 2)}
            </pre>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Sentiment Trend Chart */}
        <Card title="Sentiment Trend">
          {trend.length === 0 ? (
            <p className="text-slate-400 text-sm">No trend data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="agreement" stroke="#22c55e" strokeWidth={2} />
                <Line type="monotone" dataKey="neutral" stroke="#eab308" strokeWidth={2} />
                <Line type="monotone" dataKey="disagreement" stroke="#ef4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Latest Insights */}
        <Card title="Latest Insights">
          {summary?.mostRequestedChange ? (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                <p className="text-xs text-indigo-400 font-medium mb-1">
                  Most Requested Change
                </p>
                <p className="text-white">
                  {summary.mostRequestedChange.top_requested_change}
                </p>
              </div>
              {summary.latestRecommendation && (
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <p className="text-xs text-green-400 font-medium mb-1">
                    <Lightbulb className="w-3 h-3 inline mr-1" />
                    Recommended Next Feature
                  </p>
                  <p className="text-white">
                    {summary.latestRecommendation.recommended_next_feature}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-slate-400 text-sm">
              No insights yet. Run an analysis to get started.
            </p>
          )}
        </Card>
      </div>

      {/* Last Roadmap */}
      {analysis?.last_roadmap && (
        <Card title="Generated Roadmap">
          <pre className="text-sm text-slate-300 whitespace-pre-wrap overflow-auto max-h-96">
            {JSON.stringify(analysis.last_roadmap, null, 2)}
          </pre>
        </Card>
      )}
    </div>
  );
}
