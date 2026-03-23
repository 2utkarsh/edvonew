import type { ReactNode } from 'react';

const adminLayoutStyle = {
  margin: '-24px',
  width: 'calc(100% + 48px)',
  minHeight: 'calc(100vh + 48px)',
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <div style={adminLayoutStyle}>{children}</div>;
}
