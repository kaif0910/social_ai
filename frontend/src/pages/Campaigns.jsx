import { useState } from 'react';
import { createCampaign, generateCampaignReply, generatePost } from '../api';
import Card from '../components/Card';
import { Megaphone, MessageSquare, FileText } from 'lucide-react';

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

  const [loading, setLoading] = useState({ create: false, reply: false, post: false });

  const handleCreate = async () => {
    setLoading((l) => ({ ...l, create: true }));
    try {
      const res = await createCampaign(campaignForm);
      setCreatedCampaign(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading((l) => ({ ...l, create: false }));
    }
  };

  const handleReply = async () => {
    setLoading((l) => ({ ...l, reply: true }));
    try {
      const res = await generateCampaignReply(replyForm.campaignId, replyForm.comment);
      setGeneratedReply(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading((l) => ({ ...l, reply: false }));
    }
  };

  const handleGeneratePost = async () => {
    setLoading((l) => ({ ...l, post: true }));
    try {
      const res = await generatePost(postCampaignId);
      setGeneratedPost(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading((l) => ({ ...l, post: false }));
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-2">Campaigns</h1>
      <p className="text-slate-400 mb-8">
        Create campaigns and generate AI-powered content
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Create Campaign */}
        <Card title="Create Campaign">
          <div className="space-y-3">
            <input
              placeholder="Campaign name"
              value={campaignForm.name}
              onChange={(e) =>
                setCampaignForm({ ...campaignForm, name: e.target.value })
              }
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
            <input
              placeholder="Brand voice (e.g., friendly, professional)"
              value={campaignForm.brand_voice}
              onChange={(e) =>
                setCampaignForm({ ...campaignForm, brand_voice: e.target.value })
              }
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
            <input
              placeholder="Tone (e.g., casual, formal)"
              value={campaignForm.tone}
              onChange={(e) =>
                setCampaignForm({ ...campaignForm, tone: e.target.value })
              }
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
            <input
              placeholder="Niche (e.g., SaaS, fitness)"
              value={campaignForm.niche}
              onChange={(e) =>
                setCampaignForm({ ...campaignForm, niche: e.target.value })
              }
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={handleCreate}
              disabled={loading.create || !campaignForm.name}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <Megaphone className="w-4 h-4" />
              {loading.create ? 'Creating...' : 'Create Campaign'}
            </button>
          </div>
          {createdCampaign && (
            <div className="mt-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <p className="text-green-400 text-sm font-medium">
                Campaign created! ID: {createdCampaign.id}
              </p>
              <pre className="text-xs text-slate-300 mt-2 whitespace-pre-wrap">
                {JSON.stringify(createdCampaign, null, 2)}
              </pre>
            </div>
          )}
        </Card>

        {/* Generate Reply */}
        <Card title="Generate AI Reply">
          <div className="space-y-3">
            <input
              placeholder="Campaign ID"
              value={replyForm.campaignId}
              onChange={(e) =>
                setReplyForm({ ...replyForm, campaignId: e.target.value })
              }
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
            <textarea
              placeholder="Comment to reply to..."
              value={replyForm.comment}
              onChange={(e) =>
                setReplyForm({ ...replyForm, comment: e.target.value })
              }
              rows={4}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 resize-none"
            />
            <button
              onClick={handleReply}
              disabled={loading.reply || !replyForm.campaignId || !replyForm.comment}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              {loading.reply ? 'Generating...' : 'Generate Reply'}
            </button>
          </div>
          {generatedReply && (
            <div className="mt-4 p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
              <p className="text-xs text-indigo-400 font-medium mb-1">AI Reply</p>
              <p className="text-white text-sm">{generatedReply.reply}</p>
            </div>
          )}
        </Card>

        {/* Generate Post */}
        <Card title="Generate AI Post">
          <div className="space-y-3">
            <input
              placeholder="Campaign ID"
              value={postCampaignId}
              onChange={(e) => setPostCampaignId(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={handleGeneratePost}
              disabled={loading.post || !postCampaignId}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <FileText className="w-4 h-4" />
              {loading.post ? 'Generating...' : 'Generate Post'}
            </button>
          </div>
          {generatedPost && (
            <div className="mt-4 p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
              <p className="text-xs text-indigo-400 font-medium mb-1">Generated Post</p>
              <p className="text-white text-sm">{generatedPost.content}</p>
              <p className="text-xs text-slate-400 mt-2">
                Platform: {generatedPost.platform} | Status: {generatedPost.status}
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
