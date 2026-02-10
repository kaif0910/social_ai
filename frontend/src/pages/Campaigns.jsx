import { useState } from 'react';
import { createCampaign, generateCampaignReply, generatePost } from '../api';
import Card from '../components/Card';
import {
  Megaphone,
  MessageSquare,
  FileText,
  Loader2,
  CheckCircle2,
  Copy,
  Check,
  Sparkles,
} from 'lucide-react';

export default function Campaigns() {
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
    setLoading((l) => ({ ...l, create: true }));
    setError((e) => ({ ...e, create: null }));
    try {
      const res = await createCampaign(campaignForm);
      setCreatedCampaign(res.data);
    } catch (err) {
      console.error(err);
      setError((e) => ({
        ...e,
        create: err.response?.data?.error || 'Failed to create campaign',
      }));
    } finally {
      setLoading((l) => ({ ...l, create: false }));
    }
  };

  const handleReply = async () => {
    setLoading((l) => ({ ...l, reply: true }));
    setError((e) => ({ ...e, reply: null }));
    try {
      const res = await generateCampaignReply(
        replyForm.campaignId,
        replyForm.comment
      );
      setGeneratedReply(res.data);
    } catch (err) {
      console.error(err);
      setError((e) => ({
        ...e,
        reply: err.response?.data?.error || 'Failed to generate reply',
      }));
    } finally {
      setLoading((l) => ({ ...l, reply: false }));
    }
  };

  const handleGeneratePost = async () => {
    setLoading((l) => ({ ...l, post: true }));
    setError((e) => ({ ...e, post: null }));
    try {
      const res = await generatePost(postCampaignId);
      setGeneratedPost(res.data);
    } catch (err) {
      console.error(err);
      setError((e) => ({
        ...e,
        post: err.response?.data?.error || 'Failed to generate post',
      }));
    } finally {
      setLoading((l) => ({ ...l, post: false }));
    }
  };

  const copyText = (text, setter) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Campaigns</h1>
          <p className="text-slate-400 mt-1">
            Create campaigns and generate AI-powered content
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Create Campaign */}
        <div className="space-y-4">
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                <Megaphone className="w-4 h-4 text-orange-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">
                Create Campaign
              </h3>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Campaign Name *
                </label>
                <input
                  placeholder="My Product Launch"
                  value={campaignForm.name}
                  onChange={(e) =>
                    setCampaignForm({ ...campaignForm, name: e.target.value })
                  }
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Brand Voice
                </label>
                <input
                  placeholder="e.g., friendly, professional, witty"
                  value={campaignForm.brand_voice}
                  onChange={(e) =>
                    setCampaignForm({
                      ...campaignForm,
                      brand_voice: e.target.value,
                    })
                  }
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Tone
                  </label>
                  <input
                    placeholder="casual, formal"
                    value={campaignForm.tone}
                    onChange={(e) =>
                      setCampaignForm({
                        ...campaignForm,
                        tone: e.target.value,
                      })
                    }
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Niche
                  </label>
                  <input
                    placeholder="SaaS, fitness"
                    value={campaignForm.niche}
                    onChange={(e) =>
                      setCampaignForm({
                        ...campaignForm,
                        niche: e.target.value,
                      })
                    }
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
              <button
                onClick={handleCreate}
                disabled={loading.create || !campaignForm.name}
                className="w-full py-3 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
              >
                {loading.create ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Megaphone className="w-4 h-4" />
                    Create Campaign
                  </>
                )}
              </button>
              {error.create && (
                <p className="text-red-400 text-sm">{error.create}</p>
              )}
            </div>
          </Card>

          {createdCampaign && (
            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <p className="text-green-400 font-semibold text-sm">
                  Campaign Created
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 rounded-lg bg-slate-800/50">
                  <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide">
                    ID
                  </p>
                  <p className="text-white font-mono text-sm">
                    {createdCampaign.id}
                  </p>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-800/50">
                  <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide">
                    Name
                  </p>
                  <p className="text-white text-sm">{createdCampaign.name}</p>
                </div>
                {createdCampaign.brand_voice && (
                  <div className="p-2.5 rounded-lg bg-slate-800/50">
                    <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide">
                      Voice
                    </p>
                    <p className="text-white text-sm">
                      {createdCampaign.brand_voice}
                    </p>
                  </div>
                )}
                {createdCampaign.tone && (
                  <div className="p-2.5 rounded-lg bg-slate-800/50">
                    <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide">
                      Tone
                    </p>
                    <p className="text-white text-sm capitalize">
                      {createdCampaign.tone}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Generate Reply */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">AI Reply</h3>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Campaign ID *
                </label>
                <input
                  placeholder="Enter campaign ID"
                  value={replyForm.campaignId}
                  onChange={(e) =>
                    setReplyForm({ ...replyForm, campaignId: e.target.value })
                  }
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Comment to Reply To *
                </label>
                <textarea
                  placeholder="Paste the comment you want to reply to..."
                  value={replyForm.comment}
                  onChange={(e) =>
                    setReplyForm({ ...replyForm, comment: e.target.value })
                  }
                  rows={3}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>
              <button
                onClick={handleReply}
                disabled={
                  loading.reply ||
                  !replyForm.campaignId ||
                  !replyForm.comment
                }
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
              >
                {loading.reply ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-4 h-4" />
                    Generate Reply
                  </>
                )}
              </button>
              {error.reply && (
                <p className="text-red-400 text-sm">{error.reply}</p>
              )}
            </div>
            {generatedReply && (
              <div className="mt-4 p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-xs text-purple-400 font-semibold mb-2">
                      AI Reply
                    </p>
                    <p className="text-sm text-white leading-relaxed">
                      {typeof generatedReply === 'string'
                        ? generatedReply
                        : generatedReply.reply ||
                          generatedReply.response ||
                          generatedReply.text ||
                          generatedReply.content ||
                          Object.values(generatedReply).find(
                            (v) => typeof v === 'string' && v.length > 20
                          ) ||
                          String(generatedReply)}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      copyText(
                        typeof generatedReply === 'string'
                          ? generatedReply
                          : generatedReply.reply || JSON.stringify(generatedReply),
                        setCopiedReply
                      )
                    }
                    className="text-slate-400 hover:text-white p-1.5 rounded hover:bg-slate-700 transition-colors shrink-0"
                  >
                    {copiedReply ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            )}
          </Card>

          {/* Generate Post */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                <FileText className="w-4 h-4 text-cyan-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">
                Generate Post
              </h3>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Campaign ID *
                </label>
                <input
                  placeholder="Enter campaign ID"
                  value={postCampaignId}
                  onChange={(e) => setPostCampaignId(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <button
                onClick={handleGeneratePost}
                disabled={loading.post || !postCampaignId}
                className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
              >
                {loading.post ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Post
                  </>
                )}
              </button>
              {error.post && (
                <p className="text-red-400 text-sm">{error.post}</p>
              )}
            </div>
            {generatedPost && (
              <div className="mt-4 p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="text-xs text-cyan-400 font-semibold">
                    Generated Post
                  </p>
                  <button
                    onClick={() =>
                      copyText(
                        generatedPost.content ||
                          generatedPost.post ||
                          String(generatedPost),
                        setCopiedPost
                      )
                    }
                    className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-700 transition-colors shrink-0"
                  >
                    {copiedPost ? (
                      <Check className="w-3.5 h-3.5 text-green-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
                <p className="text-sm text-white leading-relaxed">
                  {generatedPost.content ||
                    generatedPost.post ||
                    generatedPost.body ||
                    (typeof generatedPost === 'string'
                      ? generatedPost
                      : Object.values(generatedPost).find(
                          (v) => typeof v === 'string' && v.length > 20
                        ) || String(generatedPost))}
                </p>
                {(generatedPost.platform || generatedPost.status) && (
                  <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-600/30">
                    {generatedPost.platform && (
                      <span className="text-xs text-slate-400 px-2 py-1 rounded-md bg-slate-700/50 capitalize">
                        {generatedPost.platform}
                      </span>
                    )}
                    {generatedPost.status && (
                      <span className="text-xs text-slate-400 px-2 py-1 rounded-md bg-slate-700/50 capitalize">
                        {generatedPost.status}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
