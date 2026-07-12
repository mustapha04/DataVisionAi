import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const sections = [
  { title: '1. Acceptance of Terms', content: 'By accessing or using DataVision AI ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use the Service. We reserve the right to modify these terms at any time, and continued use of the Service constitutes acceptance of any changes.' },
  { title: '2. Account Registration', content: 'You must provide accurate and complete information when creating an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.' },
  { title: '3. Acceptable Use', content: 'You agree not to use the Service for any unlawful purpose or in any way that could damage, disable, or impair the Service. You shall not upload malicious files, attempt to access other users\' data without authorization, or use the Service to transmit spam, malware, or other harmful content. You are solely responsible for the data you upload and analyze.' },
  { title: '4. Intellectual Property', content: 'The Service and its original content, features, and functionality are owned by DataVision AI and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws. You retain ownership of any data you upload to the Service. We do not claim ownership of your data.' },
  { title: '5. Payment and Billing', content: 'Free tier usage is subject to usage limits. Paid plans are billed in advance on a monthly or annual basis. All fees are non-refundable except as required by law. We reserve the right to change pricing with 30 days\' notice. Failed payments may result in service suspension.' },
  { title: '6. Data and Privacy', content: 'Your use of the Service is also governed by our Privacy Policy, which is incorporated into these terms by reference. We process your data in accordance with our Privacy Policy. You are responsible for ensuring you have the right to upload any data to the Service.' },
  { title: '7. Limitation of Liability', content: 'To the maximum extent permitted by law, DataVision AI shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the Service. Our total liability shall not exceed the amount paid by you in the twelve months preceding the claim.' },
  { title: '8. Disclaimer of Warranties', content: 'The Service is provided "as is" and "as available" without warranties of any kind, whether express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, and non-infringement. We do not warrant that the Service will be uninterrupted or error-free.' },
  { title: '9. Termination', content: 'We may terminate or suspend your account and access to the Service immediately, without prior notice, for conduct that we determine, in our sole discretion, violates these terms or is harmful to other users, us, or third parties, or for any other reason. Upon termination, your right to use the Service ceases immediately.' },
  { title: '10. Governing Law', content: 'These terms shall be governed by and construed in accordance with the laws of Morocco, without regard to its conflict of law provisions. Any disputes arising under these terms shall be resolved in the courts of Morocco.' },
  { title: '11. Contact', content: 'For questions about these Terms of Service, contact us at mustaphaelibrahimi@gmail.com.' },
];

export default function TermsPage() {
  return (
    <div className="mx-auto px-6 py-20" style={{ maxWidth: 800 }}>
      <motion.div initial="hidden" animate="visible" variants={fadeUp}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.1)' }}>
            <FileText size={20} style={{ color: 'var(--accent2)' }} />
          </div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text)' }}>Terms of Service</h1>
        </div>
        <p className="text-xs mb-10" style={{ color: 'var(--muted)' }}>Last Updated: July 2026</p>
      </motion.div>

      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
        <p className="text-sm leading-relaxed mb-8" style={{ color: 'var(--dim)' }}>
          Welcome to DataVision AI. These Terms of Service govern your use of our platform and services. Please read them carefully before using the Service.
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
