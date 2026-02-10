import { useState } from 'react';
import { generateRoadmap } from '../api';
import Card from '../components/Card';
import { Map, Sparkles } from 'lucide-react';

export default function Roadmap() {
  const [featuresText, setFeaturesText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    let clusteredData;
    try {
      clusteredData = JSON.parse(featuresText);
    } catch {
      // Fallback: treat as newline-separated features
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
    try {
      const res = await generateRoadmap(clusteredData);
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
        <Map className="w-8 h-8 text-indigo-400" />
        <h1 className="text-3xl font-bold text-white">Roadmap Generator</h1>
      </div>
      <p className="text-slate-400 mb-8">
        Generate product roadmaps from clustered feature data
      </p>

      <Card title="Input Features" className="mb-6">
        <div className="space-y-3">
          <textarea
            placeholder={`Paste clustered feature JSON or enter features (one per line):\n\nDark mode support\nExport to PDF\nMobile responsive design\nTeam collaboration\n\n— or JSON format: —\n{"features": [{"name": "Dark mode", "priority": "high"}]}`}
            value={featuresText}
            onChange={(e) => setFeaturesText(e.target.value)}
            rows={10}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 resize-none font-mono text-sm"
          />
          <button
            onClick={handleGenerate}
            disabled={loading || !featuresText.trim()}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            {loading ? 'Generating...' : 'Generate Roadmap'}
          </button>
        </div>
      </Card>

      {result && (
        <Card title="Generated Roadmap">
          {typeof result === 'object' && result.phases ? (
            <div className="space-y-6">
              {result.phases.map((phase, i) => (
                <div key={i} className="relative">
                  {/* Timeline connector */}
                  {i < result.phases.length - 1 && (
                    <div className="absolute left-4 top-12 bottom-0 w-0.5 bg-slate-600" />
                  )}
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/30 text-indigo-300 flex items-center justify-center font-bold text-sm shrink-0 mt-1">
                      {i + 1}
                    </div>
                    <div className="flex-1 p-4 rounded-lg bg-slate-700/50 border border-slate-600">
                      <h4 className="text-white font-semibold text-lg">
                        {phase.name || phase.title || `Phase ${i + 1}`}
                      </h4>
                      {phase.timeline && (
                        <p className="text-xs text-indigo-400 mt-1">
                          {phase.timeline}
                        </p>
                      )}
                      {phase.description && (
                        <p className="text-sm text-slate-400 mt-2">
                          {phase.description}
                        </p>
                      )}
                      {phase.features && (
                        <ul className="mt-3 space-y-1">
                          {phase.features.map((f, j) => (
                            <li
                              key={j}
                              className="text-sm text-slate-300 flex items-center gap-2"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                              {typeof f === 'string' ? f : f.name || JSON.stringify(f)}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <pre className="text-sm text-slate-300 whitespace-pre-wrap overflow-auto max-h-[500px]">
              {JSON.stringify(result, null, 2)}
            </pre>
          )}
        </Card>
      )}
    </div>
  );
}
