import { useState } from 'react';
import { analyzePostFeedback } from '../api';
import Card from '../components/Card';
import { MessageSquare, Search } from 'lucide-react';
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

export default function PostFeedback() {
  const [form, setForm] = useState({
    projectId: '',
    postUrl: '',
    featureContext: '',
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await analyzePostFeedback(form);
      setResult(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const sentimentData = result?.sentiment
    ? [
        { name: 'Agreement', value: result.sentiment.agreement, color: '#22c55e' },
        { name: 'Neutral', value: result.sentiment.neutral, color: '#eab308' },
        { name: 'Disagreement', value: result.sentiment.disagreement, color: '#ef4444' },
      ]
    : [];

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-2">Post Feedback</h1>
      <p className="text-slate-400 mb-8">
        Analyze feedback from a specific Reddit post about your feature
      </p>

      <Card title="Analyze Post" className="mb-6">
        <div className="space-y-3">
          <input
            placeholder="Project ID"
            value={form.projectId}
            onChange={(e) => setForm({ ...form, projectId: e.target.value })}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
          <input
            placeholder="Reddit post URL"
            value={form.postUrl}
            onChange={(e) => setForm({ ...form, postUrl: e.target.value })}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
          <textarea
            placeholder="Feature context (what feature was announced / discussed)"
            value={form.featureContext}
            onChange={(e) =>
              setForm({ ...form, featureContext: e.target.value })
            }
            rows={3}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 resize-none"
          />
          <button
            onClick={handleAnalyze}
            disabled={
              loading || !form.projectId || !form.postUrl || !form.featureContext
            }
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <Search className="w-4 h-4" />
            {loading ? 'Analyzing...' : 'Analyze Post Feedback'}
          </button>
        </div>
      </Card>

      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sentiment Chart */}
          <Card title="Sentiment Breakdown">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={sentimentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {sentimentData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* AI Insights */}
          <Card title="AI Insights">
            <div className="space-y-4">
              {result.top_requested_change && (
                <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                  <p className="text-xs text-indigo-400 font-medium mb-1">
                    Top Requested Change
                  </p>
                  <p className="text-white text-sm">
                    {result.top_requested_change}
                  </p>
                </div>
              )}
              {result.recommended_next_feature && (
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <p className="text-xs text-green-400 font-medium mb-1">
                    Recommended Next Feature
                  </p>
                  <p className="text-white text-sm">
                    {result.recommended_next_feature}
                  </p>
                </div>
              )}
              {result.confusions && result.confusions.length > 0 && (
                <div>
                  <p className="text-xs text-yellow-400 font-medium mb-2">
                    <MessageSquare className="w-3 h-3 inline mr-1" />
                    User Confusions
                  </p>
                  <ul className="space-y-1">
                    {result.confusions.map((c, i) => (
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
          </Card>
        </div>
      )}
    </div>
  );
}
