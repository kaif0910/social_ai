import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createCampaign, getCampaigns, getProjects, generatePost, deleteCampaign } from '../api';
import { useToast } from '../components/useToast';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import {
  Megaphone,
  FileText,
  Loader2,
  CheckCircle2,
  Copy,
  Check,
  Sparkles,
  FolderKanban,
  Plus,
  Trash2
} from 'lucide-react';

export default function Campaigns() {
  const toast = useToast();

  const [projects, setProjects] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loadingInit, setLoadingInit] = useState(true);

  // ── Delete Campaign state ──
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // ── Create Campaign ──
  const [campaignForm, setCampaignForm] = useState({
    project_id: '',
    name: '',
    brand_voice: '',
    tone: '',
    niche: '',
  });

  // ── Generate Post ──
  const [postCampaignId, setPostCampaignId] = useState('');
  const [generatedPost, setGeneratedPost] = useState(null);

  const [loading, setLoading] = useState({
    create: false,
    post: false,
  });
  const [error, setError] = useState({ create: null, post: null });
  const [copiedPost, setCopiedPost] = useState(false);

  const loadData = async () => {
    try {
      const projRes = await getProjects();
      const projList = Array.isArray(projRes.data) ? projRes.data : [];
      setProjects(projList);
      if (projList.length > 0) {
        setCampaignForm((f) => f.project_id ? f : { ...f, project_id: String(projList[0].id) });
      }
    } catch (err) {
      console.error('Failed to load projects:', err);
      toast.error('Failed to load workspace projects.');
    }

    try {
      const campRes = await getCampaigns();
      const campList = Array.isArray(campRes.data) ? campRes.data : [];
      setCampaigns(campList);
      if (campList.length > 0) {
        setPostCampaignId((p) => p ? p : String(campList[0].id));
      }
    } catch (err) {
      console.error('Failed to load campaigns:', err);
    } finally {
      setLoadingInit(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async () => {
    if (!campaignForm.project_id) {
      const msg = 'Please select a parent workspace project first.';
      setError((e) => ({ ...e, create: msg }));
      toast.error(msg);
      return;
    }
    if (!campaignForm.name.trim()) {
      const msg = 'Please enter a campaign name.';
      setError((e) => ({ ...e, create: msg }));
      toast.error(msg);
      return;
    }
    setLoading((l) => ({ ...l, create: true }));
    setError((e) => ({ ...e, create: null }));
    try {
      const res = await createCampaign(campaignForm);
      toast.success('Campaign created successfully!');
      setCampaignForm({
        project_id: campaignForm.project_id,
        name: '',
        brand_voice: '',
        tone: '',
        niche: '',
      });
      setPostCampaignId(String(res.data.id));
      await loadData();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.error || 'Failed to create campaign';
      setError((e) => ({ ...e, create: msg }));
      toast.error(msg);
    } finally {
      setLoading((l) => ({ ...l, create: false }));
    }
  };

  const handleGeneratePost = async () => {
    if (!postCampaignId) return;
    setLoading((l) => ({ ...l, post: true }));
    setError((e) => ({ ...e, post: null }));
    try {
      const res = await generatePost(postCampaignId);
      setGeneratedPost(res.data);
      toast.success('Post generated!');
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.error || 'Failed to generate post';
      setError((e) => ({ ...e, post: msg }));
      toast.error(msg);
    } finally {
      setLoading((l) => ({ ...l, post: false }));
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      await deleteCampaign(deleteConfirm.id);
      toast.success('Campaign deleted successfully');
      setDeleteConfirm(null);
      await loadData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete campaign');
    } finally {
      setDeleting(false);
    }
  };

  const copyText = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedPost(true);
    toast.success('Copied post to clipboard!');
    setTimeout(() => setCopiedPost(false), 2000);
  };

  if (loadingInit) return <LoadingSpinner message="Loading brand campaigns..." />;

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Brand Campaigns & Content Studio
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Create marketing campaigns attached to workspace projects and auto-generate branded copy.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Create Campaign */}
        <div className="space-y-6">
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 shadow-xl backdrop-blur-xl">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                <Megaphone className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-base font-bold text-white tracking-tight">Create Campaign under Project</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                  Parent Workspace Project *
                </label>
                {projects.length === 0 ? (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center justify-between">
                    <span>No workspace projects found.</span>
                    <Link to="/projects" className="underline font-bold text-white hover:text-amber-200">
                      + Create Project
                    </Link>
                  </div>
                ) : (
                  <select
                    value={campaignForm.project_id}
                    onChange={(e) => setCampaignForm({ ...campaignForm, project_id: e.target.value })}
                    className="w-full bg-black/60 border border-zinc-800 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-400/20 rounded-xl px-4 py-2.5 text-sm text-white outline-none transition-all"
                  >
                    <option value="">Select project...</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                  Campaign Name *
                </label>
                <input
                  placeholder="e.g., Summer SaaS Launch Drive"
                  value={campaignForm.name}
                  onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })}
                  className="w-full bg-black/60 border border-zinc-800 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-400/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                  Brand Voice Guidelines
                </label>
                <input
                  placeholder="e.g., authoritative yet friendly, developer-centric"
                  value={campaignForm.brand_voice}
                  onChange={(e) => setCampaignForm({ ...campaignForm, brand_voice: e.target.value })}
                  className="w-full bg-black/60 border border-zinc-800 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-400/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                    Tone
                  </label>
                  <input
                    placeholder="e.g., conversational"
                    value={campaignForm.tone}
                    onChange={(e) => setCampaignForm({ ...campaignForm, tone: e.target.value })}
                    className="w-full bg-black/60 border border-zinc-800 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-400/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                    Niche / Market
                  </label>
                  <input
                    placeholder="e.g., DevTools, AI"
                    value={campaignForm.niche}
                    onChange={(e) => setCampaignForm({ ...campaignForm, niche: e.target.value })}
                    className="w-full bg-black/60 border border-zinc-800 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-400/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition-all"
                  />
                </div>
              </div>

              <button
                onClick={handleCreate}
                disabled={loading.create}
                className="w-full py-3 bg-white hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-xl shadow-white/5 cursor-pointer"
              >
                {loading.create ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                    Creating Campaign...
                  </>
                ) : (
                  <>
                    <Megaphone className="w-4 h-4 text-black" />
                    Create Campaign Under Project
                  </>
                )}
              </button>

              {error.create && <p className="text-xs text-rose-400 mt-2">{error.create}</p>}
            </div>
          </div>
        </div>

        {/* Right Column: Execution Controls & Registered Campaigns */}
        <div className="space-y-6">
          {/* Campaign Post Generator */}
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 shadow-xl backdrop-blur-xl">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-base font-bold text-white tracking-tight">Generate Campaign Post Draft</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                  Select Active Campaign *
                </label>
                {campaigns.length === 0 ? (
                  <p className="text-xs text-zinc-500 italic">No campaigns registered yet. Create one on the left.</p>
                ) : (
                  <select
                    value={postCampaignId}
                    onChange={(e) => setPostCampaignId(e.target.value)}
                    className="w-full bg-black/60 border border-zinc-800 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-400/20 rounded-xl px-4 py-2.5 text-sm text-white outline-none transition-all"
                  >
                    {campaigns.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.project_name || `Project #${c.project_id}`})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <button
                onClick={handleGeneratePost}
                disabled={loading.post || !postCampaignId}
                className="w-full py-3 bg-white hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-xl shadow-white/5 cursor-pointer"
              >
                {loading.post ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                    Generating post content...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-black" />
                    Generate Campaign Post
                  </>
                )}
              </button>

              {error.post && <p className="text-xs text-rose-400 mt-2">{error.post}</p>}
            </div>

            {generatedPost && (
              <div className="mt-4 p-4 rounded-xl bg-black/80 border border-zinc-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-white uppercase tracking-wider">Generated Post Draft</span>
                  <button
                    onClick={() => copyText(generatedPost.content || String(generatedPost))}
                    className="p-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 transition-colors cursor-pointer"
                  >
                    {copiedPost ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-xs text-zinc-200 leading-relaxed whitespace-pre-wrap font-sans">
                  {generatedPost.content || String(generatedPost)}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Active Campaigns List Grouped by Project */}
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 shadow-xl backdrop-blur-xl">
        <h2 className="text-base font-bold text-white flex items-center gap-2 mb-4 tracking-tight">
          <FolderKanban className="w-4 h-4 text-zinc-300" />
          Active Workspace Campaigns ({campaigns.length})
        </h2>

        {campaigns.length === 0 ? (
          <EmptyState
            icon={Megaphone}
            title="No campaigns created"
            description="Select a project above to register your first brand campaign."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {campaigns.map((c) => (
              <div key={c.id} className="p-4 rounded-xl bg-black/40 border border-zinc-800/80 hover:border-zinc-700 transition-all flex flex-col justify-between space-y-3 relative group">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-zinc-800 text-zinc-300 border border-zinc-700">
                      {c.project_name || `Project #${c.project_id}`}
                    </span>
                    <button
                      onClick={() => setDeleteConfirm(c)}
                      className="p-1 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Delete campaign"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <h3 className="text-sm font-bold text-white">{c.name}</h3>
                  {c.brand_voice && (
                    <p className="text-xs text-zinc-400 mt-1">
                      <span className="font-semibold text-zinc-300">Voice:</span> {c.brand_voice}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-zinc-800 text-[11px] text-zinc-400">
                  {c.tone && <span className="bg-zinc-800 px-2 py-0.5 rounded text-zinc-300">{c.tone}</span>}
                  {c.niche && <span className="bg-zinc-800 px-2 py-0.5 rounded text-zinc-300">{c.niche}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Campaign"
      >
        <div className="space-y-4">
          <p className="text-sm text-zinc-300">
            Are you sure you want to delete campaign <span className="text-white font-bold">{deleteConfirm?.name}</span>?
          </p>
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
            This action will permanently delete this campaign from the workspace.
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setDeleteConfirm(null)}
              className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-sm font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors cursor-pointer"
            >
              {deleting ? 'Deleting...' : 'Confirm Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
