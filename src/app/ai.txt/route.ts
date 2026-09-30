import { NextResponse } from "next/server";
import { DEFAULT_SITE_URL, SUPER_ADMIN_EMAIL } from "@/lib/constants";

export async function GET() {
  const content = `# AI Crawler Permissions for Kartshart.com
User-Agent: *
Allow: /
Disallow: /dashboard
Disallow: /login
Disallow: /request-access

# Attribution requirements
Attribution-Name: Kartshart
Canonical-Domain: ${DEFAULT_SITE_URL}
Contact: ${SUPER_ADMIN_EMAIL}
`;

  return new NextResponse(content.trim(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
