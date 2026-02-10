import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getAnalysisById } from '../api';
import Card from '../components/Card';
import StatCard from '../components/StatCard';
import SentimentBar from '../components/SentimentBar';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  ArrowLeft,
  ThumbsUp,
  Minus,
  ThumbsDown,
  Layers,
  Lightbulb,
  Copy,
  Check,
  Hash,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const COLORS = ['#22c55e', '#eab308', '#ef4444'];

export default function AnalysisDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getAnalysisById(id)
      .then((res) => setAnalysis(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const copyInsights = () => {
    if (!analysis?.insights) return;
    navigator.clipboard.writeText(analysis.insights);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <LoadingSpinner />;
  if (!analysis) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400 mb-3">Analysis not found.</p>
        <button
          onClick={() => navigate('/analyze')}
          className="text-indigo-400 hover:text-indigo-300 text-sm"
        >
          Back to Analyses
        </button>
      </div>
    );
  }

  const total =
    (analysis.sentiment_positive || 0) +
    (analysis.sentiment_neutral || 0) +
    (analysis.sentiment_negative || 0);

  const sentimentData = [
    { name: 'Positive', value: analysis.sentiment_positive || 0 },
    { name: 'Neutral', value: analysis.sentiment_neutral || 0 },
    { name: 'Negative', value: analysis.sentiment_negative || 0 },
  ];

  const features =
    typeof analysis.feature_clusters === 'string'
      ? (() => {
          try {
            return JSON.parse(analysis.feature_clusters);
          } catch {
            return null;
          }
        })()
      : analysis.feature_clusters;

  return (
    <div>
      {/* Header */}
      <Link
        to="/analyze"
        className="text-slate-400 hover:text-white text-sm flex items-center gap-1 mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Analyses
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">
            {analysis.product_idea}
          </h1>
          <div className="flex items-center gap-3 mt-2 text-sm text-slate-400">
            <span className="flex items-center gap-1">
              <Hash className="w-3.5 h-3.5" />
              r/{analysis.subreddit}
            </span>
            <span>
              {new Date(analysis.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
            {total > 0 && (
              <span className="text-slate-500">{total} signals</span>
            )}
          </div>
        </div>
      </div>

      {/* Sentiment Bar */}
      <Card className="mb-6">
        <p className="text-xs text-slate-400 font-medium mb-3 uppercase tracking-wide">
          Overall Sentiment
        </p>
        <SentimentBar
          positive={analysis.sentiment_positive || 0}
          neutral={analysis.sentiment_neutral || 0}
          negative={analysis.sentiment_negative || 0}
        />
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard
          label="Positive"
          value={analysis.sentiment_positive || 0}
          icon={ThumbsUp}
          color="green"
        />
        <StatCard
          label="Neutral"
          value={analysis.sentiment_neutral || 0}
          icon={Minus}
          color="yellow"
        />
        <StatCard
          label="Negative"
          value={analysis.sentiment_negative || 0}
          icon={ThumbsDown}
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <Card title="Sentiment Distribution">
          {total > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={sentimentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={95}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) =>
                    `${name}: ${value} (${Math.round((value / total) * 100)}%)`
                  }
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
            <p className="text-slate-400 text-sm text-center py-8">
              No sentiment data available
            </p>
          )}
        </Card>

        {/* Feature Clusters */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Layers className="w-4 h-4 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">
              Feature Clusters
            </h3>
          </div>
          {features && Array.isArray(features) && features.length > 0 ? (
            <div className="space-y-2">
              {features.map((f, i) => {
                const label =
                  typeof f === 'string'
                    ? f
                    : f.feature || f.name || JSON.stringify(f);
                const count = typeof f === 'object' ? f.count || f.mentions : null;
                return (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-700/50 border border-slate-600/50 hover:bg-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-purple-500/15 text-purple-400 text-xs flex items-center justify-center font-medium">
                        {i + 1}
                      </span>
                      <p className="text-white text-sm">{label}</p>
                    </div>
                    {count != null && (
                      <span className="text-xs text-slate-400 bg-slate-600/50 px-2 py-1 rounded-md">
                        {count} mentions
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-slate-400 text-sm text-center py-4">
              No feature clusters found
            </p>
          )}
        </Card>
      </div>

      {/* AI Insights */}
      {analysis.insights && (
        <Card className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Lightbulb className="w-4 h-4 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">AI Insights</h3>
            </div>
            <button
              onClick={copyInsights}
              className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-700 transition-colors"
              title="Copy insights"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
          <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/10">
            <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
              {analysis.insights}
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
