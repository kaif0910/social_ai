import { useState } from 'react';
import { generateRoadmap } from '../api';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import {
  Map,
  Sparkles,
  Loader2,
  Calendar,
  CheckCircle2,
  Copy,
  Check,
  AlertCircle,
} from 'lucide-react';

const PHASE_COLORS = [
  { bg: 'bg-indigo-500/20', text: 'text-indigo-400', bar: 'bg-indigo-500' },
  { bg: 'bg-purple-500/20', text: 'text-purple-400', bar: 'bg-purple-500' },
  { bg: 'bg-cyan-500/20', text: 'text-cyan-400', bar: 'bg-cyan-500' },
  { bg: 'bg-amber-500/20', text: 'text-amber-400', bar: 'bg-amber-500' },
  { bg: 'bg-green-500/20', text: 'text-green-400', bar: 'bg-green-500' },
  { bg: 'bg-pink-500/20', text: 'text-pink-400', bar: 'bg-pink-500' },
];

export default function Roadmap() {
  const [featuresText, setFeaturesText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    let clusteredData;
    try {
      clusteredData = JSON.parse(featuresText);
    } catch {
      const features = featuresText
        .split('\n')
        .map((f) => f.trim())
        .filter(Boolean)
        .map((f) => ({ name: f }));
      clusteredData = { features };
    }

    if (!clusteredData.features || clusteredData.features.length === 0) return;

    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await generateRoadmap(clusteredData);
      setResult(res.data);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.error || 'Failed to generate roadmap'
      );
    } finally {
      setLoading(false);
    }
  };

  const copyRoadmap = () => {
    if (!result) return;
    const text = (result.phases || [])
      .map(
        (p, i) =>
          `Phase ${i + 1}: ${p.name || p.title}\n${p.timeline || ''}\n${p.description || ''}\nFeatures: ${(p.features || []).map((f) => (typeof f === 'string' ? f : f.name)).join(', ')}`
      )
      .join('\n\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const phases = result?.phases || [];
  const hasPhases = phases.length > 0;

  // Graceful rendering for any object result
  const renderObjectResult = (obj) => {
    return Object.entries(obj).map(([key, val]) => {
      if (key === 'phases') return null;
      return (
        <div key={key} className="p-3 rounded-lg bg-slate-700/50">
          <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide mb-1">
            {key.replace(/_/g, ' ')}
          </p>
          <p className="text-sm text-white">
            {typeof val === 'string'
              ? val
              : Array.isArray(val)
              ? val.map((v) => (typeof v === 'string' ? v : v.name || JSON.stringify(v))).join(', ')
              : String(val)}
          </p>
        </div>
      );
    });
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Roadmap Generator
          </h1>
          <p className="text-slate-400 mt-1">
            Turn feature clusters into a prioritized product roadmap
          </p>
        </div>
      </div>

      <Card className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
            <Map className="w-4 h-4 text-indigo-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">Input Features</h3>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Features
            </label>
            <textarea
              placeholder={"Enter features (one per line):\n\nDark mode support\nExport to PDF\nMobile responsive design\nTeam collaboration\n\nOr paste clustered JSON from Feature Clustering"}
              value={featuresText}
              onChange={(e) => setFeaturesText(e.target.value)}
              rows={8}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 resize-none font-mono text-sm"
            />
            <p className="text-xs text-slate-500 mt-1.5">
              Supports plain text (one feature per line) or JSON from the Cluster page
            </p>
          </div>
          <button
            onClick={handleGenerate}
            disabled={loading || !featuresText.trim()}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating roadmap...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Roadmap
              </>
            )}
          </button>
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Result */}
      {result && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-400" />
              <h2 className="text-xl font-bold text-white">
                Product Roadmap
              </h2>
              <span className="text-sm text-slate-400">
                ({phases.length} {phases.length === 1 ? 'phase' : 'phases'})
              </span>
            </div>
            <button
              onClick={copyRoadmap}
              className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1.5 text-sm"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="text-green-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy
                </>
              )}
            </button>
          </div>

          {hasPhases ? (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-[23px] top-0 bottom-0 w-0.5 bg-slate-700" />

              <div className="space-y-6">
                {phases.map((phase, i) => {
                  const color = PHASE_COLORS[i % PHASE_COLORS.length];
                  const featureList = phase.features || [];
                  const phaseName =
                    phase.name || phase.title || `Phase ${i + 1}`;

                  return (
                    <div key={i} className="relative flex gap-4">
                      {/* Timeline dot */}
                      <div
                        className={`w-12 h-12 rounded-xl ${color.bg} flex items-center justify-center shrink-0 z-10 border border-slate-700`}
                      >
                        <span className={`text-lg font-bold ${color.text}`}>
                          {i + 1}
                        </span>
                      </div>

                      {/* Phase card */}
                      <div className="flex-1 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden">
                        <div className="p-5">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-lg font-semibold text-white">
                              {phaseName}
                            </h3>
                            {phase.timeline && (
                              <span
                                className={`px-3 py-1 rounded-lg text-xs font-medium ${color.bg} ${color.text} border border-slate-600/50`}
                              >
                                {phase.timeline}
                              </span>
                            )}
                          </div>

                          {phase.description && (
                            <p className="text-sm text-slate-400 leading-relaxed mb-4">
                              {phase.description}
                            </p>
                          )}

                          {featureList.length > 0 && (
                            <div className="space-y-2">
                              {featureList.map((f, j) => {
                                const fname =
                                  typeof f === 'string'
                                    ? f
                                    : f.name || f.feature || f.title;
                                const fdesc =
                                  typeof f === 'object'
                                    ? f.description || f.detail
                                    : null;
                                return (
                                  <div
                                    key={j}
                                    className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-700/30"
                                  >
                                    <CheckCircle2
                                      className={`w-4 h-4 ${color.text} shrink-0 mt-0.5`}
                                    />
                                    <div>
                                      <p className="text-sm text-white font-medium">
                                        {fname}
                                      </p>
                                      {fdesc && (
                                        <p className="text-xs text-slate-400 mt-0.5">
                                          {fdesc}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* Phase progress bar accent */}
                        <div className="h-1 w-full bg-slate-700">
                          <div
                            className={`h-full ${color.bar} transition-all`}
                            style={{
                              width: `${((i + 1) / phases.length) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Non-phases result: render gracefully */
            <Card>
              <div className="space-y-3">
                {renderObjectResult(result)}
              </div>
            </Card>
          )}
        </div>
      )}

      {!result && !loading && (
        <Card>
          <EmptyState
            icon={Map}
            title="No roadmap yet"
            description="Enter your features or paste clustered data to generate a prioritized product roadmap."
          />
        </Card>
      )}
    </div>
  );
}
