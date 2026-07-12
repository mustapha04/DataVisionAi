import type { ReactNode } from 'react';
import PublicNavbar from '@/components/PublicNavbar';
import Footer from '@/components/Footer';

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <PublicNavbar />
      <main className="flex-1" style={{ paddingTop: 80 }}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
