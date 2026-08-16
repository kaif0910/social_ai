import { useState } from 'react';
import { createCampaign, generateCampaignReply, generatePost } from '../api';
import { useToast } from '../components/useToast';
import {
  Megaphone,
  MessageSquare,
  FileText,
  Loader2,
  CheckCircle2,
  Copy,
  Check,
  Sparkles,
  Tag
} from 'lucide-react';

export default function Campaigns() {
  const toast = useToast();

  // ── Create Campaign ──
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    brand_voice: '',
    tone: '',
    niche: '',
  });
  const [createdCampaign, setCreatedCampaign] = useState(null);

  // ── Generate Reply ──
  const [replyForm, setReplyForm] = useState({ campaignId: '', comment: '' });
  const [generatedReply, setGeneratedReply] = useState(null);

  // ── Generate Post ──
  const [postCampaignId, setPostCampaignId] = useState('');
  const [generatedPost, setGeneratedPost] = useState(null);

  const [loading, setLoading] = useState({
    create: false,
    reply: false,
    post: false,
  });
  const [error, setError] = useState({ create: null, reply: null, post: null });
  const [copiedReply, setCopiedReply] = useState(false);
  const [copiedPost, setCopiedPost] = useState(false);

  const handleCreate = async () => {
    if (!campaignForm.name.trim()) return;
    setLoading((l) => ({ ...l, create: true }));
    setError((e) => ({ ...e, create: null }));
    try {
      const res = await createCampaign(campaignForm);
      setCreatedCampaign(res.data);
      toast.success('Campaign created successfully!');
      // Pre-fill campaign ID for fast testing
      setReplyForm((r) => ({ ...r, campaignId: res.data.id }));
      setPostCampaignId(res.data.id);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.error || 'Failed to create campaign';
      setError((e) => ({ ...e, create: msg }));
      toast.error(msg);
    } finally {
      setLoading((l) => ({ ...l, create: false }));
    }
  };

  const handleReply = async () => {
    if (!replyForm.campaignId || !replyForm.comment.trim()) return;
    setLoading((l) => ({ ...l, reply: true }));
    setError((e) => ({ ...e, reply: null }));
    try {
      const res = await generateCampaignReply(
        replyForm.campaignId,
        replyForm.comment
      );
      setGeneratedReply(res.data);
      toast.success('Campaign reply generated!');
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.error || 'Failed to generate reply';
      setError((e) => ({ ...e, reply: msg }));
      toast.error(msg);
    } finally {
      setLoading((l) => ({ ...l, reply: false }));
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

  const copyText = (text, setter) => {
    navigator.clipboard.writeText(text);
    setter(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setter(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Brand Campaigns & Content Studio
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Define brand voice guidelines, execute targeted marketing campaigns, and auto-generate branded copy.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Create Campaign */}
        <div className="space-y-6">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <Megaphone className="w-4 h-4 text-amber-400" />
              </div>
              <h2 className="text-base font-bold text-white">Create Brand Campaign</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Campaign Name *
                </label>
                <input
                  placeholder="e.g., Summer SaaS Growth Drive"
                  value={campaignForm.name}
                  onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })}
                  className="w-full bg-slate-950/60 border border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                  Brand Voice Guidelines
                </label>
                <input
                  placeholder="e.g., authoritative yet friendly, technical, developer-centric"
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
                disabled={loading.create || !campaignForm.name.trim()}
                className="w-full py-3 bg-white hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-xl shadow-white/5 cursor-pointer"
              >
                {loading.create ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                    Initializing Campaign...
                  </>
                ) : (
                  <>
                    <Megaphone className="w-4 h-4 text-black" />
                    Create Campaign
                  </>
                )}
              </button>

              {error.create && <p className="text-xs text-rose-400 mt-2">{error.create}</p>}
            </div>
          </div>

          {createdCampaign && (
            <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 shadow-xl backdrop-blur-xl">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Active Campaign Registered</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-xl bg-black/60 border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase block">Campaign ID</span>
                  <span className="font-mono text-white font-bold">{createdCampaign.id}</span>
                </div>
                <div className="p-3 rounded-xl bg-black/60 border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase block">Campaign Name</span>
                  <span className="text-zinc-200 font-semibold">{createdCampaign.name}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Execution Controls */}
        <div className="space-y-6">
          {/* Campaign Reply Generator */}
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 shadow-xl backdrop-blur-xl">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-base font-bold text-white tracking-tight">Generate Campaign Reply</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                  Target Campaign ID *
                </label>
                <input
                  placeholder="e.g., 1"
                  value={replyForm.campaignId}
                  onChange={(e) => setReplyForm({ ...replyForm, campaignId: e.target.value })}
                  className="w-full bg-black/60 border border-zinc-800 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-400/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                  Target Comment *
                </label>
                <textarea
                  placeholder="Paste comment text to respond using campaign voice..."
                  value={replyForm.comment}
                  onChange={(e) => setReplyForm({ ...replyForm, comment: e.target.value })}
                  rows={2}
                  className="w-full bg-black/60 border border-zinc-800 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-400/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition-all resize-none"
                />
              </div>

              <button
                onClick={handleReply}
                disabled={loading.reply || !replyForm.campaignId || !replyForm.comment.trim()}
                className="w-full py-3 bg-white hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-xl shadow-white/5 cursor-pointer"
              >
                {loading.reply ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                    Synthesizing reply...
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-4 h-4 text-black" />
                    Generate Campaign Reply
                  </>
                )}
              </button>

              {error.reply && <p className="text-xs text-rose-400 mt-2">{error.reply}</p>}
            </div>

            {generatedReply && (
              <div className="mt-4 p-4 rounded-xl bg-black/80 border border-zinc-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-white uppercase tracking-wider">AI Campaign Output</span>
                  <button
                    onClick={() => copyText(typeof generatedReply === 'string' ? generatedReply : generatedReply.reply || JSON.stringify(generatedReply), setCopiedReply)}
                    className="p-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 transition-colors cursor-pointer"
                  >
                    {copiedReply ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-xs text-zinc-200 leading-relaxed">
                  {typeof generatedReply === 'string' ? generatedReply : (generatedReply.reply || JSON.stringify(generatedReply))}
                </p>
              </div>
            )}
          </div>

          {/* Campaign Post Generator */}
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 shadow-xl backdrop-blur-xl">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-base font-bold text-white tracking-tight">Generate Campaign Post</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                  Target Campaign ID *
                </label>
                <input
                  placeholder="e.g., 1"
                  value={postCampaignId}
                  onChange={(e) => setPostCampaignId(e.target.value)}
                  className="w-full bg-black/60 border border-zinc-800 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-400/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition-all"
                />
              </div>

              <button
                onClick={handleGeneratePost}
                disabled={loading.post || !postCampaignId}
                className="w-full py-3 bg-white hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-xl shadow-white/5 cursor-pointer"
              >
                {loading.post ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                    Generating post...
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
                    onClick={() => copyText(generatedPost.content || String(generatedPost), setCopiedPost)}
                    className="p-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 transition-colors cursor-pointer"
                  >
                    {copiedPost ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-xs text-zinc-200 leading-relaxed whitespace-pre-wrap">
                  {generatedPost.content || String(generatedPost)}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
