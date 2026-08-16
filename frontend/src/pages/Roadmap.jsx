import { useState } from 'react';
import { generateRoadmap } from '../api';
import { useToast } from '../components/useToast';
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
  { bg: 'bg-indigo-500/10', text: 'text-indigo-400', bar: 'bg-indigo-500', border: 'border-indigo-500/20' },
  { bg: 'bg-violet-500/10', text: 'text-violet-400', bar: 'bg-violet-500', border: 'border-violet-500/20' },
  { bg: 'bg-emerald-500/10', text: 'text-emerald-400', bar: 'bg-emerald-500', border: 'border-emerald-500/20' },
  { bg: 'bg-amber-500/10', text: 'text-amber-400', bar: 'bg-amber-500', border: 'border-amber-500/20' },
];

export default function Roadmap() {
  const toast = useToast();
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
      toast.success('Product roadmap generated!');
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.error || 'Failed to generate roadmap';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const copyRoadmap = () => {
    if (!result) return;
    const items = result.roadmap || result.phases || [];
    const text = items
      .map(
        (p, i) =>
          `Step ${p.step || i + 1}: ${p.feature || p.name || p.title}\n${p.reason || p.description || ''}\n${p.expected_impact ? `Impact: ${p.expected_impact}` : ''}`
      )
      .join('\n\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied roadmap to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const phases = result?.roadmap || result?.phases || [];
  const hasPhases = Array.isArray(phases) && phases.length > 0;

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          AI Product Roadmap Builder
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Transform requested feature clusters into a sequenced product roadmap with timeline estimates.
        </p>
      </div>

      {/* Input Card */}
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-xl backdrop-blur-xl">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center">
            <Map className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-base font-bold text-white tracking-tight">Input Requested Features</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
              Features or Cluster JSON *
            </label>
            <textarea
              placeholder={"Enter feature list (one per line):\nDark mode theme\nExport reports to PDF\nRole-based access permissions\n..."}
              value={featuresText}
              onChange={(e) => setFeaturesText(e.target.value)}
              rows={6}
              className="w-full bg-black/60 border border-zinc-800 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-400/20 rounded-xl px-4 py-3 text-xs text-white placeholder-zinc-500 outline-none transition-all resize-none font-mono"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !featuresText.trim()}
            className="w-full py-3 bg-white hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-xl shadow-white/5 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-black" />
                Synthesizing release phases...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-black" />
                Generate Sequenced Roadmap
              </>
            )}
          </button>

          {error && (
            <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>

      {/* Output Roadmap Timeline */}
      {result && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2 tracking-tight">
              <Calendar className="w-4 h-4 text-zinc-300" />
              Generated Product Timeline ({phases.length} Steps)
            </h2>
            <button
              onClick={copyRoadmap}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Copy text roadmap"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {result.summary && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-zinc-200">
              <span className="font-bold text-emerald-400 uppercase tracking-wider block mb-1">Strategic Overview</span>
              {result.summary}
            </div>
          )}

          {hasPhases ? (
            <div className="space-y-4">
              {phases.map((phase, i) => {
                const title = phase.feature || phase.name || phase.title || `Step ${phase.step || i + 1}`;
                const reason = phase.reason || phase.description;
                const impact = phase.expected_impact;
                const featureList = phase.features || [];

                return (
                  <div key={i} className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 shadow-xl backdrop-blur-xl relative overflow-hidden">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase bg-zinc-800 text-white border border-zinc-700">
                            Step {phase.step || i + 1}
                          </span>
                          <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>
                        </div>
                        {phase.timeline && (
                          <p className="text-xs font-mono text-zinc-400 mt-1">Est. Timeline: {phase.timeline}</p>
                        )}
                      </div>
                    </div>

                    {reason && (
                      <p className="text-xs text-zinc-300 mb-3">{reason}</p>
                    )}

                    {impact && (
                      <div className="p-3 rounded-xl bg-black/60 border border-zinc-800 text-xs text-zinc-400">
                        <span className="text-zinc-500 font-bold uppercase text-[10px] block mb-0.5">Expected Impact</span>
                        <span className="text-zinc-200">{impact}</span>
                      </div>
                    )}

                    {featureList.length > 0 && (
                      <div className="space-y-2 pt-3 mt-3 border-t border-neutral-800">
                        {featureList.map((f, j) => {
                          const fname = typeof f === 'string' ? f : f.name || f.feature;
                          return (
                            <div key={j} className="flex items-start gap-2 text-xs text-zinc-200">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                              <span>{fname}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 text-xs text-zinc-300 font-mono">
              {JSON.stringify(result, null, 2)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
