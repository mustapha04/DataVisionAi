import { useNavigate } from 'react-router-dom';
import { Code2, Briefcase, Mail, ArrowUpRight } from 'lucide-react';

const footerLinks = {
  Product: [
    { label: 'Features', href: '/#features' },
    { label: 'Pricing', href: '/#pricing' },
    { label: 'API', to: '/api' },
    { label: 'Documentation', to: '/docs' },
  ],
  Company: [
    { label: 'About', to: '/about' },
    { label: 'Contact', to: '/contact' },
  ],
  Legal: [
    { label: 'Privacy Policy', to: '/privacy' },
    { label: 'Terms of Service', to: '/terms' },
    { label: 'Cookie Policy', to: '/cookies' },
  ],
};

export default function Footer() {
  const navigate = useNavigate();

  const handleLink = (link: { href?: string; to?: string }) => {
    if (link.to) {
      navigate(link.to);
      window.scrollTo(0, 0);
    } else if (link.href) {
      if (link.href.startsWith('/#')) {
        const el = document.querySelector(link.href.substring(1));
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        else navigate('/');
      }
    }
  };

  return (
    <footer
      className="relative"
      style={{ background: 'var(--bg2)', borderTop: '1px solid var(--border)' }}
    >
      <div className="mx-auto px-6 pt-16 pb-8" style={{ maxWidth: 1280 }}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          <div className="lg:col-span-2">
            <div
              className="flex items-center gap-2.5 mb-5 cursor-pointer select-none"
              onClick={() => { navigate('/'); window.scrollTo(0, 0); }}
            >
              <img src="/icon.png" alt="DataVision AI" className="w-8 h-8 rounded-lg" />
              <span
                className="text-lg tracking-tight"
                style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text)' }}
              >
                DataVision<span style={{ color: 'var(--accent)' }}>AI</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--muted)', maxWidth: 320 }}>
              AI-powered data analytics platform for automated insights and predictive analysis.
              Transform raw data into intelligent decisions.
            </p>
            <div className="flex gap-3">
              {[
                { icon: Code2, label: 'GitHub' },
                { icon: Briefcase, label: 'LinkedIn' },
                { icon: Mail, label: 'Email' },
              ].map(({ icon: Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200"
                  style={{ border: '1px solid var(--border)', color: 'var(--muted)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted)'; }}
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4
                className="text-sm font-semibold mb-4"
                style={{ color: 'var(--text)' }}
              >
                {category}
              </h4>
              <ul className="flex flex-col gap-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      onClick={(e) => { e.preventDefault(); handleLink(link); }}
                      href="#"
                      className="text-sm transition-colors duration-200 flex items-center gap-1 group"
                      style={{ color: 'var(--muted)', cursor: 'pointer' }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--muted)'; }}
                    >
                      {link.label}
                      <ArrowUpRight
                        size={12}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <p className="text-xs" style={{ color: 'var(--muted)' }}>
            &copy; {new Date().getFullYear()} DataVision AI. All rights reserved.
          </p>
          <p className="text-xs" style={{ color: 'var(--dim)' }}>
            Built with AI for the future of data analytics.
          </p>
        </div>
      </div>
    </footer>
  );
}
