export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'Arial, sans-serif', padding: '24px' }}>{children}</body>
    </html>
  );
}

