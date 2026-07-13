import type { ColumnMeta, ProductRow, OpportunityItem } from '@/types';
import { supabase } from '@/services/supabase';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BarChart, LineChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { BarChart3, TrendingUp, DollarSign, Download } from 'lucide-react';

const COLORS = ['#00d4aa', '#3b82f6', '#f59e0b', '#ef4444', '#a78bfa', '#34d399', '#f97316', '#06b6d4'];
const now = new Date();
const CURRENT_MONTH = now.toLocaleString('en-US', { month: 'long', year: 'numeric' });

interface LocalData {
  rows: any[];
  meta: ColumnMeta[];
  fileName: string;
}

export default function DashboardPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<LocalData | null>(null);
  const [view, setView] = useState<'overview' | 'charts' | 'table'>('overview');
  const [tableCols, setTableCols] = useState<string[] | null>(null);
  const [reportStatus, setReportStatus] = useState<string | null>(null);
  const [showExport, setShowExport] = useState(false);

  useEffect(() => {
    if (!id) return;
    loadData(id);
  }, [id]);

  useEffect(() => {
    if (!showExport) return;
    const handler = () => setShowExport(false);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [showExport]);

  async function loadData(datasetId: string) {
    setLoading(true);
    try {
      if (datasetId.startsWith('local-')) {
        const stored = sessionStorage.getItem(datasetId);
        if (stored) {
          const parsed = JSON.parse(stored);
          setData(parsed);
          setLoading(false);
          return;
        }
      }
      const { data: ds } = await supabase.from('datasets').select('*').eq('id', datasetId).single();
      if (!ds) throw new Error('Not found');

      const { data: products } = await supabase.from('products').select('*').eq('dataset_id', datasetId);
      setData({
        rows: products || [],
        meta: ds.columns_meta || [],
        fileName: ds.file_name,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="empty-state">
        <div style={{ width: 36, height: 36, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }}></div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>Loading dashboard...</div>
      </div>
    );
  }

  if (!data || !data.rows.length) {
    return (
      <div className="empty-state">
        <BarChart3 size={48} style={{ opacity: 0.3, marginBottom: 12 }} />
        <div>No data found. <a onClick={() => navigate('/app')} style={{ cursor: 'pointer', color: 'var(--accent)' }}>Upload a dataset</a></div>
      </div>
    );
  }

  const { rows, meta, fileName } = data;
  const numCols = meta.filter(c => c.type === 'numeric').map(c => c.name);
  const catCols = meta.filter(c => c.type === 'categorical').map(c => c.name);
  const metricCols = numCols.filter(c => !/\bid\b|\bcode\b|\bkey\b|\bindex\b|timestamp|_id\b/i.test(c));
  const revenueCol = findCol(metricCols, ['revenue', 'sale', 'gross', 'income', 'proceeds', 'turnover', 'receipt']);
  const earningsCol = findCol(metricCols, ['earning', 'profit', 'net', 'royalty', 'margin', 'proceed']);
  const unitsCol = findCol(metricCols, ['unit', 'sold', 'transaction', 'qty', 'quantity', 'volume', 'sales count', 'count']);
  const downloadsCol = findCol(metricCols, ['download', 'install', 'dl', 'dload', 'acquire', 'acquisition', 'impression']);
  const refundCol = findCol(metricCols, ['refund', 'return', 'chargeback', 'cancel', 'reversal', 'dispute']);
  const priceCol = findCol(metricCols, ['price', 'cost', 'fee', 'amount', 'rate', 'list', 'charge', 'pricing']);
  const ratingCol = findCol(metricCols, ['rating', 'score', 'star', 'review', 'rank', 'feedback', 'grade']);
  const catCol = catCols[0] || null;
  const nameCol = findCol([...numCols, ...catCols, ...Object.keys(rows[0] || {})], ['product', 'app', 'name', 'title']) || 'product_name';

  const totalRev = sumCol(rows, revenueCol);
  const totalEarn = sumCol(rows, earningsCol);
  const totalUnits = sumInt(rows, unitsCol);
  const totalDownloads = sumInt(rows, downloadsCol);
  const totalRefunds = sumInt(rows, refundCol);
  const avgPrice = totalUnits > 0 ? totalRev / totalUnits : 0;
  const avgRating = avgCol(rows, ratingCol);
  const margin = totalRev > 0 ? (totalEarn / totalRev) * 100 : 0;
  const freeDownloads = Math.max(0, totalDownloads - totalUnits);
  const freePct = totalDownloads > 0 ? (freeDownloads / totalDownloads) * 100 : 0;

  const groupedCat: Record<string, number> = {};
  rows.forEach(r => { const k = r[catCol || 'category']; const v = r[revenueCol || 'revenue']; if (k != null && v != null) groupedCat[k] = (groupedCat[k] || 0) + v; });
  const catChartData = Object.entries(groupedCat).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, value]) => ({ name, value: +value.toFixed(2) }));

  const sortedRows = [...rows].sort((a, b) => (b[revenueCol || 'revenue'] || 0) - (a[revenueCol || 'revenue'] || 0));
  const topProducts: ProductRow[] = sortedRows.slice(0, 20).map(r => ({
    product_name: String(r[nameCol] || 'Unknown'),
    category: String(r[catCol || 'category'] || ''),
    price: +r[priceCol || 0] || 0,
    units_sold: +r[unitsCol || 0] || 0,
    revenue: +r[revenueCol || 0] || 0,
    earnings: +r[earningsCol || 0] || 0,
    downloads: +r[downloadsCol || 0] || 0,
    refunds: +r[refundCol || 0] || 0,
    rating: ratingCol && r[ratingCol] ? +r[ratingCol] : null,
  }));

  const trendData = rows.slice(0, 30).map((r, i) => ({
    index: i + 1,
    value: r[revenueCol || numCols[0]] || 0,
  }));

  const opps: OpportunityItem[] = [];
  const oppDownloadField = downloadsCol || (metricCols.filter(c => c !== revenueCol && c !== earningsCol && c !== priceCol && c !== ratingCol && c !== refundCol && c !== unitsCol)[0]) || unitsCol;
  const oppUnitsField = unitsCol && oppDownloadField !== unitsCol ? unitsCol : null;
  rows.forEach(r => {
    const dl = oppDownloadField ? (+r[oppDownloadField] || 0) : 0;
    const units = oppUnitsField ? (+r[oppUnitsField] || 0) : 0;
    const free = Math.max(0, dl - units);
    const rev = revenueCol ? (+r[revenueCol] || 0) : 0;
    if (free > 0) opps.push({
      app_name: String(r[nameCol || 'product_name']),
      downloads: free,
      potential_revenue: +(free * 0.99).toFixed(2),
      color: free >= 15 ? '#ef4444' : free >= 5 ? '#f59e0b' : '#00d4aa',
    });
    else if (!oppUnitsField && dl > 0 && rev === 0) opps.push({
      app_name: String(r[nameCol || 'product_name']),
      downloads: dl,
      potential_revenue: +(dl * 0.99).toFixed(2),
      color: '#3b82f6',
    });
  });
  opps.sort((a, b) => b.downloads - a.downloads);

  const maxOppDl = opps[0]?.downloads || 1;

  const kpis = [
    { label: 'Total gross revenue', value: `$${totalRev.toFixed(0)}`, sub: '{CURRENT_MONTH}', icon: <DollarSign size={16} /> },
    { label: 'Estimated earnings', value: `$${totalEarn.toFixed(0)}`, sub: `${margin.toFixed(1)}% margin`, icon: <TrendingUp size={16} /> },
    { label: 'Total transactions', value: String(totalUnits), sub: `${totalRefunds} refunds`, icon: <BarChart3 size={16} /> },
    { label: 'Free downloads', value: String(freeDownloads), sub: `${freePct.toFixed(0)}% of all installs`, icon: <Download size={16} /> },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12,
        padding: '16px 20px', borderRadius: 12, background: 'var(--card)', border: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="status-dot"></div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15 }}>{fileName}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
              {rows.length} rows · {meta.length} columns
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 4, background: 'var(--surface)', padding: 4, borderRadius: 10, border: '1px solid var(--border)' }}>
          {(['overview', 'charts', 'table'] as const).map(v => (
            <button key={v} className="btn btn-sm" onClick={() => setView(v)}
              style={view === v ? { background: 'var(--accent)', color: '#0a0e1a', borderColor: 'var(--accent)' } : {}}>
              {v === 'overview' ? 'Overview' : v === 'charts' ? 'Charts' : 'Table'}
            </button>
          ))}
        </div>
        {id && (
          <>
            <div style={{ position: 'relative' }}>
              <button className="btn btn-sm" onClick={(e) => { e.stopPropagation(); setShowExport(!showExport); }}
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Download size={14} /> Export CSV
              </button>
              {showExport && (
                <div style={{
                  position: 'absolute', top: '100%', right: 0, marginTop: 4, zIndex: 100,
                  background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8,
                  overflow: 'hidden', minWidth: 160,
                }}>
                  <div style={{ padding: '10px 16px', cursor: 'pointer', fontSize: 13, color: 'var(--text)' }}
                    onClick={() => { setShowExport(false); exportData(id!, data); }}>
                    Export as CSV
                  </div>
                </div>
              )}
            </div>
            <button className="btn btn-sm" onClick={() => downloadReport(id, data, setReportStatus)}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Download size={14} /> {reportStatus || 'PDF Report'}
            </button>
          </>
        )}
      </div>

      {/* KPI Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 24 }}>
        {kpis.map((kpi, idx) => {
          const gradients = [
            'linear-gradient(135deg, rgba(0,212,170,0.15), rgba(0,212,170,0.02))',
            'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(59,130,246,0.02))',
            'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(245,158,11,0.02))',
            'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(139,92,246,0.02))',
          ];
          const accents = ['var(--accent)', 'var(--accent2)', 'var(--accent3)', '#8b5cf6'];
          return (
            <div key={kpi.label} className="card" style={{
              position: 'relative', overflow: 'hidden',
              background: 'var(--card)', transition: 'all 0.2s',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.12)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: accents[idx] }}></div>
              <div style={{ background: gradients[idx], position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.5 }}></div>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {kpi.label}
                  </div>
                  <div style={{ color: accents[idx], opacity: 0.6 }}>{kpi.icon}</div>
                </div>
                <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text)' }}>{kpi.value}</div>
                <div style={{ fontSize: 12, color: 'var(--dim)', marginTop: 4 }}>{kpi.sub}</div>
              </div>
            </div>
          );
        })}
      </div>

      {view === 'overview' && (
        <>
          {/* Revenue by Category + Pie */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            <div className="card" style={{ borderRadius: 14, padding: 20 }}>
              <div className="section-title" style={{ marginTop: 0, marginBottom: 16 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }}></span>
                Revenue by niche (USD)
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={catChartData}>
                  <CartesianGrid stroke="rgba(42,53,85,0.4)" strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={v => `$${v}`} />
                  <Tooltip formatter={(v: any) => typeof v === 'number' ? `${v.toFixed(2)}` : v} contentStyle={{ background: '#1e2740', border: '1px solid #2a3555', borderRadius: 8 }} />
                  <Bar dataKey="value" fill="#00d4aa" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="card" style={{ borderRadius: 14, padding: 20 }}>
              <div className="section-title" style={{ marginTop: 0, marginBottom: 16 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent2)' }}></span>
                {catCol || 'Category'} Distribution
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={catChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={50}>
                    {catChartData.map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: any) => typeof v === 'number' ? `${v.toFixed(2)}` : v} contentStyle={{ background: '#1e2740', border: '1px solid #2a3555', borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 8 }}>
                {catChartData.slice(0, 6).map((item, i) => (
                  <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--dim)' }}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: COLORS[i % COLORS.length] }}></span>
                    {item.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Daily Trend */}
          <div className="card" style={{ marginBottom: 24, borderRadius: 14, padding: 20 }}>
            <div className="section-title" style={{ marginTop: 0, marginBottom: 16 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent2)' }}></span>
              Daily revenue trend — {CURRENT_MONTH}
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trendData}>
                <CartesianGrid stroke="rgba(42,53,85,0.4)" strokeDasharray="3 3" />
                <XAxis dataKey="index" tick={{ fill: '#64748b', fontSize: 10 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={v => `$${v}`} />
                <Tooltip formatter={(v: any) => typeof v === 'number' ? `$${v.toFixed(2)}` : String(v)} contentStyle={{ background: '#1e2740', border: '1px solid #2a3555', borderRadius: 8 }} />
                <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2.5} dot={false} fill="rgba(59,130,246,0.1)" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Opportunities */}
          <div className="card" style={{ marginBottom: 24, borderRadius: 14, padding: 20 }}>
            {opps.length > 0 ? (
              <>
                <div className="section-title" style={{ marginTop: 0 }}>📊 Free Apps — Revenue Opportunity</div>
                {opps.slice(0, 6).map((o, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: i < Math.min(6, opps.length) - 1 ? '1px solid rgba(42,53,85,0.4)' : 'none' }}>
                    <div style={{ width: 160, fontSize: 13, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{o.app_name}</div>
                    <div style={{ flex: 1, height: 22, borderRadius: 4, overflow: 'hidden', background: 'var(--surface)' }}>
                      <div style={{ width: `${(o.downloads / maxOppDl) * 100}%`, height: '100%', background: o.color, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 8 }}>
                        <span style={{ fontSize: 10, fontWeight: 600, color: '#0a0e1a' }}>{o.downloads}</span>
                      </div>
                    </div>
                    <div style={{ width: 100, textAlign: 'right', fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>${o.potential_revenue} potential</div>
                  </div>
                ))}
              </>
            ) : metricCols.filter(c => c !== revenueCol && c !== earningsCol && c !== priceCol && c !== ratingCol && c !== refundCol).length > 0 || metricCols.length > 0 ? (
              <>
                <div className="section-title" style={{ marginTop: 0 }}>📊 Top Products by {metricCols.filter(c => c !== revenueCol && c !== earningsCol && c !== priceCol && c !== ratingCol && c !== refundCol)[0] || metricCols[0]}</div>
                {(() => {
                  const fc = metricCols.filter(c => c !== revenueCol && c !== earningsCol && c !== priceCol && c !== ratingCol && c !== refundCol)[0] || metricCols[0];
                  if (!fc) return null;
                  const ranked = [...rows].sort((a, b) => (+(b[fc]||0)) - (+(a[fc]||0))).slice(0, 6);
                  const maxV = Math.max(...ranked.map(r => +(r[fc]||0)), 1);
                  return ranked.map((r, i) => {
                    const v = +(r[fc]||0);
                    const pct = (v / maxV) * 100;
                    return (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: i < 5 ? '1px solid rgba(42,53,85,0.4)' : 'none' }}>
                        <div style={{ width: 160, fontSize: 13, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r[nameCol || fc] || 'Product'}</div>
                        <div style={{ flex: 1, height: 22, borderRadius: 4, overflow: 'hidden', background: 'var(--surface)' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: '#3b82f6', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 8 }}>
                            <span style={{ fontSize: 10, fontWeight: 600, color: '#0a0e1a' }}>{v.toFixed(0)}</span>
                          </div>
                        </div>
                        <div style={{ width: 100, textAlign: 'right', fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{fc}</div>
                      </div>
                    );
                  });
                })()}
              </>
            ) : null}
          </div>
        </>
      )}

      {view === 'charts' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            <div className="card" style={{ borderRadius: 14, padding: 20 }}>
              <div className="section-title" style={{ marginTop: 0 }}>Revenue by niche (USD)</div>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={catChartData}>
                  <CartesianGrid stroke="rgba(42,53,85,0.4)" strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={v => `$${v}`} />
                  <Tooltip formatter={(v: any) => typeof v === 'number' ? `${v.toFixed(2)}` : v} contentStyle={{ background: '#1e2740', border: '1px solid #2a3555', borderRadius: 8 }} />
                  <Bar dataKey="value" fill="#00d4aa" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="card" style={{ borderRadius: 14, padding: 20 }}>
              <div className="section-title" style={{ marginTop: 0 }}>Category Distribution</div>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={catChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} innerRadius={55}>
                    {catChartData.map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: any) => typeof v === 'number' ? `${v.toFixed(2)}` : v} contentStyle={{ background: '#1e2740', border: '1px solid #2a3555', borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="card" style={{ marginBottom: 24, borderRadius: 14, padding: 20 }}>
              <div className="section-title" style={{ marginTop: 0 }}>Daily revenue trend — {CURRENT_MONTH}</div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trendData}>
                <CartesianGrid stroke="rgba(42,53,85,0.4)" strokeDasharray="3 3" />
                <XAxis dataKey="index" tick={{ fill: '#64748b', fontSize: 10 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={v => `$${v}`} />
                <Tooltip formatter={(v: any) => typeof v === 'number' ? `$${v.toFixed(2)}` : String(v)} contentStyle={{ background: '#1e2740', border: '1px solid #2a3555', borderRadius: 8 }} />
                <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2.5} dot={false} fill="rgba(59,130,246,0.1)" fillOpacity={0.2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {view === 'table' && (
        <div className="card" style={{ borderRadius: 14, padding: 20 }}>
          <div className="section-title" style={{ marginTop: 0 }}>Top revenue apps</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
            {[
              { key: 'name', label: 'App', show: true },
              { key: 'category', label: 'Niche', show: !!catCol },
              { key: 'price', label: 'Price', show: !!priceCol },
              { key: 'units', label: 'Units', show: !!unitsCol },
              { key: 'revenue', label: 'Revenue', show: true },
              { key: 'earnings', label: 'Earnings', show: !!earningsCol },
              { key: 'downloads', label: 'Downloads', show: !!downloadsCol },
              { key: 'rating', label: 'Rating', show: !!ratingCol },
            ].filter(d => d.show).map(d => {
              const active = (tableCols || null) === null ? true : (tableCols || []).includes(d.key);
              return (
                <span key={d.key}
                  onClick={() => {
                    const current = tableCols || ['name','category','price','units','revenue','earnings'].filter(k => {
                      if (k === 'category') return !!catCol;
                      if (k === 'price') return !!priceCol;
                      if (k === 'units') return !!unitsCol;
                      if (k === 'earnings') return !!earningsCol;
                      return true;
                    });
                    let next: string[];
                    if (current.includes(d.key)) {
                      if (current.length <= 1) return;
                      next = current.filter(c => c !== d.key);
                    } else {
                      next = [...current, d.key];
                    }
                    setTableCols(next);
                  }}
                  style={{
                    display: 'inline-block', padding: '4px 12px', borderRadius: 20,
                    fontSize: 11, fontFamily: 'var(--font-mono)', cursor: 'pointer',
                    background: active ? 'var(--accent)' : 'var(--surface)',
                    color: active ? '#0a0e1a' : 'var(--muted)',
                    border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                    fontWeight: active ? 600 : 400, userSelect: 'none',
                    transition: 'all 0.15s',
                  }}
                >{d.label}</span>
              );
            })}
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr>
                  {(!tableCols || tableCols.includes('name')) && <th style={{ textAlign: 'left', color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, padding: '8px 10px', borderBottom: '1px solid var(--border)' }}>App</th>}
                  {(!tableCols || tableCols.includes('category')) && catCol && <th style={{ textAlign: 'left', color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, padding: '8px 10px', borderBottom: '1px solid var(--border)' }}>Niche</th>}
                  {(!tableCols || tableCols.includes('price')) && <th style={{ textAlign: 'left', color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, padding: '8px 10px', borderBottom: '1px solid var(--border)' }}>Price</th>}
                  {(!tableCols || tableCols.includes('units')) && <th style={{ textAlign: 'left', color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, padding: '8px 10px', borderBottom: '1px solid var(--border)' }}>Units</th>}
                  {(!tableCols || tableCols.includes('revenue')) && <th style={{ textAlign: 'left', color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, padding: '8px 10px', borderBottom: '1px solid var(--border)' }}>Revenue</th>}
                  {(!tableCols || tableCols.includes('earnings')) && <th style={{ textAlign: 'left', color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, padding: '8px 10px', borderBottom: '1px solid var(--border)' }}>Earnings</th>}
                  {(!tableCols || tableCols.includes('downloads')) && <th style={{ textAlign: 'left', color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, padding: '8px 10px', borderBottom: '1px solid var(--border)' }}>Downloads</th>}
                  {(!tableCols || tableCols.includes('rating')) && <th style={{ textAlign: 'left', color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, padding: '8px 10px', borderBottom: '1px solid var(--border)' }}>Rating</th>}
                </tr>
              </thead>
              <tbody>
                {topProducts.map((p, i) => (
                  <tr key={i}>
                    {(!tableCols || tableCols.includes('name')) && <td style={{ padding: '8px 10px', borderBottom: '1px solid rgba(42,53,85,0.3)', color: 'var(--text)', fontWeight: 500 }}>{p.product_name}</td>}
                    {(!tableCols || tableCols.includes('category')) && catCol && <td style={{ padding: '8px 10px', borderBottom: '1px solid rgba(42,53,85,0.3)' }}>
                      <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 4, fontSize: 11, background: 'rgba(0,212,170,0.15)', color: 'var(--accent)' }}>{p.category}</span>
                    </td>}
                    {(!tableCols || tableCols.includes('price')) && <td style={{ padding: '8px 10px', borderBottom: '1px solid rgba(42,53,85,0.3)', fontFamily: 'var(--font-mono)' }}>${p.price.toFixed(2)}</td>}
                    {(!tableCols || tableCols.includes('units')) && <td style={{ padding: '8px 10px', borderBottom: '1px solid rgba(42,53,85,0.3)', fontFamily: 'var(--font-mono)' }}>{p.units_sold}</td>}
                    {(!tableCols || tableCols.includes('revenue')) && <td style={{ padding: '8px 10px', borderBottom: '1px solid rgba(42,53,85,0.3)', fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>${p.revenue.toFixed(2)}</td>}
                    {(!tableCols || tableCols.includes('earnings')) && <td style={{ padding: '8px 10px', borderBottom: '1px solid rgba(42,53,85,0.3)', fontFamily: 'var(--font-mono)' }}>${p.earnings.toFixed(2)}</td>}
                    {(!tableCols || tableCols.includes('downloads')) && <td style={{ padding: '8px 10px', borderBottom: '1px solid rgba(42,53,85,0.3)', fontFamily: 'var(--font-mono)' }}>{p.downloads}</td>}
                    {(!tableCols || tableCols.includes('rating')) && <td style={{ padding: '8px 10px', borderBottom: '1px solid rgba(42,53,85,0.3)', fontFamily: 'var(--font-mono)' }}>{p.rating ?? '-'}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

async function downloadReport(
  datasetId: string,
  data: LocalData | null,
  setStatus: (s: string | null) => void,
) {
  const token = localStorage.getItem('predictiq-token');
  const base = import.meta.env.VITE_API_URL || '';
  const isLocal = datasetId.startsWith('local-');
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  setStatus('Generating...');
  try {
    if (isLocal && data) {
      headers['Content-Type'] = 'application/json';
      const res = await fetch(`${base}/api/datasets/${datasetId}/report`, {
        method: 'POST', headers,
        body: JSON.stringify({ rows: data.rows, meta: data.meta, file_name: data.fileName }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const dlUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = dlUrl; a.download = `${datasetId}_predictiq_report.pdf`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(dlUrl), 10000);
      setStatus(null);
    } else {
      setStatus(null);
      window.open(`${base}/api/datasets/${datasetId}/report`, '_blank');
    }
  } catch (err) {
    console.error('Download failed:', err);
    setStatus(null);
    window.open(`${base}/api/datasets/${datasetId}/report`, '_blank');
  }
}

async function exportData(datasetId: string, data: LocalData | null) {
  const token = localStorage.getItem('predictiq-token');
  const base = import.meta.env.VITE_API_URL || '';
  const isLocal = datasetId.startsWith('local-');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  try {
    if (isLocal && data) {
      const res = await fetch(`${base}/api/datasets/${datasetId}/export/csv`, {
        method: 'POST', headers,
        body: JSON.stringify({ rows: data.rows, file_name: data.fileName }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `${data.fileName.replace('.csv','')}.csv`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
    } else {
      window.open(`${base}/api/datasets/${datasetId}/export/csv`, '_blank');
    }
  } catch (err) {
    console.error('Export failed:', err);
    window.open(`${base}/api/datasets/${datasetId}/export/csv`, '_blank');
  }
}

function findCol(cols: string[], keywords: string[]): string | null {
  for (const col of cols) {
    const cl = col.toLowerCase().replace(/_/g, ' ').replace(/-/g, ' ');
    for (const kw of keywords) if (cl.includes(kw)) return col;
  }
  return null;
}

function sumCol(rows: any[], col: string | null): number {
  if (!col) return 0;
  return rows.reduce((s, r) => s + (+r[col] || 0), 0);
}

function sumInt(rows: any[], col: string | null): number {
  if (!col) return 0;
  return rows.reduce((s, r) => s + Math.round(+r[col] || 0), 0);
}

function avgCol(rows: any[], col: string | null): number {
  if (!col) return 0;
  const vals = rows.map(r => +r[col]).filter(v => !isNaN(v));
  return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
}
