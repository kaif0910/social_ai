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
import StatCard from '../components/StatCard';
import Modal from '../components/Modal';
import SentimentBar from '../components/SentimentBar';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../components/useToast';
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
  Sparkles,
  Link as LinkIcon
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
  const toast = useToast();

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
      setTrend(Array.isArray(trendRes.data) ? trendRes.data : []);
      setFeedbackList(Array.isArray(fbRes.data) ? fbRes.data : []);
    } catch (err) {
      console.error("Load project detail error:", err);
      toast.error('Failed to load project details.');
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
      toast.success('Full analysis pipeline completed!');
      await loadAll();
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.error || 'Analysis failed';
      setAnalysisResult({ error: errorMsg });
      toast.error(errorMsg);
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
      toast.success('Post feedback analysis completed!');
      await loadAll();
    } catch (err) {
      console.error(err);
      toast.error('Failed to analyze post feedback.');
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
      toast.success('Project details updated!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update project.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteProject(id);
      toast.success('Project deleted successfully.');
      navigate('/projects');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete project.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading workspace project details..." />;

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'analyze', label: 'Run AI Pipeline' },
    { key: 'feedback', label: `Feedback (${feedbackList.length})` },
  ];

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Back breadcrumb */}
      <Link
        to="/projects"
        className="text-xs font-semibold text-zinc-400 hover:text-white inline-flex items-center gap-1.5 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Workspace Projects
      </Link>

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-2 border-b border-neutral-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {project?.name || `Project #${id}`}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700">
              Active Project
            </span>
          </div>
          {project?.description && (
            <p className="text-sm text-zinc-400 mt-1 max-w-2xl">{project.description}</p>
          )}
          <p className="text-xs text-zinc-500 mt-2 flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-zinc-500" />
            Created {project?.created_at ? new Date(project.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'recently'}
          </p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => {
              setEditForm({
                name: project?.name || '',
                description: project?.description || '',
              });
              setEditModal(true);
            }}
            className="px-3.5 py-2 bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700/80 text-zinc-200 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5 text-white" />
            Edit Details
          </button>
          <button
            onClick={() => setDeleteModal(true)}
            className="px-3.5 py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-300 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      </div>

      {/* Summary Metrics Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Analyses Executed"
            value={summary.totalAnalyses}
            icon={BarChart3}
            color="indigo"
          />
          <StatCard
            label="Feedback Submissions"
            value={summary.totalFeedbackPosts}
            icon={MessageSquare}
            color="blue"
          />
          <StatCard
            label="Agreement Count"
            value={summary.sentiment?.agreement || 0}
            icon={TrendingUp}
            color="green"
          />
          <StatCard
            label="Disagreement Count"
            value={summary.sentiment?.disagreement || 0}
            icon={AlertCircle}
            color="red"
          />
        </div>
      )}

      {/* Nav Tabs */}
      <div className="flex border-b border-neutral-800 space-x-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`pb-3 text-sm font-semibold transition-all border-b-2 cursor-pointer ${
              activeTab === tab.key
                ? 'border-white text-white'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── OVERVIEW TAB ─── */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Sentiment Distribution Bar */}
          {summary && (Number(summary.sentiment?.agreement) > 0 || Number(summary.sentiment?.neutral) > 0 || Number(summary.sentiment?.disagreement) > 0) && (
            <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 shadow-xl backdrop-blur-xl">
              <h3 className="text-sm font-bold text-white mb-3 tracking-tight">Overall Sentiment Distribution</h3>
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
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sentiment Trend Chart */}
            <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 shadow-xl backdrop-blur-xl">
              <h3 className="text-sm font-bold text-white mb-4 tracking-tight">Sentiment Trend Timeline</h3>
              {trend.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-zinc-800 rounded-xl">
                  <TrendingUp className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                  <p className="text-zinc-400 text-xs">No trend timeline available yet.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={trend}>
                    <defs>
                      <linearGradient id="agreeGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="disagreeGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="date" stroke="#71717a" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#71717a" tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#18181b',
                        border: '1px solid #27272a',
                        borderRadius: '12px',
                        fontSize: '12px',
                        color: '#f8fafc'
                      }}
                    />
                    <Legend />
                    <Area type="monotone" dataKey="agreement" stroke="#10b981" fill="url(#agreeGrad)" strokeWidth={2} />
                    <Line type="monotone" dataKey="neutral" stroke="#f59e0b" strokeWidth={2} dot={false} />
                    <Area type="monotone" dataKey="disagreement" stroke="#ef4444" fill="url(#disagreeGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* AI Insights Panel */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Aggregated AI Insights
              </h3>
              <div className="space-y-4">
                {summary?.mostRequestedChange ? (
                  <>
                    <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                      <div className="flex items-center gap-2 mb-1.5">
                        <AlertCircle className="w-4 h-4 text-indigo-400" />
                        <p className="text-xs text-indigo-400 font-bold uppercase tracking-wider">
                          Top Requested Feature Change
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-slate-100">
                        {summary.mostRequestedChange.top_requested_change}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Mentioned {summary.mostRequestedChange.count} time(s) across community posts
                      </p>
                    </div>

                    {summary.latestRecommendation && (
                      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                        <div className="flex items-center gap-2 mb-1.5">
                          <Lightbulb className="w-4 h-4 text-emerald-400" />
                          <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider">
                            Recommended Next Action
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-slate-100">
                          {summary.latestRecommendation.recommended_next_feature}
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8 border border-dashed border-slate-800 rounded-xl">
                    <Lightbulb className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-slate-400 text-xs">No AI insights generated yet.</p>
                    <button
                      onClick={() => setActiveTab('analyze')}
                      className="text-xs text-indigo-400 hover:underline mt-1 cursor-pointer"
                    >
                      Run an analysis to generate insights →
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Feedback Entries Preview */}
          {feedbackList.length > 0 && (
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white">Recent Post Evaluations</h3>
                <button onClick={() => setActiveTab('feedback')} className="text-xs font-semibold text-indigo-400 hover:text-indigo-300">
                  View All ({feedbackList.length})
                </button>
              </div>
              <div className="space-y-3">
                {feedbackList.slice(0, 3).map((fb) => (
                  <div key={fb.id} className="p-4 rounded-xl bg-slate-800/40 border border-slate-800/80 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-xs font-bold text-slate-200">{fb.feature_context}</p>
                      <a href={fb.post_url} target="_blank" rel="noopener noreferrer" className="text-[11px] text-indigo-400 hover:underline flex items-center gap-1 shrink-0">
                        <LinkIcon className="w-3 h-3" /> Post Link
                      </a>
                    </div>
                    <SentimentBar positive={fb.agreement} neutral={fb.neutral} negative={fb.disagreement} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── ANALYZE TAB ─── */}
      {activeTab === 'analyze' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Pipeline */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Play className="w-4 h-4 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Full AI Pipeline Analysis</h3>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                Provide a Reddit discussion URL to automatically extract comments, cluster feature feedback, and build a product roadmap.
              </p>
              <div className="space-y-3">
                <input
                  type="text"
                  value={redditUrl}
                  onChange={(e) => setRedditUrl(e.target.value)}
                  placeholder="https://www.reddit.com/r/SaaS/comments/..."
                  className="w-full bg-slate-950/60 border border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all"
                />
                <button
                  onClick={handleFullAnalysis}
                  disabled={runningAnalysis || !redditUrl.trim()}
                  className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
                >
                  {runningAnalysis ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Play className="w-4 h-4" /> Run Full AI Analysis
                    </>
                  )}
                </button>
              </div>
            </div>

            {analysisResult && (
              <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                {analysisResult.error ? (
                  <p className="text-rose-400">{analysisResult.error}</p>
                ) : (
                  <div>
                    <span className="text-emerald-400 font-bold block mb-1">✓ Analysis Run Completed</span>
                    <pre className="text-[11px] text-slate-300 overflow-auto max-h-48 whitespace-pre-wrap">
                      {JSON.stringify(analysisResult, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Feature Post Feedback Analyzer */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 shadow-sm space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-4 h-4 text-violet-400" />
                <h3 className="text-base font-bold text-white">Post Sentiment Evaluation</h3>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                Evaluate community sentiment for a specific feature announcement or product update.
              </p>

              <div className="space-y-3">
                <input
                  placeholder="Reddit post URL"
                  value={fbForm.postUrl}
                  onChange={(e) => setFbForm({ ...fbForm, postUrl: e.target.value })}
                  className="w-full bg-slate-950/60 border border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all"
                />
                <textarea
                  placeholder="Feature context (e.g. Launched new dark mode toggle and faster search)..."
                  value={fbForm.featureContext}
                  onChange={(e) => setFbForm({ ...fbForm, featureContext: e.target.value })}
                  rows={3}
                  className="w-full bg-slate-950/60 border border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all resize-none"
                />
                <button
                  onClick={handlePostFeedback}
                  disabled={fbLoading || !fbForm.postUrl.trim() || !fbForm.featureContext.trim()}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 disabled:opacity-50 text-slate-100 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {fbLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <MessageSquare className="w-4 h-4 text-violet-400" /> Evaluate Post Reactions
                    </>
                  )}
                </button>
              </div>
            </div>

            {fbResult && (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-3">
                <span className="text-emerald-400 font-bold block">✓ Post Evaluated</span>
                {fbResult.sentiment && (
                  <SentimentBar
                    positive={fbResult.sentiment.agreement}
                    neutral={fbResult.sentiment.neutral}
                    negative={fbResult.sentiment.disagreement}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── FEEDBACK TAB ─── */}
      {activeTab === 'feedback' && (
        <div className="space-y-4">
          {feedbackList.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-8 text-center">
              <MessageSquare className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-white">No feedback records found</h3>
              <p className="text-xs text-slate-400 mt-1 mb-4">Run an analysis to inspect community reactions.</p>
              <button onClick={() => setActiveTab('analyze')} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer">
                Run First Analysis
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {feedbackList.map((fb) => (
                <div key={fb.id} className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-white">{fb.feature_context}</h4>
                      <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                        <span>{new Date(fb.created_at || Date.now()).toLocaleDateString()}</span>
                        <span>•</span>
                        <a href={fb.post_url} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">
                          View original post ↗
                        </a>
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-mono shrink-0">
                      <span className="text-emerald-400">+{fb.agreement || 0}</span>
                      <span className="text-amber-400">~{fb.neutral || 0}</span>
                      <span className="text-rose-400">-{fb.disagreement || 0}</span>
                    </div>
                  </div>
                  <SentimentBar positive={fb.agreement} neutral={fb.neutral} negative={fb.disagreement} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit Modal */}
      <Modal isOpen={editModal} onClose={() => setEditModal(false)} title="Edit Project Details">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Project Name *</label>
            <input
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              className="w-full bg-slate-950/60 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Description</label>
            <textarea
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              rows={3}
              className="w-full bg-slate-950/60 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 outline-none resize-none"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setEditModal(false)} className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-medium">Cancel</button>
            <button onClick={handleEdit} disabled={saving || !editForm.name.trim()} className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={deleteModal} onClose={() => setDeleteModal(false)} title="Delete Project">
        <div className="space-y-4">
          <p className="text-sm text-slate-300">Are you sure you want to delete <span className="text-white font-bold">{project?.name}</span>?</p>
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
            This will permanently remove all associated feedback logs.
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setDeleteModal(false)} className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-medium">Cancel</button>
            <button onClick={handleDelete} disabled={deleting} className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-sm font-medium">
              {deleting ? 'Deleting...' : 'Confirm Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
