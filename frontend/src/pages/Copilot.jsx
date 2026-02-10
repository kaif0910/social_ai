import { useState } from 'react';
import { copilotGeneratePost, copilotGenerateReplies } from '../api';
import Card from '../components/Card';
import { Bot, Send, MessageSquare } from 'lucide-react';

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

  const handleGeneratePost = async () => {
    setLoading((l) => ({ ...l, post: true }));
    setGeneratedPost(null);
    try {
      const res = await copilotGeneratePost(postForm);
      setGeneratedPost(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading((l) => ({ ...l, post: false }));
    }
  };

  const handleGenerateReplies = async () => {
    setLoading((l) => ({ ...l, replies: true }));
    setGeneratedReplies(null);
    try {
      const res = await copilotGenerateReplies(replyForm);
      setGeneratedReplies(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading((l) => ({ ...l, replies: false }));
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <Bot className="w-8 h-8 text-indigo-400" />
        <h1 className="text-3xl font-bold text-white">AI Copilot</h1>
      </div>
      <p className="text-slate-400 mb-8">
        Generate social media posts and smart replies
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Generate Post */}
        <Card title="Generate Post">
          <div className="space-y-3">
            <textarea
              placeholder="Describe your project idea..."
              value={postForm.projectIdea}
              onChange={(e) =>
                setPostForm({ ...postForm, projectIdea: e.target.value })
              }
              rows={3}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 resize-none"
            />
            <textarea
              placeholder="What's the update? (new feature, launch, etc.)"
              value={postForm.update}
              onChange={(e) =>
                setPostForm({ ...postForm, update: e.target.value })
              }
              rows={2}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 resize-none"
            />
            <select
              value={postForm.platform}
              onChange={(e) =>
                setPostForm({ ...postForm, platform: e.target.value })
              }
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="reddit">Reddit</option>
              <option value="twitter">Twitter</option>
              <option value="linkedin">LinkedIn</option>
              <option value="hackernews">Hacker News</option>
            </select>
            <button
              onClick={handleGeneratePost}
              disabled={
                loading.post || !postForm.projectIdea || !postForm.update
              }
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <Send className="w-4 h-4" />
              {loading.post ? 'Generating...' : 'Generate Post'}
            </button>
          </div>
          {generatedPost && (
            <div className="mt-4 p-4 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
              <p className="text-xs text-indigo-400 font-medium mb-2">
                Generated Content
              </p>
              <pre className="text-sm text-white whitespace-pre-wrap">
                {typeof generatedPost === 'string'
                  ? generatedPost
                  : JSON.stringify(generatedPost, null, 2)}
              </pre>
            </div>
          )}
        </Card>

        {/* Generate Replies */}
        <Card title="Generate Smart Replies">
          <div className="space-y-3">
            <input
              placeholder="Reddit post URL"
              value={replyForm.postUrl}
              onChange={(e) =>
                setReplyForm({ ...replyForm, postUrl: e.target.value })
              }
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
            <textarea
              placeholder="Feature context (what you're building / promoting)"
              value={replyForm.featureContext}
              onChange={(e) =>
                setReplyForm({ ...replyForm, featureContext: e.target.value })
              }
              rows={3}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 resize-none"
            />
            <button
              onClick={handleGenerateReplies}
              disabled={
                loading.replies ||
                !replyForm.postUrl ||
                !replyForm.featureContext
              }
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              {loading.replies ? 'Generating...' : 'Generate Replies'}
            </button>
          </div>
          {generatedReplies && (
            <div className="mt-4 space-y-3">
              {Array.isArray(generatedReplies) ? (
                generatedReplies.map((r, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg bg-slate-700/50 border border-slate-600"
                  >
                    {r.comment && (
                      <p className="text-xs text-slate-400 mb-1">
                        Comment: {r.comment}
                      </p>
                    )}
                    <p className="text-sm text-white">{r.reply || JSON.stringify(r)}</p>
                  </div>
                ))
              ) : (
                <pre className="text-sm text-slate-300 whitespace-pre-wrap">
                  {JSON.stringify(generatedReplies, null, 2)}
                </pre>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
