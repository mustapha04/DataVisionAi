import { motion } from 'framer-motion';
import { useTheme } from '@/app/theme';
import { BookOpen, Rocket, Code2, Puzzle, History, ChevronRight, FileText, Key, BarChart3, Brain, TrendingUp, Shield } from 'lucide-react';
import { useState } from 'react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  }),
};

const sections = [
  { id: 'getting-started', label: 'Getting Started', icon: Rocket },
  { id: 'tutorials', label: 'Tutorials', icon: BookOpen },
  { id: 'sdks', label: 'SDKs & Libraries', icon: Code2 },
  { id: 'changelog', label: 'Changelog', icon: History },
];

const guides = [
  { icon: Rocket, title: 'Quick Start Guide', desc: 'Get up and running in under 5 minutes. Upload your first dataset and see AI-powered insights.', time: '5 min read', color: 'var(--accent)' },
  { icon: Upload, title: 'Uploading Datasets', desc: 'Learn how to upload CSV, Excel, and JSON files. Understand data quality scoring and cleaning options.', time: '8 min read', color: 'var(--accent2)' },
  { icon: BarChart3, title: 'Building Dashboards', desc: 'Create interactive dashboards with KPIs, charts, and real-time data exploration.', time: '10 min read', color: 'var(--accent3)' },
  { icon: Brain, title: 'AI Insights Deep Dive', desc: 'Understand how our AI generates insights, detects anomalies, and provides recommendations.', time: '12 min read', color: '#8b5cf6' },
  { icon: TrendingUp, title: 'Forecasting with ML', desc: 'Run time-series predictions using ARIMA, Prophet, and XGBoost models.', time: '15 min read', color: '#06b6d4' },
  { icon: Shield, title: 'Security & Compliance', desc: 'Data encryption, SOC 2 compliance, access controls, and best practices.', time: '7 min read', color: '#ef4444' },
];

const sdks = [
  { name: 'Python SDK', lang: 'python', install: 'pip install datavision-ai', version: 'v2.4.1', color: '#3b82f6' },
  { name: 'JavaScript SDK', lang: 'javascript', install: 'npm install @datavision/sdk', version: 'v2.3.0', color: '#f59e0b' },
  { name: 'REST API', lang: 'http', install: 'Base URL: https://api.datavision.ai/v1', version: 'v1.0', color: 'var(--accent)' },
];

const changelog = [
  { version: 'v2.4.1', date: 'June 2026', changes: ['Added JSON upload support', 'Improved forecast accuracy by 15%', 'Fixed PDF report generation for large datasets'] },
  { version: 'v2.4.0', date: 'May 2026', changes: ['New AI Insights engine with GPT integration', 'Team collaboration features', 'API rate limit increase for Pro plan'] },
  { version: 'v2.3.0', date: 'April 2026', changes: ['Time-series forecasting with Prophet', '50+ chart types', 'Dark mode support'] },
  { version: 'v2.2.0', date: 'March 2026', changes: ['Launch of DataVision AI', 'CSV and Excel upload', 'Basic dashboard with KPIs and charts'] },
];

