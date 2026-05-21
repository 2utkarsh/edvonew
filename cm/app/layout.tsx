import "../styles/globals.css";
import "../styles/dashboard.css";
import "@livekit/components-styles";
import "@livekit/components-styles/prefabs";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: {
    default: "IEDUP LMS Dashboard",
    template: "%s | IEDUP LMS Dashboard",
  },
  description:
    "A polished meeting workspace for hosts, participants, and recording review.",
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
  themeColor: "#081f1c",
};

export default function RootLayout({ children }: any) {
  return (
    <html lang="en">
      <head>
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body>{children}</body>
    </html>
  );
}
