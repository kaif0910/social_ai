import { useState } from 'react';
import { copilotGeneratePost, copilotGenerateReplies } from '../api';
import { useToast } from '../components/useToast';
import {
  Bot,
  Send,
  MessageSquare,
  Loader2,
  Copy,
  Check,
  Sparkles,
  LinkIcon
} from 'lucide-react';

export default function Copilot() {
  const toast = useToast();

  // ── Generate Post ──
  const [postForm, setPostForm] = useState({
    projectIdea: '',
    update: '',
    platform: 'reddit',
  });
  const [generatedPost, setGeneratedPost] = useState(null);

  // ── Generate Replies ──
  const [replyForm, setReplyForm] = useState({
    postUrl: '',
    featureContext: '',
  });
  const [generatedReplies, setGeneratedReplies] = useState(null);

  const [loading, setLoading] = useState({ post: false, replies: false });
  const [error, setError] = useState({ post: null, replies: null });
  const [copiedPost, setCopiedPost] = useState(false);
  const [copiedReply, setCopiedReply] = useState(null);

  const handleGeneratePost = async () => {
    if (!postForm.projectIdea.trim() || !postForm.update.trim()) return;
    setLoading((l) => ({ ...l, post: true }));
    setGeneratedPost(null);
    setError((e) => ({ ...e, post: null }));
    try {
      const res = await copilotGeneratePost(postForm);
      setGeneratedPost(res.data);
      toast.success('Social post content generated!');
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.error || 'Failed to generate post';
      setError((e) => ({ ...e, post: msg }));
      toast.error(msg);
    } finally {
      setLoading((l) => ({ ...l, post: false }));
    }
  };

  const handleGenerateReplies = async () => {
    if (!replyForm.postUrl.trim() || !replyForm.featureContext.trim()) return;
    setLoading((l) => ({ ...l, replies: true }));
    setGeneratedReplies(null);
    setError((e) => ({ ...e, replies: null }));
    try {
      const res = await copilotGenerateReplies(replyForm);
      setGeneratedReplies(res.data);
      toast.success('Smart community replies generated!');
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.error || 'Failed to generate replies';
      setError((e) => ({ ...e, replies: msg }));
      toast.error(msg);
    } finally {
      setLoading((l) => ({ ...l, replies: false }));
    }
  };

  const copyText = (text, setter, val) => {
    navigator.clipboard.writeText(text);
    setter(val ?? true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setter(val === undefined ? false : null), 2000);
  };

  const extractPostContent = (data) => {
    if (typeof data === 'string') return data;
    if (data?.post) return data.post;
    if (data?.content) return data.content;
    if (data?.title && data?.body) return `${data.title}\n\n${data.body}`;
    return null;
  };

  const postContent = generatedPost ? extractPostContent(generatedPost) : null;

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          AI Content & Engagement Copilot
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Draft high-converting product announcements and generate intelligent replies to community feedback.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Post Generator */}
        <div className="space-y-6">
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 shadow-xl backdrop-blur-xl">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                <Send className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-base font-bold text-white tracking-tight">Generate Social Post</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                  Project / Product Concept *
                </label>
                <textarea
                  placeholder="e.g., AI Code Assistant that suggests inline refactorings..."
                  value={postForm.projectIdea}
                  onChange={(e) => setPostForm({ ...postForm, projectIdea: e.target.value })}
                  rows={2}
                  className="w-full bg-black/60 border border-zinc-800 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-400/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                  Feature Update or Announcement *
                </label>
                <textarea
                  placeholder="e.g., Added support for Python and TypeScript with 2x faster inline completions..."
                  value={postForm.update}
                  onChange={(e) => setPostForm({ ...postForm, update: e.target.value })}
                  rows={2}
                  className="w-full bg-black/60 border border-zinc-800 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-400/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                  Target Platform
                </label>
                <select
                  value={postForm.platform}
                  onChange={(e) => setPostForm({ ...postForm, platform: e.target.value })}
                  className="w-full bg-black/60 border border-zinc-800 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-400/20 rounded-xl px-4 py-2.5 text-sm text-white outline-none transition-all"
                >
                  <option value="reddit">Reddit (r/SaaS, r/startups)</option>
                  <option value="twitter">Twitter / X Post</option>
                  <option value="linkedin">LinkedIn Update</option>
                  <option value="hackernews">Hacker News Show HN</option>
                </select>
              </div>

              <button
                onClick={handleGeneratePost}
                disabled={loading.post || !postForm.projectIdea.trim() || !postForm.update.trim()}
                className="w-full py-3 bg-white hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-xl shadow-white/5 cursor-pointer"
              >
                {loading.post ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                    Crafting post content...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-black" />
                    Generate Post Draft
                  </>
                )}
              </button>

              {error.post && (
                <p className="text-xs text-rose-400 mt-2">{error.post}</p>
              )}
            </div>
          </div>

          {/* Generated Post Result Card */}
          {generatedPost && (
            <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 shadow-xl backdrop-blur-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-white" /> Generated Post Draft
                </span>
                {postContent && (
                  <button
                    onClick={() => copyText(postContent, setCopiedPost)}
                    className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
                    title="Copy post"
                  >
                    {copiedPost ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                )}
              </div>

              {postContent ? (
                <div className="p-4 rounded-xl bg-black/80 border border-zinc-800 text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap font-sans">
                  {postContent}
                </div>
              ) : (
                <div className="space-y-2">
                  {Object.entries(generatedPost).map(([key, val]) => (
                    <div key={key} className="p-3 rounded-xl bg-black/60 border border-zinc-800">
                      <span className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">{key.replace(/_/g, ' ')}</span>
                      <p className="text-xs text-zinc-200">{typeof val === 'string' ? val : JSON.stringify(val)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Smart Replies Generator */}
        <div className="space-y-6">
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 shadow-xl backdrop-blur-xl">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-base font-bold text-white tracking-tight">Smart Replies Copilot</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                  Reddit Post URL *
                </label>
                <div className="relative">
                  <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    placeholder="https://www.reddit.com/r/SaaS/comments/..."
                    value={replyForm.postUrl}
                    onChange={(e) => setReplyForm({ ...replyForm, postUrl: e.target.value })}
                    className="w-full bg-black/60 border border-zinc-800 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-400/20 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                  Product / Feature Context *
                </label>
                <textarea
                  placeholder="Context about what product features you are offering or explaining..."
                  value={replyForm.featureContext}
                  onChange={(e) => setReplyForm({ ...replyForm, featureContext: e.target.value })}
                  rows={3}
                  className="w-full bg-black/60 border border-zinc-800 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-400/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition-all resize-none"
                />
              </div>

              <button
                onClick={handleGenerateReplies}
                disabled={loading.replies || !replyForm.postUrl.trim() || !replyForm.featureContext.trim()}
                className="w-full py-3 bg-white hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-xl shadow-white/5 cursor-pointer"
              >
                {loading.replies ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                    Parsing comments & writing responses...
                  </>
                ) : (
                  <>
                    <Bot className="w-4 h-4 text-black" />
                    Generate Smart Replies
                  </>
                )}
              </button>

              {error.replies && (
                <p className="text-xs text-rose-400 mt-2">{error.replies}</p>
              )}
            </div>
          </div>

          {/* Generated Replies List */}
          {generatedReplies && (
            <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 shadow-xl backdrop-blur-xl space-y-4">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Bot className="w-3.5 h-3.5 text-white" /> Generated Engagement Replies
              </span>

              <div className="space-y-3">
                {Array.isArray(generatedReplies) ? (
                  generatedReplies.map((r, i) => {
                    const comment = typeof r === 'object' ? r.comment : null;
                    const reply = typeof r === 'object' ? (r.reply || r.response || r.text) : r;
                    return (
                      <div key={i} className="rounded-xl bg-black/80 border border-zinc-800 overflow-hidden">
                        {comment && (
                          <div className="px-4 py-2.5 bg-neutral-900 border-b border-zinc-800 text-xs text-zinc-400">
                            <span className="font-semibold text-zinc-200">Comment:</span> "{comment}"
                          </div>
                        )}
                        <div className="p-4 flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Suggested Reply</span>
                            <p className="text-xs text-zinc-200 leading-relaxed">{reply || String(r)}</p>
                          </div>
                          <button
                            onClick={() => copyText(reply || String(r), setCopiedReply, i)}
                            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors shrink-0 cursor-pointer"
                          >
                            {copiedReply === i ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-4 rounded-xl bg-black/80 border border-zinc-800 text-xs text-zinc-200">
                    {JSON.stringify(generatedReplies)}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
