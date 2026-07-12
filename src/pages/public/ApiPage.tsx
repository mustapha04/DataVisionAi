import { motion } from 'framer-motion';
import { useTheme } from '@/app/theme';
import { Code2, Lock, Zap, ArrowRight, Copy, Check } from 'lucide-react';
import { useState } from 'react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  }),
};

const endpoints = [
  { method: 'POST', path: '/api/datasets/upload', desc: 'Upload a CSV/Excel/JSON dataset', color: '#22c55e' },
  { method: 'GET', path: '/api/datasets', desc: 'List all uploaded datasets', color: '#3b82f6' },
  { method: 'GET', path: '/api/datasets/:id', desc: 'Get dataset details and metadata', color: '#3b82f6' },
  { method: 'DELETE', path: '/api/datasets/:id', desc: 'Delete a dataset', color: '#ef4444' },
  { method: 'GET', path: '/api/datasets/:id/kpis', desc: 'Get computed KPI metrics', color: '#3b82f6' },
  { method: 'GET', path: '/api/datasets/:id/charts', desc: 'Get chart data for visualization', color: '#3b82f6' },
  { method: 'POST', path: '/api/datasets/:id/clean', desc: 'Run AI data cleaning pipeline', color: '#f59e0b' },
  { method: 'POST', path: '/api/datasets/:id/insights', desc: 'Generate AI-powered insights', color: '#f59e0b' },
  { method: 'POST', path: '/api/datasets/:id/forecast', desc: 'Run time-series forecast', color: '#f59e0b' },
  { method: 'GET', path: '/api/datasets/:id/report', desc: 'Download PDF report', color: '#3b82f6' },
];

const codeExamples = [
  {
    lang: 'cURL',
    code: `curl -X POST https://api.datavision.ai/api/datasets/upload \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -F "file=@data.csv"`,
  },
  {
    lang: 'Python',
    code: `import requests

response = requests.post(
    "https://api.datavision.ai/api/datasets/upload",
    headers={"Authorization": "Bearer YOUR_API_KEY"},
    files={"file": open("data.csv", "rb")}
)
print(response.json())`,
  },
  {
    lang: 'JavaScript',
    code: `const formData = new FormData();
formData.append("file", fileInput.files[0]);

const res = await fetch("https://api.datavision.ai/api/datasets/upload", {
  method: "POST",
  headers: { "Authorization": "Bearer YOUR_API_KEY" },
  body: formData,
});
const data = await res.json();`,
  },
];

function CodeBlock({ code, lang }: { code: string; lang: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="rounded-xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <div className="flex items-center justify-between px-4 py-2" style={{ borderBottom: '1px solid var(--border)' }}>
        <span className="text-xs font-mono font-medium" style={{ color: 'var(--muted)' }}>{lang}</span>
        <button onClick={copy} className="flex items-center gap-1 text-xs" style={{ color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
          {copied ? <><Check size={12} style={{ color: 'var(--accent)' }} /> Copied</> : <><Copy size={12} /> Copy</>}
        </button>
      </div>
      <pre className="p-4 text-xs leading-relaxed overflow-x-auto" style={{ color: 'var(--dim)', fontFamily: 'var(--font-mono)' }}>
        <code>{code}</code>
      </pre>
    </div>
  );
}

export default function ApiPage() {
  const { theme } = useTheme();

  return (
    <div className="mx-auto px-6 py-20" style={{ maxWidth: 1000 }}>
      <motion.div initial="hidden" animate="visible" variants={fadeUp}>
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium mb-6"
          style={{ background: theme === 'dark' ? 'rgba(59,130,246,0.1)' : 'rgba(37,99,235,0.08)', border: '1px solid rgba(59,130,246,0.2)', color: 'var(--accent2)' }}>
          <Code2 size={14} /> Developer API
        </span>
        <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--text)' }}>API Reference</h1>
        <p className="text-lg mb-12 leading-relaxed" style={{ color: 'var(--muted)', maxWidth: 600 }}>
          Integrate DataVision AI into your applications. Our RESTful API provides programmatic access to all platform features.
        </p>
      </motion.div>

      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-16">
        {[
          { icon: Lock, title: 'Secure Authentication', desc: 'OAuth 2.0 and API key authentication' },
          { icon: Zap, title: 'Rate Limited', desc: '1,000 requests/min on Pro plan' },
          { icon: ArrowRight, title: 'RESTful Design', desc: 'Clean JSON responses, standard HTTP codes' },
        ].map((item) => (
          <div key={item.title} className="rounded-xl p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <item.icon size={20} className="mb-3" style={{ color: 'var(--accent)' }} />
            <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--text)' }}>{item.title}</h3>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>{item.desc}</p>
          </div>
        ))}
      </motion.div>

      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={2} className="mb-16">
        <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text)' }}>Authentication</h2>
        <div className="rounded-xl p-6" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <p className="text-sm mb-4 leading-relaxed" style={{ color: 'var(--dim)' }}>
            All API requests require authentication via Bearer token. Include your API key in the <code className="px-1.5 py-0.5 rounded text-xs" style={{ background: 'var(--surface)', fontFamily: 'var(--font-mono)' }}>Authorization</code> header:
          </p>
          <CodeBlock lang="Header" code={`Authorization: Bearer YOUR_API_KEY`} />
          <p className="text-xs mt-4" style={{ color: 'var(--muted)' }}>
            Generate your API key from the Dashboard → Settings → API Keys. Keep it secret — do not expose it in client-side code.
          </p>
        </div>
      </motion.div>

      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={3} className="mb-16">
        <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text)' }}>Endpoints</h2>
        <div className="rounded-xl overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          {endpoints.map((ep, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-3.5 text-sm"
              style={{ borderBottom: i < endpoints.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded w-16 text-center"
                style={{ background: `${ep.color}15`, color: ep.color }}>{ep.method}</span>
              <code className="text-xs font-mono flex-shrink-0" style={{ color: 'var(--text)' }}>{ep.path}</code>
              <span className="text-xs ml-auto hidden sm:inline" style={{ color: 'var(--muted)' }}>{ep.desc}</span>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={4} className="mb-16">
        <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text)' }}>Code Examples</h2>
        <div className="flex flex-col gap-4">
          {codeExamples.map((ex) => (
            <CodeBlock key={ex.lang} lang={ex.lang} code={ex.code} />
          ))}
        </div>
      </motion.div>

      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={5}>
        <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text)' }}>Rate Limits</h2>
        <div className="rounded-xl overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          {[
            { plan: 'Starter', limit: '100 req/min', features: '5 datasets, basic analytics' },
            { plan: 'Professional', limit: '1,000 req/min', features: 'Unlimited datasets, AI insights, forecasts' },
            { plan: 'Enterprise', limit: 'Custom', features: 'Dedicated infrastructure, SLA guarantee' },
          ].map((tier, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4"
              style={{ borderBottom: i < 2 ? '1px solid var(--border)' : 'none' }}>
              <span className="text-sm font-semibold w-32" style={{ color: 'var(--text)' }}>{tier.plan}</span>
              <span className="text-sm font-mono w-32" style={{ color: 'var(--accent)' }}>{tier.limit}</span>
              <span className="text-xs" style={{ color: 'var(--muted)' }}>{tier.features}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
