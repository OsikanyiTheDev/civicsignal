import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import "./globals.css";
import "./auth.css";
import "./incident.css";
import "./moderator.css";
import "./insights.css";
import "./following.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://civicsignal.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "CivicSignal | Community Infrastructure Incident & Response Hub",
    template: "%s | CivicSignal",
  },
  description: "A community-first prototype for reporting infrastructure issues, tracking transparent status updates, and designing a safer response workflow.",
  keywords: ["community infrastructure", "civic technology", "incident reporting", "AWS serverless", "Terraform", "CivicSignal"],
  alternates: { canonical: siteUrl },
  openGraph: {
    title: "CivicSignal | Make local issues visible",
    description: "A community-first infrastructure incident and response hub, built as an open cloud engineering project.",
    type: "website",
    url: siteUrl,
    siteName: "CivicSignal",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#102c35",
  colorScheme: "light",
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "CivicSignal",
  applicationCategory: "Civic technology",
  operatingSystem: "Web",
  description: "A community-first infrastructure incident and response hub prototype.",
  creator: {
    "@type": "Person",
    name: "Osikanyi Nana Yaw Essandoh",
    url: "https://osikanyi-cloud-portfolio.vercel.app/",
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
        {children}
      </body>
    </html>
  );
}
