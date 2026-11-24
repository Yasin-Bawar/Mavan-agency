# Mavan — Agency Website

A premium, white-themed, Framer-style website for **Mavan**, a studio that builds websites, booking systems, online ordering and mobile apps for local businesses (restaurants, barbershops, salons, gyms, clinics, retail).

Live at **https://mavan.app**. Plain HTML, CSS and JavaScript with no build step and no dependencies, plus one serverless function that emails contact-form enquiries through [Resend](https://resend.com).

```
index.html              → all page content (English)
afg/index.html          → the same site in Dari, right-to-left (mavan.app/afg/)
industries/             → one landing page per industry + the hub (mavan.app/industries/), generated
assets/css/styles.css   → design system, layout, device mockups
assets/css/afg.css      → Dari page only: Vazirmatn font, RTL mirroring, Dastarkhan mockup
assets/css/niche.css    → industry pages only: their hero, calculator, SEO and playbook sections
assets/js/main.js       → animations, industries tabs, FAQ, contact form
assets/js/niche.js      → industry pages only: the savings calculators
assets/img/             → favicon + social share image (assets/img/og/ has one per industry page)
assets/img/photos/      → real photos used in the website & app examples
lib/contact.js          → contact form logic (validates, then emails via Resend)
netlify/functions/      → contact form endpoint on Netlify (POST /api/contact)
api/contact.js          → same endpoint for Vercel, if you ever move hosts
tools/                  → generators for the industry pages, sitemap and share images (not published)
sitemap.xml, robots.txt → for Google
netlify.toml            → Netlify build: publishes the pages, assets/, robots.txt and sitemap.xml
```

## Run locally

```bash
npx netlify dev     # full site including the contact form (reads RESEND_API_KEY from Netlify or a local .env)
# or, pages only (the form will show its "couldn't send" fallback):
npx serve .
```

## Deploy (Netlify)

The site is hosted on **Netlify**. `netlify.toml` already tells Netlify what to publish and where the contact function lives, so there are no build settings to type in.

