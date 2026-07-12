import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const sections = [
  { title: '1. Information We Collect', content: 'We collect information you provide directly, such as your name, email address, and payment information when you create an account. We also collect data you upload to the platform for analysis, including datasets, file contents, and associated metadata. Additionally, we automatically collect certain information about your device and usage, including IP address, browser type, operating system, pages visited, and timestamps.' },
  { title: '2. How We Use Your Information', content: 'We use your information to provide, maintain, and improve our services; process transactions and send related information; send technical notices, updates, security alerts, and support messages; respond to your comments and questions; and develop new products and services. We also use data to monitor and analyze trends, usage, and activities in connection with our services.' },
  { title: '3. Data Sharing and Disclosure', content: 'We do not sell your personal information. We may share your information with third-party service providers who perform services on our behalf, such as hosting, analytics, and payment processing. We may also disclose information if required by law, or when we believe in good faith that disclosure is necessary to protect our rights, your safety, or the safety of others.' },
  { title: '4. Data Security', content: 'We implement industry-standard security measures including AES-256 encryption at rest, TLS 1.3 encryption in transit, regular security audits, access controls, and monitoring. While we strive to protect your information, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.' },
  { title: '5. Data Retention', content: 'We retain your personal information for as long as your account is active or as needed to provide you services. We will also retain your information as necessary to comply with legal obligations, resolve disputes, and enforce our agreements. You may request deletion of your data at any time by contacting us.' },
  { title: '6. Your Rights', content: 'You have the right to access, correct, or delete your personal information. You may also export your data at any time from the dashboard. If you are in the European Economic Area, you have additional rights under GDPR, including the right to restrict processing and the right to data portability. To exercise these rights, please contact us.' },
  { title: '7. Children\'s Privacy', content: 'Our services are not directed to individuals under the age of 16. We do not knowingly collect personal information from children under 16. If we become aware that we have collected personal information from a child under 16, we will take steps to delete such information promptly.' },
  { title: '8. Changes to This Policy', content: 'We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last Updated" date. We encourage you to review this policy periodically for any changes.' },
  { title: '9. Contact Us', content: 'If you have any questions about this privacy policy, please contact us at mustaphaelibrahimi@gmail.com or by mail at DataVision AI, Morocco.' },
];

export default function PrivacyPage() {
  return (
    <div className="mx-auto px-6 py-20" style={{ maxWidth: 800 }}>
      <motion.div initial="hidden" animate="visible" variants={fadeUp}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(0,212,170,0.1)' }}>
            <Shield size={20} style={{ color: 'var(--accent)' }} />
          </div>
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--text)' }}>Privacy Policy</h1>
          </div>
        </div>
        <p className="text-xs mb-10" style={{ color: 'var(--muted)' }}>Last Updated: July 2026</p>
      </motion.div>

      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
        <p className="text-sm leading-relaxed mb-8" style={{ color: 'var(--dim)' }}>
          DataVision AI ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform and services.
        </p>

        <div className="flex flex-col gap-6">
          {sections.map((s) => (
            <div key={s.title}>
              <h2 className="text-base font-bold mb-2" style={{ color: 'var(--text)' }}>{s.title}</h2>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--dim)' }}>{s.content}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
