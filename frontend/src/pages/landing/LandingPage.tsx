import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/app/theme';
import { useAuth } from '@/hooks/useAuth';
import PublicNavbar from '@/components/PublicNavbar';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import {
  Upload, Brain, BarChart3, TrendingUp, Shield, Zap, Eye, FileText,
  Users, Database, Sparkles, MessageSquare, LineChart, PieChart,
  CheckCircle2, ArrowRight, ChevronDown, Play, Star, Clock,
  Cpu, GitBranch, Lightbulb, Lock, Globe, Layers
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

const features = [
  { icon: Upload, title: 'Upload CSV, Excel & JSON', desc: 'Drag and drop any dataset. We support all major formats with intelligent auto-detection.' },
  { icon: Brain, title: 'AI Data Cleaning', desc: 'Automatically detect and fix missing values, duplicates, outliers, and inconsistencies.' },
  { icon: BarChart3, title: 'Interactive Dashboards', desc: 'Real-time dashboards with drill-down capabilities and dynamic filtering.' },
  { icon: TrendingUp, title: 'ML Predictions', desc: 'Time-series forecasting and regression models built automatically from your data.' },
  { icon: Eye, title: 'Trend Detection', desc: 'AI identifies patterns, seasonality, and anomalies before you even look for them.' },
  { icon: Sparkles, title: 'AI Insights', desc: 'Natural language explanations of what your data means and what to do about it.' },
  { icon: FileText, title: 'Automatic Reports', desc: 'Generate professional PDF reports with executive summaries and key findings.' },
  { icon: LineChart, title: 'Data Visualization', desc: '50+ chart types from bar and pie to heatmap, scatter, and sankey diagrams.' },
  { icon: Users, title: 'Team Collaboration', desc: 'Share dashboards, annotations, and insights with your entire organization.' },
  { icon: Lock, title: 'Secure Cloud Storage', desc: 'Enterprise-grade encryption at rest and in transit. SOC 2 compliant infrastructure.' },
];

const steps = [
  { num: '01', icon: Upload, title: 'Upload Your Dataset', desc: 'Drag and drop your CSV, Excel, or JSON file. Our AI instantly detects data types, columns, and structure.' },
  { num: '02', icon: Cpu, title: 'AI Cleans & Analyzes', desc: 'Machine learning algorithms automatically clean your data, detect anomalies, and identify patterns.' },
  { num: '03', icon: BarChart3, title: 'Visualize & Predict', desc: 'Interactive dashboards with KPI cards, charts, and AI-powered forecasts appear in seconds.' },
  { num: '04', icon: FileText, title: 'Export & Decide', desc: 'Download professional reports, share insights with your team, and make data-driven decisions.' },
];

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Head of Analytics, TechCorp',
    quote: 'DataVision AI reduced our analysis time from hours to minutes. The AI insights are remarkably accurate and actionable.',
    rating: 5,
    avatar: 'SC',
  },
  {
    name: 'Dr. Marcus Rivera',
    role: 'Data Science Lead, ResearchLab',
    quote: 'The predictive modeling capabilities are enterprise-grade. We use it for all our research data analysis workflows.',
    rating: 5,
    avatar: 'MR',
  },
  {
    name: 'Aisha Patel',
    role: 'CFO, GrowthStartup',
    quote: 'Finally, a tool that lets non-technical team members explore data confidently. The AI assistant is a game changer.',
    rating: 5,
    avatar: 'AP',
  },
];

const faqs = [
  { q: 'Which file formats are supported?', a: 'We support CSV, Excel (.xlsx, .xls), JSON, and TSV files up to 500MB. Our parser handles various encodings, date formats, and nested structures automatically.' },
  { q: 'Is my data secure?', a: 'Absolutely. All data is encrypted at rest (AES-256) and in transit (TLS 1.3). We are SOC 2 Type II compliant and never share your data with third parties. You can delete your data at any time.' },
  { q: 'Can I export reports?', a: 'Yes. You can export dashboards as PDF reports, download raw data as CSV/Excel, and share interactive dashboard links with your team.' },
  { q: 'Which AI models are used?', a: 'We use a combination of statistical models (ARIMA, Prophet), machine learning (Random Forest, XGBoost), and large language models for natural language insights and explanations.' },
  { q: 'Do I need coding experience?', a: 'Not at all. DataVision AI is designed for everyone. Simply upload your data, and our AI handles the rest. The interface is completely no-code with point-and-click interactions.' },
];

const companies = [
  'Stanford University', 'MIT', 'Google', 'Microsoft', 'Deloitte',
  'McKinsey', 'JP Morgan', 'Tesla', 'NVIDIA', 'Meta',
];

