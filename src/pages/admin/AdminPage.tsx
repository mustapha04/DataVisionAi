import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, Database, BarChart3, Brain, Trash2, AlertTriangle } from 'lucide-react';

interface AdminStats {
  users: number;
  datasets: number;
  products: number;
  analyses: number;
}

interface AdminUser {
  id: string;
  email: string;
  created_at?: string;
}

interface AdminDataset {
  id: string;
  file_name: string;
  row_count?: number;
  created_at?: string;
  user_id?: string;
}

export default function AdminPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [datasets, setDatasets] = useState<AdminDataset[]>([]);
  const [tab, setTab] = useState<'overview' | 'users' | 'datasets'>('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    const token = localStorage.getItem('predictiq-token');
    const base = import.meta.env.VITE_API_URL || '';
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    try {
      const [statsRes, usersRes, datasetsRes] = await Promise.all([
        fetch(`${base}/api/admin/stats`, { headers }),
        fetch(`${base}/api/admin/users`, { headers }),
        fetch(`${base}/api/admin/datasets`, { headers }),
      ]);
      if (statsRes.ok) setStats(await statsRes.json());
      if (usersRes.ok) { const d = await usersRes.json(); setUsers(d.users || []); }
      if (datasetsRes.ok) { const d = await datasetsRes.json(); setDatasets(d.datasets || []); }
    } catch (err) {
      console.error('Admin load failed:', err);
    } finally {
      setLoading(false);
    }
  }

  async function deleteUser(id: string) {
    if (!confirm('Delete this user and all their data?')) return;
    const token = localStorage.getItem('predictiq-token');
    const base = import.meta.env.VITE_API_URL || '';
    const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
    try {
      await fetch(`${base}/api/admin/users/${id}`, { method: 'DELETE', headers });
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (err) {
      console.error('Delete user failed:', err);
    }
  }

  async function deleteDataset(id: string) {
    if (!confirm('Delete this dataset and all its data?')) return;
    const token = localStorage.getItem('predictiq-token');
    const base = import.meta.env.VITE_API_URL || '';
    const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
    try {
      await fetch(`${base}/api/admin/datasets/${id}`, { method: 'DELETE', headers });
      setDatasets(prev => prev.filter(d => d.id !== id));
    } catch (err) {
      console.error('Delete dataset failed:', err);
    }
  }

  if (loading) {
    return (
      <div className="empty-state">
        <div style={{ width: 36, height: 36, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }}></div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>Loading admin...</div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Shield size={22} style={{ color: 'var(--accent)' }} />
          <div>
            <div style={{ fontWeight: 600, fontSize: 16 }}>Admin Dashboard</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>Platform overview &amp; management</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, background: 'var(--surface)', padding: 3, borderRadius: 8, border: '1px solid var(--border)' }}>
          {(['overview', 'users', 'datasets'] as const).map(t => (
            <button key={t} className="btn btn-sm" onClick={() => setTab(t)}
              style={tab === t ? { background: 'var(--accent)', color: '#0a0e1a', borderColor: 'var(--accent)' } : {}}>
              {t === 'overview' ? 'Overview' : t === 'users' ? 'Users' : 'Datasets'}
            </button>
          ))}
        </div>
      </div>

      {tab === 'overview' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
            {[
              { label: 'Users', value: stats?.users ?? '—', icon: <Users size={18} />, color: 'var(--accent)' },
              { label: 'Datasets', value: stats?.datasets ?? '—', icon: <Database size={18} />, color: '#3b82f6' },
              { label: 'Products', value: stats?.products ?? '—', icon: <BarChart3 size={18} />, color: '#f59e0b' },
              { label: 'AI Analyses', value: stats?.analyses ?? '—', icon: <Brain size={18} />, color: '#a78bfa' },
            ].map(kpi => (
              <div key={kpi.label} className="card" style={{ position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: kpi.color }}></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ color: kpi.color }}>{kpi.icon}</span>
                  <span style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{kpi.label}</span>
                </div>
                <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{kpi.value}</div>
              </div>
            ))}
          </div>

          <div className="card" style={{ marginBottom: 24 }}>
            <div className="section-title" style={{ marginTop: 0 }}>Recent Datasets</div>
            {datasets.length === 0 ? (
              <div style={{ color: 'var(--muted)', fontSize: 13, padding: '20px 0' }}>No datasets uploaded yet.</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', color: 'var(--muted)', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, padding: '8px 10px', borderBottom: '1px solid var(--border)' }}>File</th>
                      <th style={{ textAlign: 'left', color: 'var(--muted)', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, padding: '8px 10px', borderBottom: '1px solid var(--border)' }}>User ID</th>
                      <th style={{ textAlign: 'left', color: 'var(--muted)', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, padding: '8px 10px', borderBottom: '1px solid var(--border)' }}>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {datasets.slice(0, 10).map(ds => (
                      <tr key={ds.id}>
                        <td style={{ padding: '8px 10px', borderBottom: '1px solid rgba(42,53,85,0.3)' }}>
                          <span style={{ cursor: 'pointer', color: 'var(--accent)' }} onClick={() => navigate(`/app/dashboard/${ds.id}`)}>{ds.file_name}</span>
                        </td>
                        <td style={{ padding: '8px 10px', borderBottom: '1px solid rgba(42,53,85,0.3)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>{(ds.user_id || '—').slice(0, 12)}</td>
                        <td style={{ padding: '8px 10px', borderBottom: '1px solid rgba(42,53,85,0.3)', color: 'var(--muted)' }}>{ds.created_at ? new Date(ds.created_at).toLocaleDateString() : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {tab === 'users' && (
        <div className="card">
          <div className="section-title" style={{ marginTop: 0 }}>Platform Users ({users.length})</div>
          {users.length === 0 ? (
            <div style={{ color: 'var(--muted)', fontSize: 13, padding: '20px 0' }}>No users yet.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', color: 'var(--muted)', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, padding: '8px 10px', borderBottom: '1px solid var(--border)' }}>Email</th>
                    <th style={{ textAlign: 'left', color: 'var(--muted)', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, padding: '8px 10px', borderBottom: '1px solid var(--border)' }}>Joined</th>
                    <th style={{ textAlign: 'right', color: 'var(--muted)', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, padding: '8px 10px', borderBottom: '1px solid var(--border)' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td style={{ padding: '8px 10px', borderBottom: '1px solid rgba(42,53,85,0.3)', fontWeight: 500 }}>{u.email}</td>
                      <td style={{ padding: '8px 10px', borderBottom: '1px solid rgba(42,53,85,0.3)', color: 'var(--muted)' }}>{u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}</td>
                      <td style={{ padding: '8px 10px', borderBottom: '1px solid rgba(42,53,85,0.3)', textAlign: 'right' }}>
                        <button className="btn btn-sm" onClick={() => deleteUser(u.id)}
                          style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' }}>
                          <Trash2 size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'datasets' && (
        <div className="card">
          <div className="section-title" style={{ marginTop: 0 }}>All Datasets ({datasets.length})</div>
          {datasets.length === 0 ? (
            <div style={{ color: 'var(--muted)', fontSize: 13, padding: '20px 0' }}>No datasets yet.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', color: 'var(--muted)', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, padding: '8px 10px', borderBottom: '1px solid var(--border)' }}>File</th>
                    <th style={{ textAlign: 'left', color: 'var(--muted)', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, padding: '8px 10px', borderBottom: '1px solid var(--border)' }}>Rows</th>
                    <th style={{ textAlign: 'left', color: 'var(--muted)', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, padding: '8px 10px', borderBottom: '1px solid var(--border)' }}>User</th>
                    <th style={{ textAlign: 'left', color: 'var(--muted)', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, padding: '8px 10px', borderBottom: '1px solid var(--border)' }}>Created</th>
                    <th style={{ textAlign: 'right', color: 'var(--muted)', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, padding: '8px 10px', borderBottom: '1px solid var(--border)' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {datasets.map(ds => (
                    <tr key={ds.id}>
                      <td style={{ padding: '8px 10px', borderBottom: '1px solid rgba(42,53,85,0.3)', fontWeight: 500 }}>
                        <span style={{ cursor: 'pointer', color: 'var(--accent)' }} onClick={() => navigate(`/app/dashboard/${ds.id}`)}>{ds.file_name}</span>
                      </td>
                      <td style={{ padding: '8px 10px', borderBottom: '1px solid rgba(42,53,85,0.3)', fontFamily: 'var(--font-mono)' }}>{ds.row_count ?? '—'}</td>
                      <td style={{ padding: '8px 10px', borderBottom: '1px solid rgba(42,53,85,0.3)', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)' }}>{(ds.user_id || '—').slice(0, 12)}</td>
                      <td style={{ padding: '8px 10px', borderBottom: '1px solid rgba(42,53,85,0.3)', color: 'var(--muted)' }}>{ds.created_at ? new Date(ds.created_at).toLocaleDateString() : '—'}</td>
                      <td style={{ padding: '8px 10px', borderBottom: '1px solid rgba(42,53,85,0.3)', textAlign: 'right' }}>
                        <button className="btn btn-sm" onClick={() => deleteDataset(ds.id)}
                          style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' }}>
                          <Trash2 size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
