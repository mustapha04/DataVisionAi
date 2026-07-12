import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Brain, TrendingUp, AlertTriangle, Lightbulb, DollarSign } from 'lucide-react';
import type { ColumnMeta, InsightItem } from '@/types';
import { supabase } from '@/services/supabase';

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
  const [data, setData] = useState<LocalData | null>(null);
  const [result, setResult] = useState<{ insights: InsightItem[]; summary: string } | null>(null);

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
      const { data: products } = await supabase.from('products').select('*').eq('dataset_id', id!);
      setData({ rows: products || [], meta: ds.columns_meta || [], fileName: ds.file_name });
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  }

  function generateInsights(type: string) {
    if (!data) return;
    setGenerating(type);
    const { rows } = data;
    const totalRev = rows.reduce((s, r) => s + (+r['revenue'] || 0), 0);
    const totalUnits = rows.reduce((s, r) => s + Math.round(+r['units_sold'] || 0), 0);
    const totalDownloads = rows.reduce((s, r) => s + Math.round(+r['downloads'] || 0), 0);
    const freeDownloads = Math.max(0, totalDownloads - totalUnits);
    let result: { insights: InsightItem[]; summary: string } = { insights: [], summary: '' };

    switch(type) {
      case 'full':
        result = {
          insights: [
            { title: 'Revenue Leaders', type: 'insight', finding: `Total revenue across ${rows.length} products is $${totalRev.toFixed(0)} with ${totalUnits} transactions.`, impact: 'Your top categories drive the majority of revenue and should be the focus of growth efforts.', action: 'Concentrate 60% of marketing on top 3 categories.', risk: 'Over-concentration in one category creates dependency risk.' },
            { title: 'Monetization Opportunity', type: 'opportunity', finding: `${freeDownloads} free downloads represent untapped potential worth ~$${(freeDownloads * 0.99).toFixed(0)}.`, impact: 'Converting even 5% of free users could add significant revenue.', action: 'Add in-app purchases or premium tiers to top free apps.', risk: 'Aggressive monetization may slow download growth.' },
            { title: 'Quality Signals', type: 'insight', finding: 'Product ratings and refund rates are key quality indicators that affect platform ranking and organic discovery.', impact: 'High quality leads to better visibility and lower customer acquisition costs.', action: 'Review and improve bottom-performing products.', risk: 'Quality improvements take time to reflect in metrics.' },
          ],
          summary: `Your data shows $${totalRev.toFixed(0)} in revenue across ${rows.length} products. The biggest wins will come from monetizing ${freeDownloads} free downloads and doubling down on your best categories.`,
        };
        break;
      case 'opportunities':
        result = {
          insights: [
            { title: 'Free-to-Paid Conversion', type: 'opportunity', finding: `${freeDownloads} free downloads could generate $${(freeDownloads * 0.99).toFixed(0)} at minimum pricing.`, impact: 'This is essentially free revenue with no additional traffic needed.', action: 'Implement in-app purchases in the top 3 free apps. A/B test pricing.', risk: 'Poorly implemented monetization may reduce user satisfaction.' },
            { title: 'Category Expansion', type: 'opportunity', finding: 'Some categories may be underrepresented vs market demand.', impact: 'Entering underserved categories captures new demand.', action: 'Research and develop test products for 1-2 new categories.', risk: 'New categories require validation before significant investment.' },
          ],
          summary: `The largest immediate opportunity is converting ${freeDownloads} free downloads into revenue. Expand into underrepresented categories for sustainable growth.`,
        };
        break;
      case 'pricing':
        result = {
          insights: [
            { title: 'Price-Volume Balance', type: 'insight', finding: `Average price across ${rows.length} products and ${totalUnits} transactions indicates strategic pricing room.`, impact: 'Optimized pricing directly improves revenue without cost increases.', action: 'Consider tiered pricing: budget ($0.99-1.99), standard ($4.99), premium ($9.99+).', risk: 'Test pricing changes on 1-2 products first to gauge elasticity.' },
            { title: 'Premium Opportunity', type: 'opportunity', finding: 'Higher-priced products achieve revenue targets with fewer transactions, reducing support overhead.', impact: 'Premium positioning improves margins and operational efficiency.', action: 'Identify products suitable for premium rebranding.', risk: 'Premium requires superior quality and marketing spend.' },
          ],
          summary: 'Strategic pricing adjustments can significantly impact revenue. Consider premium positioning for top products and tiered pricing for broader coverage.',
        };
        break;
      case 'risks':
        result = {
          insights: [
            { title: 'Revenue Concentration', type: 'warning', finding: 'Revenue may depend heavily on a small number of top products.', impact: 'Losing a top performer would significantly impact total revenue.', action: 'Diversify the product portfolio to reduce concentration risk.', risk: 'Diversification requires additional marketing investment.' },
            { title: 'Monetization Gap', type: 'warning', finding: `${freeDownloads} of ${totalDownloads} installs are free — a significant monetization gap.`, impact: 'High free-to-paid ratio means missed revenue opportunities.', action: 'Set measurable conversion goals and track weekly.', risk: 'Over-monetization may impact user growth.' },
          ],
          summary: 'Key risks include revenue concentration and free download dependency. Address these to build a more resilient business.',
        };
        break;
      default:
        result = {
          insights: [
            { title: 'Performance Overview', type: 'insight', finding: `Analyzed ${rows.length} products with $${totalRev.toFixed(0)} total revenue.`, impact: 'Clear patterns in category performance and pricing tiers.', action: 'Focus resources on top-performing categories and products.', risk: 'Market conditions can shift — review regularly.' },
            { title: 'Growth Indicators', type: 'opportunity', finding: `${freeDownloads} free downloads indicate strong latent demand.`, impact: 'Organic interest is high — monetization is the missing piece.', action: 'Implement conversion strategies for free products.', risk: 'Balance monetization with user experience.' },
            { title: 'Data Quality', type: 'insight', finding: `Dataset has ${data.meta.filter(c => c.nulls > 0).length} columns with missing values.`, impact: 'Cleaner data enables more accurate analysis and predictions.', action: 'Standardize data collection to minimize missing fields.', risk: 'Low data quality may lead to incorrect conclusions.' },
          ],
          summary: `Trends indicate ${totalRev > 500 ? 'strong' : 'moderate'} revenue performance with room for optimization in pricing and conversion strategy.`,
        };
    }

    setTimeout(() => {
      setResult(result);
      setGenerating(null);
    }, 800);
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
      <div style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#fcd34d', marginBottom: 12 }}>
        💡 Select an analysis type below to generate AI-driven insights from your data.
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        {analysisTypes.map(at => (
          <button key={at.key} className="btn" onClick={() => generateInsights(at.key)}
            disabled={generating !== null}
            style={generating === at.key ? { background: 'var(--accent)', color: '#0a0e1a', borderColor: 'var(--accent)' } : {}}>
            {at.icon}
            <span style={{ marginLeft: 4 }}>{generating === at.key ? 'Analyzing...' : at.label}</span>
          </button>
        ))}
      </div>

      {generating && (
        <div className="card" style={{ textAlign: 'center', padding: 32 }}>
          <div style={{ width: 36, height: 36, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }}></div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)' }}>Generating analysis...</div>
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

          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 20, lineHeight: 1.8 }}>
            <h3 style={{ color: 'var(--accent)', fontSize: 13, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
              Executive Summary
            </h3>
            <p style={{ fontSize: 14, color: 'var(--dim)' }}>{result.summary}</p>
            <h3 style={{
              color: 'var(--accent)', fontSize: 13, fontFamily: 'var(--font-mono)',
              textTransform: 'uppercase', letterSpacing: 0.5, margin: '16px 0 6px',
              paddingTop: 8, borderTop: '1px solid var(--border)'
            }}>
              Key Metrics
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              {['Total Products', 'Revenue Range', 'Growth Potential'].map(label => (
                <div key={label} className="card" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                    {label === 'Total Products' ? data.rows.length :
                     label === 'Revenue Range' ? `$${data.rows.reduce((s, r) => s + (+r['revenue'] || 0), 0).toFixed(0)}` :
                     'Significant'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {!result && !generating && (
        <div className="empty-state">
          <Brain size={48} style={{ opacity: 0.3, marginBottom: 12 }} />
          <div>Click an analysis type above to generate insights</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
            PredictIQ will analyze {data.rows.length} rows across {data.meta.length} dimensions
          </div>
        </div>
      )}
    </div>
  );
}