1. **Connect the repo** (Site configuration → Build & deploy → Link repository) so Netlify deploys on every push. A drag-and-drop deploy can't run the contact function.
2. **Add environment variables** (Site configuration → Environment variables → Add a variable), then redeploy (Deploys → Trigger deploy):

   | Key | Value |
   | --- | --- |
   | `RESEND_API_KEY` | A Resend API key with *Sending access* ([resend.com/api-keys](https://resend.com/api-keys)). Scope: at least *Functions*. |
   | `CONTACT_TO` | *(optional)* where enquiries arrive. Default `hello@mavan.app` |
   | `CONTACT_FROM` | *(optional)* sender. Default `Mavan Website <website@mavan.app>` |

3. **Domain:** Domain management → add `mavan.app`, then set the DNS records Netlify shows.
4. **Resend:** the `mavan.app` domain must be verified in Resend (Domains) so it can send from `@mavan.app`.

*Vercel also works:* import the repo and add the same variables; `api/contact.js` serves the same endpoint.

**How the form works:** the browser posts JSON to `/api/contact`. The function checks every field, drops spam (a hidden honeypot field and a minimum time on the page), refuses posts from other websites, and sends one email to `CONTACT_TO` with **Reply-To set to the visitor**, so you can answer by just hitting reply. If sending fails, visitors see a friendly error with a clickable `hello@mavan.app` link and keep what they typed.

## Sections

Sticky glass nav · hero on a warm orange wash with soft light streaks (`assets/img/hero-light.svg`, mirrored on the Dari page) and a rotating industry word · scroll-tilt product showcase · "built for" industry marquee · intro statement that lights up on scroll · services (dark bento) · interactive industries tabs, each with its own app design (food ordering, barber booking, spa menu, gym member app, patient app, florist store) · six concept example designs · process timeline · "Why Mavan" promises · pricing · FAQ accordion · big CTA whose giant word keeps sliding through "booked. / online. / packed. / digital." · contact form · footer.

The website and app examples are built as real HTML/CSS layouts filled with **real photography** (food, barbershop, salon, gym, dental and florist photos) stored in `assets/img/photos/`. Photos are from Unsplash (free for commercial use under the Unsplash License); photographers are credited in `assets/img/photos/CREDITS.md`. Swap in photos of your real clients' work whenever you have them; just keep the same file names.

## Dari page (`/afg/`)

`afg/index.html` is the full website rebuilt in **Dari** for Afghan businesses: right-to-left layout, the Vazirmatn font, Persian digits, and everyday Afghan (Kabuli) Dari rather than formal Persian: ویب‌سایت، ریزرف، فرمایش، مفت، تیلفون، گپ زدن، «می‌تانیم» instead of «می‌توانیم». It is the link to send Afghan prospects: **https://mavan.app/afg/**.

- It targets the businesses Mavan builds for in Afghanistan: **restaurants, fast food, wedding halls, hotels, travel agencies, hospitals, clinics (dental, eye, skin…), language & computer schools, real estate agents (رهنمای معاملات), furniture showrooms and large companies**, not small shops like bakeries.
- Everything on it is in Dari, mockups included:
  - The hero concept *Dastarkhan* (دسترخوان): an Afghan restaurant site and ordering app.
  - Twelve example designs, one for each business type in the strip under the hero: پیتزا ناپولی (restaurant), فست فود نارنج (fast food), تالار مهتاب (wedding hall), هوتل سیمرغ (hotel), آژانس سفر آسمان (travel agency), شفاخانهٔ شفا (hospital), کلینیک دندان لبخند (dental clinic), کلینیک تخصصی مهر (specialist clinic), آکادمی پیشرو (language & computer school), املاک امید (real estate), فرنیچر سرو (furniture) and شرکت آریا (company).
  - Nine industry apps: restaurant, hotel, travel agency, real estate, hospital, clinic, school, furniture and company (`INDUSTRIES_FA` and `APP_TEXT.fa` in `main.js`).
- Dari wording: an app is «برنامه», never «اپ» (برنامهٔ موبایل، ویب‌سایت و برنامه), and a business is «تجارت», never «کاروبار» (تجارت تان، تجارت‌ها).
- The Dari page has no "Why Mavan" (چرا ماوان) section; the English page still does.
- **Dari pricing is by business size**, set for the Afghan market:
  - تجارت کوچک (small business): $50, a website.
  - تجارت بزرگ (big business): $100–200, website and app.
  - تجارت کلان (large organisation): from $400, a full system.
  - Hosting and care from $10/mo.
  - A second list gives a range per business type: restaurant $50–200, fast food $50–150, wedding hall $80–200, hotel $100–400, travel agency $80–200, clinic $80–200, language & computer school $50–150, real estate $120–300, furniture $50–200, hospital and companies from $400.
- In Dari text, separate items with «،» and not «·»: in this font the middle dot looks exactly like the Persian zero «۰», so «۵۲ · دالر» reads as «۵۲۰».
- It shares `styles.css` and `main.js` with the English page; `afg.css` only adds the font and mirrors left/right. `main.js` switches to Dari automatically when `<html lang="fa-…">` (industry copy in `INDUSTRIES_FA`, form messages, Persian month names and digits).
- The contact form posts to the same `/api/contact`. Enquiries from this page are marked **Page: Dari page (/afg)** in the email, so you know to reply in Dari.
- The **EN | دری** switch in the nav (on every screen size) moves between the two pages. The choice is remembered in the browser: someone who picked Dari is sent straight to `/afg/` the next time they open mavan.app, until they switch back to EN.
- Change the email or phone in **both** `index.html` and `afg/index.html`. Prices differ on purpose (see above).

## Industry landing pages (`/industries/`)

Every industry has its own page, so a barbershop owner sees barbershop features, a barbershop app and barbershop marketing instead of a general pitch. Visitors get there from the **I run a…** picker in the homepage hero, the button in each Industries tab, the footer, or straight from Google.

| Page | URL |
| --- | --- |
| Hub (all industries) | `/industries/` |
| Restaurants & cafés | `/industries/restaurants/` |
| Barbershops | `/industries/barbershops/` |
| Salons & spas | `/industries/salons-spas/` |
| Dental & health clinics | `/industries/dental-clinics/` |
| Contractors & trades | `/industries/contractors/` |
| Gyms & fitness studios | `/industries/fitness-studios/` |
| Retail & boutiques | `/industries/retail-shops/` |

Each page has its own colours (same fonts, buttons and layout as the homepage), its industry's app on a phone in the hero, the three problems that industry has and how we fix them, six features, an **interactive calculator** (no-shows for barbers, delivery-app commission for restaurants, missed calls for clinics, won jobs for contractors…), a **Marketing & SEO** section with a Google-search illustration, target searches and a six-channel marketing playbook, a 90-day plan, the matching concept design, pricing, its own FAQ, links to the other industries and the contact form with the business type already chosen. Enquiries from these pages arrive marked **Page: Barbershops landing page** (and so on).

SEO on every page: its own title and description, canonical URL, Open Graph/Twitter tags with its own share image, breadcrumbs, and structured data (Service, FAQPage, BreadcrumbList, Organization). `sitemap.xml` lists every page and `robots.txt` points Google to it.

**The pages are generated.** Edit the copy in `tools/niches.mjs`, then run:

```bash
node tools/build-industries.mjs   # rewrites industries/**/index.html and sitemap.xml
node tools/og-images.mjs          # only if titles or colours changed (needs Playwright)
```

The build copies the icon sprite, the concept designs and the contact form from `index.html`, so run it again after changing those on the homepage. Prices on the industry pages come from `PRICES` at the top of `tools/build-industries.mjs`: change them there and in `index.html` together, then rebuild. Don't hand-edit `industries/**/index.html`; the next build overwrites it.

## Brand

**Mavan** uses a lowercase wordmark (`mavan`, Inter Tight 600) next to an app-icon mark: a geometric "m" with the orange notification badge, the "new booking" moment the studio sells. The mark is inline SVG in `index.html` (dark version in the nav, light version in the footer) and in `assets/img/favicon.svg`. The giant footer wordmark repeats the orange badge.

## Before going live: replace the placeholders

The content is written to be realistic, but it is **sample content**. Swap it for your own:

| What | Where |
| --- | --- |
| Contact email (`hello@mavan.app`) | `index.html` and `afg/index.html`: search for `hello@mavan.app` (shown address, mailto link and form fallback). Where form emails go is set by `CONTACT_TO` on Netlify. |
| Phone (`+93 79 881 9664`) | `index.html` and `afg/index.html`: contact section and footer (search for `tel:+93798819664`) |
| Form delivery | Handled by `api/contact.js` + Resend (see *Deploy*). `data-endpoint="/api/contact"` on `#contact-form`; clear it to make the form open the visitor's email app instead. |
| Prices ($250 Starter / $500 Growth / $1,000+ Custom App, care plans from $49/mo; the Dari page has its own Afghan pricing, see above) | `index.html` and `afg/index.html`: Pricing section, the "from $…" line under each example design, and the Budget chips in the contact form. The industry pages read them from `PRICES` in `tools/build-industries.mjs` (rebuild after changing). |
| Example designs (Bella Napoli, Fade Factory, Glow Studio, Iron Temple, SmileCare, Petal & Stem) | `index.html` → Example designs. These are clearly labelled **concepts**, not clients. When you launch real projects, swap a concept for the real one (with the client's permission) and you can add genuine results and testimonials then. The site deliberately shows no reviews, ratings or client logos until they are real. |
| Industry copy & app previews | `assets/js/main.js` → `INDUSTRIES` (homepage tabs), `INDUSTRIES_FA` (the Dari page's own industries) and `APP_SCREENS` (one app layout per industry, also used on the industry pages). The industry pages' own copy is in `tools/niches.mjs`. |
| Social links | `index.html` footer (`href="#"`) |
| Domain | `https://mavan.app` is set in `index.html` and `afg/index.html` (canonical and language links, `og:url`, `og:image`, `twitter:image`) |

The "Booking projects for …" badge always shows next month automatically.

## Accessibility & performance

- Semantic landmarks, skip link, keyboard-navigable tabs (arrow keys), accessible accordion and form errors.
- Respects `prefers-reduced-motion`.
- No frameworks: one CSS file, one small JS file and Google Fonts (Inter, Inter Tight, Instrument Serif).
