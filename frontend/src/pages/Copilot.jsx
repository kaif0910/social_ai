import { useState } from 'react';
import { copilotGeneratePost, copilotGenerateReplies } from '../api';
import Card from '../components/Card';
import {
  Bot,
  Send,
  MessageSquare,
  Loader2,
  Copy,
  Check,
  Sparkles,
  LinkIcon,
} from 'lucide-react';

export default function Copilot() {
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
    setLoading((l) => ({ ...l, post: true }));
    setGeneratedPost(null);
    setError((e) => ({ ...e, post: null }));
    try {
      const res = await copilotGeneratePost(postForm);
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

  const handleGenerateReplies = async () => {
    setLoading((l) => ({ ...l, replies: true }));
    setGeneratedReplies(null);
    setError((e) => ({ ...e, replies: null }));
    try {
      const res = await copilotGenerateReplies(replyForm);
      setGeneratedReplies(res.data);
    } catch (err) {
      console.error(err);
      setError((e) => ({
        ...e,
        replies: err.response?.data?.error || 'Failed to generate replies',
      }));
    } finally {
      setLoading((l) => ({ ...l, replies: false }));
    }
  };

  const copyText = (text, setter, val) => {
    navigator.clipboard.writeText(text);
    setter(val ?? true);
    setTimeout(() => setter(val === undefined ? false : null), 2000);
  };

  const extractPostContent = (data) => {
    if (typeof data === 'string') return data;
    if (data?.post) return data.post;
    if (data?.content) return data.content;
    if (data?.title && data?.body)
      return `${data.title}\n\n${data.body}`;
    return null;
  };

  const postContent = generatedPost ? extractPostContent(generatedPost) : null;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">AI Copilot</h1>
          <p className="text-slate-400 mt-1">
            Generate social media posts and smart replies powered by AI
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Generate Post */}
        <div className="space-y-4">
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                <Send className="w-4 h-4 text-indigo-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">
                Generate Post
              </h3>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Project Idea *
                </label>
                <textarea
                  placeholder="Describe your project idea..."
                  value={postForm.projectIdea}
                  onChange={(e) =>
                    setPostForm({ ...postForm, projectIdea: e.target.value })
                  }
                  rows={3}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Update / Announcement *
                </label>
                <textarea
                  placeholder="New feature, launch, milestone..."
                  value={postForm.update}
                  onChange={(e) =>
                    setPostForm({ ...postForm, update: e.target.value })
                  }
                  rows={2}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Platform
                </label>
                <select
                  value={postForm.platform}
                  onChange={(e) =>
                    setPostForm({ ...postForm, platform: e.target.value })
                  }
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="reddit">Reddit</option>
                  <option value="twitter">Twitter / X</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="hackernews">Hacker News</option>
                </select>
              </div>
              <button
                onClick={handleGeneratePost}
                disabled={
                  loading.post || !postForm.projectIdea || !postForm.update
                }
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
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
          </Card>

          {/* Generated Post Result */}
          {generatedPost && (
            <Card>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <p className="text-sm text-indigo-400 font-semibold">
                    Generated Content
                  </p>
                </div>
                {postContent && (
                  <button
                    onClick={() =>
                      copyText(postContent, setCopiedPost)
                    }
                    className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-700 transition-colors"
                  >
                    {copiedPost ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
              {postContent ? (
                <div className="p-4 rounded-lg bg-slate-700/50 border border-slate-600/50">
                  <p className="text-sm text-white whitespace-pre-wrap leading-relaxed">
                    {postContent}
                  </p>
                </div>
              ) : (
                /* Handle unexpected object shape gracefully */
                <div className="space-y-2">
                  {Object.entries(generatedPost).map(([key, val]) => (
                    <div key={key} className="p-3 rounded-lg bg-slate-700/50">
                      <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide mb-1">
                        {key.replace(/_/g, ' ')}
                      </p>
                      <p className="text-sm text-white">
                        {typeof val === 'string'
                          ? val
                          : Array.isArray(val)
                          ? val.join(', ')
                          : String(val)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}
        </div>

        {/* Generate Replies */}
        <div className="space-y-4">
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">
                Smart Replies
              </h3>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Reddit Post URL *
                </label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    placeholder="https://www.reddit.com/r/..."
                    value={replyForm.postUrl}
                    onChange={(e) =>
                      setReplyForm({ ...replyForm, postUrl: e.target.value })
                    }
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Feature Context *
                </label>
                <textarea
                  placeholder="What are you building / promoting?"
                  value={replyForm.featureContext}
                  onChange={(e) =>
                    setReplyForm({
                      ...replyForm,
                      featureContext: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>
              <button
                onClick={handleGenerateReplies}
                disabled={
                  loading.replies ||
                  !replyForm.postUrl ||
                  !replyForm.featureContext
                }
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
              >
                {loading.replies ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating replies...
                  </>
                ) : (
                  <>
                    <Bot className="w-4 h-4" />
                    Generate Replies
                  </>
                )}
              </button>
              {error.replies && (
                <p className="text-red-400 text-sm">{error.replies}</p>
              )}
            </div>
          </Card>

          {/* Generated Replies Result */}
          {generatedReplies && (
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <Bot className="w-4 h-4 text-purple-400" />
                <p className="text-sm text-purple-400 font-semibold">
                  Generated Replies (
                  {Array.isArray(generatedReplies)
                    ? generatedReplies.length
                    : '1'}
                  )
                </p>
              </div>
              <div className="space-y-3">
                {Array.isArray(generatedReplies) ? (
                  generatedReplies.map((r, i) => {
                    const comment =
                      typeof r === 'object' ? r.comment : null;
                    const reply =
                      typeof r === 'object'
                        ? r.reply || r.response || r.text
                        : r;
                    return (
                      <div
                        key={i}
                        className="rounded-lg bg-slate-700/50 border border-slate-600/50 overflow-hidden"
                      >
                        {comment && (
                          <div className="px-4 py-2.5 bg-slate-700/80 border-b border-slate-600/30">
                            <p className="text-xs text-slate-400 font-medium mb-0.5">
                              Original Comment
                            </p>
                            <p className="text-sm text-slate-300 line-clamp-2">
                              {comment}
                            </p>
                          </div>
                        )}
                        <div className="p-4">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="text-xs text-purple-400 font-medium mb-1">
                                AI Reply
                              </p>
                              <p className="text-sm text-white leading-relaxed">
                                {reply || String(r)}
                              </p>
                            </div>
                            <button
                              onClick={() =>
                                copyText(
                                  reply || String(r),
                                  setCopiedReply,
                                  i
                                )
                              }
                              className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-600 transition-colors shrink-0"
                            >
                              {copiedReply === i ? (
                                <Check className="w-3.5 h-3.5 text-green-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : typeof generatedReplies === 'object' ? (
                  <div className="space-y-2">
                    {Object.entries(generatedReplies).map(([key, val]) => (
                      <div key={key} className="p-3 rounded-lg bg-slate-700/50">
                        <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide mb-1">
                          {key.replace(/_/g, ' ')}
                        </p>
                        <p className="text-sm text-white">
                          {typeof val === 'string' ? val : String(val)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-lg bg-slate-700/50">
                    <p className="text-sm text-white">{String(generatedReplies)}</p>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
