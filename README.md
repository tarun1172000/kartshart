# Kartshart.com — Modern Editorial Blogging Platform
> **हिंदी और English में संपूर्ण दस्तावेज़ीकरण / Complete Production Guide**

Kartshart is a high-performance, secure, SEO + AEO + GEO + AIO optimized editorial magazine and blogging platform built from scratch with Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, MongoDB (Mongoose), and passwordless Email OTP authentication.

---

## 🌟 English Overview & Features

### 1. Key Features
- **Modern Magazine & Editorial Design**: Clean serif typography (Newsreader), fluid responsive grids, smooth dark/light theme toggle, reading progress bar, and executive summary callouts.
- **Strict Dashboard Authoring**: Public site is read-only. All articles are composed, edited, and published exclusively from the private `/dashboard`.
- **Zero File Uploads (Image URL Protocol)**: Authors provide direct image URLs (Unsplash, Cloudinary, Pexels, CDNs) with live preview, alt text enforcement, and image credit metadata.
- **Passwordless Email OTP Authentication**: Secure 6-digit numeric OTP with SHA-256 HMAC pepper hashing, 10-minute expiry, rate-limiting, and signed JWT session cookies (Jose).
- **Hardcoded Super Admin**: `tarunwaliya780@gmail.com` is seeded on boot and cannot be deleted, demoted, or altered.
- **Controlled Contributor Onboarding**: Prospective writers request access via `/request-access`. The Super Admin reviews, approves (assigning `ADMIN` or `EDITOR` role), or rejects requests.
- **Complete SEO / AEO / GEO / AIO Architecture**:
  - Semantic HTML5 with dynamic OpenGraph, Twitter Cards, and canonical URLs.
  - JSON-LD structured schemas: `BlogPosting`, `FAQPage`, `BreadcrumbList`, `Organization`, and `WebSite`.
  - Machine-readable AI manifests: `/llms.txt` and `/ai.txt`.
  - Dynamic XML Sitemap (`/sitemap.xml`) and RSS 2.0 Feed (`/rss.xml`).
  - Search engine crawler directives via `/robots.txt`.

---

## 🇮🇳 हिंदी सारांश और मुख्य विशेषताएँ

- **आधुनिक संपादकीय मैगज़ीन**: न्यूज़रीडर सेरिफ़ टाइपोग्राफी, सहज डार्क/लाइट मोड, रीडिंग प्रोग्रेस बार और प्रीमियम लेआउट।
- **सुरक्षित डैशबोर्ड**: सभी ब्लॉग पोस्ट केवल `/dashboard` से ही बनाए और प्रकाशित किए जाते हैं। पब्लिक वेबसाइट केवल पढ़ने के लिए है।
- **फ़ाइल अपलोड रहित (केवल इमेज URL)**: कोई फ़ाइल अपलोड नहीं। अनस्प्लैश या क्लाउडिनरी इमेज URL पेस्ट करें, लाइव प्रीव्यू देखें और सेव करें।
- **पासवर्ड-रहित ईमेल OTP लॉगिन**: कोई पासवर्ड नहीं। 6-अंकों का सुरक्षित OTP ईमेल पर आता है।
- **सुपर एडमिन (मालिक)**: `tarunwaliya780@gmail.com` हमेशा सुपर एडमिन रहेगा।
- **कंट्रीब्यूटर एक्सेस अनुरोध**: नए लेखक `/request-access` पर फॉर्म भरते हैं। सुपर एडमिन उन्हें एडमिन या एडिटर के रूप में स्वीकृत करता है।
- **पूर्ण SEO, AEO, GEO एवं AIO ऑप्टिमाइज़ेशन**: गूगल सर्च, चैटजीपीटी, परप्लेक्सिटी और क्लॉड के लिए संरचित स्कीमा और `llms.txt`।

---

## 🚀 Quick Setup / सेटअप निर्देश

### Step 1: Clone & Install Dependencies / डिपेंडेंसी इंस्टॉल करें
```bash
git clone https://github.com/yourusername/kartshart.git
cd kartshart
npm install
```

