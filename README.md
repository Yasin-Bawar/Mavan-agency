# Mavan — Agency Website

A premium, white-themed, Framer-style website for **Mavan**, a studio that builds websites, booking systems, online ordering and mobile apps for local businesses (restaurants, barbershops, salons, gyms, clinics, retail).

Live at **https://mavan.app**. Plain HTML, CSS and JavaScript with no build step and no dependencies, plus one serverless function that emails contact-form enquiries through [Resend](https://resend.com).

```
index.html              → all page content
assets/css/styles.css   → design system, layout, device mockups
assets/js/main.js       → animations, industries tabs, FAQ, contact form
assets/img/             → favicon + social share image
assets/img/photos/      → real photos used in the website & app examples
api/contact.js          → contact form endpoint (Vercel function → Resend)
```

## Run locally

```bash
npx vercel dev      # full site including the contact form (needs RESEND_API_KEY, see below)
# or, pages only (the form will show its "couldn't send" fallback):
npx serve .
```

## Deploy (Vercel)

The contact form needs a server-side function so the Resend API key is never exposed in the browser, so host on **Vercel** (free plan is fine). GitHub Pages can't run the function.

1. **Import the repo** at [vercel.com/new](https://vercel.com/new). Framework preset: *Other*. No build command, no output directory.
2. **Add environment variables** (Project → Settings → Environment Variables), then redeploy:

   | Name | Value |
   | --- | --- |
   | `RESEND_API_KEY` | A Resend API key with *Sending access* ([resend.com/api-keys](https://resend.com/api-keys)) |
   | `CONTACT_TO` | *(optional)* where enquiries arrive. Default `hello@mavan.app` |
   | `CONTACT_FROM` | *(optional)* sender. Default `Mavan Website <website@mavan.app>` |

3. **Connect the domain:** Project → Settings → Domains → add `mavan.app` (and `www.mavan.app`), then set the DNS records Vercel shows at your registrar.
4. **Resend:** the `mavan.app` domain must be verified in Resend (Domains) so it can send from `@mavan.app`.

**How the form works:** the browser posts JSON to `/api/contact`. The function checks every field, drops spam (a hidden honeypot field and a minimum time on the page), refuses posts from other websites, and sends one email to `CONTACT_TO` with **Reply-To set to the visitor**, so you can answer by just hitting reply. If sending fails, visitors see a friendly error with a clickable `hello@mavan.app` link and keep what they typed.

## Sections

Sticky glass nav · hero with animated fluted-glass stripes and a rotating industry word · scroll-tilt product showcase · "built for" industry marquee · intro statement that lights up on scroll · services (dark bento) · interactive industries tabs, each with its own app design (food ordering, barber booking, spa menu, gym member app, patient app, florist store) · six concept example designs · process timeline · "Why Mavan" promises · pricing · FAQ accordion · big CTA whose giant word keeps sliding through "booked. / online. / packed. / digital." · contact form · footer.

The website and app examples are built as real HTML/CSS layouts filled with **real photography** (food, barbershop, salon, gym, dental and florist photos) stored in `assets/img/photos/`. Photos are from Unsplash (free for commercial use under the Unsplash License); photographers are credited in `assets/img/photos/CREDITS.md`. Swap in photos of your real clients' work whenever you have them; just keep the same file names.

## Brand

**Mavan** uses a lowercase wordmark (`mavan`, Inter Tight 600) next to an app-icon mark: a geometric "m" with the orange notification badge, the "new booking" moment the studio sells. The mark is inline SVG in `index.html` (dark version in the nav, light version in the footer) and in `assets/img/favicon.svg`. The giant footer wordmark repeats the orange badge.

## Before going live: replace the placeholders

The content is written to be realistic, but it is **sample content**. Swap it for your own:

| What | Where |
| --- | --- |
| Contact email (`hello@mavan.app`) | `index.html`: search for `hello@mavan.app` (shown address, mailto link and form fallback). Where form emails go is set by `CONTACT_TO` on Vercel. |
| Form delivery | Handled by `api/contact.js` + Resend (see *Deploy*). `data-endpoint="/api/contact"` on `#contact-form`; clear it to make the form open the visitor's email app instead. |
| Prices ($250 Starter / $500 Growth / $1,000+ Custom App, care plans from $49/mo) | `index.html`: Pricing section, the "from $…" line under each example design, and the Budget chips in the contact form |
| Example designs (Bella Napoli, Fade Factory, Glow Studio, Iron Temple, SmileCare, Petal & Stem) | `index.html` → Example designs. These are clearly labelled **concepts**, not clients. When you launch real projects, swap a concept for the real one (with the client's permission) and you can add genuine results and testimonials then. The site deliberately shows no reviews, ratings or client logos until they are real. |
| Industry copy & app previews | `assets/js/main.js` → `INDUSTRIES` (copy) and `APP_SCREENS` (one app layout per industry) |
| Social links | `index.html` footer (`href="#"`) |
| Domain | `https://mavan.app` is set in `index.html` (canonical link, `og:url`, `og:image`, `twitter:image`) |

The "Booking projects for …" badge always shows next month automatically.

## Accessibility & performance

- Semantic landmarks, skip link, keyboard-navigable tabs (arrow keys), accessible accordion and form errors.
- Respects `prefers-reduced-motion`.
- No frameworks: one CSS file, one small JS file and Google Fonts (Inter, Inter Tight, Instrument Serif).
