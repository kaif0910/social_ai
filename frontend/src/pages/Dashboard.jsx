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
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-950/60 via-slate-900 to-violet-950/40 border border-indigo-500/20 p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-3">
              <Zap className="w-3.5 h-3.5" />
              <span>Workspace Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Good day, <span className="bg-gradient-to-r from-indigo-300 to-violet-300 bg-clip-text text-transparent">{user?.name || 'Maker'}</span>
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-xl">
              Track community feedback, discover feature demand, and generate AI growth content.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              to="/projects"
              className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-medium rounded-xl shadow-lg shadow-indigo-600/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              New Project
            </Link>
            <Link
              to="/analyze"
              className="px-4 py-2.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-200 text-sm font-medium rounded-xl flex items-center gap-2 transition-all cursor-pointer"
            >
              <Search className="w-4 h-4 text-indigo-400" />
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
          color="indigo"
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
        <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-white">Sentiment Comparison</h2>
              <p className="text-xs text-slate-400">Analysis breakdown by positive, neutral, and negative reaction</p>
            </div>
            <Link to="/analyze" className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1">
              View details <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {sentimentChart.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl">
              <BarChart3 className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-slate-400 text-sm">No analysis history yet.</p>
              <Link to="/analyze" className="text-xs text-indigo-400 hover:underline mt-1 inline-block">
                Run your first analysis →
              </Link>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={sentimentChart} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="name"
                  stroke="#64748b"
                  tick={{ fontSize: 11 }}
                />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#f8fafc'
                  }}
                />
                <Bar dataKey="Positive" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Neutral" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Negative" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Quick Launch Panel */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-white mb-1">Quick Tools</h2>
            <p className="text-xs text-slate-400 mb-5">Jump right to your growth workflow</p>

            <div className="space-y-3">
              <Link
                to="/analyze"
                className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 transition-all group"
              >
                <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                  <Search className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-200 group-hover:text-white">Analyze Product Idea</p>
                  <p className="text-[11px] text-slate-500 truncate">Scrape & analyze Reddit sentiment</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
              </Link>

              <Link
                to="/copilot"
                className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 transition-all group"
              >
                <div className="w-9 h-9 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-violet-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-200 group-hover:text-white">AI Content Copilot</p>
                  <p className="text-[11px] text-slate-500 truncate">Generate viral posts & replies</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-violet-400 group-hover:translate-x-0.5 transition-all" />
              </Link>

              <Link
                to="/roadmap"
                className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 transition-all group"
              >
                <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-200 group-hover:text-white">AI Product Roadmap</p>
                  <p className="text-[11px] text-slate-500 truncate">Turn feedback into action items</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
              </Link>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> System Operational
            </span>
            <span className="text-[11px] font-mono text-slate-500">API Latency: 42ms</span>
          </div>
        </div>
      </div>

      {/* Projects + Recent Analyses Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-indigo-400" />
              Active Projects
            </h2>
            <Link to="/projects" className="text-xs font-medium text-indigo-400 hover:text-indigo-300">
              View all ({projects.length})
            </Link>
          </div>

          {projects.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-slate-800 rounded-xl">
              <p className="text-slate-400 text-xs">No active projects found.</p>
              <Link to="/projects" className="text-xs text-indigo-400 hover:underline mt-1 inline-block">
                + Create project
              </Link>
            </div>
          ) : (
            <div className="space-y-2.5">
              {projects.slice(0, 4).map((p) => (
                <Link
                  key={p.id}
                  to={`/projects/${p.id}`}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-slate-800/30 hover:bg-slate-800/70 border border-slate-800/60 transition-all group"
                >
                  <div className="min-w-0 pr-3">
                    <span className="text-sm font-semibold text-slate-200 group-hover:text-white block truncate">
                      {p.name}
                    </span>
                    {p.description && (
                      <span className="text-xs text-slate-400 block truncate mt-0.5">
                        {p.description}
                      </span>
                    )}
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 shrink-0 transition-colors" />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Analyses */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              Recent Market Analyses
            </h2>
            <Link to="/analyze" className="text-xs font-medium text-indigo-400 hover:text-indigo-300">
              View all ({analyses.length})
            </Link>
          </div>

          {analyses.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-slate-800 rounded-xl">
              <p className="text-slate-400 text-xs">No recent analyses run.</p>
              <Link to="/analyze" className="text-xs text-indigo-400 hover:underline mt-1 inline-block">
                Start new analysis →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {analyses.slice(0, 4).map((a) => (
                <Link
                  key={a.id}
                  to={`/analyze/${a.id}`}
                  className="block p-3.5 rounded-xl bg-slate-800/30 hover:bg-slate-800/70 border border-slate-800/60 transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-200 truncate pr-2">
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
