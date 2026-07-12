import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TrendingUp, BarChart3 } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { getDataset, runForecast } from '@/services/api';

interface Row {
  [key: string]: any;
}

interface ForecastPoint {
  ds: string;
  yhat: number;
  yhat_lower: number;
  yhat_upper: number;
}

interface ActualPoint {
  ds: string;
  y: number;
}

interface ForecastResult {
  forecast: ForecastPoint[];
  actuals?: ActualPoint[];
  fitted_values?: { ds: string; yhat: number }[];
  components?: { trend: number[]; seasonal: number[] };
  metadata?: { rows_used: number; periods_forecasted: number; date_col: string; value_col: string; seasonality_period: number };
  error?: string;
}

export default function ForecastPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Row[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [dateCols, setDateCols] = useState<string[]>([]);
  const [numCols, setNumCols] = useState<string[]>([]);
  const [dateCol, setDateCol] = useState('');
  const [valueCol, setValueCol] = useState('');
  const [periods, setPeriods] = useState(30);
  const [forecasting, setForecasting] = useState(false);
  const [result, setResult] = useState<ForecastResult | null>(null);

  function pickBestDateCol(rows: Row[], cols: string[]): string {
    let best = '';
    let bestScore = -1;
    for (const col of cols) {
      let score = 0;
      let checked = 0;
      for (const r of rows) {
        const v = r[col];
        if (v == null || v === '') continue;
        if (typeof v !== 'string') continue;
        checked++;
        const d = new Date(v);
        if (!isNaN(d.getTime()) && d.getTime() > 946684800000) score++;
        if (checked >= 10) break;
      }
      if (score > bestScore) { bestScore = score; best = col; }
    }
    return best;
  }

  function pickBestValueCol(rows: Row[], cols: string[]): string {
    let best = '';
    let bestSum = -1;
    for (const col of cols) {
      let sum = 0;
      let checked = 0;
      for (const r of rows) {
        const v = r[col];
        const n = typeof v === 'number' ? v : Number(String(v).replace(/[$,€£¥\s]/g, ''));
        if (!isNaN(n)) { sum += Math.abs(n); checked++; }
        if (checked >= 10) break;
      }
      if (sum > bestSum) { bestSum = sum; best = col; }
    }
    return best || cols[0] || '';
  }

  const _DATE_KEYS = ['date','time','timestamp','day','month','year','created','updated','period','ds','datetime','released','submitted'];

  useEffect(() => {
    if (!id) return;
    loadData(id);
  }, [id]);

  async function loadData(datasetId: string) {
    setLoading(true);
    try {
      let dataRows: Row[] = [];
      let allCols: string[] = [];
      let dateCandidates: string[] = [];
      let numCandidates: string[] = [];

      if (datasetId.startsWith('local-')) {
        const stored = sessionStorage.getItem(datasetId);
        if (stored) {
          const parsed = JSON.parse(stored);
          dataRows = parsed.rows || [];
          allCols = (parsed.meta || []).map((m: any) => m.name);
          const meta = parsed.meta || [];
          dateCandidates = allCols.filter((c: string) => {
            const cl = c.toLowerCase();
            return _DATE_KEYS.some(k => cl.includes(k));
          });
          numCandidates = meta.filter((m: any) => m.type === 'numeric').map((m: any) => m.name);
        }
      } else {
        try {
          const ds = await getDataset(datasetId);
          allCols = (ds.columns_meta || []).map((m: any) => m.name);
          dateCandidates = allCols.filter((c: string) => {
            const cl = c.toLowerCase();
            return _DATE_KEYS.some(k => cl.includes(k));
          });
          numCandidates = (ds.columns_meta || []).filter((m: any) => m.type === 'numeric').map((m: any) => m.name);
        } catch {
          // fallback
        }
      }

      const bestDate = pickBestDateCol(dataRows, dateCandidates.length ? dateCandidates : allCols);
      const bestValue = pickBestValueCol(dataRows, numCandidates.length ? numCandidates : allCols);

      setRows(dataRows);
      setColumns(allCols);
      setDateCols(dateCandidates.length ? dateCandidates : allCols);
      setNumCols(numCandidates.length ? numCandidates : allCols);
      setDateCol(bestDate || allCols[0] || '');
      setValueCol(bestValue || allCols[0] || '');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function parseVal(v: any): number {
    if (v == null || v === '') return NaN;
    const n = typeof v === 'number' ? v : Number(String(v).replace(/[$,€£¥\s]/g, ''));
    return isNaN(n) ? NaN : n;
  }

  function parseDate(v: any): Date | null {
    if (v == null || v === '') return null;
    if (typeof v !== 'string') return null;
    const d = new Date(v);
    if (isNaN(d.getTime())) return null;
    if (d.getTime() < 946684800000) return null;
    return d;
  }

  function clientForecast(): ForecastResult {
    if (!dateCol || !valueCol || !rows.length) return { forecast: [], error: 'No data' };

    const valid = [] as { ds: Date; y: number }[];
    for (const r of rows) {
      const d = parseDate(r[dateCol]);
      const y = parseVal(r[valueCol]);
      if (d && !isNaN(y)) valid.push({ ds: d, y });
    }
    valid.sort((a, b) => a.ds.getTime() - b.ds.getTime());

    if (valid.length < 4) {
      const err = valid.length === 0
        ? `No valid dates or numeric values found in "${dateCol}" / "${valueCol}". Try a different column.`
        : `Need at least 4 valid rows, got ${valid.length}`;
      return { forecast: [], error: err };
    }

    const n = valid.length;
    const t = Array.from({ length: n }, (_, i) => i);
    const y = valid.map(r => r.y);

    const tMean = t.reduce((a, b) => a + b, 0) / n;
    const yMean = y.reduce((a, b) => a + b, 0) / n;
    const num = t.reduce((s, ti, i) => s + (ti - tMean) * (y[i] - yMean), 0);
    const den = t.reduce((s, ti) => s + (ti - tMean) ** 2, 0);
    const slope = den ? num / den : 0;
    const intercept = yMean - slope * tMean;

    const trend = t.map(ti => slope * ti + intercept);
    const detrended = y.map((yi, i) => yi - trend[i]);

    let period = 1;
    if (valid.length > 2) {
      const ms = valid[1].ds.getTime() - valid[0].ds.getTime();
      const days = ms > 0 ? Math.round(ms / 86400000) : 1;
      period = days <= 1 ? 7 : days < 7 ? 30 : 365;
    }

    const seasonal = new Array(n).fill(0);
    if (period > 1 && n >= period * 2) {
      const pattern = new Array(period).fill(0);
      const counts = new Array(period).fill(0);
      for (let i = 0; i < n; i++) {
        pattern[i % period] += detrended[i];
        counts[i % period]++;
      }
      for (let i = 0; i < period; i++) {
        pattern[i] = counts[i] > 0 ? pattern[i] / counts[i] : 0;
      }
      for (let i = 0; i < n; i++) {
        seasonal[i] = pattern[i % period];
      }
    }

    const residuals = y.map((yi, i) => yi - trend[i] - seasonal[i]);
    const resStd = residuals.length > 1 ? Math.sqrt(residuals.reduce((s, r) => s + r * r, 0) / (residuals.length - 1)) : 0;

    const lastTs = valid[valid.length - 1].ds.getTime();
    const forecast: ForecastPoint[] = [];
    for (let i = 1; i <= periods; i++) {
      const ti = n - 1 + i;
      const trendVal = slope * ti + intercept;
      const seasonalVal = period > 1 ? (seasonal[(n - 1 + i) % period] || 0) : 0;
      const yhat = trendVal + seasonalVal;
      forecast.push({
        ds: new Date(lastTs + i * 86400000).toISOString().split('T')[0],
        yhat: +yhat.toFixed(4),
        yhat_lower: +(yhat - 1.96 * resStd).toFixed(4),
        yhat_upper: +(yhat + 1.96 * resStd).toFixed(4),
      });
    }

    return {
      forecast,
      actuals: valid.map(r => ({ ds: r.ds.toISOString().split('T')[0], y: +r.y.toFixed(4) })),
      components: { trend, seasonal },
      metadata: { rows_used: n, periods_forecasted: periods, date_col: dateCol, value_col: valueCol, seasonality_period: period },
    };
  }

  async function handleGenerate() {
    if (!dateCol || !valueCol) return;
    setForecasting(true);
    setResult(null);
    try {
      if (id?.startsWith('local-')) {
        const res = clientForecast();
        setResult(res);
      } else {
        const res = await runForecast(id!, dateCol, valueCol, periods, true);
        setResult(res);
      }
    } catch (err: any) {
      setResult({ forecast: [], error: err.message || 'Forecast failed' });
    } finally {
      setForecasting(false);
    }
  }

  if (loading) {
    return (
      <div className="empty-state">
        <div style={{ width: 36, height: 36, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }}></div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>Loading columns...</div>
      </div>
    );
  }

  if (!columns.length) {
    return (
      <div className="empty-state">
        <BarChart3 size={48} style={{ opacity: 0.3, marginBottom: 12 }} />
        <div>No data found. <a onClick={() => navigate('/app')} style={{ cursor: 'pointer', color: 'var(--accent)' }}>Upload a dataset</a></div>
      </div>
    );
  }

  const chartData = result?.forecast ? [
    ...(result.actuals || []).map(a => ({ ds: a.ds, actual: a.y, forecast: null, lower: null, upper: null })),
    ...result.forecast.map(f => ({ ds: f.ds, actual: null, forecast: f.yhat, lower: f.yhat_lower, upper: f.yhat_upper })),
  ] : [];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <TrendingUp size={20} style={{ color: 'var(--accent)' }} />
        <span style={{ fontWeight: 600, fontSize: 16 }}>Forecast</span>
        <span style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
          {id?.startsWith('local-') ? 'Local mode' : 'Online mode'}
        </span>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'end', flexWrap: 'wrap' }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>Date column</label>
            <select value={dateCol} onChange={e => setDateCol(e.target.value)}
              style={{ background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 6, padding: '8px 12px', fontSize: 13, fontFamily: 'var(--font-mono)' }}>
              <option value="">-- select --</option>
              {dateCols.map(c => <option key={c} value={c}>{c}</option>)}
              {columns.filter(c => !dateCols.includes(c)).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>Value column</label>
            <select value={valueCol} onChange={e => setValueCol(e.target.value)}
              style={{ background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 6, padding: '8px 12px', fontSize: 13, fontFamily: 'var(--font-mono)' }}>
              <option value="">-- select --</option>
              {numCols.map(c => <option key={c} value={c}>{c}</option>)}
              {columns.filter(c => !numCols.includes(c)).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>Forecast periods</label>
            <input type="number" min={1} max={365} value={periods} onChange={e => setPeriods(Math.max(1, Math.min(365, +e.target.value || 30)))}
              style={{ width: 80, background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 6, padding: '8px 12px', fontSize: 13, fontFamily: 'var(--font-mono)' }} />
          </div>
          <button className="btn" onClick={handleGenerate} disabled={forecasting || !dateCol || !valueCol}
            style={{ background: 'var(--accent)', color: '#0a0e1a', fontWeight: 600, padding: '8px 20px', border: 'none', borderRadius: 8, cursor: 'pointer', opacity: forecasting || !dateCol || !valueCol ? 0.5 : 1, fontSize: 13 }}>
            {forecasting ? 'Generating...' : 'Generate Forecast'}
          </button>
        </div>
      </div>

      {result?.error && (
        <div className="card" style={{ textAlign: 'center', padding: 24 }}>
          <div style={{ color: '#ef4444', fontSize: 14 }}>{result.error}</div>
        </div>
      )}

      {result && chartData.length > 0 && !result.error && (() => {
        const r = result!;
        return (
        <>
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="section-title" style={{ marginTop: 0 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }}></span>
              Forecast vs Actuals
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00d4aa" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#00d4aa" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(42,53,85,0.4)" strokeDasharray="3 3" />
                <XAxis dataKey="ds" tick={{ fill: '#64748b', fontSize: 10 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
                <Tooltip contentStyle={{ background: '#1e2740', border: '1px solid #2a3555', borderRadius: 8 }} />
                <Area type="monotone" dataKey="upper" stroke="none" fill="#00d4aa" fillOpacity={0.08} />
                <Area type="monotone" dataKey="lower" stroke="none" fill="#1e2740" fillOpacity={1} />
                <Line type="monotone" dataKey="actual" stroke="#3b82f6" strokeWidth={2} dot={false} name="Actual" />
                <Line type="monotone" dataKey="forecast" stroke="#00d4aa" strokeWidth={2.5} strokeDasharray="5 5" dot={false} name="Forecast" />
              </AreaChart>
            </ResponsiveContainer>
            {r.components && (
              <div style={{ display: 'flex', gap: 24, marginTop: 12, fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                <span>Rows: {r.metadata?.rows_used}</span>
                <span>Forecast: {r.metadata?.periods_forecasted} periods</span>
                <span>Seasonality: every {r.metadata?.seasonality_period} days</span>
              </div>
            )}
          </div>

          <div className="card">
            <div className="section-title" style={{ marginTop: 0 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent2)' }}></span>
              Forecast Values
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, padding: '8px 12px', borderBottom: '1px solid var(--border)' }}>Date</th>
                    <th style={{ textAlign: 'right', color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, padding: '8px 12px', borderBottom: '1px solid var(--border)' }}>Forecast</th>
                    <th style={{ textAlign: 'right', color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, padding: '8px 12px', borderBottom: '1px solid var(--border)' }}>Lower (95%)</th>
                    <th style={{ textAlign: 'right', color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, padding: '8px 12px', borderBottom: '1px solid var(--border)' }}>Upper (95%)</th>
                    <th style={{ textAlign: 'right', color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, padding: '8px 12px', borderBottom: '1px solid var(--border)' }}>Range</th>
                  </tr>
                </thead>
                <tbody>
                  {r.forecast.slice(-30).map((f, i) => {
                    const range = f.yhat_upper - f.yhat_lower;
                    return (
                      <tr key={i}>
                        <td style={{ padding: '6px 12px', borderBottom: '1px solid rgba(42,53,85,0.3)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>{f.ds}</td>
                        <td style={{ padding: '6px 12px', borderBottom: '1px solid rgba(42,53,85,0.3)', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--accent)' }}>{f.yhat.toFixed(2)}</td>
                        <td style={{ padding: '6px 12px', borderBottom: '1px solid rgba(42,53,85,0.3)', textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--dim)' }}>{f.yhat_lower.toFixed(2)}</td>
                        <td style={{ padding: '6px 12px', borderBottom: '1px solid rgba(42,53,85,0.3)', textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--dim)' }}>{f.yhat_upper.toFixed(2)}</td>
                        <td style={{ padding: '6px 12px', borderBottom: '1px solid rgba(42,53,85,0.3)', textAlign: 'right', fontFamily: 'var(--font-mono)', color: '#f59e0b', fontSize: 11 }}>±{(range / 2).toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {r.forecast.length > 30 && (
              <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginTop: 8, textAlign: 'center' }}>
                Showing last 30 of {r.forecast.length} forecast periods
              </div>
            )}
          </div>
        </>
        );
      })()}
    </div>
  );
}
