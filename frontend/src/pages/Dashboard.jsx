import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProjects, getAnalyses } from '../api';
import StatCard from '../components/StatCard';
import Card from '../components/Card';
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
} from 'lucide-react';
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

export default function Dashboard() {
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
        setProjects(projRes.data);
        setAnalyses(analRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <LoadingSpinner />;

  // Aggregate sentiment from analyses
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

  // Sentiment chart data for latest 8 analyses
  const chartAnalyses = analyses.slice(0, 8).reverse();
  const sentimentChart = chartAnalyses.map((a) => ({
    name:
      (a.product_idea || '').length > 15
        ? a.product_idea.slice(0, 15) + '...'
        : a.product_idea,
    Positive: a.sentiment_positive || 0,
    Neutral: a.sentiment_neutral || 0,
    Negative: a.sentiment_negative || 0,
  }));

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 mt-1">
            AI-powered feedback analysis overview
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/projects"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Project
          </Link>
          <Link
            to="/analyze"
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
          >
            <Search className="w-4 h-4" />
            Analyze
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Projects"
          value={projects.length}
          icon={FolderKanban}
          color="indigo"
        />
        <StatCard
          label="Analyses Run"
          value={analyses.length}
          icon={BarChart3}
          color="green"
        />
        <StatCard
          label="Positive Signals"
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

      {/* Overall Sentiment */}
      {(totalPositive > 0 || totalNeutral > 0 || totalNegative > 0) && (
        <Card title="Overall Feedback Sentiment" className="mb-6">
          <SentimentBar
            positive={totalPositive}
            neutral={totalNeutral}
            negative={totalNegative}
          />
        </Card>
      )}

      {/* Charts + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Sentiment comparison chart */}
        <div className="lg:col-span-2">
          <Card title="Sentiment by Analysis">
            {sentimentChart.length === 0 ? (
              <div className="text-center py-8">
                <BarChart3 className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">
                  No analysis data yet. Run your first analysis to see charts.
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={sentimentChart} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis
                    dataKey="name"
                    stroke="#94a3b8"
                    tick={{ fontSize: 11 }}
                    angle={-20}
                    textAnchor="end"
                    height={50}
                  />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="Positive" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Neutral" fill="#eab308" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Negative" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>
        </div>

        {/* Quick Actions */}
        <Card title="Quick Actions">
          <div className="space-y-3">
            <Link
              to="/analyze"
              className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                <Search className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="flex-1">
                <p className="text-white text-sm font-medium">
                  Analyze Product Idea
                </p>
                <p className="text-xs text-slate-400">
                  Search Reddit for feedback
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500" />
            </Link>
            <Link
              to="/post-feedback"
              className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-white text-sm font-medium">
                  Analyze Post Feedback
                </p>
                <p className="text-xs text-slate-400">Feature reaction check</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500" />
            </Link>
            <Link
              to="/copilot"
              className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Bot className="w-5 h-5 text-green-400" />
              </div>
              <div className="flex-1">
                <p className="text-white text-sm font-medium">AI Copilot</p>
                <p className="text-xs text-slate-400">Generate posts & replies</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500" />
            </Link>
            <Link
              to="/roadmap"
              className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-yellow-400" />
              </div>
              <div className="flex-1">
                <p className="text-white text-sm font-medium">
                  Generate Roadmap
                </p>
                <p className="text-xs text-slate-400">AI-driven prioritization</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500" />
            </Link>
          </div>
        </Card>
      </div>

      {/* Recent Projects + Analyses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Recent Projects">
          {projects.length === 0 ? (
            <div className="text-center py-6">
              <FolderKanban className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-slate-400 text-sm mb-3">No projects yet.</p>
              <Link
                to="/projects"
                className="text-indigo-400 text-sm hover:underline"
              >
                Create your first project
              </Link>
            </div>
          ) : (
            <ul className="space-y-2">
              {projects.slice(0, 5).map((p) => (
                <li key={p.id}>
                  <Link
                    to={`/projects/${p.id}`}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors group"
                  >
                    <div className="min-w-0">
                      <span className="text-white font-medium text-sm block truncate">
                        {p.name}
                      </span>
                      {p.description && (
                        <span className="text-xs text-slate-500 truncate block">
                          {p.description}
                        </span>
                      )}
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 shrink-0 ml-2 transition-colors" />
                  </Link>
                </li>
              ))}
              {projects.length > 5 && (
                <li>
                  <Link
                    to="/projects"
                    className="text-sm text-indigo-400 hover:underline block pt-1"
                  >
                    View all {projects.length} projects
                  </Link>
                </li>
              )}
            </ul>
          )}
        </Card>

        <Card title="Recent Analyses">
          {analyses.length === 0 ? (
            <div className="text-center py-6">
              <BarChart3 className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-slate-400 text-sm mb-3">No analyses yet.</p>
              <Link
                to="/analyze"
                className="text-indigo-400 text-sm hover:underline"
              >
                Run your first analysis
              </Link>
            </div>
          ) : (
            <ul className="space-y-2">
              {analyses.slice(0, 5).map((a) => (
                <li key={a.id}>
                  <Link
                    to={`/analyze/${a.id}`}
                    className="block p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white font-medium text-sm truncate">
                        {a.product_idea}
                      </span>
                      <div className="flex gap-2 text-xs shrink-0 ml-2">
                        <span className="text-green-400">
                          +{a.sentiment_positive}
                        </span>
                        <span className="text-yellow-400">
                          ~{a.sentiment_neutral}
                        </span>
                        <span className="text-red-400">
                          -{a.sentiment_negative}
                        </span>
                      </div>
                    </div>
                    <SentimentBar
                      positive={a.sentiment_positive}
                      neutral={a.sentiment_neutral}
                      negative={a.sentiment_negative}
                    />
                  </Link>
                </li>
              ))}
              {analyses.length > 5 && (
                <li>
                  <Link
                    to="/analyze"
                    className="text-sm text-indigo-400 hover:underline block pt-1"
                  >
                    View all {analyses.length} analyses
                  </Link>
                </li>
              )}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
