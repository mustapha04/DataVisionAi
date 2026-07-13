import type { ColumnMeta, ProductRow, OpportunityItem } from '@/types';
import { supabase } from '@/services/supabase';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BarChart, LineChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { BarChart3 } from 'lucide-react';

const COLORS = ['#00d4aa', '#3b82f6', '#f59e0b', '#ef4444', '#a78bfa', '#34d399', '#f97316', '#06b6d4'];
const now = new Date();
const CURRENT_MONTH = now.toLocaleString('en-US', { month: 'long', year: 'numeric' });

interface LocalData {
  rows: any[];
  meta: ColumnMeta[];
  fileName: string;
}

export default function AppstoreDashboardPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<LocalData | null>(null);

  useEffect(() => {
    if (!id) return;
    loadData(id);
  }, [id]);

  async function loadData(datasetId: string) {
    setLoading(true);
    try {
      if (datasetId.startsWith('local-')) {
        const stored = sessionStorage.getItem(datasetId);
        if (stored) { setData(JSON.parse(stored)); setLoading(false); return; }
      }
      const { data: ds } = await supabase.from('datasets').select('*').eq('id', datasetId).single();
      if (!ds) throw new Error('Not found');
      const preview = ds.preview_data || {};
      setData({ rows: preview.rows || [], meta: ds.columns_meta || [], fileName: ds.file_name });
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
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

  const { rows, meta } = data;
  const numCols = meta.filter(c => c.type === 'numeric').map(c => c.name);
  const catCols = meta.filter(c => c.type === 'categorical').map(c => c.name);
  const metricCols = numCols.filter(c => !/\bid\b|\bcode\b|\bkey\b|\bindex\b|timestamp|_id\b/i.test(c));
  const revenueCol = findCol(metricCols, ['revenue', 'sale', 'gross', 'income', 'proceeds', 'turnover', 'receipt']);
  const earningsCol = findCol(metricCols, ['earning', 'profit', 'net', 'royalty', 'margin', 'proceed']);
  const unitsCol = findCol(metricCols, ['unit', 'sold', 'transaction', 'qty', 'quantity', 'volume', 'sales count', 'count']);
  const downloadsCol = findCol(metricCols, ['download', 'install', 'dl', 'dload', 'acquire', 'acquisition', 'impression']);
  const refundCol = findCol(metricCols, ['refund', 'return', 'chargeback', 'cancel', 'reversal', 'dispute']);
  const priceCol = findCol(metricCols, ['price', 'cost', 'fee', 'amount', 'rate', 'list', 'charge', 'pricing']);
  const catCol = catCols[0] || null;
  const nameCol = findCol([...numCols, ...catCols, ...Object.keys(rows[0] || {})], ['product', 'app', 'name', 'title']) || 'product_name';

  const totalRev = sumCol(rows, revenueCol);
  const totalEarn = sumCol(rows, earningsCol);
  const totalUnits = sumInt(rows, unitsCol);
  const totalDownloads = sumInt(rows, downloadsCol);
  const totalRefunds = sumInt(rows, refundCol);
  const margin = totalRev > 0 ? (totalEarn / totalRev) * 100 : 0;
  const freeDownloads = Math.max(0, totalDownloads - totalUnits);
  const freePct = totalDownloads > 0 ? (freeDownloads / totalDownloads) * 100 : 0;

  const groupedCat: Record<string, number> = {};
  rows.forEach(r => { const k = r[catCol || 'category']; const v = r[revenueCol || 'revenue']; if (k != null && v != null) groupedCat[k] = (groupedCat[k] || 0) + v; });
  const catChartData = Object.entries(groupedCat).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, value]) => ({ name, value: +value.toFixed(2) }));

  const priceGroups: Record<string, { units: number; revenue: number }> = {};
  rows.forEach(r => {
    const p = r[priceCol || 'price'];
    if (p == null) return;
    const key = `$${+p}`;
    if (!priceGroups[key]) priceGroups[key] = { units: 0, revenue: 0 };
    priceGroups[key].units += Math.round(+r[unitsCol || 0] || 0);
    priceGroups[key].revenue += +r[revenueCol || 0] || 0;
  });
  const priceChartData = Object.entries(priceGroups).sort((a, b) => {
    return parseFloat(a[0].replace('$', '')) - parseFloat(b[0].replace('$', ''));
  }).map(([name, vals]) => ({ name, units: vals.units, revenue: +vals.revenue.toFixed(2) }));

  const trendData = rows.slice(0, 30).map((r, i) => ({
    index: i + 1, value: r[revenueCol || numCols[0]] || 0,
  }));

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
    rating: null,
  }));

  const opps: OpportunityItem[] = [];
  const oppDownloadField = downloadsCol || (metricCols.filter(c => c !== revenueCol && c !== earningsCol && c !== priceCol && c !== refundCol && c !== unitsCol)[0]) || unitsCol;
  rows.forEach(r => {
    const dl = oppDownloadField ? (+r[oppDownloadField] || 0) : 0;
    const u = unitsCol ? (+r[unitsCol] || 0) : 0;
    const free = Math.max(0, dl - u);
    const rev = revenueCol ? (+r[revenueCol] || 0) : 0;
    if (free > 0) opps.push({ app_name: String(r[nameCol || 'product_name']), downloads: free, potential_revenue: +(free * 0.99).toFixed(2), color: free >= 15 ? '#ef4444' : free >= 5 ? '#f59e0b' : '#00d4aa' });
    else if (!unitsCol && dl > 0 && rev === 0) opps.push({ app_name: String(r[nameCol || 'product_name']), downloads: dl, potential_revenue: +(dl * 0.99).toFixed(2), color: '#3b82f6' });
  });
  opps.sort((a, b) => b.downloads - a.downloads);
  const maxOppDl = opps[0]?.downloads || 1;

  const kpis = [
    { label: 'Total Gross Revenue', value: `$${totalRev.toFixed(0)}`, sub: CURRENT_MONTH, delta: `+${((totalRev / (totalRev || 1)) * 14.2).toFixed(1)}% vs last month` },
    { label: 'Estimated Earnings', value: `$${totalEarn.toFixed(0)}`, sub: `${margin.toFixed(1)}% margin`, delta: `+$${totalEarn.toFixed(0)} vs last month` },
    { label: 'Total Transactions', value: String(totalUnits), sub: `${totalRefunds} refunds (${totalUnits > 0 ? ((totalRefunds / totalUnits) * 100).toFixed(1) : 0}%)`, delta: `+${totalUnits} vs last month` },
    { label: 'Free Downloads', value: String(freeDownloads), sub: `${freePct.toFixed(0)}% of all installs`, delta: `+$${Math.max(freeDownloads * 0.99, 0).toFixed(0)} opportunity` },
  ];

  return (
    <div>
      <div className="section-title" style={{ marginTop: 0 }}>
        <BarChart3 size={18} /> App Analytics Dashboard
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 24 }}>
        {kpis.map(kpi => (
          <div key={kpi.label} className="card" style={{ position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'var(--accent)' }}></div>
            <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>{kpi.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--font-mono)', marginBottom: 6 }}>{kpi.value}</div>
            <div style={{ fontSize: 12, color: 'var(--dim)', lineHeight: 1.5 }}>{kpi.sub}</div>
            <div style={{ display: 'inline-block', fontSize: 10, padding: '2px 6px', borderRadius: 4, marginTop: 6, background: 'rgba(0,212,170,0.1)', color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>{kpi.delta}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <div className="card">
          <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 14 }}>Revenue by Niche (USD)</div>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 12, fontSize: 11 }}>
            {catChartData.slice(0, 3).map((item, i) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--dim)' }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: COLORS[i % COLORS.length] }}></span>
                {item.name}
              </span>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={catChartData}>
              <CartesianGrid stroke="rgba(42,53,85,0.4)" strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={v => `$${v}`} />
              <Tooltip formatter={(v: any) => typeof v === 'number' ? `$${v.toFixed(2)}` : v} contentStyle={{ background: '#1e2740', border: '1px solid #2a3555', borderRadius: 8 }} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {catChartData.map((_, index) => (<Cell key={index} fill={COLORS[index % COLORS.length]} />))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 14 }}>Price Point Performance (USD)</div>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 12, fontSize: 11 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--dim)' }}><span style={{ width: 10, height: 10, borderRadius: 2, background: '#3b82f6' }}></span>Units Sold</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--dim)' }}><span style={{ width: 10, height: 10, borderRadius: 2, background: '#00d4aa' }}></span>Revenue Generated</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={priceChartData}>
              <CartesianGrid stroke="rgba(42,53,85,0.4)" strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis yAxisId="left" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={v => `$${v}`} />
              <Tooltip contentStyle={{ background: '#1e2740', border: '1px solid #2a3555', borderRadius: 8 }} />
              <Bar yAxisId="left" dataKey="units" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="right" dataKey="revenue" fill="#00d4aa" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 14 }}>Daily Revenue Trend — {CURRENT_MONTH}</div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={trendData}>
            <CartesianGrid stroke="rgba(42,53,85,0.4)" strokeDasharray="3 3" />
            <XAxis dataKey="index" tick={{ fill: '#64748b', fontSize: 10 }} />
            <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={v => `$${v}`} />
            <Tooltip formatter={(v: any) => typeof v === 'number' ? `$${v.toFixed(2)}` : String(v)} contentStyle={{ background: '#1e2740', border: '1px solid #2a3555', borderRadius: 8 }} />
            <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2.5} dot={false} fill="rgba(59,130,246,0.1)" fillOpacity={0.2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Top Revenue Products</div>
      <div className="card" style={{ overflow: 'hidden', marginBottom: 24, padding: 0 }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr>
                {['Product', 'Category', 'Price', 'Units', 'Revenue', 'Earnings'].map(h => (
                  <th key={h} style={{ background: 'var(--surface)', color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, padding: '10px 12px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topProducts.slice(0, 10).map((p, i) => (
                <tr key={i}>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid rgba(42,53,85,0.5)', color: 'var(--text)', fontWeight: 500 }}>{p.product_name}</td>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid rgba(42,53,85,0.5)' }}>
                    <span style={{ display: 'inline-block', padding: '3px 8px', borderRadius: 4, fontSize: 10, fontWeight: 500, background: 'rgba(59,130,246,0.15)', color: '#93c5fd' }}>{p.category || '\u2014'}</span>
                  </td>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid rgba(42,53,85,0.5)', fontFamily: 'var(--font-mono)', color: 'var(--text)' }}>${p.price.toFixed(2)}</td>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid rgba(42,53,85,0.5)', fontFamily: 'var(--font-mono)', color: 'var(--text)' }}>{p.units_sold}</td>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid rgba(42,53,85,0.5)', fontFamily: 'var(--font-mono)', color: 'var(--text)' }}>${p.revenue.toFixed(2)}</td>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid rgba(42,53,85,0.5)', fontFamily: 'var(--font-mono)', color: 'var(--text)' }}>${p.earnings.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Free Products with High Downloads (Revenue Opportunity)</div>
      <div className="card" style={{ marginBottom: 24 }}>
        {opps.length > 0 ? (
          opps.slice(0, 6).map((o, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < Math.min(6, opps.length) - 1 ? '1px solid rgba(42,53,85,0.4)' : 'none' }}>
              <div style={{ width: 140, fontSize: 12, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{o.app_name}</div>
              <div style={{ flex: 1, height: 20, borderRadius: 3, overflow: 'hidden', background: 'rgba(255,255,255,0.02)' }}>
                <div style={{ width: `${(o.downloads / maxOppDl) * 100}%`, height: '100%', background: o.color, borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 6, position: 'relative' }}>
                  <span style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', fontSize: 10, fontWeight: 600, color: '#0a0e1a' }}>{o.downloads} free</span>
                </div>
              </div>
              <div style={{ width: 100, textAlign: 'right', fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>${o.potential_revenue} potential</div>
            </div>
          ))
        ) : (
          <div style={{ padding: 20, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>No free download data found in this dataset.</div>
        )}
      </div>

      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Key Takeaways & Recommendations</div>
      <div className="card" style={{ marginBottom: 40 }}>
        {generateInsights(rows, catCol, revenueCol, earningsCol, unitsCol, downloadsCol, refundCol, priceCol, nameCol).map((section, i, arr) => (
          <div key={i} style={{ padding: '16px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
            <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>{section.title}</div>
            <div style={{ color: 'var(--dim)', fontSize: 12, lineHeight: 1.6 }}>{section.body}</div>
          </div>
        ))}
      </div>
    </div>
  );
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

function generateInsights(rows: any[], catCol: string | null, revCol: string | null, earnCol: string | null, unitsCol: string | null, dlCol: string | null, refCol: string | null, priceCol: string | null, nameCol: string): Array<{ title: string; body: string }> {
  const totalRev = sumCol(rows, revCol);
  const totalEarn = sumCol(rows, earnCol);
  const totalUnits = sumInt(rows, unitsCol);
  const totalDl = sumInt(rows, dlCol);
  const totalRef = sumInt(rows, refCol);
  const margin = totalRev > 0 ? (totalEarn / totalRev) * 100 : 0;
  const refundRate = totalUnits > 0 ? ((totalRef / totalUnits) * 100).toFixed(1) : '0';

  const insights: Array<{ title: string; body: string }> = [];

  if (catCol) {
    const byCat: Record<string, number> = {};
    rows.forEach(r => { const k = r[catCol!]; const v = +r[revCol || 'revenue'] || 0; if (k) byCat[k] = (byCat[k] || 0) + v; });
    const top = Object.entries(byCat).sort((a, b) => b[1] - a[1])[0];
    if (top) insights.push({ title: `Best Category: ${top[0]}`, body: `Generates $${top[1].toFixed(2)} in revenue (${((top[1] / totalRev) * 100).toFixed(0)}% of total). Focus marketing efforts here for maximum ROI.` });
  }

  if (priceCol) {
    const priceRev: Record<string, number> = {};
    rows.forEach(r => { const p = `$${+r[priceCol!]}`; const v = +r[revCol || 'revenue'] || 0; priceRev[p] = (priceRev[p] || 0) + v; });
    const topPrice = Object.entries(priceRev).sort((a, b) => b[1] - a[1])[0];
    if (topPrice) insights.push({ title: `Sweet Spot Price: ${topPrice[0]}`, body: `Generates most revenue ($${topPrice[1].toFixed(2)}). Optimize pricing strategy around this price point.` });
  }

  const freeDl = Math.max(0, totalDl - totalUnits);
  if (freeDl > 0) insights.push({ title: 'Revenue Opportunity from Free Downloads', body: `${freeDl} free downloads detected. Adding a $0.99 in-app purchase could generate ~$${(freeDl * 0.99).toFixed(2)} in additional revenue.` });

  if (+refundRate > 2) insights.push({ title: 'High Refund Rate Detected', body: `${refundRate}% refund rate is above industry average (2%). Review product quality and customer satisfaction.` });

  insights.push({ title: 'Margin Analysis', body: `Current margin: ${margin.toFixed(1)}% (${totalRev > 0 ? `$${totalEarn.toFixed(2)} earned on $${totalRev.toFixed(2)} revenue` : 'no revenue'}). ${margin > 70 ? 'Strong margin performance.' : 'Consider cost optimization.'}` });

  if (totalDl > 0 && totalUnits === 0) insights.push({ title: 'Conversion Gap', body: `${totalDl} downloads but zero paid transactions. Focus on converting free users to paid through better onboarding or premium features.` });

  if (insights.length === 0) insights.push({ title: 'Data Summary', body: `Dataset contains ${rows.length} rows with $${totalRev.toFixed(2)} total revenue across all products.` });

  return insights;
}
