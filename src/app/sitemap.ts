import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://civicsignal.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  return [{
    url: siteUrl,
    lastModified: new Date("2026-08-21"),
    changeFrequency: "weekly",
    priority: 1,
  }];
}
