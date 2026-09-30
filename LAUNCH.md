# Kartshart Production Launch Checklist

Follow these exact steps to take `kartshart.com` live:

## 1. MongoDB Atlas Configuration
- [ ] Log into MongoDB Atlas.
- [ ] Ensure your Database User (`tarunwaliya780_db_user` or similar) has **Read and write to any database** permissions.
- [ ] Go to **Network Access**.
- [ ] Add IP Address `0.0.0.0/0` (Allow access from anywhere) so Vercel serverless functions can connect.

## 2. Vercel Environment Variables
Add the following exactly as they appear in your `.env.local` to your Vercel Project Settings > Environment Variables:
- `MONGODB_URI` (Must start with `mongodb+srv://...`)
- `MONGODB_DB_NAME` (e.g. `kartshart`)
- `NEXT_PUBLIC_SITE_URL` (Set to `https://kartshart.com`)
- `SESSION_SECRET`
- `OTP_PEPPER`
- `SUPER_ADMIN_EMAIL` (`tarunwaliya780@gmail.com`)
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` (Your Gmail App Password without spaces)

## 3. Domain Configuration (kartshart.com)
In your domain registrar (GoDaddy, Namecheap, etc) or Cloudflare:
- [ ] Add Vercel's nameservers OR add A Record for `@` to `76.76.21.21`.
- [ ] Ensure Vercel project domains include `kartshart.com` and `www.kartshart.com`.
- [ ] Set `www.kartshart.com` to redirect to `kartshart.com` in Vercel settings.

## 4. Email Domain Verification (Optional / If using Resend)
- [ ] If you ever switch to Resend, verify the `kartshart.com` domain by adding DKIM/MX records to your DNS. For now, your Gmail SMTP fallback is working.

## 5. Test Production OTP
- [ ] Go to `https://kartshart.com/login`.
- [ ] Enter `tarunwaliya780@gmail.com` and request OTP.
- [ ] Verify you receive the email from Gmail SMTP and can log into the dashboard.

## 6. Create First Real Post
- [ ] Go to `https://kartshart.com/dashboard/posts/new`.
- [ ] Author and publish 1 real article to ensure database read/write and routing work perfectly in production.

## 7. Google Search Console
- [ ] Go to [Google Search Console](https://search.google.com/search-console).
- [ ] Add property `https://kartshart.com` and verify ownership.
- [ ] Submit your sitemap: `https://kartshart.com/sitemap.xml`.

## 8. Final Checks
- [ ] Visit `https://kartshart.com/sitemap.xml` to ensure it loads XML.
- [ ] Visit `https://kartshart.com/robots.txt` to ensure it allows crawling.
- [ ] Visit `https://kartshart.com/rss.xml` and `/llms.txt`.
- [ ] Check mobile view (360px) to ensure no horizontal scrolling.

**Status:** Ready for Launch 🚀
