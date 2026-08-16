import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProjects, getAnalyses } from '../api';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import SentimentBar from '../components/SentimentBar';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  FolderKanban,
  BarChart3,
  Bot,
  TrendingUp,
  ArrowRight,
  Plus,
  Search,
  MessageSquare,
  Sparkles,
  Zap,
  CheckCircle2
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function Dashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [projRes, analRes] = await Promise.all([
          getProjects(),
          getAnalyses(),
        ]);
        setProjects(Array.isArray(projRes.data) ? projRes.data : []);
        setAnalyses(Array.isArray(analRes.data) ? analRes.data : []);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <LoadingSpinner message="Loading workspace metrics..." />;

  const totalPositive = analyses.reduce(
    (sum, a) => sum + (a.sentiment_positive || 0),
    0
  );
  const totalNeutral = analyses.reduce(
    (sum, a) => sum + (a.sentiment_neutral || 0),
    0
  );
  const totalNegative = analyses.reduce(
    (sum, a) => sum + (a.sentiment_negative || 0),
    0
  );

  const chartAnalyses = analyses.slice(0, 6).reverse();
  const sentimentChart = chartAnalyses.map((a) => ({
    name: (a.product_idea || 'Analysis').length > 12
      ? a.product_idea.slice(0, 12) + '...'
      : a.product_idea || 'Analysis',
    Positive: a.sentiment_positive || 0,
    Neutral: a.sentiment_neutral || 0,
    Negative: a.sentiment_negative || 0,
  }));

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-neutral-900 border border-neutral-800 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs font-semibold mb-3">
              <Zap className="w-3.5 h-3.5 text-white" />
              <span>Workspace Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Good day, <span className="bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">{user?.name || 'Maker'}</span>
            </h1>
            <p className="text-sm text-zinc-400 mt-1 max-w-xl">
              Track community feedback, discover feature demand, and generate AI growth content.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              to="/projects"
              className="px-4 py-2.5 bg-white hover:bg-zinc-200 text-black text-sm font-semibold rounded-xl shadow-lg shadow-white/5 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 text-black" />
              New Project
            </Link>
            <Link
              to="/analyze"
              className="px-4 py-2.5 bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 text-sm font-medium rounded-xl flex items-center gap-2 transition-all cursor-pointer"
            >
              <Search className="w-4 h-4 text-zinc-300" />
              Analyze Idea
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Projects"
          value={projects.length}
          icon={FolderKanban}
          color="white"
        />
        <StatCard
          label="Analyses Executed"
          value={analyses.length}
          icon={BarChart3}
          color="green"
        />
        <StatCard
          label="Positive Mentions"
          value={totalPositive}
          icon={TrendingUp}
          color="green"
        />
        <StatCard
          label="Negative Signals"
          value={totalNegative}
          icon={MessageSquare}
          color="red"
        />
      </div>

      {/* Sentiment Overview & Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sentiment Chart */}
        <div className="lg:col-span-2 bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Sentiment Comparison</h2>
              <p className="text-xs text-zinc-400">Analysis breakdown by positive, neutral, and negative reaction</p>
            </div>
            <Link to="/analyze" className="text-xs font-semibold text-white hover:underline transition-colors flex items-center gap-1">
              View details <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {sentimentChart.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-zinc-800 rounded-xl">
              <BarChart3 className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
              <p className="text-zinc-400 text-sm">No analysis history yet.</p>
              <Link to="/analyze" className="text-xs text-white hover:underline mt-1 inline-block">
                Run your first analysis →
              </Link>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={sentimentChart} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis
                  dataKey="name"
                  stroke="#a1a1aa"
                  tick={{ fontSize: 11 }}
                />
                <YAxis stroke="#a1a1aa" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    border: '1px solid #27272a',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#f4f4f5'
                  }}
                />
                <Bar dataKey="Positive" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Neutral" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Negative" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Quick Launch Panel */}
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 shadow-xl backdrop-blur-xl flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-white mb-1 tracking-tight">Quick Tools</h2>
            <p className="text-xs text-zinc-400 mb-5">Jump right to your growth workflow</p>

            <div className="space-y-3">
              <Link
                to="/analyze"
                className="flex items-center gap-3.5 p-3 rounded-xl bg-black/40 hover:bg-black/80 border border-zinc-800/80 hover:border-zinc-700 transition-all group"
              >
                <div className="w-9 h-9 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
                  <Search className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-zinc-200 group-hover:text-white">Analyze Product Idea</p>
                  <p className="text-[11px] text-zinc-400 truncate">Scrape & analyze Reddit sentiment</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
              </Link>

              <Link
                to="/copilot"
                className="flex items-center gap-3.5 p-3 rounded-xl bg-black/40 hover:bg-black/80 border border-zinc-800/80 hover:border-zinc-700 transition-all group"
              >
                <div className="w-9 h-9 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-zinc-200 group-hover:text-white">AI Content Copilot</p>
                  <p className="text-[11px] text-zinc-400 truncate">Generate viral posts & replies</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
              </Link>

              <Link
                to="/roadmap"
                className="flex items-center gap-3.5 p-3 rounded-xl bg-black/40 hover:bg-black/80 border border-zinc-800/80 hover:border-zinc-700 transition-all group"
              >
                <div className="w-9 h-9 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-zinc-200 group-hover:text-white">AI Product Roadmap</p>
                  <p className="text-[11px] text-zinc-400 truncate">Turn feedback into action items</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
              </Link>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-neutral-800 flex items-center justify-between text-xs text-zinc-400">
            <span className="flex items-center gap-1.5 text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> System Operational
            </span>
            <span className="text-[11px] font-mono text-zinc-500">API Latency: 42ms</span>
          </div>
        </div>
      </div>

      {/* Projects + Recent Analyses Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2 tracking-tight">
              <FolderKanban className="w-4 h-4 text-zinc-300" />
              Active Projects
            </h2>
            <Link to="/projects" className="text-xs font-semibold text-white hover:underline">
              View all ({projects.length})
            </Link>
          </div>

          {projects.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-zinc-800 rounded-xl">
              <p className="text-zinc-400 text-xs">No active projects found.</p>
              <Link to="/projects" className="text-xs text-white hover:underline mt-1 inline-block">
                + Create project
              </Link>
            </div>
          ) : (
            <div className="space-y-2.5">
              {projects.slice(0, 4).map((p) => (
                <Link
                  key={p.id}
                  to={`/projects/${p.id}`}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-black/40 hover:bg-black/80 border border-zinc-800/80 hover:border-zinc-700 transition-all group"
                >
                  <div className="min-w-0 pr-3">
                    <span className="text-sm font-semibold text-zinc-200 group-hover:text-white block truncate">
                      {p.name}
                    </span>
                    {p.description && (
                      <span className="text-xs text-zinc-400 block truncate mt-0.5">
                        {p.description}
                      </span>
                    )}
                  </div>
                  <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-white shrink-0 transition-colors" />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Analyses */}
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2 tracking-tight">
              <BarChart3 className="w-4 h-4 text-zinc-300" />
              Recent Market Analyses
            </h2>
            <Link to="/analyze" className="text-xs font-semibold text-white hover:underline">
              View all ({analyses.length})
            </Link>
          </div>

          {analyses.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-zinc-800 rounded-xl">
              <p className="text-zinc-400 text-xs">No recent analyses run.</p>
              <Link to="/analyze" className="text-xs text-white hover:underline mt-1 inline-block">
                Start new analysis →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {analyses.slice(0, 4).map((a) => (
                <Link
                  key={a.id}
                  to={`/analyze/${a.id}`}
                  className="block p-3.5 rounded-xl bg-black/40 hover:bg-black/80 border border-zinc-800/80 hover:border-zinc-700 transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-zinc-200 truncate pr-2">
                      {a.product_idea || 'Market Analysis'}
                    </span>
                    <div className="flex items-center gap-2 text-[11px] font-mono shrink-0">
                      <span className="text-emerald-400">+{a.sentiment_positive || 0}</span>
                      <span className="text-amber-400">~{a.sentiment_neutral || 0}</span>
                      <span className="text-rose-400">-{a.sentiment_negative || 0}</span>
                    </div>
                  </div>
                  <SentimentBar
                    positive={a.sentiment_positive || 0}
                    neutral={a.sentiment_neutral || 0}
                    negative={a.sentiment_negative || 0}
                  />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
