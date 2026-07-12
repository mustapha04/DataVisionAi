import { motion } from 'framer-motion';
import { useTheme } from '@/app/theme';
import { Target, Lightbulb, Users, Globe, ArrowRight, Sparkles, Mail, Briefcase } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  }),
};

const values = [
  { icon: Target, title: 'Mission-Driven', desc: 'We believe every organization deserves access to powerful data analytics without the complexity of traditional tools.', color: 'var(--accent)' },
  { icon: Lightbulb, title: 'Innovation First', desc: 'We push the boundaries of AI and machine learning to deliver insights that were previously only available to tech giants.', color: 'var(--accent2)' },
  { icon: Users, title: 'User-Centered', desc: 'Every feature is designed with our users in mind. We build tools that people love to use, not tools they have to use.', color: 'var(--accent3)' },
  { icon: Globe, title: 'Global Impact', desc: 'From startups to universities, we empower data-driven decisions across industries and continents.', color: '#8b5cf6' },
];

const timeline = [
  { year: '2026', title: 'DataVision AI Launches', desc: 'Launched the platform with AI-powered analytics, predictive modeling, and automated reporting for businesses and researchers.' },
  { year: '2026 Q2', title: '10,000+ Users', desc: 'Reached 10,000 active users across 50+ countries, including Fortune 500 companies and leading universities.' },
  { year: '2026 Q3', title: 'AI Assistant', desc: 'Introduced the AI Assistant for natural language data exploration, anomaly detection, and automated business recommendations.' },
  { year: '2026 Q4', title: 'Enterprise & API', desc: 'Launched Enterprise plan with SSO, RBAC, dedicated infrastructure, and a full REST API for custom integrations.' },
];

export default function AboutPage() {
  const { theme } = useTheme();

  return (
    <div style={{ background: 'var(--bg)' }}>
      {/* Hero */}
      <section className="mx-auto px-6 pt-16 pb-20" style={{ maxWidth: 1000 }}>
        <motion.div initial="hidden" animate="visible" variants={fadeUp}>
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium mb-6"
            style={{ background: theme === 'dark' ? 'rgba(0,212,170,0.1)' : 'rgba(5,150,105,0.08)', border: '1px solid rgba(0,212,170,0.2)', color: 'var(--accent)' }}>
            <Sparkles size={14} /> Our Story
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold mb-6" style={{ color: 'var(--text)', lineHeight: 1.15 }}>
            Empowering data-driven
            <br />decisions with AI
          </h1>
          <p className="text-lg leading-relaxed mb-8" style={{ color: 'var(--muted)', maxWidth: 600 }}>
            DataVision AI was founded with a simple belief: everyone should be able to understand their data,
            regardless of technical skill. We combine cutting-edge AI with intuitive design to make analytics accessible to all.
          </p>
        </motion.div>

        {/* Founder Card */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}
          className="rounded-2xl p-8 mb-16" style={{
            background: 'linear-gradient(135deg, rgba(0,212,170,0.08), rgba(59,130,246,0.08))',
            border: '1px solid rgba(0,212,170,0.15)',
          }}>
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl font-bold"
              style={{ background: 'var(--accent)', color: '#0a0e1a' }}>
              MI
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--text)' }}>MUSTAPHA EL IBRAHIMI</h2>
              <p className="text-sm font-medium mb-3" style={{ color: 'var(--accent)' }}>Founder & CEO</p>
              <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--dim)' }}>
                "I founded DataVision AI because I saw how much valuable data goes unanalyzed — not because people don't care,
                but because existing tools are too complex, too expensive, or both. Our mission is to change that.
                Every dataset has a story, and AI should help us hear it."
              </p>
              <div className="flex gap-3">
                <a href="mailto:mustaphaelibrahimi@gmail.com" className="flex items-center gap-2 text-xs"
                  style={{ color: 'var(--muted)' }}>
                  <Mail size={14} /> mustaphaelibrahimi@gmail.com
                </a>
                <a href="#" className="flex items-center gap-2 text-xs"
                  style={{ color: 'var(--muted)' }}>
                  <Briefcase size={14} /> LinkedIn
                </a>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Values */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={2}>
          <h2 className="text-2xl font-bold mb-8" style={{ color: 'var(--text)' }}>Our Values</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-20">
            {values.map((v) => (
              <div key={v.title} className="rounded-xl p-6 transition-all duration-200"
                style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.1)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
                <v.icon size={24} className="mb-3" style={{ color: v.color }} />
                <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--text)' }}>{v.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Timeline */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={3}>
          <h2 className="text-2xl font-bold mb-8" style={{ color: 'var(--text)' }}>Our Journey</h2>
          <div className="flex flex-col gap-6 relative">
            <div className="absolute left-5 top-0 bottom-0 w-px" style={{ background: 'var(--border)' }} />
            {timeline.map((t, i) => (
              <motion.div key={t.year} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="flex gap-5 items-start">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 z-10 text-[10px] font-bold"
                  style={{ background: 'var(--accent)', color: '#0a0e1a' }}>
                  {t.year.split(' ')[0]}
                </div>
                <div className="rounded-xl p-5 flex-1" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                  <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--text)' }}>{t.title}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>{t.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>
    </div>
  );
}
