import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  getProject,
  getProjectSummary,
  getProjectAnalysis,
  getSentimentTrend,
  getProjectFeedback,
  runFullAnalysis,
  analyzePostFeedback,
  updateProject,
  deleteProject,
} from '../api';
import Card from '../components/Card';
import StatCard from '../components/StatCard';
import Modal from '../components/Modal';
import SentimentBar from '../components/SentimentBar';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  ArrowLeft,
  BarChart3,
  MessageSquare,
  TrendingUp,
  Lightbulb,
  Play,
  Pencil,
  Trash2,
  AlertCircle,
  CheckCircle,
  Clock,
  ChevronDown,
  ChevronUp,
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
  AreaChart,
  Area,
} from 'recharts';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [summary, setSummary] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [trend, setTrend] = useState([]);
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Full analysis
  const [runningAnalysis, setRunningAnalysis] = useState(false);
  const [redditUrl, setRedditUrl] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);

  // Post feedback analyzer
  const [fbForm, setFbForm] = useState({ postUrl: '', featureContext: '' });
  const [fbResult, setFbResult] = useState(null);
  const [fbLoading, setFbLoading] = useState(false);

  // Edit project
  const [editModal, setEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);

  // Delete
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Expanded feedback
  const [expandedFb, setExpandedFb] = useState(null);

  // Active tab
  const [activeTab, setActiveTab] = useState('overview');

  const loadAll = async () => {
    try {
      const [projRes, sumRes, analRes, trendRes, fbRes] = await Promise.all([
        getProject(id),
        getProjectSummary(id),
        getProjectAnalysis(id),
        getSentimentTrend(id),
        getProjectFeedback(id),
      ]);
      setProject(projRes.data);
      setSummary(sumRes.data);
      setAnalysis(analRes.data);
      setTrend(trendRes.data);
      setFeedbackList(fbRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, [id]);

  const handleFullAnalysis = async () => {
    if (!redditUrl.trim()) return;
    setRunningAnalysis(true);
    setAnalysisResult(null);
    try {
      const res = await runFullAnalysis(id, redditUrl);
      setAnalysisResult(res.data);
      setRedditUrl('');
      await loadAll();
    } catch (err) {
      console.error(err);
      setAnalysisResult({
        error: err.response?.data?.error || 'Analysis failed',
      });
    } finally {
      setRunningAnalysis(false);
    }
  };

  const handlePostFeedback = async () => {
    if (!fbForm.postUrl.trim() || !fbForm.featureContext.trim()) return;
    setFbLoading(true);
    setFbResult(null);
    try {
      const res = await analyzePostFeedback({
        projectId: id,
        postUrl: fbForm.postUrl,
        featureContext: fbForm.featureContext,
      });
      setFbResult(res.data);
      setFbForm({ postUrl: '', featureContext: '' });
      await loadAll();
    } catch (err) {
      console.error(err);
    } finally {
      setFbLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!editForm.name.trim()) return;
    setSaving(true);
    try {
      const res = await updateProject(id, editForm);
      setProject(res.data);
      setEditModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteProject(id);
      navigate('/projects');
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'analyze', label: 'Run Analysis' },
    { key: 'feedback', label: `Feedback (${feedbackList.length})` },
  ];

  return (
    <div>
      {/* Back link */}
      <Link
        to="/projects"
        className="text-slate-400 hover:text-white text-sm flex items-center gap-1 mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Projects
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">
            {project?.name || `Project #${id}`}
          </h1>
          {project?.description && (
            <p className="text-slate-400 mt-1">{project.description}</p>
          )}
          <p className="text-xs text-slate-500 mt-1">
            Created{' '}
            {project?.created_at
              ? new Date(project.created_at).toLocaleDateString()
              : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setEditForm({
                name: project?.name || '',
                description: project?.description || '',
              });
              setEditModal(true);
            }}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm flex items-center gap-2 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </button>
          <button
            onClick={() => setDeleteModal(true)}
            className="px-4 py-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-lg text-sm flex items-center gap-2 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
            icon={AlertCircle}
            color="red"
          />
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-800 rounded-xl p-1 border border-slate-700 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── OVERVIEW TAB ─── */}
      {activeTab === 'overview' && (
        <>
          {/* Overall Sentiment Bar */}
          {summary && (summary.sentiment?.agreement > 0 || summary.sentiment?.neutral > 0 || summary.sentiment?.disagreement > 0) && (
            <Card title="Overall Sentiment Distribution" className="mb-6">
              <SentimentBar
                positive={Number(summary.sentiment.agreement)}
                neutral={Number(summary.sentiment.neutral)}
                negative={Number(summary.sentiment.disagreement)}
                labels={{
                  positive: 'Agreement',
                  neutral: 'Neutral',
                  negative: 'Disagreement',
                }}
              />
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Sentiment Trend Chart */}
            <Card title="Sentiment Trend Over Time">
              {trend.length === 0 ? (
                <div className="text-center py-8">
                  <TrendingUp className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                  <p className="text-slate-400 text-sm">
                    No trend data yet. Analyze some posts to see trends.
                  </p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={trend}>
                    <defs>
                      <linearGradient id="agreeGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="disagreeGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Legend />
                    <Area type="monotone" dataKey="agreement" stroke="#22c55e" fill="url(#agreeGrad)" strokeWidth={2} />
                    <Line type="monotone" dataKey="neutral" stroke="#eab308" strokeWidth={2} dot={false} />
                    <Area type="monotone" dataKey="disagreement" stroke="#ef4444" fill="url(#disagreeGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </Card>

            {/* Latest Insights */}
            <Card title="AI Insights">
              <div className="space-y-4">
                {summary?.mostRequestedChange ? (
                  <>
                    <div className="p-4 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="w-4 h-4 text-indigo-400" />
                        <p className="text-xs text-indigo-400 font-semibold uppercase tracking-wide">
                          Most Requested Change
                        </p>
                      </div>
                      <p className="text-white">
                        {summary.mostRequestedChange.top_requested_change}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Requested {summary.mostRequestedChange.count} time(s)
                      </p>
                    </div>
                    {summary.latestRecommendation && (
                      <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Lightbulb className="w-4 h-4 text-green-400" />
                          <p className="text-xs text-green-400 font-semibold uppercase tracking-wide">
                            Recommended Next Feature
                          </p>
                        </div>
                        <p className="text-white">
                          {summary.latestRecommendation.recommended_next_feature}
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-6">
                    <Lightbulb className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                    <p className="text-slate-400 text-sm">
                      No insights yet. Run a post feedback analysis to generate
                      insights.
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Recent Feedback */}
          {feedbackList.length > 0 && (
            <Card title="Recent Feedback Analyses">
              <div className="space-y-3">
                {feedbackList.slice(0, 3).map((fb) => (
                  <div
                    key={fb.id}
                    className="p-4 rounded-lg bg-slate-700/50 border border-slate-600"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium text-sm truncate">
                          {fb.feature_context}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {new Date(fb.created_at).toLocaleDateString()} &middot;{' '}
                          <a
                            href={fb.post_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-400 hover:underline"
                          >
                            View post
                          </a>
                        </p>
                      </div>
                    </div>
                    <SentimentBar
                      positive={fb.agreement}
                      neutral={fb.neutral}
                      negative={fb.disagreement}
                      labels={{
                        positive: 'Agree',
                        neutral: 'Neutral',
                        negative: 'Disagree',
                      }}
                    />
                    {fb.top_requested_change && (
                      <p className="text-xs text-slate-400 mt-2">
                        <span className="text-indigo-400 font-medium">
                          Top change:
                        </span>{' '}
                        {fb.top_requested_change}
                      </p>
                    )}
                  </div>
                ))}
                {feedbackList.length > 3 && (
                  <button
                    onClick={() => setActiveTab('feedback')}
                    className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    View all {feedbackList.length} feedback entries
                  </button>
                )}
              </div>
            </Card>
          )}

          {/* Last Roadmap */}
          {analysis?.last_roadmap && (
            <Card title="Generated Roadmap" className="mt-6">
              <pre className="text-sm text-slate-300 whitespace-pre-wrap overflow-auto max-h-96">
                {JSON.stringify(analysis.last_roadmap, null, 2)}
              </pre>
            </Card>
          )}
        </>
      )}

      {/* ─── ANALYZE TAB ─── */}
      {activeTab === 'analyze' && (
        <div className="space-y-6">
          {/* Full Analysis */}
          <Card title="Run Full AI Pipeline">
            <p className="text-sm text-slate-400 mb-4">
              Provide a Reddit post URL to run the full analysis pipeline:
              comment extraction, sentiment analysis, feature clustering, and
              roadmap generation.
            </p>
            <div className="flex gap-3">
              <input
                type="text"
                value={redditUrl}
                onChange={(e) => setRedditUrl(e.target.value)}
                placeholder="https://reddit.com/r/..."
                className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={handleFullAnalysis}
                disabled={runningAnalysis || !redditUrl.trim()}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
              >
                <Play className="w-4 h-4" />
                {runningAnalysis ? 'Running...' : 'Run Pipeline'}
              </button>
            </div>
            {analysisResult && (
              <div className="mt-4">
                {analysisResult.error ? (
                  <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                    <p className="text-red-400 text-sm">{analysisResult.error}</p>
                  </div>
                ) : (
                  <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <p className="text-green-400 font-medium text-sm">
                        Analysis completed successfully
                      </p>
                    </div>
                    <pre className="text-xs text-slate-300 whitespace-pre-wrap overflow-auto max-h-64 mt-2">
                      {JSON.stringify(analysisResult, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Post Feedback Analyzer */}
          <Card title="Analyze Post Feedback">
            <p className="text-sm text-slate-400 mb-4">
              Analyze a specific Reddit post to gauge community reaction to a
              feature you shipped or announced.
            </p>
            <div className="space-y-3">
              <input
                placeholder="Reddit post URL"
                value={fbForm.postUrl}
                onChange={(e) =>
                  setFbForm({ ...fbForm, postUrl: e.target.value })
                }
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
              <textarea
                placeholder="Feature context (what was announced / shipped)"
                value={fbForm.featureContext}
                onChange={(e) =>
                  setFbForm({ ...fbForm, featureContext: e.target.value })
                }
                rows={3}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 resize-none"
              />
              <button
                onClick={handlePostFeedback}
                disabled={
                  fbLoading ||
                  !fbForm.postUrl.trim() ||
                  !fbForm.featureContext.trim()
                }
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                {fbLoading ? 'Analyzing...' : 'Analyze Feedback'}
              </button>
            </div>

            {fbResult && (
              <div className="mt-6 space-y-4">
                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <p className="text-green-400 font-medium text-sm">
                      Feedback analysis complete
                    </p>
                  </div>
                  {fbResult.sentiment && (
                    <SentimentBar
                      positive={fbResult.sentiment.agreement}
                      neutral={fbResult.sentiment.neutral}
                      negative={fbResult.sentiment.disagreement}
                      labels={{
                        positive: 'Agree',
                        neutral: 'Neutral',
                        negative: 'Disagree',
                      }}
                    />
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {fbResult.top_requested_change && (
                    <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                      <p className="text-xs text-indigo-400 font-medium mb-1">
                        Top Requested Change
                      </p>
                      <p className="text-white text-sm">
                        {fbResult.top_requested_change}
                      </p>
                    </div>
                  )}
                  {fbResult.recommended_next_feature && (
                    <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                      <p className="text-xs text-green-400 font-medium mb-1">
                        Recommended Next Feature
                      </p>
                      <p className="text-white text-sm">
                        {fbResult.recommended_next_feature}
                      </p>
                    </div>
                  )}
                </div>
                {fbResult.confusions && fbResult.confusions.length > 0 && (
                  <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                    <p className="text-xs text-yellow-400 font-medium mb-2">
                      User Confusions
                    </p>
                    <ul className="space-y-1">
                      {fbResult.confusions.map((c, i) => (
                        <li
                          key={i}
                          className="text-sm text-slate-300 pl-3 border-l-2 border-yellow-500/30"
                        >
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ─── FEEDBACK TAB ─── */}
      {activeTab === 'feedback' && (
        <div>
          {feedbackList.length === 0 ? (
            <Card>
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white mb-1">
                  No feedback yet
                </h3>
                <p className="text-sm text-slate-400 mb-4">
                  Go to the "Run Analysis" tab to analyze post feedback.
                </p>
                <button
                  onClick={() => setActiveTab('analyze')}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Analyze Feedback
                </button>
              </div>
            </Card>
          ) : (
            <div className="space-y-3">
              {feedbackList.map((fb) => {
                const isExpanded = expandedFb === fb.id;
                const confusions =
                  typeof fb.confusions === 'string'
                    ? JSON.parse(fb.confusions)
                    : fb.confusions;

                return (
                  <div
                    key={fb.id}
                    className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden"
                  >
                    <button
                      onClick={() =>
                        setExpandedFb(isExpanded ? null : fb.id)
                      }
                      className="w-full p-5 text-left hover:bg-slate-750 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium">
                            {fb.feature_context}
                          </p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(fb.created_at).toLocaleDateString()}
                            </span>
                            <a
                              href={fb.post_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-400 hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              View post
                            </a>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 ml-4">
                          <div className="flex gap-3 text-xs">
                            <span className="text-green-400 font-medium">
                              +{fb.agreement}
                            </span>
                            <span className="text-yellow-400 font-medium">
                              ~{fb.neutral}
                            </span>
                            <span className="text-red-400 font-medium">
                              -{fb.disagreement}
                            </span>
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-slate-500" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-500" />
                          )}
                        </div>
                      </div>
                      <div className="mt-3">
                        <SentimentBar
                          positive={fb.agreement}
                          neutral={fb.neutral}
                          negative={fb.disagreement}
                          labels={{
                            positive: 'Agree',
                            neutral: 'Neutral',
                            negative: 'Disagree',
                          }}
                        />
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-5 pb-5 pt-2 border-t border-slate-700 space-y-3">
                        {fb.top_requested_change && (
                          <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                            <p className="text-xs text-indigo-400 font-medium mb-1">
                              Top Requested Change
                            </p>
                            <p className="text-white text-sm">
                              {fb.top_requested_change}
                            </p>
                          </div>
                        )}
                        {fb.recommended_next_feature && (
                          <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                            <p className="text-xs text-green-400 font-medium mb-1">
                              Recommended Next Feature
                            </p>
                            <p className="text-white text-sm">
                              {fb.recommended_next_feature}
                            </p>
                          </div>
                        )}
                        {confusions && confusions.length > 0 && (
                          <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                            <p className="text-xs text-yellow-400 font-medium mb-2">
                              User Confusions
                            </p>
                            <ul className="space-y-1">
                              {confusions.map((c, i) => (
                                <li
                                  key={i}
                                  className="text-sm text-slate-300 pl-3 border-l-2 border-yellow-500/30"
                                >
                                  {c}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Edit Modal */}
      <Modal
        isOpen={editModal}
        onClose={() => setEditModal(false)}
        title="Edit Project"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Project Name *
            </label>
            <input
              value={editForm.name}
              onChange={(e) =>
                setEditForm({ ...editForm, name: e.target.value })
              }
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Description
            </label>
            <textarea
              value={editForm.description}
              onChange={(e) =>
                setEditForm({ ...editForm, description: e.target.value })
              }
              rows={3}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setEditModal(false)}
              className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleEdit}
              disabled={saving || !editForm.name.trim()}
              className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        title="Delete Project"
      >
        <div>
          <p className="text-slate-300 mb-2">
            Are you sure you want to delete{' '}
            <span className="text-white font-semibold">{project?.name}</span>?
          </p>
          <p className="text-sm text-red-400 mb-6">
            This will permanently delete all analyses and feedback for this
            project.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setDeleteModal(false)}
              className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
            >
              {deleting ? 'Deleting...' : 'Delete Project'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
