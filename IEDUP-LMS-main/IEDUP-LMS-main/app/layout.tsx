import "../styles/globals.css";
import "../styles/dashboard.css";
import "@livekit/components-styles";
import "@livekit/components-styles/prefabs";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: {
    default: "IEDUP LMS Meetings",
    template: "%s | IEDUP LMS Meetings",
  },
  description:
    "A Zoom-inspired meeting workspace for IEDUP LMS hosts, participants, and recordings.",
  icons: {
    icon: {
      rel: "icon",
      url: "/logo/favicon.png",
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0e62fd",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body>{children}</body>
    </html>
  );
}
