'use client';

import { ReactNode } from 'react';
import { Footer, Navbar } from '@/components/layout';

type AuthPageChromeProps = {
  children: ReactNode;
  showNavbar?: boolean;
  showFooter?: boolean;
  hideGuestAuthActions?: boolean;
};

export default function AuthPageChrome({
  children,
  showNavbar = true,
  showFooter = true,
  hideGuestAuthActions = false,
}: AuthPageChromeProps) {
  return (
    <>
      {showNavbar ? <Navbar hideGuestAuthActions={hideGuestAuthActions} /> : null}
      {children}
      {showFooter ? <Footer /> : null}
    </>
  );
}
