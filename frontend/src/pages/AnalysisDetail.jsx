import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getAnalysisById } from '../api';
import StatCard from '../components/StatCard';
import SentimentBar from '../components/SentimentBar';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../components/useToast';
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
  Sparkles
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

export default function AnalysisDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getAnalysisById(id)
      .then((res) => setAnalysis(res.data))
      .catch((err) => {
        console.error(err);
        toast.error('Failed to load analysis details.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const copyInsights = () => {
    if (!analysis?.insights) return;
    navigator.clipboard.writeText(analysis.insights);
    setCopied(true);
    toast.success('Copied insights to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <LoadingSpinner message="Fetching analysis record..." />;
  if (!analysis) {
    return (
      <div className="text-center py-12 bg-slate-900/60 border border-slate-800 rounded-2xl">
        <p className="text-slate-400 text-sm mb-3">Analysis record not found.</p>
        <button
          onClick={() => navigate('/analyze')}
          className="text-xs font-semibold text-indigo-400 hover:underline cursor-pointer"
        >
          Back to Analyses Overview →
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
    <div className="space-y-6 animate-in fade-in">
      {/* Back Link */}
      <Link
        to="/analyze"
        className="text-xs font-semibold text-zinc-400 hover:text-white inline-flex items-center gap-1.5 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Market Analyses
      </Link>

      {/* Header */}
      <div className="pb-2 border-b border-neutral-800">
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          {analysis.product_idea || 'Market Analysis'}
        </h1>
        <div className="flex items-center gap-3 mt-2 text-xs text-zinc-400">
          <span className="flex items-center gap-1 font-mono text-white font-medium">
            <Hash className="w-3.5 h-3.5" />
            r/{analysis.subreddit || 'all'}
          </span>
          <span>•</span>
          <span>
            {new Date(analysis.created_at || Date.now()).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
          {total > 0 && (
            <>
              <span>•</span>
              <span className="text-zinc-400">{total} signals recorded</span>
            </>
          )}
        </div>
      </div>

      {/* Sentiment Overview Bar */}
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 shadow-xl backdrop-blur-xl">
        <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-3">Overall Consensus Breakdown</h3>
        <SentimentBar
          positive={analysis.sentiment_positive || 0}
          neutral={analysis.sentiment_neutral || 0}
          negative={analysis.sentiment_negative || 0}
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="Positive Reaction"
          value={analysis.sentiment_positive || 0}
          icon={ThumbsUp}
          color="green"
        />
        <StatCard
          label="Neutral Reaction"
          value={analysis.sentiment_neutral || 0}
          icon={Minus}
          color="yellow"
        />
        <StatCard
          label="Negative Reaction"
          value={analysis.sentiment_negative || 0}
          icon={ThumbsDown}
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 shadow-xl backdrop-blur-xl">
          <h3 className="text-sm font-bold text-white mb-4 tracking-tight">Sentiment Distribution</h3>
          {total > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={sentimentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {sentimentData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#18181b', borderRadius: '12px', border: '1px solid #27272a', color: '#fff' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-xs text-zinc-400 text-center py-8">No sentiment chart data available.</p>
          )}
        </div>

        {/* Feature Clusters */}
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 shadow-xl backdrop-blur-xl space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-sm font-bold text-white tracking-tight">Identified Feature Clusters</h3>
          </div>

          {features && Array.isArray(features) && features.length > 0 ? (
            <div className="space-y-2">
              {features.map((f, i) => {
                const label = typeof f === 'string' ? f : f.feature || f.name || JSON.stringify(f);
                const count = typeof f === 'object' ? (f.count || f.mentions) : null;
                return (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-xl bg-black/60 border border-zinc-800"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-5 h-5 rounded-md bg-zinc-800 text-white text-[11px] font-bold flex items-center justify-center border border-zinc-700 shrink-0">
                        {i + 1}
                      </span>
                      <p className="text-xs font-semibold text-zinc-200 truncate">{label}</p>
                    </div>
                    {count != null && (
                      <span className="text-[11px] font-mono text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded-md shrink-0">
                        {count} mentions
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-zinc-400 text-center py-4">No feature clusters recorded.</p>
          )}
        </div>
      </div>

      {/* AI Insights Card */}
      {analysis.insights && (
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Lightbulb className="w-4 h-4 text-emerald-400" />
              </div>
              <h3 className="text-sm font-bold text-white tracking-tight">Full AI Insight Summary</h3>
            </div>
            <button
              onClick={copyInsights}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Copy insights"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <div className="p-4 rounded-xl bg-black/80 border border-zinc-800 text-xs text-zinc-200 leading-relaxed whitespace-pre-wrap font-sans">
            {analysis.insights}
          </div>
        </div>
      )}
    </div>
  );
}
