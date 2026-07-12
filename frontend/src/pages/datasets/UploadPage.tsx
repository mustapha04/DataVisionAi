import { useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, Database, TrendingUp, Zap, Check, X, AlertTriangle } from 'lucide-react';
import Papa from 'papaparse';
import { createClient } from '@supabase/supabase-js';
import api from '@/services/api';
import type { ColumnMeta } from '@/types';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || 'https://pjnkkhmfwjismqveipok.supabase.co',
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_J5suxlNBcL4nrbxEUgz_Ug_gzzZGbsV'
);

const DEMO_CSV = `product_name,category,price,units_sold,revenue,earnings,downloads,refunds,rating,country
Soccer Star World Cup Legend,Sports,9.99,39,97.79,78.23,60,2,4.5,US
Kids Piano Learning Music,Kids,4.99,3,14.97,11.97,9,0,4.8,US
Football Games Soccer,Sports,9.99,1,9.99,7.99,4,0,4.2,US
Farm Tractor Rescue Mission,Vehicles,9.99,1,9.99,7.99,3,0,4.0,US
City Bus Driving Simulator,Vehicles,1.99,5,9.95,7.95,8,1,4.1,US
Bowling Strike Master 3D,Sports,1.99,5,9.95,7.95,10,0,4.3,US
Drawing & Coloring,Kids,0.99,3,6.97,5.57,9,0,4.6,US`;

const DEMO_FILE = new File([DEMO_CSV], 'amazon_appstore_demo.csv', { type: 'text/csv' });

