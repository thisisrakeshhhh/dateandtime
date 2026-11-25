# TimeBridge Production Deployment Guide

A step-by-step launch manual for deploying TimeBridge to production on your own custom domain.

---

## 1. Domain Registration

### Where to Buy
- Recommended registrars: **Cloudflare Registrar**, **Namecheap**, or **Porkbun** (low markup, free WHOIS privacy).
- **Recommended TLD**: `.com` (e.g. `yourname-time.com` or `timebridge-app.com`).
- **What to avoid**:
  - Hype or spammy TLDs such as `.xyz`, `.top`, `.click`, `.buzz`, `.space`, `.club`, or `.cc`.
  - Google AdSense frequently delays or rejects brand new websites registered on spam-heavy or low-trust TLDs. A standard `.com`, `.net`, or `.org` builds immediate domain authority.

---

## 2. Connecting Your Domain in Vercel

### Setting Apex and WWW
1. Open your project in the [Vercel Dashboard](https://vercel.com/dashboard).
2. Go to **Settings** → **Domains**.
3. Add **both** your apex domain (`yourdomain.com`) and the `www` subdomain (`www.yourdomain.com`).
4. **Redirect Recommendation**: Set `yourdomain.com` as your primary production domain, and set `www.yourdomain.com` to redirect permanently (HTTP 308) to `yourdomain.com` (or vice-versa). Consistent canonical redirection prevents duplicate content issues in search engines.

### Configuring DNS Records
At your domain registrar's DNS management panel:
- **For the Apex domain (`@`)**:
  - Type: `A` Record
  - Name / Host: `@`
  - Value: `76.76.21.21` (Vercel IP)
- **For the WWW subdomain (`www`)**:
  - Type: `CNAME` Record
  - Name / Host: `www`
  - Value: `cname.vercel-dns.com.`

### Verifying DNS Propagation
Open your local terminal and test DNS resolution:
```bash
# Check Apex domain A record
nslookup yourdomain.com
# or with dig:
dig yourdomain.com +short

# Check WWW CNAME
nslookup www.yourdomain.com
# or with dig:
dig www.yourdomain.com +short
```
When `76.76.21.21` or `cname.vercel-dns.com` appears, Vercel will automatically provision a free Let's Encrypt SSL certificate within a few minutes.

---

## 3. Environment Variables in Vercel

Navigate to **Project Settings** → **Environment Variables** in Vercel. Ensure you select the **Production** environment checkbox when saving these variables.

| Variable Name | Required? | Recommended Production Value | Description |
|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | **Required** | `https://yourdomain.com` | Primary canonical website URL (no trailing slash). Used for canonical tags, Open Graph, sitemaps, and JSON-LD schema. |
| `NEXT_PUBLIC_OWNER_NAME` | Optional | `Your Name` | Operator/owner name displayed on the About page. Defaults to "an independent developer" if unset. |
| `CONTACT_EMAIL` | **Required** | `you@yourdomain.com` | Destination inbox where contact form submissions will be delivered. |
| `RESEND_API_KEY` | Optional | `re_xxxxxxxxxxxxxxxx` | Resend API key for sending email. Contact form returns 503 if missing. |
| `RESEND_FROM_EMAIL` | Optional | `contact@yourdomain.com` | Verified sender email address configured in your Resend account. |
| `INDEX_WAVE` | **Required** | `1` | Phased indexing rollout (`1`, `2`, or `3`). Keep at `1` for initial launch. |
| `NEXT_PUBLIC_ENABLE_ADS` | Optional | `false` | Master toggle for Google AdSense scripts and ad slots. Keep `false` until approved. |
| `NEXT_PUBLIC_ADSENSE_CLIENT` | Optional | `ca-pub-xxxxxxxxxxxxxxxx` | Your Google AdSense publisher client ID. |
| `NEXT_PUBLIC_ADSENSE_SLOT_TOP` | Optional | `1234567890` | AdSense ad slot ID for top placements. |
| `NEXT_PUBLIC_ADSENSE_SLOT_BOTTOM` | Optional | `0987654321` | AdSense ad slot ID for bottom placements. |
| `WEATHER_API_KEY` | Optional | *(Leave empty)* | OpenWeatherMap API key (if using OpenWeather for live weather cards). |
| `OPENMETEO_COMMERCIAL_KEY` | Optional | *(Leave empty)* | Commercial license key if utilizing Open-Meteo commercial tier. |
| `ENABLE_NONCOMMERCIAL_OPENMETEO` | Optional | `true` | Allows free non-commercial Open-Meteo weather data during non-commercial launch. |

---

## 4. Setting Up Resend for the Contact Form

1. Sign up for a free account at [resend.com](https://resend.com) (free tier includes 3,000 emails/month, 100 emails/day).
2. Generate an API Key under **API Keys** → **Create API Key**. Copy this into `RESEND_API_KEY` in Vercel.
3. **Initial Testing with `onboarding@resend.dev`**:
   - By default, before domain verification, Resend only permits sending from `onboarding@resend.dev` to the email address registered with your Resend account.
   - For initial testing, set `RESEND_FROM_EMAIL=onboarding@resend.dev` and `CONTACT_EMAIL=<your-resend-account-email>`.
4. **Full Production Verification (DKIM & SPF)**:
   - Go to **Domains** → **Add Domain** in the Resend dashboard and enter `yourdomain.com`.
   - Add the 3 DNS records provided by Resend (DKIM, SPF TXT record, and MX record) to your domain registrar.
   - Once verified in Resend (status turns green), change `RESEND_FROM_EMAIL` to `contact@yourdomain.com`. Contact form messages can now be routed anywhere.

---

## 5. Redeploying and Running the Smoke Test

1. In the Vercel Dashboard, go to **Deployments** → click the three dots (`...`) on the latest deployment → click **Redeploy**.
   *(Checking "Redeploy with existing build cache" is fine, or trigger a clean deployment without cache).*
2. Once the deployment reaches **Ready**, run the automated smoke test from your computer:
```bash
node scripts/smoke-test.mjs https://yourdomain.com
```
3. Verify that all 11 test suites output `[PASS]` and the summary reads:
```
========================================================================
TOTAL CHECKS  : 79
PASSED CHECKS : 79
FAILED CHECKS : 0
========================================================================
ALL SMOKE TEST CHECKS PASSED SUCCESSFULLY!
```

---

## 6. Google Search Console Setup

1. Open [Google Search Console](https://search.google.com/search-console).
2. Choose **Domain** property type and enter `yourdomain.com`.
3. Copy the `google-site-verification=...` DNS TXT token and paste it into your registrar's DNS records.
4. Click **Verify**.
5. Once verified, go to **Sitemaps** in the left sidebar and submit all 5 sitemaps:
   - `https://yourdomain.com/sitemap/core.xml` (Homepage, hub pages, core tools)
   - `https://yourdomain.com/sitemap/corridors.xml` (Primary timezone corridors)
   - `https://yourdomain.com/sitemap/converters.xml` (Abbreviation & city converters)
   - `https://yourdomain.com/sitemap/shifts.xml` (Global shift guide pages)
   - `https://yourdomain.com/sitemap/sports.xml` (Confirmed global sporting event times)
6. **URL Inspection Quota Warning**:
   - Google limits manual "Request Indexing" submissions to roughly 10–50 requests per day per property.
   - Do **NOT** attempt to inspect hundreds of pages manually. Submitting the sitemaps allows Googlebot to discover and crawl pages naturally.

---

## 7. Phased Rollout Plan (`INDEX_WAVE`)

To prevent your brand new domain from being flagged by search algorithms as low-quality programmatic spam, TimeBridge implements phased indexing waves:

- **Launch Phase: `INDEX_WAVE=1` (Current)**
  - Indexes only core hub pages and Tier-1 high-demand corridors (e.g. New York to London, San Francisco to Tokyo) along with primary converter pairs.
  - Sitemaps include ~215 essential, high-quality, fully populated pages.
  - Run with Wave 1 for **1 to 2 weeks**. Monitor Google Search Console until Google has indexed the core pages and reports zero crawl errors.
- **Expansion Phase: `INDEX_WAVE=2`**
  - Change `INDEX_WAVE=2` in Vercel Environment Variables and redeploy.
  - Unlocks Tier-2 regional corridor pairs and additional converter combinations (~500 pages).
  - Run for 2 to 3 weeks while gathering initial organic impressions.
- **Full Coverage: `INDEX_WAVE=3`**
  - Set `INDEX_WAVE=3` once your domain has established solid crawl trust and indexing velocity.
  - Unlocks full global corridor coverage.

---

## 8. Google AdSense Application & Compliance

- **When to Apply**:
  - Do **NOT** apply on day one.
  - Wait until Google Search Console shows **at least 50+ pages indexed** and your site receives genuine search traffic over a period of 2 to 4 weeks.
  - AdSense reviewers reject thin, unindexed, or zero-traffic websites under "Low value content".
- **Enabling Ads Once Approved**:
  1. Once approved, Google provides your publisher ID (`ca-pub-XXXXXXXXXXXXXXXX`).
  2. In `public/ads.txt`, replace the comment with your official AdSense record:
     ```
     google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
     ```
  3. In Vercel Environment Variables, set:
     - `NEXT_PUBLIC_ENABLE_ADS=true`
     - `NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-XXXXXXXXXXXXXXXX`
  4. Redeploy the application.
- **Important Vercel Plan Warning**:
  - Vercel's **Hobby (Free) Plan** terms of service restrict commercial monetization.
  - Once you serve advertisements or earn revenue from your website, you must upgrade your Vercel account to the **Vercel Pro Plan** ($20/month) to stay compliant with Vercel TOS.

---

## 9. One-Minute Rollback Procedure

If a bug or issue appears in production at any point:
1. Open the [Vercel Dashboard](https://vercel.com/dashboard) and select your project.
2. Click the **Deployments** tab.
3. Find the previous stable deployment in the history list.
4. Click the three dots menu icon (`...`) on that deployment row.
5. Click **Instant Rollback** (or **Promote to Production**).
6. Traffic immediately switches to the previous build in under 60 seconds with zero downtime.

---

## 10. First-Week Post-Launch Checklist

- [ ] **Day 1**: Run `node scripts/smoke-test.mjs https://yourdomain.com` against the live domain. Verify all 79 tests pass.
- [ ] **Day 1**: Test the live contact form on `/contact`. Verify an email is received in `CONTACT_EMAIL` and check delivery status in the Resend dashboard.
- [ ] **Day 2**: Open Google Search Console. Confirm that DNS ownership verification remains active and all 5 submitted sitemaps show "Success".
- [ ] **Day 3**: Review Vercel Dashboard → **Usage** / **Functions** to observe invocation metrics, average execution duration (<150ms), and error rate (0%).
- [ ] **Day 5**: Check Google Search Console **Page indexing** report to monitor newly discovered and indexed pages.
- [ ] **Day 7**: Review Search Console **Performance** tab for initial search queries and impressions.
- [ ] **Week 2**: If indexing is healthy, prepare to advance from `INDEX_WAVE=1` to `INDEX_WAVE=2`.
