import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '@/app/theme';
import { useAuth } from '@/hooks/useAuth';
import { Moon, Sun, Upload, BarChart3, Brain, LogOut, User, TrendingUp, Shield } from 'lucide-react';

const LS_KEY = 'predictiq-last-dataset-id';

function getDatasetId(pathname: string): string | null {
  const segs = pathname.split('/');
  return segs.length >= 3 && segs[1] !== 'admin' ? segs[2] : null;
}

export default function Layout({ children }: { children: ReactNode }) {
  const { theme, toggle } = useTheme();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const id = getDatasetId(location.pathname);
    if (id) sessionStorage.setItem(LS_KEY, id);
  }, [location.pathname]);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  function navTo(path: string) {
    const id = getDatasetId(location.pathname) || sessionStorage.getItem(LS_KEY);
    if (id) navigate(`/${path}/${id}`);
  }

  return (
    <div className="container">
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 0', borderBottom: '1px solid var(--border)', marginBottom: 24,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 700,
          color: 'var(--accent)', cursor: 'pointer',
        }} onClick={() => navigate(user ? '/' : '/login')}>
          <span style={{
            width: 10, height: 10, background: 'var(--accent)',
            borderRadius: '50%', boxShadow: '0 0 10px var(--accent)',
          }}></span>
          PREDICTIQ
        </div>

        {user && !isAuthPage && (
          <div style={{
            display: 'flex', gap: 4, background: 'var(--surface)',
            padding: 4, borderRadius: 10, border: '1px solid var(--border)',
          }}>
            <button className="btn btn-sm" onClick={() => navigate('/')}
              style={isActive('/') && location.pathname === '/' ? { background: 'var(--accent)', color: '#0a0e1a', borderColor: 'var(--accent)' } : {}}>
              <Upload size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />
              Upload
            </button>
            <button className="btn btn-sm" onClick={() => navTo('dashboard')}
              style={isActive('/dashboard') ? { background: 'var(--accent)', color: '#0a0e1a', borderColor: 'var(--accent)' } : {}}>
              <BarChart3 size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />
              Dashboard
            </button>
            <button className="btn btn-sm" onClick={() => navTo('insights')}
              style={isActive('/insights') ? { background: 'var(--accent)', color: '#0a0e1a', borderColor: 'var(--accent)' } : {}}>
              <Brain size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />
              AI Insights
            </button>
            <button className="btn btn-sm" onClick={() => navTo('forecast')}
              style={isActive('/forecast') ? { background: 'var(--accent)', color: '#0a0e1a', borderColor: 'var(--accent)' } : {}}>
              <TrendingUp size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />
              Forecast
            </button>
            <button className="btn btn-sm" onClick={() => navigate('/admin')}
              style={isActive('/admin') ? { background: 'var(--accent)', color: '#0a0e1a', borderColor: 'var(--accent)' } : {}}>
              <Shield size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />
              Admin
            </button>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {user && !isAuthPage && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--font-mono)',
            }}>
              <User size={12} />
              <span style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.email}
              </span>
              <button onClick={signOut} className="btn btn-sm" title="Sign out"
                style={{ marginLeft: 4 }}>
                <LogOut size={14} />
              </button>
            </div>
          )}
          <button onClick={toggle} className="btn btn-sm" title="Toggle theme">
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </div>
      {children}
    </div>
  );
}
