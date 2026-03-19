import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import PageLayout from "@/components/layout/PageLayout";
import ThemeProvider from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "EDVO - World-Class Learning Platform for Students & Professionals",
  description: "Transform your career with premium courses, expert instructors, and job opportunities. Learn coding, physics, mathematics, and more with interactive content.",
  keywords: ["online learning", "courses", "education", "jobs", "coding", "physics", "mathematics", "professional development"],
  authors: [{ name: "EDVO Team" }],
  openGraph: {
    title: "EDVO - Transform Your Learning Journey",
    description: "Premium courses, expert instructors, and career opportunities",
    type: "website",
  },
};

const themeInitScript = `
  try {
    var stored = localStorage.getItem('theme-storage');
    var parsed = stored ? JSON.parse(stored) : null;
    var mode = parsed && parsed.state && parsed.state.config ? parsed.state.config.mode : 'light';
    var root = document.documentElement;
    root.dataset.theme = mode;
    root.style.colorScheme = mode;
    if (mode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  } catch (e) {}
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {themeInitScript}
        </Script>
      </head>
      <body className="min-h-screen flex flex-col bg-white font-sans antialiased text-gray-900 dark:bg-slate-950 dark:text-gray-100">
        <ThemeProvider>
          <PageLayout>{children}</PageLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