function clientClean(rows: any[], meta: ColumnMeta[], config: Record<string, any>) {
  let cleaned = [...rows];
  let activeMeta = [...meta];
  const report: Record<string, any> = {};

  if (config.drop_fully_null !== false) {
    const fullyNull = meta.filter(c => c.nulls === c.total && c.total > 0);
    if (fullyNull.length) {
      const names = new Set(fullyNull.map(c => c.name));
      activeMeta = activeMeta.filter(c => !names.has(c.name));
      cleaned = cleaned.map(r => { const n: any = {}; Object.entries(r).forEach(([k, v]) => { if (!names.has(k)) n[k] = v; }); return n; });
      report.fully_null_columns_dropped = fullyNull.map(c => c.name);
    }
  }

  if (config.deduplicate) {
    const before = cleaned.length;
    const seen = new Set();
    cleaned = cleaned.filter(r => {
      const key = JSON.stringify(r);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    if (before - cleaned.length > 0) report.duplicates_removed = before - cleaned.length;
  }

  const fill = config.fill_missing;
  if (fill && fill !== 'none') {
    let filled = 0;
    cleaned = cleaned.map(r => {
      const nr = { ...r };
      meta.forEach(c => {
        if (nr[c.name] == null || nr[c.name] === '' || nr[c.name] === undefined) {
          filled++;
          if (c.type === 'numeric') {
            nr[c.name] = fill === 'zero' ? 0 : 0;
          } else {
            nr[c.name] = 'Unknown';
          }
        }
      });
      return nr;
    });
    if (filled > 0) report.nulls_filled = filled;
  }

  return { cleaned, meta: activeMeta, report, rows_before: rows.length, rows_after: cleaned.length };
}

export default function UploadPage() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cleaning, setCleaning] = useState(false);
  const [stage, setStage] = useState<'upload' | 'quality'>('upload');
  const [parseResult, setParseResult] = useState<{
    rows: any[]; meta: ColumnMeta[]; fileName: string; quality: number;
    datasetId: string; isLocal: boolean;
  } | null>(null);
  const [cleanConfig, setCleanConfig] = useState<Record<string, any>>({
    deduplicate: true, fill_missing: 'auto', remove_outliers: 'none',
  });

  const processFile = useCallback(async (file: File) => {
    setLoading(true);
    try {
      const text = await file.text();
      const result = Papa.parse(text, { header: true, dynamicTyping: true, skipEmptyLines: true });
      const rows = result.data as any[];
      const fields = result.meta?.fields || [];

      if (!rows.length) { alert('No data found in file.'); setLoading(false); return; }

      const meta: ColumnMeta[] = fields.map(name => {
        const vals = rows.map(r => r[name]).filter((v: any) => v != null && v !== '');
        const nums = vals.filter((v: any) => typeof v === 'number' && !isNaN(v));
        const isNum = nums.length > vals.length * 0.6;
        if (isNum) {
          return { name, type: 'numeric', nulls: rows.length - vals.length, total: rows.length,
            min: Math.min(...nums), max: Math.max(...nums), mean: nums.reduce((a: number, b: number) => a + b, 0) / nums.length,
            median: nums.sort((a: number, b: number) => a - b)[Math.floor(nums.length / 2)], sum: nums.reduce((a: number, b: number) => a + b, 0) };
        }
        const freq: Record<string, number> = {};
        vals.forEach((v: string) => { freq[v] = (freq[v] || 0) + 1; });
        const top = Object.entries(freq).sort((a, b) => b[1] - a[1])[0];
        return { name, type: 'categorical', nulls: rows.length - vals.length, total: rows.length,
          unique: Object.keys(freq).length, top_value: top?.[0] as string, top_count: top?.[1] as number };
      });

      const nullCells = meta.reduce((s, c) => s + c.nulls, 0);
      const quality = Math.round((1 - nullCells / (rows.length * fields.length)) * 100);

      const userId = 'demo-user';
      const dsPayload = {
        user_id: userId, file_name: file.name, row_count: rows.length,
        column_count: fields.length, data_quality_score: quality,
        columns_meta: meta, data_hash: btoa(text.slice(0, 100)),
      };
      const { data: ds, error } = await supabase.from('datasets').insert(dsPayload).select().single();
      if (error) {
        console.log('Supabase unavailable, using local mode');
        setParseResult({ rows, meta, fileName: file.name, quality, datasetId: 'local-' + Date.now(), isLocal: true });
        setStage('quality');
        setLoading(false);
        return;
      }

      const { data: inserted } = await supabase.from('datasets').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(1);
      const datasetId = ds?.id || inserted?.[0]?.id;
      setParseResult({ rows, meta, fileName: file.name, quality, datasetId, isLocal: false });
      setStage('quality');
    } catch (err) {
      console.error(err);
      alert('Error processing file.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleClean = useCallback(async () => {
    if (!parseResult) return;
    setCleaning(true);

    try {
      if (parseResult.isLocal) {
        const { cleaned, meta: cleanedMeta, report } = clientClean(parseResult.rows, parseResult.meta, cleanConfig);
        sessionStorage.setItem(parseResult.datasetId, JSON.stringify({
          rows: cleaned, meta: cleanedMeta, fileName: parseResult.fileName, cleaning_report: report,
        }));
        navigate(`/app/dashboard/${parseResult.datasetId}`);
      } else {
        await api.post(`/api/datasets/${parseResult.datasetId}/clean`, { config: cleanConfig });
        navigate(`/app/dashboard/${parseResult.datasetId}`);
      }
    } catch (err) {
      console.error(err);
      navigate(`/app/dashboard/${parseResult.datasetId}`);
    }
  }, [parseResult, cleanConfig, navigate]);

  const handleSkip = useCallback(() => {
    if (!parseResult) return;
    if (parseResult.isLocal) {
      sessionStorage.setItem(parseResult.datasetId, JSON.stringify({
        rows: parseResult.rows, meta: parseResult.meta, fileName: parseResult.fileName,
      }));
    }
    navigate(`/app/dashboard/${parseResult.datasetId}`);
  }, [parseResult, navigate]);

  if (stage === 'quality' && parseResult) {
    const nullCols = parseResult.meta.filter(c => c.nulls > 0);
    const totalCells = parseResult.rows.length * parseResult.meta.length;
    const nullCells = parseResult.meta.reduce((s, c) => s + c.nulls, 0);
    const qualityColor = parseResult.quality >= 80 ? 'var(--accent)' : parseResult.quality >= 50 ? '#f59e0b' : '#ef4444';

    return (
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'rgba(0,212,170,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Database size={22} style={{ color: 'var(--accent)' }} />
            </div>
            <div>
              <div style={{ fontWeight: 600 }}>{parseResult.fileName}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                {parseResult.rows.length} rows · {parseResult.meta.length} columns
              </div>
            </div>
            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
              <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--font-mono)', color: qualityColor }}>
                {parseResult.quality}%
              </div>
              <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Data Quality
              </div>
            </div>
          </div>

          <div style={{ height: 6, background: 'var(--surface)', borderRadius: 3, marginBottom: 16, overflow: 'hidden' }}>
            <div style={{ width: `${parseResult.quality}%`, height: '100%', background: qualityColor, borderRadius: 3, transition: 'width 0.5s' }}></div>
          </div>

          {nullCols.length > 0 && (
            <div style={{
              background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)',
              borderRadius: 8, padding: '12px 16px', marginBottom: 16,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <AlertTriangle size={16} style={{ color: '#f59e0b' }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: '#fcd34d' }}>
                  {nullCells} missing values found in {nullCols.length} columns
                </span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {nullCols.slice(0, 8).map(c => (
                  <span key={c.name} style={{
                    fontSize: 11, fontFamily: 'var(--font-mono)', background: 'rgba(245,158,11,0.1)',
                    color: '#fcd34d', padding: '3px 10px', borderRadius: 6,
                  }}>
                    {c.name}: {c.nulls}/{c.total} null
                  </span>
                ))}
              </div>
            </div>
          )}

          {parseResult.quality < 100 && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>
                Recommended Cleaning
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13 }}>
                  <input type="checkbox" checked={cleanConfig.deduplicate}
                    onChange={e => setCleanConfig(c => ({ ...c, deduplicate: e.target.checked }))}
                    style={{ accentColor: 'var(--accent)' }} />
                  Remove duplicate rows
                </label>
        {nullCols.some(c => c.nulls === c.total) && (
          <div style={{ fontSize: 12, color: '#fcd34d', marginBottom: 6, padding: '6px 10px', background: 'rgba(245,158,11,0.08)', borderRadius: 6 }}>
            {nullCols.filter(c => c.nulls === c.total).length} columns are 100% empty — they will be automatically removed
          </div>
        )}
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13 }}>
          <input type="checkbox" checked={cleanConfig.fill_missing !== 'none'}
            onChange={e => setCleanConfig(c => ({ ...c, fill_missing: e.target.checked ? 'auto' : 'none' }))}
            style={{ accentColor: 'var(--accent)' }} />
          Fill missing values (auto: median for numbers, mode for text)
        </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13 }}>
                  <input type="checkbox" checked={cleanConfig.remove_outliers !== 'none'}
                    onChange={e => setCleanConfig(c => ({ ...c, remove_outliers: e.target.checked ? 'iqr' : 'none' }))}
                    style={{ accentColor: 'var(--accent)' }} />
                  Remove outliers (IQR method)
                </label>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button className="btn" onClick={handleSkip} disabled={cleaning}>
              <X size={14} style={{ marginRight: 4 }} /> Skip
            </button>
            <button className="btn btn-primary" onClick={handleClean} disabled={cleaning}>
              {cleaning ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 14, height: 14, border: '2px solid rgba(10,14,26,0.3)', borderTopColor: '#0a0e1a', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                  Cleaning...
                </span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Check size={16} /> Clean & Continue
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--muted)', marginBottom: 10 }}>
            Column Preview
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {parseResult.meta.slice(0, 12).map(c => (
              <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                <span style={{
                  display: 'inline-block', padding: '1px 6px', borderRadius: 4, fontSize: 10,
                  background: c.type === 'numeric' ? 'rgba(0,212,170,0.12)' : 'rgba(59,130,246,0.12)',
                  color: c.type === 'numeric' ? 'var(--accent)' : '#93c5fd',
                  fontFamily: 'var(--font-mono)', fontWeight: 600,
                }}>{c.type === 'numeric' ? '#' : 'A'}</span>
                <span style={{ flex: 1, color: 'var(--text)' }}>{c.name}</span>
                {c.nulls > 0 && (
                  <span style={{ color: '#f59e0b', fontSize: 11, fontFamily: 'var(--font-mono)' }}>
                    {c.nulls} null
                  </span>
                )}
                {c.type === 'numeric' && c.nulls === 0 && (
                  <span style={{ color: 'var(--dim)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>
                    {c.min?.toFixed(1)} – {c.max?.toFixed(1)}
                  </span>
                )}
                {c.type === 'categorical' && (
                  <span style={{ color: 'var(--dim)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>
                    {c.unique} unique
                  </span>
                )}
              </div>
            ))}
          </div>
          <div style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center', marginTop: 8 }}>
            {parseResult.meta.length} columns total
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 640, margin: '48px auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Intelligent Data Analytics</h1>
        <p style={{ fontSize: 15, color: 'var(--muted)' }}>
          Upload a dataset — PredictIQ analyzes, visualizes, and generates AI insights
        </p>
      </div>

      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) processFile(f); }}
        onClick={() => inputRef.current?.click()}
        style={{
          border: `2px dashed ${dragOver ? 'var(--accent)' : 'var(--border)'}`,
          borderRadius: 16, padding: '60px 32px', textAlign: 'center', cursor: 'pointer',
          background: dragOver ? 'rgba(0,212,170,0.04)' : 'var(--surface)',
          transition: 'all 0.3s',
        }}
      >
        <Upload size={48} style={{ marginBottom: 12, opacity: 0.5, color: 'var(--muted)' }} />
        <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>
          {loading ? 'Processing...' : 'Drop your dataset here'}
        </div>
        <div style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 20 }}>
          CSV, JSON, TSV, or Excel
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
          {['CSV', 'JSON', 'TSV', 'XLSX'].map(f => (
            <span key={f} style={{
              background: 'var(--card)', border: '1px solid var(--border)',
              borderRadius: 6, padding: '4px 12px', fontSize: 12,
              fontFamily: 'var(--font-mono)', color: 'var(--dim)'
            }}>{f}</span>
          ))}
        </div>
        <input ref={inputRef} type="file" accept=".csv,.json,.tsv,.txt,.xls,.xlsx"
          style={{ display: 'none' }}
          onChange={e => { if (e.target.files?.[0]) processFile(e.target.files[0]); }}
        />
        <button className="btn btn-primary" onClick={e => { e.stopPropagation(); inputRef.current?.click(); }}
          disabled={loading}>
          {loading ? '⏳ Analyzing...' : 'Browse Files'}
        </button>
      </div>

      <div style={{ marginTop: 16, textAlign: 'center' }}>
        <button className="btn" onClick={() => processFile(DEMO_FILE)} disabled={loading}>
          <FileText size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
          Try Demo — Amazon App Store Sales
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginTop: 32 }}>
        {[
          { icon: <Database size={20} />, title: 'Auto-Clean', sub: 'Missing values handled' },
          { icon: <TrendingUp size={20} />, title: 'Smart Charts', sub: 'Auto-selected visuals' },
          { icon: <Zap size={20} />, title: 'AI Insights', sub: 'Actionable intelligence' },
        ].map((item, i) => (
          <div key={i} className="card" style={{ textAlign: 'center', padding: 20 }}>
            <div style={{ marginBottom: 8, color: 'var(--accent)' }}>{item.icon}</div>
            <div style={{ fontWeight: 600, marginBottom: 2 }}>{item.title}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>{item.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
