# TimeBridge - World Time Difference, Day/Night Map & Best Time to Call

**TimeBridge** is a modern, production-grade world time zone calculator, live solar terminator day/night visualizer, and international calling window coordinator. Built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, and deployable on **Cloudflare Workers** via `@opennextjs/cloudflare`.

---

## 🌟 Key Features

1. **Interactive Solar Terminator Map**:
   - Live night shadow polygon computed via astronomical solar position formulas, updating every 60 seconds.
   - Glowing golden city lights inside the night shadow.
   - Great-circle geodesic flight curves between selected locations with distance badges (km & miles).
   - Zero paid map keys (OpenStreetMap standard tiles).

2. **Accurate Time Difference Engine**:
   - Powered by **Luxon** and the official **IANA Time Zone Database**.
   - Handles fractional and quarter-hour offsets: India (+5:30), Nepal (+5:45), Adelaide/Darwin (+9:30), Newfoundland (-3:30), Chatham Islands (+12:45 / +13:45).
   - Automatic Daylight Saving Time (DST) tracking with clear notices.

3. **Live Non-Blocking Clocks**:
   - Real-time digital clocks ticking every second isolated in lightweight leaf components to prevent full-page or map re-renders.
   - 12h/24h toggle, date, timezone abbreviations, and daytime/nighttime indicators.

4. **Best Time to Call & 24-Hour Comparison**:
   - Optimal awake window (9:00 AM to 9:00 PM) in both locations.
   - Business overlap window (9:00 AM to 5:00 PM) for remote team syncs.
   - 24-hour hour-by-hour cross-reference table (*"When it is 9 AM in A, it is X in B"*).

5. **Advanced Programmatic SEO & AdSense Readiness**:
   - Statically generated pair routes (`/time-difference/[from]-to-[to]` and `/best-time-to-call/[to]-from-[from]`) for 200+ high-volume popular pairs.
   - Country (`/country/[slug]`) and City (`/city/[slug]`) landing pages.
   - Plain server-rendered HTML fallbacks for crawlers without JavaScript.
   - Unique title, meta descriptions, Open Graph, and Twitter tags.
   - `FAQPage` and `BreadcrumbList` JSON-LD schema markup.
   - Configurable `<AdSlot />` with zero CLS layout placeholders, enabled via `NEXT_PUBLIC_ENABLE_ADS`.
   - AdSense-compliant `/about`, `/contact`, `/privacy-policy`, `/terms`, and `/public/ads.txt`.
   - Auto-generated `sitemap.xml` and `robots.txt`.

---

## 🛠️ Project Structure

```
├── app/
│   ├── about/                    # About Us page
│   ├── best-time-to-call/[pair]/ # Best time to call route
│   ├── city/[slug]/              # City time zone profile
│   ├── contact/                  # Contact support page
│   ├── country/[slug]/           # Country time zone profile
│   ├── privacy-policy/           # AdSense & GDPR Privacy Policy
│   ├── terms/                    # Terms of Service
│   ├── time-difference/[pair]/   # Pair difference SEO landing page
│   ├── globals.css               # Tailwind & Leaflet styles
│   ├── layout.tsx                # Global navigation header & footer
│   ├── page.tsx                  # Interactive Homepage
│   ├── robots.ts                 # Dynamic robots.txt generator
│   └── sitemap.ts                # Dynamic sitemap.xml generator
├── components/
│   ├── AdSlot.tsx                # Fixed-height AdSense slot component
│   ├── BestTimeToCallBox.tsx     # 9 AM - 9 PM awake & office overlap box
│   ├── CookieConsent.tsx         # GDPR / EU Cookie banner
│   ├── FaqBlock.tsx              # Interactive FAQs + JSON-LD schema
│   ├── HomeClient.tsx            # Interactive client coordinator
│   ├── LiveClock.tsx             # Real-time ticking clock
│   ├── Map/                      # Leaflet day/night world map
│   ├── MeetingTable.tsx          # 24-hour schedule conversion table
│   ├── PlaceSearch.tsx           # Keyboard-accessible autocomplete
│   └── ResultCard.tsx            # Headline difference & live facts
├── data/
│   ├── cities.json               # 511 global cities with verified IANA zones
│   ├── countries.json            # 67 countries with ISO, capitals & coords
│   └── popular-pairs.json        # 288 curated high-volume search pairs
├── lib/
│   ├── config.ts                 # Single source of truth for branding & ads
│   ├── distance.ts               # Haversine distance & flight time
│   ├── places.ts                 # Fast indexed lookups & autocomplete
│   ├── seo.ts                    # Dynamic articles, FAQs & JSON-LD
│   ├── solar.ts                  # Astronomical solar terminator engine
│   └── time.ts                   # Luxon time difference & overlap logic
├── public/
│   └── ads.txt                   # Google AdSense authorized sellers file
├── open-next.config.ts           # Cloudflare OpenNext configuration
├── wrangler.jsonc                # Cloudflare Workers deployment config
└── package.json                  # Scripts & dependencies
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Tests
Run the comprehensive Vitest test suite:
```bash
npm test
```

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
```

---

## ☁️ Cloudflare Workers Deployment

This project uses `@opennextjs/cloudflare` to run Next.js on Cloudflare Workers with zero Node-only API limitations.

### Prerequisites
1. Ensure you have a Cloudflare account.
2. Login to Wrangler CLI:
```bash
npx wrangler login
```

### Build & Preview Locally in Cloudflare Worker runtime
```bash
npm run preview
```
This runs `@opennextjs/cloudflare` to build the worker bundle and starts `wrangler dev` on the local Cloudflare Workerd edge runtime.

### Deploy to Cloudflare
```bash
npm run deploy
```

---

## ⚙️ Configuration & Customization

All website branding, name, contact emails, and AdSense identifiers are controlled in **`lib/config.ts`**:

```typescript
export const siteConfig = {
  name: "TimeBridge", // Change website title here
  domain: "timebridge.app",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://timebridge.app",
  contactEmail: "support@timebridge.app",
  ads: {
    enabled: process.env.NEXT_PUBLIC_ENABLE_ADS === "true", // Off by default
    client: process.env.NEXT_PUBLIC_ADSENSE_CLIENT || "ca-pub-XXXXXXXXXXXXXXXX",
  },
};
```

To enable AdSense ads:
1. Set `NEXT_PUBLIC_ENABLE_ADS=true` in `.env.local` or Cloudflare dashboard.
2. Put your Publisher ID in `NEXT_PUBLIC_ADSENSE_CLIENT`.
3. Update `public/ads.txt` with your publisher ID.
