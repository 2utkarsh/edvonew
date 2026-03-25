'use client';

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import { Navbar, Footer } from '@/components/layout';

interface PageLayoutProps {
  children: ReactNode;
}

export default function PageLayout({ children }: PageLayoutProps) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith('/auth');
  const isDashboard = pathname?.startsWith('/dashboard');
  const isLiveWorkspace = pathname?.startsWith('/live-classroom');

  if (isAuthPage || isDashboard || isLiveWorkspace) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
