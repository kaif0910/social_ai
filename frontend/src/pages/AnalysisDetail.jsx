import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAnalysisById } from '../api';
import Card from '../components/Card';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { ArrowLeft, ThumbsUp, Minus, ThumbsDown } from 'lucide-react';
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
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnalysisById(id)
      .then((res) => setAnalysis(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!analysis) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">Analysis not found.</p>
        <Link to="/analyze" className="text-indigo-400 hover:underline mt-2 inline-block">
          Back to Analyses
        </Link>
      </div>
    );
  }

  const sentimentData = [
    { name: 'Positive', value: analysis.sentiment_positive || 0 },
    { name: 'Neutral', value: analysis.sentiment_neutral || 0 },
    { name: 'Negative', value: analysis.sentiment_negative || 0 },
  ];

  const features =
    typeof analysis.feature_clusters === 'string'
      ? JSON.parse(analysis.feature_clusters)
      : analysis.feature_clusters;

  return (
    <div>
      <Link
        to="/analyze"
        className="text-slate-400 hover:text-white text-sm flex items-center gap-1 mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Analyses
      </Link>

      <h1 className="text-3xl font-bold text-white mb-1">
        {analysis.product_idea}
      </h1>
      <p className="text-slate-400 mb-8">
        r/{analysis.subreddit} &middot;{' '}
        {new Date(analysis.created_at).toLocaleDateString()}
      </p>

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
          <ResponsiveContainer width="100%" height={280}>
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
        </Card>

        {/* Features */}
        <Card title="Feature Clusters">
          {features && Array.isArray(features) ? (
            <div className="space-y-2">
              {features.map((f, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg bg-slate-700/50 border border-slate-600"
                >
                  <p className="text-white text-sm">
                    {typeof f === 'string' ? f : f.feature || JSON.stringify(f)}
                  </p>
                  {f.count && (
                    <p className="text-xs text-slate-400 mt-1">
                      Mentions: {f.count}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-sm">No feature clusters</p>
          )}
        </Card>
      </div>

      {/* Insights */}
      {analysis.insights && (
        <Card title="AI Insights" className="mt-6">
          <p className="text-slate-300 leading-relaxed">{analysis.insights}</p>
        </Card>
      )}
    </div>
  );
}
