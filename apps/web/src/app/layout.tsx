import type { Metadata, Viewport } from "next";
import { Providers } from "@/lib/providers";
import { RegisterSW } from "@/components/pwa/register-sw";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Veedu",
    template: "%s · Veedu",
  },
  description:
    "Veedu — calm household command center for shared plans, tasks, and day-to-day coordination.",
  applicationName: "Veedu",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Veedu",
  },
  icons: {
    icon: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/icons/icon-192.png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#5046C7",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <RegisterSW />
          {children}
        </Providers>
      </body>
    </html>
  );
}
