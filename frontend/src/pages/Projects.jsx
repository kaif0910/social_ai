import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
} from '../api';
import Card from '../components/Card';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../components/useToast';
import {
  FolderKanban,
  Plus,
  Pencil,
  Trash2,
  ArrowRight,
  Search,
  Calendar,
  Sparkles
} from 'lucide-react';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);

  // Delete confirm
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const toast = useToast();

  const loadProjects = () => {
    setLoading(true);
    getProjects()
      .then((res) => setProjects(Array.isArray(res.data) ? res.data : []))
      .catch((err) => {
        console.error(err);
        toast.error('Failed to load projects');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const openCreate = () => {
    setEditingProject(null);
    setForm({ name: '', description: '' });
    setModalOpen(true);
  };

  const openEdit = (project, e) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingProject(project);
    setForm({ name: project.name, description: project.description || '' });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (editingProject) {
        await updateProject(editingProject.id, form);
        toast.success('Project updated successfully');
      } else {
        await createProject(form);
        toast.success('Project created successfully');
      }
      setModalOpen(false);
      loadProjects();
    } catch (err) {
      console.error(err);
      toast.error('Failed to save project');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      await deleteProject(deleteConfirm.id);
      setDeleteConfirm(null);
      toast.success('Project deleted');
      loadProjects();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete project');
    } finally {
      setDeleting(false);
    }
  };

  const filtered = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.description || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <LoadingSpinner message="Loading workspace projects..." />;

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Workspace Projects
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Organize feedback analysis pipelines, track feature requests, and run AI evaluations.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="px-4 py-2.5 bg-white hover:bg-zinc-200 text-black rounded-xl text-sm font-semibold flex items-center gap-2 transition-all shadow-xl shadow-white/5 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4 text-black" />
          Create Project
        </button>
      </div>

      {/* Filter / Search Control */}
      {projects.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            placeholder="Search projects by title or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-96 bg-neutral-900/90 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-400/20 transition-all"
          />
        </div>
      )}

      {/* Projects Grid */}
      {filtered.length === 0 ? (
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-8 backdrop-blur-xl">
          <EmptyState
            icon={FolderKanban}
            title={search ? 'No matching projects found' : 'No projects yet'}
            description={
              search
                ? 'Try broadening your search term.'
                : 'Create your first project to start organizing feedback analyses.'
            }
            action={
              !search && (
                <button
                  onClick={openCreate}
                  className="px-4 py-2.5 bg-white hover:bg-zinc-200 text-black rounded-xl text-sm font-semibold inline-flex items-center gap-2 transition-all shadow-xl shadow-white/5 cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-black" />
                  Create Project
                </button>
              )
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((p) => (
            <Link key={p.id} to={`/projects/${p.id}`} className="group block">
              <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 hover:border-zinc-700 hover:bg-neutral-900 transition-all duration-200 shadow-xl shadow-black/40 h-full flex flex-col relative overflow-hidden backdrop-blur-xl">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-white group-hover:underline transition-colors truncate tracking-tight">
                      {p.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mt-1">
                      <Calendar className="w-3 h-3 text-zinc-400" />
                      <span>{new Date(p.created_at || Date.now()).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => openEdit(p, e)}
                      className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                      title="Edit project"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDeleteConfirm(p);
                      }}
                      className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer"
                      title="Delete project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-zinc-400 line-clamp-2 flex-1 mb-4">
                  {p.description || 'No project description provided.'}
                </p>

                <div className="flex items-center justify-between pt-3 border-t border-neutral-800 mt-auto">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700">
                    <Sparkles className="w-3 h-3 text-white" /> Active Pipeline
                  </span>
                  <span className="text-xs font-semibold text-white flex items-center gap-1 group-hover:translate-x-0.5 transition-all">
                    Open Project <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingProject ? 'Edit Project Details' : 'Create New Workspace Project'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
              Project Name *
            </label>
            <input
              placeholder="e.g., AI Code Assistant"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-black/60 border border-zinc-800 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-400/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition-all"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
              Description
            </label>
            <textarea
              placeholder="Overview of project goals and community targets..."
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows={3}
              className="w-full bg-black/60 border border-zinc-800 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-400/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition-all resize-none"
            />
          </div>
          <div className="flex gap-3 pt-3">
            <button
              onClick={() => setModalOpen(false)}
              className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-sm font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !form.name.trim()}
              className="flex-1 py-2.5 bg-white hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold rounded-xl text-sm transition-all shadow-md shadow-white/5 cursor-pointer"
            >
              {saving
                ? 'Saving...'
                : editingProject
                  ? 'Update Details'
                  : 'Create Project'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Project"
      >
        <div className="space-y-4">
          <p className="text-sm text-zinc-300">
            Are you sure you want to delete <span className="text-white font-bold">{deleteConfirm?.name}</span>?
          </p>
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
            This action will permanently delete all associated analyses and feedback logs.
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setDeleteConfirm(null)}
              className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-sm font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors cursor-pointer"
            >
              {deleting ? 'Deleting...' : 'Confirm Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
