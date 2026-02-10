import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  Megaphone,
  Bot,
  BarChart3,
  MessageSquare,
  GitBranch,
  Map,
} from 'lucide-react';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
  { to: '/campaigns', label: 'Campaigns', icon: Megaphone },
  { to: '/copilot', label: 'Copilot', icon: Bot },
  { to: '/analyze', label: 'Analyze', icon: BarChart3 },
  { to: '/post-feedback', label: 'Post Feedback', icon: MessageSquare },
  { to: '/cluster', label: 'Cluster', icon: GitBranch },
  { to: '/roadmap', label: 'Roadmap', icon: Map },
];

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col">
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Bot className="w-6 h-6 text-indigo-400" />
            Build Sense
          </h1>
          <p className="text-xs text-slate-400 mt-1">Manager Dashboard</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
