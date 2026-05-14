'use client';

import { ReactNode } from 'react';
import { Footer, Navbar } from '@/components/layout';

type AuthPageChromeProps = {
  children: ReactNode;
};

export default function AuthPageChrome({ children }: AuthPageChromeProps) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