### Step 2: Environment Variables / पर्यावरण चर विन्यास
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Open `.env.local` and configure your database and secrets:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/kartshart?retryWrites=true&w=majority
MONGODB_DB_NAME=kartshart
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SESSION_SECRET=a_very_long_random_string_with_32_characters_min!
OTP_PEPPER=random_otp_pepper_secret_key_12345
SUPER_ADMIN_EMAIL=tarunwaliya780@gmail.com
RESEND_API_KEY=re_your_resend_api_key_here
EMAIL_FROM="Kartshart <noreply@kartshart.com>"
```

> **Development Note / डेवलपमेंट टिप:** If `RESEND_API_KEY` is not provided in development, the OTP code is automatically logged prominently in your terminal server console (`>>> DEV LOGIN OTP for ...: [ 123456 ] <<<`).

### Step 3: Run Development Server / लोकल सर्वर चालू करें
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 First Login & Super Admin Access / पहला लॉगिन

1. Navigate to `http://localhost:3000/login`.
2. Enter the Super Admin email: `tarunwaliya780@gmail.com`.
3. Click **Send Verification Code**.
4. Check your email (or your dev terminal console) for the 6-digit OTP code.
5. Enter the OTP code to log in to the `/dashboard`.

---

## 👥 How to Approve New Contributors / नए लेखकों को मंज़ूरी कैसे दें

1. A new user goes to `http://localhost:3000/request-access` and submits their name, email, and pitch.
2. The Super Admin receives an email notification.
3. The Super Admin logs in and navigates to `/dashboard/access-requests`.
4. Click **Approve** and choose their role:
   - **EDITOR**: Can author drafts and edit their own articles.
   - **ADMIN**: Can edit, publish, and delete any article and manage categories.
5. The applicant receives an approval email and can now log in at `/login` with their email and OTP.

---

## ✍️ How to Create & Publish a Blog Post / ब्लॉग पोस्ट कैसे बनाएँ

1. In the dashboard, click **Write New Post** (`/dashboard/posts/new`).
2. Fill in:
   - **Title**: e.g., *Building at Scale: How India's Digital Rails are Shaping Innovation*.
   - **Slug**: Auto-generated from title, editable if needed.
   - **Cover Image URL**: Paste a direct link (e.g., from [Unsplash](https://unsplash.com)).
   - **Cover Image Alt Text**: Describe the visual for accessibility.
   - **Category**: Select a topic (Technology, Business, Lifestyle, India, Guides).
   - **AEO Accordion**: Add 2-3 bullet Key Takeaways and FAQ Q&A items.
   - **SEO Accordion**: Optional custom meta description and OG image.
   - **Content Body**: Use the formatting toolbar to structure headings, blockquotes, lists, links, and embedded images.
3. Click **Publish Post** (or **Save Draft**).
4. Your post is instantly live at `/blog/[slug]` and dynamically indexed in `/sitemap.xml` and `/rss.xml`.

---

## 🌐 Deploy to Vercel & Production / प्रोडक्शन परिनियोजन

### 1. MongoDB Atlas Setup
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a database user with read/write permissions.
3. In Network Access, allow access from anywhere (`0.0.0.0/0`) so Vercel serverless functions can connect.
4. Copy the connection string into `MONGODB_URI`.

### 2. Vercel Deployment
1. Push your repository to GitHub / GitLab.
2. Import the project into [Vercel](https://vercel.com).
3. Add the environment variables from `.env.local` to the Vercel Project Settings.
4. Set `NEXT_PUBLIC_SITE_URL` to `https://kartshart.com`.
5. Deploy!

### 3. Custom Domain & DNS Settings (kartshart.com)
In your domain registrar (Namecheap, GoDaddy, Cloudflare, etc.):
- **Apex domain (`kartshart.com`)**:
  - Type: `A` | Name: `@` | Value: `76.76.21.21` (Vercel IP)
- **Subdomain (`www.kartshart.com`)**:
  - Type: `CNAME` | Name: `www` | Value: `cname.vercel-dns.com`

### 4. Resend Domain Verification (for live email delivery)
1. Sign up on [Resend.com](https://resend.com) and add your domain `kartshart.com`.
2. Add the required DKIM and MX DNS records provided by Resend.
3. Copy your API Key into `RESEND_API_KEY` on Vercel.

---

## 📋 Post-Deployment Checklist / परिनियोजन के बाद की चेकलिस्ट

- [ ] Log in with `tarunwaliya780@gmail.com` on `https://kartshart.com/login`.
- [ ] Submit `https://kartshart.com/sitemap.xml` in [Google Search Console](https://search.google.com/search-console).
- [ ] Verify `/llms.txt` and `/ai.txt` are accessible by AI crawlers.
- [ ] Verify `/rss.xml` parses cleanly in RSS readers.
- [ ] Test requesting access with a test email and approving it in `/dashboard/access-requests`.

---

## 🛡️ Security & Architecture Guarantees
- Strict session validation verifying fresh DB user records on every mutating request.
- Rate-limited OTP creation (10-minute expiry, locked after 5 failed attempts).
- Sanitized HTML input blocking XSS, data URIs, and javascript protocol injection.
- Edge HTTP security headers configured in `next.config.ts`.
