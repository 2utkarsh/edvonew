'use client';

import { ReactNode } from 'react';
import { Footer, Navbar } from '@/components/layout';

type AuthPageChromeProps = {
  children: ReactNode;
  showNavbar?: boolean;
  showFooter?: boolean;
};

export default function AuthPageChrome({ children, showNavbar = true, showFooter = true }: AuthPageChromeProps) {
  return (
    <>
      {showNavbar ? <Navbar /> : null}
      {children}
      {showFooter ? <Footer /> : null}
    </>
  );
}
