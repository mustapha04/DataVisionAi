import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '@/app/theme';
import { useAuth } from '@/hooks/useAuth';
import { Moon, Sun, Upload, BarChart3, Brain, LogOut, User, TrendingUp, Shield, ArrowLeft, MessageSquare } from 'lucide-react';

const LS_KEY = 'predictiq-last-dataset-id';

function getDatasetId(pathname: string): string | null {
  const segs = pathname.split('/');
  const appIdx = segs.indexOf('app');
  if (appIdx >= 0 && segs.length > appIdx + 2 && segs[appIdx + 1] !== 'admin') {
    return segs[appIdx + 2];
  }
  return null;
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { theme, toggle } = useTheme();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const id = getDatasetId(location.pathname);
    if (id) sessionStorage.setItem(LS_KEY, id);
  }, [location.pathname]);

  const isActive = (path: string) => location.pathname.startsWith(`/app${path}`);

  function navTo(path: string) {
    const id = getDatasetId(location.pathname) || sessionStorage.getItem(LS_KEY);
    if (id) navigate(`/app/${path}/${id}`);
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      {/* Top Navigation Bar */}
      <div
        className="sticky top-0 z-50"
        style={{
          background: theme === 'dark' ? 'rgba(10,14,26,0.9)' : 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div
          className="mx-auto flex items-center justify-between px-6"
          style={{ maxWidth: 1400, height: 56 }}
        >
          {/* Left: Logo + Back */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200"
              style={{ border: '1px solid var(--border)', background: 'transparent', color: 'var(--muted)', cursor: 'pointer' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted)'; }}
              title="Back to Home"
            >
              <ArrowLeft size={16} />
            </button>
            <div
              className="flex items-center gap-2 cursor-pointer select-none"
              onClick={() => navigate('/')}
            >
              <img src="/icon.png" alt="DataVision AI" className="w-7 h-7 rounded-md" />
              <span
                className="text-sm tracking-tight hidden sm:inline"
                style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text)' }}
              >
                DataVision<span style={{ color: 'var(--accent)' }}>AI</span>
              </span>
            </div>
          </div>

          {/* Center: Nav tabs */}
          <div
            className="hidden md:flex items-center gap-0.5 rounded-lg p-1"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <button
              onClick={() => navigate('/app')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200"
              style={isActive('/') && location.pathname === '/app' ? { background: 'var(--accent)', color: '#0a0e1a' } : { color: 'var(--muted)', background: 'transparent', border: 'none', cursor: 'pointer' }}
            >
              <Upload size={13} />
              Upload
            </button>
            <button
              onClick={() => navTo('dashboard')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200"
              style={isActive('/dashboard') ? { background: 'var(--accent)', color: '#0a0e1a' } : { color: 'var(--muted)', background: 'transparent', border: 'none', cursor: 'pointer' }}
            >
              <BarChart3 size={13} />
              Dashboard
            </button>
            <button
              onClick={() => navTo('analytics')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200"
              style={isActive('/analytics') ? { background: 'var(--accent)', color: '#0a0e1a' } : { color: 'var(--muted)', background: 'transparent', border: 'none', cursor: 'pointer' }}
            >
              <BarChart3 size={13} />
              Analytics
            </button>
            <button
              onClick={() => navTo('insights')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200"
              style={isActive('/insights') ? { background: 'var(--accent)', color: '#0a0e1a' } : { color: 'var(--muted)', background: 'transparent', border: 'none', cursor: 'pointer' }}
            >
              <Brain size={13} />
              AI Insights
            </button>
            <button
              onClick={() => navTo('forecast')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200"
              style={isActive('/forecast') ? { background: 'var(--accent)', color: '#0a0e1a' } : { color: 'var(--muted)', background: 'transparent', border: 'none', cursor: 'pointer' }}
            >
              <TrendingUp size={13} />
              Forecast
            </button>
            <button
              onClick={() => navTo('chat')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200"
              style={isActive('/chat') ? { background: 'var(--accent)', color: '#0a0e1a' } : { color: 'var(--muted)', background: 'transparent', border: 'none', cursor: 'pointer' }}
            >
              <MessageSquare size={13} />
              AI Chat
            </button>
            <button
              onClick={() => navigate('/app/admin')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200"
              style={isActive('/admin') ? { background: 'var(--accent)', color: '#0a0e1a' } : { color: 'var(--muted)', background: 'transparent', border: 'none', cursor: 'pointer' }}
            >
              <Shield size={13} />
              Admin
            </button>
          </div>

          {/* Right: User + Theme */}
          <div className="flex items-center gap-3">
            {user && (
              <div className="hidden sm:flex items-center gap-2 text-xs" style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                <User size={12} />
                <span style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.email}
                </span>
              </div>
            )}
            <button
              onClick={toggle}
              className="flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200"
              style={{ border: '1px solid var(--border)', background: 'transparent', color: 'var(--muted)', cursor: 'pointer' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--text)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted)'; }}
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            {user && (
              <button
                onClick={signOut}
                className="flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200"
                style={{ border: '1px solid var(--border)', background: 'transparent', color: 'var(--muted)', cursor: 'pointer' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--danger)'; e.currentTarget.style.color = 'var(--danger)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted)'; }}
                title="Sign out"
              >
                <LogOut size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <div className="md:hidden sticky top-14 z-40 overflow-x-auto" style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-1 px-4 py-2">
          {[
            { icon: Upload, label: 'Upload', path: '/app' },
            { icon: BarChart3, label: 'Dashboard', path: '/app/dashboard' },
            { icon: Brain, label: 'AI', path: '/app/insights' },
            { icon: TrendingUp, label: 'Forecast', path: '/app/forecast' },
            { icon: MessageSquare, label: 'Chat', path: '/app/chat' },
            { icon: Shield, label: 'Admin', path: '/app/admin' },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => {
                if (item.path === '/app' || item.path === '/app/admin') navigate(item.path);
                else navTo(item.path.split('/app/')[1]);
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-md text-[11px] font-medium whitespace-nowrap transition-all"
              style={{
                background: location.pathname.startsWith(item.path) && (item.path === '/app' ? location.pathname === '/app' : true) ? 'var(--accent)' : 'transparent',
                color: location.pathname.startsWith(item.path) ? '#0a0e1a' : 'var(--muted)',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <item.icon size={12} />
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="container" style={{ paddingTop: 24, paddingBottom: 40 }}>
        {children}
      </div>
    </div>
  );
}
