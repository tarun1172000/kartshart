import { MetadataRoute } from "next";
import { DEFAULT_SITE_URL } from "@/lib/constants";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard/",
          "/dashboard",
          "/login",
          "/request-access",
          "/api/",
        ],
      },
      {
        userAgent: "GPTBot",
        allow: "/",
        disallow: ["/dashboard/", "/login"],
      },
      {
        userAgent: "ClaudeBot",
        allow: "/",
        disallow: ["/dashboard/", "/login"],
      },
      {
        userAgent: "PerplexityBot",
        allow: "/",
        disallow: ["/dashboard/", "/login"],
      },
    ],
    sitemap: `${DEFAULT_SITE_URL}/sitemap.xml`,
  };
}