function Upload(props: React.SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

export default function DocsPage() {
  const { theme } = useTheme();
  const [activeSection, setActiveSection] = useState('getting-started');

  return (
    <div className="mx-auto px-6 py-20" style={{ maxWidth: 1100 }}>
      <motion.div initial="hidden" animate="visible" variants={fadeUp}>
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium mb-6"
          style={{ background: theme === 'dark' ? 'rgba(0,212,170,0.1)' : 'rgba(5,150,105,0.08)', border: '1px solid rgba(0,212,170,0.2)', color: 'var(--accent)' }}>
          <BookOpen size={14} /> Documentation
        </span>
        <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--text)' }}>Documentation</h1>
        <p className="text-lg mb-12 leading-relaxed" style={{ color: 'var(--muted)', maxWidth: 600 }}>
          Everything you need to build with DataVision AI. Guides, tutorials, API references, and more.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <motion.aside initial="hidden" animate="visible" variants={fadeUp} custom={1}
          className="lg:sticky lg:top-24 lg:self-start">
          <nav className="flex flex-col gap-1">
            {sections.map((s) => (
              <button key={s.id} onClick={() => setActiveSection(s.id)}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm font-medium text-left transition-all duration-200"
                style={{
                  background: activeSection === s.id ? 'var(--accent)' : 'transparent',
                  color: activeSection === s.id ? '#0a0e1a' : 'var(--muted)',
                  border: 'none', cursor: 'pointer',
                }}>
                <s.icon size={16} />
                {s.label}
              </button>
            ))}
          </nav>
        </motion.aside>

        {/* Content */}
        <div className="lg:col-span-3">
          {activeSection === 'getting-started' && (
            <motion.div initial="hidden" animate="visible" variants={fadeUp}>
              <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text)' }}>Getting Started</h2>
              <div className="flex flex-col gap-4 mb-10">
                {[
                  { step: '1', title: 'Create your account', desc: 'Sign up for free at datavision.ai/register. No credit card required.' },
                  { step: '2', title: 'Upload a dataset', desc: 'Drag and drop your CSV, Excel, or JSON file. Our AI auto-detects data types and structure.' },
                  { step: '3', title: 'Explore your insights', desc: 'View interactive dashboards, AI-generated insights, and ML predictions instantly.' },
                ].map((s) => (
                  <div key={s.step} className="flex gap-4 items-start rounded-xl p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold"
                      style={{ background: 'var(--accent)', color: '#0a0e1a' }}>{s.step}</div>
                    <div>
                      <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--text)' }}>{s.title}</h3>
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text)' }}>Guides</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {guides.map((g) => (
                  <div key={g.title} className="rounded-xl p-5 transition-all duration-200 cursor-pointer"
                    style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = g.color; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}>
                    <g.icon size={20} className="mb-3" style={{ color: g.color }} />
                    <h4 className="text-sm font-semibold mb-1" style={{ color: 'var(--text)' }}>{g.title}</h4>
                    <p className="text-xs mb-3 leading-relaxed" style={{ color: 'var(--muted)' }}>{g.desc}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px]" style={{ color: 'var(--dim)' }}>{g.time}</span>
                      <ChevronRight size={14} style={{ color: 'var(--muted)' }} />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeSection === 'tutorials' && (
            <motion.div initial="hidden" animate="visible" variants={fadeUp}>
              <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text)' }}>Tutorials</h2>
              <div className="flex flex-col gap-3">
                {[
                  { title: 'Analyze Amazon App Store Sales Data', desc: 'Step-by-step walkthrough of uploading, cleaning, and analyzing sales data with AI insights.', difficulty: 'Beginner', icon: FileText },
                  { title: 'Build a Revenue Dashboard', desc: 'Create a real-time dashboard with KPIs, trend charts, and category breakdowns.', difficulty: 'Intermediate', icon: BarChart3 },
                  { title: 'Predict Future Revenue with ML', desc: 'Use our forecasting engine to predict next quarter\'s revenue with confidence intervals.', difficulty: 'Advanced', icon: TrendingUp },
                  { title: 'Automate Data Cleaning', desc: 'Configure AI-powered cleaning rules for duplicate removal, outlier detection, and null filling.', difficulty: 'Intermediate', icon: Key },
                ].map((t) => (
                  <div key={t.title} className="flex items-center gap-4 rounded-xl p-5 transition-all duration-200 cursor-pointer"
                    style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(0,212,170,0.1)' }}>
                      <t.icon size={20} style={{ color: 'var(--accent)' }} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{t.title}</h4>
                      <p className="text-xs" style={{ color: 'var(--muted)' }}>{t.desc}</p>
                    </div>
                    <span className="text-[10px] px-2 py-1 rounded-full flex-shrink-0"
                      style={{ background: 'var(--surface)', color: 'var(--dim)' }}>{t.difficulty}</span>
                    <ChevronRight size={16} style={{ color: 'var(--muted)' }} />
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeSection === 'sdks' && (
            <motion.div initial="hidden" animate="visible" variants={fadeUp}>
              <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text)' }}>SDKs & Libraries</h2>
              <div className="flex flex-col gap-4">
                {sdks.map((sdk) => (
                  <div key={sdk.name} className="rounded-xl p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{sdk.name}</h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-mono" style={{ background: `${sdk.color}15`, color: sdk.color }}>{sdk.version}</span>
                    </div>
                    <div className="rounded-lg px-4 py-2.5 text-xs font-mono" style={{ background: 'var(--surface)', color: 'var(--dim)' }}>
                      {sdk.install}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeSection === 'changelog' && (
            <motion.div initial="hidden" animate="visible" variants={fadeUp}>
              <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text)' }}>Changelog</h2>
              <div className="flex flex-col gap-4">
                {changelog.map((entry) => (
                  <div key={entry.version} className="rounded-xl p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-sm font-bold font-mono" style={{ color: 'var(--accent)' }}>{entry.version}</span>
                      <span className="text-xs" style={{ color: 'var(--muted)' }}>{entry.date}</span>
                    </div>
                    <ul className="flex flex-col gap-1.5">
                      {entry.changes.map((c, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs" style={{ color: 'var(--dim)' }}>
                          <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: 'var(--accent)' }} />
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
