import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/app/theme';
import { useAuth } from '@/hooks/useAuth';
import { Moon, Sun, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'About', href: '#about' },
];

export default function PublicNavbar() {
  const { theme, toggle } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNav = (href: string) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled
          ? theme === 'dark'
            ? 'rgba(10, 14, 26, 0.85)'
            : 'rgba(255, 255, 255, 0.85)'
          : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
      }}
    >
      <div className="mx-auto flex items-center justify-between px-6 py-4" style={{ maxWidth: 1280 }}>
        <div
          className="flex items-center gap-2.5 cursor-pointer select-none"
          onClick={() => navigate('/')}
        >
          <img src="/icon.png" alt="DataVision AI" className="w-8 h-8 rounded-lg" />
          <span
            className="text-lg tracking-tight"
            style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text)' }}
          >
            DataVision<span style={{ color: 'var(--accent)' }}>AI</span>
          </span>
        </div>

        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => handleNav(link.href)}
              className="px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              style={{ color: 'var(--dim)' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.background = 'var(--surface)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--dim)'; e.currentTarget.style.background = 'transparent'; }}
            >
              {link.label}
            </button>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-3">
          <button
            onClick={toggle}
            className="flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200"
            style={{ border: '1px solid var(--border)', background: 'transparent', color: 'var(--dim)', cursor: 'pointer' }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--text)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--dim)'; }}
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {user ? (
            <button
              onClick={() => navigate('/')}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200"
              style={{ background: 'var(--accent)', color: '#0a0e1a', border: 'none', cursor: 'pointer' }}
              onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(1.1)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.filter = 'none'; }}
            >
              Dashboard
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate('/login')}
                className="px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
                style={{ background: 'transparent', color: 'var(--text)', border: 'none', cursor: 'pointer' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text)'; }}
              >
                Log in
              </button>
              <button
                onClick={() => navigate('/register')}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200"
                style={{ background: 'var(--accent)', color: '#0a0e1a', border: 'none', cursor: 'pointer' }}
                onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(1.1)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.filter = 'none'; }}
              >
                Get Started
              </button>
            </>
          )}
        </div>

        <div className="flex lg:hidden items-center gap-2">
          <button
            onClick={toggle}
            className="flex items-center justify-center w-9 h-9 rounded-lg"
            style={{ border: '1px solid var(--border)', background: 'transparent', color: 'var(--dim)', cursor: 'pointer' }}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex items-center justify-center w-9 h-9 rounded-lg"
            style={{ border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)', cursor: 'pointer' }}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden overflow-hidden"
            style={{ background: theme === 'dark' ? 'rgba(10, 14, 26, 0.95)' : 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(20px)', borderTop: '1px solid var(--border)' }}
          >
            <div className="flex flex-col gap-1 px-6 py-4">
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => handleNav(link.href)}
                  className="text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors"
                  style={{ color: 'var(--dim)', background: 'transparent', border: 'none', cursor: 'pointer' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.background = 'var(--surface)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--dim)'; e.currentTarget.style.background = 'transparent'; }}
                >
                  {link.label}
                </button>
              ))}
              <div className="flex flex-col gap-2 mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                {user ? (
                  <button
                    onClick={() => { setMobileOpen(false); navigate('/'); }}
                    className="w-full py-3 rounded-lg text-sm font-semibold"
                    style={{ background: 'var(--accent)', color: '#0a0e1a', border: 'none', cursor: 'pointer' }}
                  >
                    Dashboard
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => { setMobileOpen(false); navigate('/login'); }}
                      className="w-full py-3 rounded-lg text-sm font-medium"
                      style={{ background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)', cursor: 'pointer' }}
                    >
                      Log in
                    </button>
                    <button
                      onClick={() => { setMobileOpen(false); navigate('/register'); }}
                      className="w-full py-3 rounded-lg text-sm font-semibold"
                      style={{ background: 'var(--accent)', color: '#0a0e1a', border: 'none', cursor: 'pointer' }}
                    >
                      Get Started
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
