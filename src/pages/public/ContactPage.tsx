import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/app/theme';
import { Mail, Phone, MapPin, Send, MessageSquare, CheckCircle2 } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  }),
};

const CONTACT_EMAIL = 'mustaphaelibrahimi@gmail.com';
const CONTACT_PHONE = '+212 606 412 511';

export default function ContactPage() {
  const { theme } = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const body = `Name: ${name}%0AEmail: ${email}%0A%0AMessage:%0A${encodeURIComponent(message)}`;
    window.open(`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${body}`, '_blank');
    setSent(true);
    setTimeout(() => setSent(false), 4000);
    setName(''); setEmail(''); setSubject(''); setMessage('');
  };

  const inputStyle = {
    width: '100%' as const,
    padding: '12px 16px',
    borderRadius: 10,
    border: '1px solid var(--border)',
    background: 'var(--surface)',
    color: 'var(--text)',
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box' as const,
    fontFamily: 'var(--font-sans)',
  };

  return (
    <div className="mx-auto px-6 py-20" style={{ maxWidth: 1000 }}>
      <motion.div initial="hidden" animate="visible" variants={fadeUp}>
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium mb-6"
          style={{ background: theme === 'dark' ? 'rgba(139,92,246,0.1)' : 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', color: '#8b5cf6' }}>
          <MessageSquare size={14} /> Get in Touch
        </span>
        <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--text)' }}>Contact Us</h1>
        <p className="text-lg mb-12 leading-relaxed" style={{ color: 'var(--muted)', maxWidth: 550 }}>
          Have a question, suggestion, or want to partner with us? We'd love to hear from you.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Info */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}
          className="flex flex-col gap-4">
          {[
            { icon: Mail, label: 'Email', value: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` },
            { icon: Phone, label: 'Phone', value: CONTACT_PHONE, href: `tel:${CONTACT_PHONE.replace(/\s/g, '')}` },
            { icon: MapPin, label: 'Location', value: 'Morocco', href: '#' },
          ].map((item) => (
            <a key={item.label} href={item.href}
              className="flex items-start gap-4 rounded-xl p-5 transition-all duration-200"
              style={{ background: 'var(--card)', border: '1px solid var(--border)', textDecoration: 'none' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(139,92,246,0.1)' }}>
                <item.icon size={18} style={{ color: '#8b5cf6' }} />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: 'var(--muted)' }}>{item.label}</div>
                <div className="text-sm font-medium" style={{ color: 'var(--text)' }}>{item.value}</div>
              </div>
            </a>
          ))}

          <div className="rounded-xl p-5 mt-2" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--text)' }}>Office Hours</h3>
            <div className="flex flex-col gap-1">
              {[
                { day: 'Monday – Friday', time: '9:00 AM – 6:00 PM' },
                { day: 'Saturday', time: '10:00 AM – 2:00 PM' },
                { day: 'Sunday', time: 'Closed' },
              ].map((h) => (
                <div key={h.day} className="flex justify-between text-xs">
                  <span style={{ color: 'var(--muted)' }}>{h.day}</span>
                  <span style={{ color: 'var(--dim)' }}>{h.time}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Contact Form */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={2}
          className="lg:col-span-2">
          <div className="rounded-2xl p-8" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <h2 className="text-lg font-bold mb-6" style={{ color: 'var(--text)' }}>Send a Message</h2>

            {sent && (
              <div className="flex items-center gap-2 p-3 rounded-lg mb-6 text-sm"
                style={{ background: 'rgba(0,212,170,0.1)', border: '1px solid rgba(0,212,170,0.2)', color: 'var(--accent)' }}>
                <CheckCircle2 size={16} /> Your email client has opened with the message. Thank you!
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-2" style={{ color: 'var(--muted)' }}>Your Name</label>
                  <input type="text" required value={name} onChange={e => setName(e.target.value)}
                    placeholder="John Doe" style={inputStyle} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-2" style={{ color: 'var(--muted)' }}>Email Address</label>
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="john@company.com" style={inputStyle} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-2" style={{ color: 'var(--muted)' }}>Subject</label>
                <input type="text" required value={subject} onChange={e => setSubject(e.target.value)}
                  placeholder="How can we help?" style={inputStyle} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-2" style={{ color: 'var(--muted)' }}>Message</label>
                <textarea required value={message} onChange={e => setMessage(e.target.value)} rows={5}
                  placeholder="Tell us about your project, question, or feedback..."
                  style={{ ...inputStyle, resize: 'vertical' as const, minHeight: 120 }} />
              </div>
              <button type="submit"
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 self-start"
                style={{ background: 'var(--accent)', color: '#0a0e1a', border: 'none', cursor: 'pointer' }}
                onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(1.1)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.filter = 'none'; e.currentTarget.style.transform = 'none'; }}>
                <Send size={16} /> Send Message
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
