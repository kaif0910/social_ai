import { useState, useRef, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  FolderKanban,
  Megaphone,
  Bot,
  BarChart3,
  MessageSquare,
  GitBranch,
  Map,
  Menu,
  X,
  LogOut,
  User,
  Sparkles,
  ChevronDown,
  Search
} from 'lucide-react';

const navGroups = [
  {
    title: 'Core Platform',
    items: [
      { to: '/', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/projects', label: 'Projects', icon: FolderKanban },
      { to: '/analyze', label: 'Deep Analyze', icon: BarChart3 },
    ]
  },
  {
    title: 'AI Copilot & Growth',
    items: [
      { to: '/copilot', label: 'AI Copilot', icon: Bot },
      { to: '/campaigns', label: 'Campaigns', icon: Megaphone },
    ]
  },
  {
    title: 'Feedback Intelligence',
    items: [
      { to: '/post-feedback', label: 'Post Feedback', icon: MessageSquare },
      { to: '/cluster', label: 'Feature Cluster', icon: GitBranch },
      { to: '/roadmap', label: 'AI Roadmap', icon: Map },
    ]
  }
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const userMenuRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Get active page title for header
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard Overview';
    if (path.startsWith('/projects')) return 'Project Workspace';
    if (path.startsWith('/campaigns')) return 'Marketing Campaigns';
    if (path.startsWith('/copilot')) return 'AI Growth Copilot';
    if (path.startsWith('/analyze')) return 'Market Feedback Analysis';
    if (path.startsWith('/post-feedback')) return 'Post Feedback Inspector';
    if (path.startsWith('/cluster')) return 'Feature Clustering';
    if (path.startsWith('/roadmap')) return 'Product Roadmap';
    return 'BuildSense Platform';
  };

  return (
    <div className="flex min-h-screen bg-[#0b0f19] text-slate-100 font-sans">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900/90 border-r border-slate-800/80 flex flex-col transform transition-transform duration-200 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        {/* Sidebar Brand Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 p-0.5 shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                BuildSense
                <span className="text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-1.5 py-0.2 rounded-full">v1.0</span>
              </h1>
              <p className="text-xs text-slate-400">Product Intelligence</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
          {navGroups.map((group, groupIdx) => (
            <div key={groupIdx}>
              <p className="px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                {group.title}
              </p>
              <div className="space-y-1">
                {group.items.map(({ to, label, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={to === '/'}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 font-semibold shadow-sm'
                          : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Sidebar User Footer */}
        <div className="p-4 border-t border-slate-800/80">
          <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center text-xs font-bold shrink-0">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-200 truncate">{user?.name || 'User'}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email || 'user@buildsense.ai'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Log out"
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 bg-[#0b0f19]/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {getPageTitle()}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick action link */}
            <button
              onClick={() => navigate('/projects')}
              className="hidden sm:flex items-center gap-2 bg-indigo-600/15 hover:bg-indigo-600/25 border border-indigo-500/30 text-indigo-300 text-xs font-medium px-3 py-2 rounded-xl transition-all cursor-pointer"
            >
              <FolderKanban className="w-3.5 h-3.5" />
              Manage Projects
            </button>

            {/* Profile Menu Dropdown */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-800/80 transition-colors border border-transparent hover:border-slate-700/80 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-bold text-xs flex items-center justify-center shadow-md">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="hidden md:inline-block text-xs font-medium text-slate-200">
                  {user?.name || 'Account'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:inline-block" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2.5 border-b border-slate-800">
                    <p className="text-xs font-bold text-white truncate">{user?.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        navigate('/projects');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 rounded-xl transition-colors text-left"
                    >
                      <FolderKanban className="w-4 h-4 text-slate-400" />
                      Workspace Projects
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 rounded-xl transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4 text-red-400" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
