import { type ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Settings, LogOut, Moon, Sun, Menu, X, Zap, History, MessageSquare,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';

export function AppShell({ children }: { children: ReactNode }) {
  const { user, profile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/ai-chat', label: 'AI Chat', icon: MessageSquare },
    { to: '/history', label: 'History', icon: History },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Mobile header */}
      <header className="lg:hidden flex items-center justify-between px-4 py-3 border-b sticky top-0 z-30 glass" style={{ borderColor: 'var(--border)' }}>
        <Link to="/dashboard" className="flex items-center gap-2">
          <Zap className="h-6 w-6 text-primary-500" />
          <span className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>VibeMatch</span>
        </Link>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-64 shrink-0 border-r transition-transform lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
        >
          <div className="flex h-full flex-col">
            <div className="flex items-center gap-2 px-6 py-5">
              <Link to="/dashboard" className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>VibeMatch</span>
              </Link>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive(item.to)
                        ? 'bg-primary-600/10 text-primary-600 dark:text-primary-400'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                    style={!isActive(item.to) ? { color: 'var(--text-secondary)' } : {}}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="border-t p-3 space-y-1" style={{ borderColor: 'var(--border)' }}>
              <button
                onClick={toggleTheme}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                style={{ color: 'var(--text-secondary)' }}
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                {theme === 'dark' ? 'Light mode' : 'Dark mode'}
              </button>
              <button
                onClick={handleSignOut}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                style={{ color: 'var(--text-secondary)' }}
              >
                <LogOut className="h-5 w-5" />
                Sign out
              </button>
            </div>

            {profile && (
              <div className="border-t px-4 py-3" style={{ borderColor: 'var(--border)' }}>
                <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                  {profile.name || user?.email}
                </p>
                <p className="text-xs truncate" style={{ color: 'var(--text-tertiary)' }}>
                  {user?.email}
                </p>
              </div>
            )}
          </div>
        </aside>

        {sidebarOpen && (
          <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Main content */}
        <main className="flex-1 min-w-0 p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
