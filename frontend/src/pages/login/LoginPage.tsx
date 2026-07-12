import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LogIn, Mail, Lock, Eye, EyeOff, UserPlus } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, guestLogin, isOnline } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/app';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      navigate(from, { replace: true });
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '60px auto', padding: '0 16px' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Welcome back</div>
        <div style={{ fontSize: 14, color: 'var(--muted)' }}>Sign in to your DataVision AI account</div>
      </div>

      {!isOnline && (
        <div style={{
          background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)',
          borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#fcd34d', marginBottom: 16,
        }}>
          ⚡ Supabase not available — you can continue as a guest below.
        </div>
      )}

      <form onSubmit={handleSubmit} className="card" style={{ padding: 28 }}>
        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#fca5a5', marginBottom: 16,
          }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'var(--muted)' }}>
            <Mail size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} /> Email
          </label>
          <input
            type="email" required value={email} onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            style={{
              width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)',
              background: 'var(--surface)', color: 'var(--text)', fontSize: 14, outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'var(--muted)' }}>
            <Lock size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} /> Password
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPw ? 'text' : 'password'} required
              value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)',
                background: 'var(--surface)', color: 'var(--text)', fontSize: 14, outline: 'none',
                boxSizing: 'border-box', paddingRight: 40,
              }}
            />
            <button type="button" onClick={() => setShowPw(!showPw)}
              style={{
                position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: 4,
              }}>
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <div style={{ width: 14, height: 14, border: '2px solid rgba(10,14,26,0.3)', borderTopColor: '#0a0e1a', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              Signing in...
            </span>
          ) : (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <LogIn size={16} /> Sign In
            </span>
          )}
        </button>

        <div style={{ marginTop: 14, textAlign: 'center', fontSize: 13, color: 'var(--dim)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Create one</Link>
        </div>

        <div style={{
          marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)',
          textAlign: 'center',
        }}>
          <button type="button" className="btn" onClick={() => { guestLogin(); navigate(from, { replace: true }); }}
            style={{ width: '100%' }}>
            <UserPlus size={16} style={{ marginRight: 6 }} />
            Continue as Guest
          </button>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6 }}>
            Data is stored locally in your browser
          </div>
        </div>
      </form>
    </div>
  );
}
