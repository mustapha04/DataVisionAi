import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Brain, TrendingUp, AlertTriangle, Lightbulb, DollarSign, Loader2 } from 'lucide-react';
import type { ColumnMeta, InsightItem } from '@/types';
import { supabase } from '@/services/supabase';
import { generateInsights } from '@/services/api';

interface LocalData { rows: any[]; meta: ColumnMeta[]; fileName: string; }

const analysisTypes = [
  { key: 'full', label: 'Full Analysis', icon: <Brain size={14} /> },
  { key: 'trends', label: 'Trend Analysis', icon: <TrendingUp size={14} /> },
  { key: 'opportunities', label: 'Opportunities', icon: <Lightbulb size={14} /> },
  { key: 'pricing', label: 'Pricing Strategy', icon: <DollarSign size={14} /> },
  { key: 'risks', label: 'Risk Alerts', icon: <AlertTriangle size={14} /> },
];

export default function InsightsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<LocalData | null>(null);
  const [result, setResult] = useState<{ insights: InsightItem[]; summary: string; key_metrics: Record<string, string> } | null>(null);

  useEffect(() => {
    if (!id) return;
    loadData();
  }, [id]);

  async function loadData() {
    setLoading(true);
    try {
      if (id?.startsWith('local-')) {
        const stored = sessionStorage.getItem(id!);
        if (stored) { setData(JSON.parse(stored)); setLoading(false); return; }
      }
      const { data: ds } = await supabase.from('datasets').select('*').eq('id', id!).single();
      if (!ds) throw new Error('Not found');
      const preview = ds.preview_data || {};
      setData({ rows: preview.rows || [], meta: ds.columns_meta || [], fileName: ds.file_name });
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  }

  async function generate(type: string) {
    if (!data || !id) return;
    setGenerating(type);
    setError(null);
    setResult(null);

    try {
      const isLocal = id.startsWith('local-');
      const res = await generateInsights(
        id, type,
        isLocal ? data.rows : [],
        isLocal ? data.meta : [],
      );
      const content = res.content;
      if (content && content.insights) {
        setResult({
          insights: content.insights,
          summary: content.summary || '',
          key_metrics: content.key_metrics || {},
        });
      } else {
        setError('AI returned empty insights. Try a different analysis type.');
      }
    } catch (err: any) {
      let msg = err?.response?.data?.detail || err.message || 'Failed to generate insights';
      if (err.code === 'ECONNABORTED' || msg?.includes?.('timeout')) {
        msg = 'Request timed out (180s). The AI model may be slow — try again or use a different analysis type.';
      }
      setError(msg);
    } finally {
      setGenerating(null);
    }
  }

  if (loading) {
    return (
      <div className="empty-state">
        <div style={{ width: 36, height: 36, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }}></div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>Loading...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="empty-state">
        <Brain size={48} style={{ opacity: 0.3, marginBottom: 12 }} />
        <div>No data found. <a onClick={() => navigate('/app')} style={{ cursor: 'pointer', color: 'var(--accent)' }}>Upload a dataset</a></div>
      </div>
    );
  }

  const tagClass = (t: string) =>
    t === 'opportunity' ? { background: 'rgba(0,212,170,0.12)', color: 'var(--accent)' } :
    t === 'warning' ? { background: 'rgba(245,158,11,0.15)', color: '#fcd34d' } :
    { background: 'rgba(59,130,246,0.15)', color: '#93c5fd' };

  const borderClass = (t: string) =>
    t === 'warning' ? '3px solid var(--accent3)' :
    t === 'insight' ? '3px solid var(--accent2)' : '3px solid var(--accent)';

  return (
    <div>
      <div className="section-title" style={{ marginTop: 0 }}>
        <Brain size={18} /> AI-Powered Insights
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        {analysisTypes.map(at => (
          <button key={at.key} className="btn" onClick={() => generate(at.key)}
            disabled={generating !== null}
            style={generating === at.key ? { background: 'var(--accent)', color: '#0a0e1a', borderColor: 'var(--accent)' } : {}}>
            {at.icon}
            <span style={{ marginLeft: 4 }}>{generating === at.key ? 'Analyzing...' : at.label}</span>
          </button>
        ))}
      </div>

      {generating && (
        <div className="card" style={{ textAlign: 'center', padding: 32 }}>
          <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px', color: 'var(--accent)' }} />
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)' }}>
            {data.fileName} · {data.rows.length} rows · {data.meta.length} cols
          </div>
        </div>
      )}

      {error && !generating && (
        <div className="card" style={{ borderLeft: '3px solid var(--danger)', padding: 14, marginBottom: 16 }}>
          <div style={{ fontWeight: 600, color: 'var(--danger)', marginBottom: 4 }}>Error generating insights</div>
          <div style={{ fontSize: 12, color: 'var(--dim)' }}>{error}</div>
        </div>
      )}

      {result && !generating && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', marginBottom: 16 }}>
            <div className="status-dot"></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 500 }}>Analysis Complete</div>
              <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                {data.fileName} · {data.rows.length} rows
              </div>
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--accent)' }}>✓ Ready</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 12, marginBottom: 20 }}>
            {result.insights.map((ins, i) => (
              <div key={i} className="card" style={{ borderLeft: borderClass(ins.type) }}>
                <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 4, fontSize: 10, fontFamily: 'var(--font-mono)', marginBottom: 8, ...tagClass(ins.type) }}>
                  {ins.type.toUpperCase()}
                </span>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>{ins.title}</div>
                <div style={{ fontSize: 13, color: 'var(--dim)', lineHeight: 1.6, marginBottom: 8 }}>{ins.finding}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>
                  <strong>Impact:</strong> {ins.impact}
                </div>
                <div style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 500 }}>
                  → {ins.action}
                </div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
                  ⚠ {ins.risk}
                </div>
              </div>
            ))}
          </div>

          {result.summary && (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 20, lineHeight: 1.8, marginBottom: 20 }}>
              <h3 style={{ color: 'var(--accent)', fontSize: 13, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
                Executive Summary
              </h3>
              <p style={{ fontSize: 14, color: 'var(--dim)' }}>{result.summary}</p>
              {Object.keys(result.key_metrics).length > 0 && (
                <>
                  <h3 style={{ color: 'var(--accent)', fontSize: 13, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: 0.5, margin: '16px 0 6px', paddingTop: 8, borderTop: '1px solid var(--border)' }}>
                    Key Metrics
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
                    {Object.entries(result.key_metrics).map(([key, val]) => (
                      <div key={key} className="card" style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>{key}</div>
                        <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{val}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </>
      )}

      {!result && !generating && !error && (
        <div className="empty-state">
          <Brain size={48} style={{ opacity: 0.3, marginBottom: 12 }} />
          <div>Click an analysis type above to generate AI-powered insights</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
            PredictIQ will analyze {data.rows.length} rows across {data.meta.length} dimensions
          </div>
        </div>
      )}
    </div>
  );
}
