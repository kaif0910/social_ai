import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProjects, getAnalyses } from '../api';
import StatCard from '../components/StatCard';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  FolderKanban,
  BarChart3,
  Bot,
  TrendingUp,
} from 'lucide-react';

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [projRes, analRes] = await Promise.all([
          getProjects(),
          getAnalyses(),
        ]);
        setProjects(projRes.data);
        setAnalyses(analRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
      <p className="text-slate-400 mb-8">Overview of your Social AI Manager</p>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Projects"
          value={projects.length}
          icon={FolderKanban}
          color="indigo"
        />
        <StatCard
          label="Analyses"
          value={analyses.length}
          icon={BarChart3}
          color="green"
        />
        <StatCard
          label="AI Features"
          value="7"
          icon={Bot}
          color="blue"
        />
        <StatCard
          label="Status"
          value="Active"
          icon={TrendingUp}
          color="green"
        />
      </div>

      {/* Recent Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Recent Projects">
          {projects.length === 0 ? (
            <p className="text-slate-400 text-sm">No projects yet.</p>
          ) : (
            <ul className="space-y-3">
              {projects.slice(0, 5).map((p) => (
                <li key={p.id}>
                  <Link
                    to={`/projects/${p.id}`}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors"
                  >
                    <span className="text-white font-medium">{p.name}</span>
                    <span className="text-xs text-slate-400">
                      {new Date(p.created_at).toLocaleDateString()}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Recent Analyses">
          {analyses.length === 0 ? (
            <p className="text-slate-400 text-sm">No analyses yet.</p>
          ) : (
            <ul className="space-y-3">
              {analyses.slice(0, 5).map((a) => (
                <li key={a.id}>
                  <Link
                    to={`/analyze/${a.id}`}
                    className="block p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors"
                  >
                    <span className="text-white font-medium block">
                      {a.product_idea}
                    </span>
                    <span className="text-xs text-slate-400">
                      r/{a.subreddit} &middot;{' '}
                      {new Date(a.created_at).toLocaleDateString()}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