const chatMessages = [
  { role: 'user', text: 'What are the top performing categories this quarter?' },
  { role: 'ai', text: 'Electronics leads with 34% revenue share, growing 12% MoM. Home & Garden shows the fastest growth at 28% increase. I recommend focusing marketing spend on Electronics and Home & Garden segments.' },
  { role: 'user', text: 'Any anomalies I should know about?' },
  { role: 'ai', text: 'Detected 3 anomalies: Unusual spike in Electronics returns on March 15th (+340%), unexpected drop in Sports category sales in week 2, and a pricing outlier in Furniture at $0.01 (likely data entry error).' },
];

export default function LandingPage() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  const handleGetStarted = () => navigate(user ? '/app' : '/register');
  const handleWatchDemo = () => {
    const el = document.querySelector('#dashboard-preview');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', overflow: 'hidden' }}>
      <PublicNavbar />

      {/* Hero */}
      <section
        id="home"
        className="relative landing-gradient hero-grid"
        style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', paddingTop: 80 }}
      >
        <div className="absolute inset-0 pointer-events-none" style={{
          background: theme === 'dark'
            ? 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(0,212,170,0.12), transparent)'
            : 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(5,150,105,0.08), transparent)',
        }} />

        <div className="mx-auto px-6 py-20 relative z-10" style={{ maxWidth: 1280 }}>
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
            >
              <motion.div variants={fadeUp} custom={0} className="mb-6">
                <span
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium"
                  style={{
                    background: theme === 'dark' ? 'rgba(0,212,170,0.1)' : 'rgba(5,150,105,0.08)',
                    border: '1px solid rgba(0,212,170,0.2)',
                    color: 'var(--accent)',
                  }}
                >
                  <Sparkles size={14} />
                  Now powered by Advanced AI Models
                </span>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                custom={1}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6"
                style={{ color: 'var(--text)', letterSpacing: '-0.02em' }}
              >
                AI-Powered Data Analytics for{' '}
                <span style={{
                  background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                  Automated Insights
                </span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                custom={2}
                className="text-lg mb-8 leading-relaxed"
                style={{ color: 'var(--muted)', maxWidth: 520 }}
              >
                Transform raw data into intelligent insights using Artificial Intelligence and Machine Learning.
                Upload your datasets, analyze them instantly, visualize trends, and generate accurate
                predictions — all from one modern platform.
              </motion.p>

              <motion.div variants={fadeUp} custom={3} className="flex flex-wrap gap-4">
                <button
                  onClick={handleGetStarted}
                  className="flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200"
                  style={{
                    background: 'var(--accent)',
                    color: '#0a0e1a',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 20px rgba(0,212,170,0.3)',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(1.1)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.filter = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  Get Started Free
                  <ArrowRight size={16} />
                </button>
                <button
                  onClick={handleWatchDemo}
                  className="flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200"
                  style={{
                    background: 'transparent',
                    color: 'var(--text)',
                    border: '1px solid var(--border)',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <Play size={16} />
                  Watch Demo
                </button>
              </motion.div>

              <motion.div variants={fadeUp} custom={4} className="flex items-center gap-6 mt-10">
                {[
                  { val: '10K+', label: 'Users' },
                  { val: '500K+', label: 'Datasets Analyzed' },
                  { val: '99.2%', label: 'Accuracy' },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className="text-xl font-bold" style={{ color: 'var(--accent)' }}>{stat.val}</div>
                    <div className="text-xs" style={{ color: 'var(--muted)' }}>{stat.label}</div>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 60, rotateY: -10 }}
              animate={{ opacity: 1, x: 0, rotateY: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
              className="hidden lg:block relative"
              style={{ perspective: 1000 }}
            >
              <div
                className="rounded-2xl p-1"
                style={{
                  background: 'linear-gradient(135deg, var(--accent), var(--accent2), var(--accent3))',
                  boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
                }}
              >
                <div className="rounded-2xl p-6" style={{ background: theme === 'dark' ? '#0f1629' : '#ffffff' }}>
                  {/* Mock Dashboard Header */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ background: '#ef4444' }} />
                      <div className="w-3 h-3 rounded-full" style={{ background: '#f59e0b' }} />
                      <div className="w-3 h-3 rounded-full" style={{ background: '#22c55e' }} />
                    </div>
                    <div className="text-xs font-medium px-3 py-1 rounded-full" style={{ background: 'var(--surface)', color: 'var(--muted)' }}>
                      Dashboard — Q4 2024
                    </div>
                  </div>

                  {/* KPI Row */}
                  <div className="grid grid-cols-3 gap-3 mb-5">
                    {[
                      { label: 'Revenue', val: '$2.4M', change: '+12.5%', color: 'var(--accent)' },
                      { label: 'Users', val: '48,291', change: '+8.2%', color: 'var(--accent2)' },
                      { label: 'Growth', val: '34.2%', change: '+5.1%', color: 'var(--accent3)' },
                    ].map((kpi) => (
                      <div key={kpi.label} className="rounded-xl p-3" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                        <div className="text-[10px] mb-1" style={{ color: 'var(--muted)' }}>{kpi.label}</div>
                        <div className="text-lg font-bold" style={{ color: 'var(--text)' }}>{kpi.val}</div>
                        <div className="text-[10px] font-medium" style={{ color: kpi.color }}>{kpi.change}</div>
                      </div>
                    ))}
                  </div>

                  {/* Chart Area */}
                  <div className="rounded-xl p-4 mb-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                    <div className="text-[10px] font-medium mb-3" style={{ color: 'var(--muted)' }}>Revenue Trend</div>
                    <svg viewBox="0 0 300 80" className="w-full">
                      <defs>
                        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path d="M0,60 Q30,55 60,45 T120,35 T180,25 T240,15 T300,10" fill="none" stroke="var(--accent)" strokeWidth="2" />
                      <path d="M0,60 Q30,55 60,45 T120,35 T180,25 T240,15 T300,10 L300,80 L0,80 Z" fill="url(#chartGrad)" />
                      <circle cx="240" cy="15" r="4" fill="var(--accent)" />
                      <circle cx="240" cy="15" r="8" fill="var(--accent)" opacity="0.2" />
                    </svg>
                  </div>

                  {/* Bar Chart */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl p-3" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                      <div className="text-[10px] font-medium mb-3" style={{ color: 'var(--muted)' }}>By Category</div>
                      <div className="flex items-end gap-2 h-16">
                        {[60, 80, 45, 90, 70, 55].map((h, i) => (
                          <div key={i} className="flex-1 rounded-t" style={{
                            height: `${h}%`,
                            background: i === 3 ? 'var(--accent)' : 'var(--border)',
                            opacity: i === 3 ? 1 : 0.5,
                          }} />
                        ))}
                      </div>
                    </div>
                    <div className="rounded-xl p-3" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                      <div className="text-[10px] font-medium mb-3" style={{ color: 'var(--muted)' }}>AI Prediction</div>
                      <div className="flex items-center justify-center h-16">
                        <div className="text-center">
                          <div className="text-xl font-bold" style={{ color: 'var(--accent)' }}>+23%</div>
                          <div className="text-[10px]" style={{ color: 'var(--muted)' }}>Next Quarter</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trusted Companies */}
      <section className="py-16" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="mx-auto px-6" style={{ maxWidth: 1280 }}>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center text-sm mb-10"
            style={{ color: 'var(--muted)' }}
          >
            Trusted by businesses, researchers, universities, and data professionals worldwide
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-wrap justify-center items-center gap-x-10 gap-y-5"
          >
            {companies.map((name) => (
              <div
                key={name}
                className="text-sm font-semibold tracking-wide select-none"
                style={{ color: 'var(--border)', fontFamily: 'var(--font-sans)' }}
              >
                {name}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 relative">
        <div className="absolute inset-0 pointer-events-none" style={{
          background: theme === 'dark'
            ? 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(0,212,170,0.05), transparent)'
            : 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(5,150,105,0.03), transparent)',
        }} />
        <div className="mx-auto px-6 relative z-10" style={{ maxWidth: 1280 }}>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.div variants={fadeUp} className="mb-4">
              <span
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium"
                style={{
                  background: theme === 'dark' ? 'rgba(59,130,246,0.1)' : 'rgba(37,99,235,0.08)',
                  border: '1px solid rgba(59,130,246,0.2)',
                  color: 'var(--accent2)',
                }}
              >
                <Zap size={14} />
                Powerful Features
              </span>
            </motion.div>
            <motion.h2
              variants={fadeUp}
              custom={1}
              className="text-3xl sm:text-4xl font-bold mb-4"
              style={{ color: 'var(--text)' }}
            >
              Everything you need to analyze data
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-base max-w-2xl mx-auto"
              style={{ color: 'var(--muted)' }}
            >
              From upload to insight in seconds. Our AI handles the complexity so you can focus on decisions.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4"
          >
            {features.map((feat, i) => (
              <motion.div
                key={feat.title}
                variants={fadeUp}
                custom={i}
                className="group relative rounded-2xl p-5 transition-all duration-300 cursor-default"
                style={{
                  background: hoveredFeature === i ? 'var(--surface)' : 'var(--card)',
                  border: `1px solid ${hoveredFeature === i ? 'var(--accent)' : 'var(--border)'}`,
                  transform: hoveredFeature === i ? 'translateY(-4px)' : 'translateY(0)',
                  boxShadow: hoveredFeature === i
                    ? '0 10px 40px rgba(0,0,0,0.15)'
                    : 'none',
                }}
                onMouseEnter={() => setHoveredFeature(i)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-all duration-300"
                  style={{
                    background: hoveredFeature === i
                      ? 'var(--accent)'
                      : theme === 'dark' ? 'rgba(0,212,170,0.1)' : 'rgba(5,150,105,0.08)',
                  }}
                >
                  <feat.icon
                    size={20}
                    style={{
                      color: hoveredFeature === i ? '#0a0e1a' : 'var(--accent)',
                      transition: 'color 0.3s',
                    }}
                  />
                </div>
                <h3 className="text-sm font-semibold mb-1.5" style={{ color: 'var(--text)' }}>
                  {feat.title}
                </h3>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>
                  {feat.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24" style={{ background: 'var(--bg2)' }}>
        <div className="mx-auto px-6" style={{ maxWidth: 1280 }}>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.div variants={fadeUp} className="mb-4">
              <span
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium"
                style={{
                  background: theme === 'dark' ? 'rgba(245,158,11,0.1)' : 'rgba(217,119,6,0.08)',
                  border: '1px solid rgba(245,158,11,0.2)',
                  color: 'var(--accent3)',
                }}
              >
                <Layers size={14} />
                Simple Workflow
              </span>
            </motion.div>
            <motion.h2
              variants={fadeUp}
              custom={1}
              className="text-3xl sm:text-4xl font-bold mb-4"
              style={{ color: 'var(--text)' }}
            >
              From data to decisions in 4 steps
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-base max-w-xl mx-auto" style={{ color: 'var(--muted)' }}>
              No coding required. Our AI handles the heavy lifting.
            </motion.p>
          </motion.div>

          <div className="relative max-w-3xl mx-auto">
            <div
              className="absolute left-6 sm:left-8 top-0 bottom-0 w-px hidden sm:block"
              style={{ background: 'linear-gradient(to bottom, var(--accent), var(--accent2), var(--accent3))', opacity: 0.3 }}
            />

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              variants={stagger}
              className="flex flex-col gap-8"
            >
              {steps.map((step, i) => (
                <motion.div
                  key={step.num}
                  variants={fadeUp}
                  custom={i}
                  className="flex gap-6 items-start"
                >
                  <div className="relative flex-shrink-0">
                    <div
                      className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center relative z-10"
                      style={{
                        background: i === 0 ? 'rgba(0,212,170,0.15)' : i === 1 ? 'rgba(59,130,246,0.15)' : i === 2 ? 'rgba(245,158,11,0.15)' : 'rgba(139,92,246,0.15)',
                        border: `1px solid ${i === 0 ? 'rgba(0,212,170,0.3)' : i === 1 ? 'rgba(59,130,246,0.3)' : i === 2 ? 'rgba(245,158,11,0.3)' : 'rgba(139,92,246,0.3)'}`,
                      }}
                    >
                      <step.icon
                        size={24}
                        style={{ color: i === 0 ? 'var(--accent)' : i === 1 ? 'var(--accent2)' : i === 2 ? 'var(--accent3)' : '#8b5cf6' }}
                      />
                    </div>
                  </div>
                  <div className="pt-1 sm:pt-3">
                    <div className="text-xs font-mono font-semibold mb-1" style={{ color: 'var(--accent)' }}>
                      Step {step.num}
                    </div>
                    <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text)' }}>
                      {step.title}
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
                      {step.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section id="dashboard-preview" className="py-24 relative">
        <div className="mx-auto px-6" style={{ maxWidth: 1280 }}>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="text-center mb-12"
          >
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: 'var(--text)' }}>
              A dashboard that works as hard as you do
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-base max-w-xl mx-auto" style={{ color: 'var(--muted)' }}>
              Enterprise-grade analytics with the simplicity of a modern SaaS tool.
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="rounded-2xl p-1"
            style={{
              background: 'linear-gradient(135deg, rgba(0,212,170,0.3), rgba(59,130,246,0.3), rgba(245,158,11,0.2))',
              boxShadow: '0 30px 80px rgba(0,0,0,0.3)',
            }}
          >
            <div className="rounded-2xl p-6 sm:p-8" style={{ background: theme === 'dark' ? '#0f1629' : '#ffffff' }}>
              {/* Mock Dashboard Nav */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full" style={{ background: '#ef4444' }} />
                    <div className="w-3 h-3 rounded-full" style={{ background: '#f59e0b' }} />
                    <div className="w-3 h-3 rounded-full" style={{ background: '#22c55e' }} />
                  </div>
                  <div className="flex gap-2 ml-4">
                    {['Overview', 'Charts', 'Table', 'AI Insights'].map((tab, i) => (
                      <div
                        key={tab}
                        className="px-3 py-1.5 rounded-lg text-[11px] font-medium"
                        style={{
                          background: i === 0 ? 'var(--accent)' : 'transparent',
                          color: i === 0 ? '#0a0e1a' : 'var(--muted)',
                        }}
                      >
                        {tab}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1.5 rounded-lg text-[11px]" style={{ background: 'var(--surface)', color: 'var(--muted)' }}>
                    Last 30 days
                  </div>
                </div>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {[
                  { label: 'Total Revenue', val: '$2,847,291', change: '+12.5%', icon: TrendingUp, color: '#22c55e' },
                  { label: 'Active Users', val: '48,291', change: '+8.2%', icon: Users, color: '#3b82f6' },
                  { label: 'Conversion Rate', val: '3.24%', change: '+0.8%', icon: BarChart3, color: '#f59e0b' },
                  { label: 'AI Confidence', val: '99.2%', change: '+0.3%', icon: Brain, color: '#8b5cf6' },
                ].map((kpi) => (
                  <div
                    key={kpi.label}
                    className="rounded-xl p-4"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-[10px]" style={{ color: 'var(--muted)' }}>{kpi.label}</div>
                      <kpi.icon size={14} style={{ color: kpi.color }} />
                    </div>
                    <div className="text-xl font-bold mb-1" style={{ color: 'var(--text)' }}>{kpi.val}</div>
                    <div className="text-[10px] font-medium" style={{ color: kpi.color }}>{kpi.change} vs last month</div>
                  </div>
                ))}
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                {/* Line Chart */}
                <div className="lg:col-span-2 rounded-xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-xs font-medium" style={{ color: 'var(--muted)' }}>Revenue Trend</div>
                    <div className="flex gap-3">
                      <span className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--accent)' }}>
                        <span className="w-2 h-2 rounded-full" style={{ background: 'var(--accent)' }} /> Actual
                      </span>
                      <span className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--accent2)' }}>
                        <span className="w-2 h-2 rounded-full" style={{ background: 'var(--accent2)' }} /> Predicted
                      </span>
                    </div>
                  </div>
                  <svg viewBox="0 0 500 120" className="w-full">
                    <defs>
                      <linearGradient id="lg1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d="M0,90 Q50,85 100,70 T200,55 T300,40 T400,30 T500,15" fill="none" stroke="var(--accent)" strokeWidth="2.5" />
                    <path d="M0,90 Q50,85 100,70 T200,55 T300,40 T400,30 T500,15 L500,120 L0,120 Z" fill="url(#lg1)" />
                    <path d="M0,95 Q50,90 100,80 T200,68 T300,52 T400,42 T500,30" fill="none" stroke="var(--accent2)" strokeWidth="1.5" strokeDasharray="6,4" opacity="0.6" />
                    {[100, 200, 300, 400].map((cx, i) => (
                      <circle key={i} cx={cx} cy={[70, 55, 40, 30][i]} r="3" fill="var(--accent)" />
                    ))}
                  </svg>
                </div>

                {/* Pie Chart */}
                <div className="rounded-xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <div className="text-xs font-medium mb-3" style={{ color: 'var(--muted)' }}>Category Distribution</div>
                  <div className="flex items-center justify-center mb-3">
                    <svg viewBox="0 0 100 100" className="w-28 h-28">
                      <circle cx="50" cy="50" r="40" fill="none" stroke="var(--accent)" strokeWidth="12" strokeDasharray="75 175" strokeDashoffset="0" />
                      <circle cx="50" cy="50" r="40" fill="none" stroke="var(--accent2)" strokeWidth="12" strokeDasharray="55 195" strokeDashoffset="-75" />
                      <circle cx="50" cy="50" r="40" fill="none" stroke="var(--accent3)" strokeWidth="12" strokeDasharray="40 210" strokeDashoffset="-130" />
                      <circle cx="50" cy="50" r="40" fill="none" stroke="#8b5cf6" strokeWidth="12" strokeDasharray="30 220" strokeDashoffset="-170" />
                      <circle cx="50" cy="50" r="24" fill={theme === 'dark' ? '#0f1629' : '#ffffff'} />
                    </svg>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {[
                      { name: 'Electronics', pct: '34%', color: 'var(--accent)' },
                      { name: 'Home & Garden', pct: '25%', color: 'var(--accent2)' },
                      { name: 'Sports', pct: '18%', color: 'var(--accent3)' },
                      { name: 'Other', pct: '23%', color: '#8b5cf6' },
                    ].map((item) => (
                      <div key={item.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                          <span className="text-[10px]" style={{ color: 'var(--dim)' }}>{item.name}</span>
                        </div>
                        <span className="text-[10px] font-semibold" style={{ color: 'var(--text)' }}>{item.pct}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Row: Bar Chart + AI Insights */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="rounded-xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <div className="text-xs font-medium mb-3" style={{ color: 'var(--muted)' }}>Monthly Revenue Comparison</div>
                  <div className="flex items-end gap-2 h-32">
                    {[
                      { m: 'Jul', v: 45 }, { m: 'Aug', v: 62 }, { m: 'Sep', v: 55 },
                      { m: 'Oct', v: 78 }, { m: 'Nov', v: 85 }, { m: 'Dec', v: 92 },
                    ].map((bar) => (
                      <div key={bar.m} className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full rounded-t-lg transition-all" style={{
                          height: `${bar.v}%`,
                          background: bar.m === 'Dec' ? 'var(--accent)' : 'var(--border)',
                          opacity: bar.m === 'Dec' ? 1 : 0.6,
                        }} />
                        <span className="text-[9px]" style={{ color: 'var(--muted)' }}>{bar.m}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles size={14} style={{ color: 'var(--accent)' }} />
                    <span className="text-xs font-medium" style={{ color: 'var(--muted)' }}>AI Insights</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {[
                      { type: 'Insight', text: 'Revenue grew 12.5% month-over-month, outperforming industry average of 8%.', color: 'var(--accent)' },
                      { type: 'Prediction', text: 'Based on current trends, Q1 2025 revenue projected at $3.1M (+9.2%).', color: 'var(--accent2)' },
                      { type: 'Alert', text: 'Electronics returns spiked 340% on March 15th. Investigate quality issues.', color: 'var(--accent3)' },
                    ].map((item, i) => (
                      <div key={i} className="flex gap-2 items-start">
                        <div className="w-1 h-full min-h-[32px] rounded-full flex-shrink-0 mt-1" style={{ background: item.color }} />
                        <div>
                          <span className="text-[10px] font-semibold" style={{ color: item.color }}>{item.type}</span>
                          <p className="text-[11px] leading-relaxed" style={{ color: 'var(--dim)' }}>{item.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* AI Assistant */}
      <section className="py-24" style={{ background: 'var(--bg2)' }}>
        <div className="mx-auto px-6" style={{ maxWidth: 1280 }}>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={stagger}
            >
              <motion.div variants={fadeUp} className="mb-4">
                <span
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium"
                  style={{
                    background: theme === 'dark' ? 'rgba(139,92,246,0.1)' : 'rgba(139,92,246,0.08)',
                    border: '1px solid rgba(139,92,246,0.2)',
                    color: '#8b5cf6',
                  }}
                >
                  <MessageSquare size={14} />
                  AI Assistant
                </span>
              </motion.div>
              <motion.h2
                variants={fadeUp}
                custom={1}
                className="text-3xl sm:text-4xl font-bold mb-4"
                style={{ color: 'var(--text)' }}
              >
                Ask anything about your data
              </motion.h2>
              <motion.p variants={fadeUp} custom={2} className="text-base mb-8 leading-relaxed" style={{ color: 'var(--muted)' }}>
                Our AI assistant understands your data and answers questions in natural language.
                It can explain charts, summarize datasets, detect anomalies, and suggest business improvements.
              </motion.p>
              <motion.div variants={fadeUp} custom={3} className="flex flex-col gap-3">
                {[
                  'Explain what this chart means',
                  'Summarize key findings from my dataset',
                  'Detect anomalies and outliers',
                  'Suggest business improvements',
                  'Answer questions about uploaded data',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 size={16} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                    <span className="text-sm" style={{ color: 'var(--dim)' }}>{item}</span>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6 }}
              className="rounded-2xl overflow-hidden"
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
              }}
            >
              {/* Chat Header */}
              <div
                className="flex items-center gap-3 px-5 py-4"
                style={{ borderBottom: '1px solid var(--border)' }}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(139,92,246,0.2)' }}>
                  <Brain size={16} style={{ color: '#8b5cf6' }} />
                </div>
                <div>
                  <div className="text-sm font-semibold" style={{ color: 'var(--text)' }}>DataVision AI</div>
                  <div className="text-[10px] flex items-center gap-1" style={{ color: 'var(--accent)' }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent)' }} />
                    Online
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex flex-col gap-4 p-5" style={{ maxHeight: 400 }}>
                {chatMessages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className="max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed"
                      style={{
                        background: msg.role === 'user' ? 'var(--accent)' : 'var(--surface)',
                        color: msg.role === 'user' ? '#0a0e1a' : 'var(--dim)',
                        borderBottomRightRadius: msg.role === 'user' ? '4px' : '16px',
                        borderBottomLeftRadius: msg.role === 'ai' ? '4px' : '16px',
                      }}
                    >
                      {msg.text}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Chat Input */}
              <div className="px-5 pb-5">
                <div
                  className="flex items-center gap-3 px-4 py-3 rounded-xl"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                >
                  <MessageSquare size={16} style={{ color: 'var(--muted)' }} />
                  <span className="text-sm flex-1" style={{ color: 'var(--muted)' }}>Ask about your data...</span>
                  <ArrowRight size={16} style={{ color: 'var(--accent)' }} />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats / Benefits */}
      <section id="about" className="py-24 relative">
        <div className="mx-auto px-6" style={{ maxWidth: 1280 }}>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: 'var(--text)' }}>
              Built for performance
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-base max-w-xl mx-auto" style={{ color: 'var(--muted)' }}>
              Numbers that speak for themselves.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={stagger}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {[
              { stat: '90%', label: 'Faster Analysis', desc: 'Compared to manual analysis', icon: Clock, color: 'var(--accent)' },
              { stat: '99%', label: 'Accurate Predictions', desc: 'Industry-leading ML models', icon: Target, color: 'var(--accent2)' },
              { stat: '50+', label: 'Visualization Types', desc: 'Charts, graphs, and maps', icon: PieChart, color: 'var(--accent3)' },
              { stat: '256-bit', label: 'Encryption', desc: 'Enterprise-grade security', icon: Shield, color: '#8b5cf6' },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                variants={fadeUp}
                custom={i}
                className="rounded-2xl p-6 text-center transition-all duration-300"
                style={{
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = item.color;
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 10px 40px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: `${item.color}15` }}
                >
                  <item.icon size={24} style={{ color: item.color }} />
                </div>
                <div className="text-3xl font-bold mb-1" style={{ color: 'var(--text)' }}>{item.stat}</div>
                <div className="text-sm font-semibold mb-1" style={{ color: 'var(--text)' }}>{item.label}</div>
                <div className="text-xs" style={{ color: 'var(--muted)' }}>{item.desc}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24" style={{ background: 'var(--bg2)' }}>
        <div className="mx-auto px-6" style={{ maxWidth: 1280 }}>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: 'var(--text)' }}>
              Loved by data professionals
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-base max-w-xl mx-auto" style={{ color: 'var(--muted)' }}>
              See what our users have to say about DataVision AI.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                variants={fadeUp}
                custom={i}
                className="rounded-2xl p-6 transition-all duration-300"
                style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 10px 40px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} size={14} fill="var(--accent3)" style={{ color: 'var(--accent3)' }} />
                  ))}
                </div>
                <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--dim)' }}>
                  "{t.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: 'var(--accent)', color: '#0a0e1a' }}
                  >
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{t.name}</div>
                    <div className="text-xs" style={{ color: 'var(--muted)' }}>{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24">
        <div className="mx-auto px-6" style={{ maxWidth: 1280 }}>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: 'var(--text)' }}>
              Simple, transparent pricing
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-base max-w-xl mx-auto" style={{ color: 'var(--muted)' }}>
              Start free. Scale as you grow. No hidden fees.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
          >
            {[
              {
                name: 'Starter',
                price: 'Free',
                period: 'forever',
                desc: 'Perfect for exploring and personal projects',
                features: ['5 datasets/month', 'Basic AI insights', 'Standard charts', 'CSV export', 'Community support'],
                cta: 'Get Started',
                featured: false,
              },
              {
                name: 'Professional',
                price: '$29',
                period: '/month',
                desc: 'For teams and growing businesses',
                features: ['Unlimited datasets', 'Advanced AI predictions', '50+ chart types', 'PDF reports', 'Team collaboration', 'Priority support', 'API access'],
                cta: 'Start Free Trial',
                featured: true,
              },
              {
                name: 'Enterprise',
                price: 'Custom',
                period: '',
                desc: 'For organizations with advanced needs',
                features: ['Everything in Pro', 'Custom AI models', 'SSO & RBAC', 'Dedicated support', 'SLA guarantee', 'On-premise option', 'Custom integrations'],
                cta: 'Contact Sales',
                featured: false,
              },
            ].map((plan, i) => (
              <motion.div
                key={plan.name}
                variants={fadeUp}
                custom={i}
                className="rounded-2xl p-6 transition-all duration-300 relative"
                style={{
                  background: plan.featured ? 'var(--card)' : 'var(--card)',
                  border: `1px solid ${plan.featured ? 'var(--accent)' : 'var(--border)'}`,
                  transform: plan.featured ? 'scale(1.02)' : 'scale(1)',
                  boxShadow: plan.featured ? '0 20px 60px rgba(0,212,170,0.1)' : 'none',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = plan.featured ? 'scale(1.03) translateY(-4px)' : 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 15px 50px rgba(0,0,0,0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = plan.featured ? 'scale(1.02)' : 'scale(1)';
                  e.currentTarget.style.boxShadow = plan.featured ? '0 20px 60px rgba(0,212,170,0.1)' : 'none';
                }}
              >
                {plan.featured && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-bold"
                    style={{ background: 'var(--accent)', color: '#0a0e1a' }}
                  >
                    Most Popular
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--text)' }}>{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-4xl font-bold" style={{ color: 'var(--text)' }}>{plan.price}</span>
                    <span className="text-sm" style={{ color: 'var(--muted)' }}>{plan.period}</span>
                  </div>
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>{plan.desc}</p>
                </div>
                <ul className="flex flex-col gap-2.5 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm" style={{ color: 'var(--dim)' }}>
                      <CheckCircle2 size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={handleGetStarted}
                  className="w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200"
                  style={{
                    background: plan.featured ? 'var(--accent)' : 'transparent',
                    color: plan.featured ? '#0a0e1a' : 'var(--text)',
                    border: plan.featured ? 'none' : '1px solid var(--border)',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    if (!plan.featured) { e.currentTarget.style.borderColor = 'var(--accent)'; }
                    else { e.currentTarget.style.filter = 'brightness(1.1)'; }
                  }}
                  onMouseLeave={(e) => {
                    if (!plan.featured) { e.currentTarget.style.borderColor = 'var(--border)'; }
                    else { e.currentTarget.style.filter = 'none'; }
                  }}
                >
                  {plan.cta}
                </button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24" style={{ background: 'var(--bg2)' }}>
        <div className="mx-auto px-6" style={{ maxWidth: 800 }}>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: 'var(--text)' }}>
              Frequently asked questions
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-base" style={{ color: 'var(--muted)' }}>
              Everything you need to know about DataVision AI.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={stagger}
            className="flex flex-col gap-3"
          >
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                custom={i}
                className="rounded-xl overflow-hidden transition-all duration-300"
                style={{
                  background: 'var(--card)',
                  border: `1px solid ${openFaq === i ? 'var(--accent)' : 'var(--border)'}`,
                }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                >
                  <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{faq.q}</span>
                  <ChevronDown
                    size={16}
                    className="transition-transform duration-300 flex-shrink-0 ml-4"
                    style={{
                      color: 'var(--muted)',
                      transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}
                  />
                </button>
                <div
                  className="px-5 overflow-hidden transition-all duration-300"
                  style={{
                    maxHeight: openFaq === i ? 200 : 0,
                    paddingBottom: openFaq === i ? 16 : 0,
                  }}
                >
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>{faq.a}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section id="contact" className="py-24 relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: theme === 'dark'
              ? 'linear-gradient(135deg, rgba(0,212,170,0.15) 0%, rgba(59,130,246,0.15) 50%, rgba(139,92,246,0.1) 100%)'
              : 'linear-gradient(135deg, rgba(5,150,105,0.1) 0%, rgba(37,99,235,0.1) 50%, rgba(139,92,246,0.07) 100%)',
          }}
        />
        <div className="mx-auto px-6 relative z-10" style={{ maxWidth: 800 }}>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: 'var(--text)' }}>
              Start making smarter decisions today
            </h2>
            <p className="text-base mb-10 max-w-lg mx-auto" style={{ color: 'var(--muted)' }}>
              Join 10,000+ data professionals already using DataVision AI to transform their analytics workflow.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => navigate(user ? '/app' : '/register')}
                className="flex items-center gap-2 px-8 py-4 rounded-xl text-sm font-semibold transition-all duration-200"
                style={{
                  background: 'var(--accent)',
                  color: '#0a0e1a',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 30px rgba(0,212,170,0.3)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(1.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.filter = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                Start Free
                <ArrowRight size={16} />
              </button>
              <button
                onClick={handleWatchDemo}
                className="flex items-center gap-2 px-8 py-4 rounded-xl text-sm font-semibold transition-all duration-200"
                style={{
                  background: 'transparent',
                  color: 'var(--text)',
                  border: '1px solid var(--border)',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                Book a Demo
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function Target(props: React.SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}
