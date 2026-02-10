import { useState } from 'react';
import { clusterFeatures } from '../api';
import Card from '../components/Card';
import { GitBranch } from 'lucide-react';

export default function Cluster() {
  const [commentsText, setCommentsText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCluster = async () => {
    const comments = commentsText
      .split('\n')
      .map((c) => c.trim())
      .filter(Boolean);

    if (comments.length === 0) return;

    setLoading(true);
    setResult(null);
    try {
      const res = await clusterFeatures(comments);
      setResult(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <GitBranch className="w-8 h-8 text-indigo-400" />
        <h1 className="text-3xl font-bold text-white">Feature Clustering</h1>
      </div>
      <p className="text-slate-400 mb-8">
        Group user comments into feature clusters using AI
      </p>

      <Card title="Input Comments" className="mb-6">
        <div className="space-y-3">
          <textarea
            placeholder="Enter comments (one per line):&#10;I wish it had dark mode&#10;Please add export to PDF&#10;Dark theme would be great&#10;..."
            value={commentsText}
            onChange={(e) => setCommentsText(e.target.value)}
            rows={8}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 resize-none font-mono text-sm"
          />
          <button
            onClick={handleCluster}
            disabled={loading || !commentsText.trim()}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <GitBranch className="w-4 h-4" />
            {loading ? 'Clustering...' : 'Cluster Features'}
          </button>
        </div>
      </Card>

      {result && (
        <Card title="Clustered Features">
          {result.features ? (
            <div className="space-y-4">
              {Array.isArray(result.features) ? (
                result.features.map((cluster, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-lg bg-slate-700/50 border border-slate-600"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-6 h-6 rounded-full bg-indigo-500/30 text-indigo-300 text-xs flex items-center justify-center font-bold">
                        {i + 1}
                      </span>
                      <h4 className="text-white font-medium">
                        {cluster.name || cluster.feature || `Cluster ${i + 1}`}
                      </h4>
                    </div>
                    {cluster.description && (
                      <p className="text-sm text-slate-400 mb-2">
                        {cluster.description}
                      </p>
                    )}
                    {cluster.comments && (
                      <div className="space-y-1">
                        {cluster.comments.map((c, j) => (
                          <p
                            key={j}
                            className="text-xs text-slate-300 pl-3 border-l-2 border-indigo-500/30"
                          >
                            {c}
                          </p>
                        ))}
                      </div>
                    )}
                    {cluster.count && (
                      <p className="text-xs text-slate-500 mt-2">
                        {cluster.count} comments
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <pre className="text-sm text-slate-300 whitespace-pre-wrap">
                  {JSON.stringify(result.features, null, 2)}
                </pre>
              )}
            </div>
          ) : (
            <pre className="text-sm text-slate-300 whitespace-pre-wrap">
              {JSON.stringify(result, null, 2)}
            </pre>
          )}
        </Card>
      )}
    </div>
  );
}
