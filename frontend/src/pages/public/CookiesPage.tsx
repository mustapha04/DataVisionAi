import { motion } from 'framer-motion';
import { Cookie } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const cookieTypes = [
  {
    name: 'Essential Cookies',
    required: true,
    desc: 'These cookies are necessary for the Service to function properly. They enable core features such as authentication, security, and session management. Without these cookies, the Service cannot work.',
    examples: ['Session ID token', 'Authentication token', 'Security cookies (CSRF)', 'Load balancing cookies'],
  },
  {
    name: 'Analytics Cookies',
    required: false,
    desc: 'These cookies help us understand how visitors interact with our Service by collecting and reporting information anonymously. This helps us improve the Service experience.',
    examples: ['Page visit tracking', 'Feature usage analytics', 'Performance metrics', 'Error reporting'],
  },
  {
    name: 'Functional Cookies',
    required: false,
    desc: 'These cookies enable personalized features such as remembering your preferences, theme settings, and dashboard configurations to provide a more customized experience.',
    examples: ['Theme preference (dark/light)', 'Language settings', 'Dashboard layout preferences', 'Recently viewed datasets'],
  },
];

const faqs = [
  { q: 'What are cookies?', a: 'Cookies are small text files stored on your device when you visit a website. They help websites remember your preferences and provide a better user experience.' },
  { q: 'How can I manage cookies?', a: 'You can manage cookies through your browser settings. Most browsers allow you to block or delete cookies. However, blocking essential cookies may prevent the Service from working properly.' },
  { q: 'Does DataVision AI use third-party cookies?', a: 'We use minimal third-party services for analytics. These may set their own cookies. You can opt out of analytics tracking through your browser or our cookie preferences.' },
  { q: 'How long do cookies persist?', a: 'Session cookies are deleted when you close your browser. Persistent cookies remain for a set period (typically 30 days) or until you manually delete them.' },
];

export default function CookiesPage() {
  return (
    <div className="mx-auto px-6 py-20" style={{ maxWidth: 800 }}>
      <motion.div initial="hidden" animate="visible" variants={fadeUp}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.1)' }}>
            <Cookie size={20} style={{ color: 'var(--accent3)' }} />
          </div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text)' }}>Cookie Policy</h1>
        </div>
        <p className="text-xs mb-10" style={{ color: 'var(--muted)' }}>Last Updated: July 2026</p>
      </motion.div>

      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
        <p className="text-sm leading-relaxed mb-8" style={{ color: 'var(--dim)' }}>
          This Cookie Policy explains how DataVision AI uses cookies and similar technologies when you visit our website and use our platform. We want you to understand what cookies we use and why.
        </p>

        <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text)' }}>Types of Cookies We Use</h2>
        <div className="flex flex-col gap-4 mb-12">
          {cookieTypes.map((type) => (
            <div key={type.name} className="rounded-xl p-6" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-3 mb-3">
                <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{type.name}</h3>
                {type.required && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                    style={{ background: 'rgba(0,212,170,0.1)', color: 'var(--accent)' }}>Required</span>
                )}
              </div>
              <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--muted)' }}>{type.desc}</p>
              <div className="flex flex-wrap gap-1.5">
                {type.examples.map((ex) => (
                  <span key={ex} className="text-[10px] px-2 py-1 rounded-md font-mono"
                    style={{ background: 'var(--surface)', color: 'var(--dim)' }}>{ex}</span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text)' }}>Managing Cookies</h2>
        <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--dim)' }}>
          You can control and manage cookies in several ways. Please note that removing or blocking cookies may impact your experience and some features of the Service may become inaccessible.
        </p>
        <div className="rounded-xl p-5 mb-12" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <div className="flex flex-col gap-2">
            {[
              { browser: 'Chrome', instruction: 'Settings → Privacy and Security → Cookies' },
              { browser: 'Firefox', instruction: 'Settings → Privacy & Security → Cookies' },
              { browser: 'Safari', instruction: 'Preferences → Privacy → Manage Website Data' },
              { browser: 'Edge', instruction: 'Settings → Privacy → Cookies and Site Data' },
            ].map((b) => (
              <div key={b.browser} className="flex items-center gap-3 text-xs">
                <span className="font-semibold w-16" style={{ color: 'var(--text)' }}>{b.browser}</span>
                <span style={{ color: 'var(--muted)' }}>{b.instruction}</span>
              </div>
            ))}
          </div>
        </div>

        <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text)' }}>FAQ</h2>
        <div className="flex flex-col gap-4 mb-12">
          {faqs.map((faq) => (
            <div key={faq.q} className="rounded-xl p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--text)' }}>{faq.q}</h3>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>{faq.a}</p>
            </div>
          ))}
        </div>

        <div className="rounded-xl p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>
            If you have questions about our use of cookies, please contact us at{' '}
            <a href="mailto:mustaphaelibrahimi@gmail.com" style={{ color: 'var(--accent)' }}>mustaphaelibrahimi@gmail.com</a>.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
