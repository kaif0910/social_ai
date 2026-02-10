import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProjects } from '../api';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import { FolderKanban, ArrowRight } from 'lucide-react';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProjects()
      .then((res) => setProjects(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-2">Projects</h1>
      <p className="text-slate-400 mb-8">
        Manage your projects and run AI analyses
      </p>

      {projects.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <FolderKanban className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-400">No projects found.</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p) => (
            <Link key={p.id} to={`/projects/${p.id}`}>
              <Card className="hover:border-indigo-500/50 transition-colors cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {p.name}
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">
                      Created {new Date(p.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-500" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
