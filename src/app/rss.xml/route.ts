import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Post } from "@/models/Post";
import { PostStatus, SITE_NAME, SITE_DESCRIPTION, DEFAULT_SITE_URL } from "@/lib/constants";

export async function GET() {
  await connectToDatabase();

  const posts = await Post.find({ status: PostStatus.PUBLISHED })
    .populate("categoryId", "name")
    .sort({ publishedAt: -1 })
    .limit(30)
    .lean();

  const baseUrl = DEFAULT_SITE_URL;

  const rssItems = posts
    .map((post: any) => {
      const categoryName = post.categoryId?.name || "General";
      const pubDate = post.publishedAt
        ? new Date(post.publishedAt).toUTCString()
        : new Date().toUTCString();

      return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${baseUrl}/blog/${post.slug}</link>
      <guid isPermaLink="true">${baseUrl}/blog/${post.slug}</guid>
      <description><![CDATA[${post.excerpt}]]></description>
      <category><![CDATA[${categoryName}]]></category>
      <author><![CDATA[${post.authorName || "Kartshart Editorial Desk"}]]></author>
      <pubDate>${pubDate}</pubDate>
    </item>`;
    })
    .join("\n");

  const rssFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${SITE_NAME}</title>
    <link>${baseUrl}</link>
    <description>${SITE_DESCRIPTION}</description>
    <language>en-us</language>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${rssItems}
  </channel>
</rss>`;

  return new NextResponse(rssFeed.trim(), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
