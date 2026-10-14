# Mavan — Agency Website

A premium, white-themed, Framer-style website for **Mavan**, a studio that builds websites, booking systems, online ordering and mobile apps for local businesses (restaurants, barbershops, salons, gyms, clinics, retail).

Plain HTML, CSS and JavaScript with no build step and no dependencies.

```
index.html              → all page content
assets/css/styles.css   → design system, layout, device mockups
assets/js/main.js       → animations, industries tabs, FAQ, contact form
assets/img/             → favicon + social share image
assets/img/photos/      → real photos used in the website & app examples
```

## Run locally

Open `index.html` in a browser, or serve the folder:

```bash
npx serve .
# or
python3 -m http.server 8000
```

## Deploy

Any static host works:

- **GitHub Pages:** Settings → Pages → Deploy from branch → `main` / root.
- **Netlify / Vercel / Cloudflare Pages:** import the repo; no build command, publish directory `/`.

## Sections

Sticky glass nav · hero with animated fluted-glass stripes and a rotating industry word · scroll-tilt product showcase · client marquee · intro statement that lights up on scroll · services (dark bento) · interactive industries tabs, each with its own app design (food ordering, barber booking, spa menu, gym member app, patient app, florist store) · case studies · process timeline · stats & testimonials · pricing · FAQ accordion · big CTA whose giant word keeps sliding through "booked. / online. / packed. / digital." · contact form · footer.

The website and app examples are built as real HTML/CSS layouts filled with **real photography** (food, barbershop, salon, gym, dental and florist photos) stored in `assets/img/photos/`. Photos are from Unsplash (free for commercial use under the Unsplash License); photographers are credited in `assets/img/photos/CREDITS.md`. Swap in photos of your real clients' work whenever you have them; just keep the same file names.

## Brand

**Mavan** uses a lowercase wordmark (`mavan`, Inter Tight 600) next to an app-icon mark: a geometric "m" with the orange notification badge, the "new booking" moment the studio sells. The mark is inline SVG in `index.html` (dark version in the nav, light version in the footer) and in `assets/img/favicon.svg`. The giant footer wordmark repeats the orange badge.

## Before going live: replace the placeholders

The content is written to be realistic, but it is **sample content**. Swap it for your own:

| What | Where |
| --- | --- |
| Contact email (`hello@mavan.studio`) | `index.html`: search for `mavan.studio` (form `data-email` and the mailto link) |
| Form delivery | `index.html`: `data-endpoint=""` on `#contact-form`. Paste a [Formspree](https://formspree.io) (or similar) endpoint to receive messages directly. Left empty, the form opens the visitor's email app with the message pre-filled. |
| Prices ($990 / $2,490 / from $5,900, care plans from $49/mo) | `index.html`: Pricing section |
| Case studies, client logos, testimonials, ratings & stats (Bella Napoli, Fade Factory, Glow Studio, Iron Temple, "120+ launched", "4.9/5"…) | `index.html`: these are illustrative examples; replace them with real clients and numbers |
| Industry copy & app previews | `assets/js/main.js` → `INDUSTRIES` (copy) and `APP_SCREENS` (one app layout per industry) |
| Social links | `index.html` footer (`href="#"`) |
| Share image URL | `index.html` `og:image`: use the full absolute URL once you have a domain |

The "Booking projects for …" badge always shows next month automatically.

## Accessibility & performance

- Semantic landmarks, skip link, keyboard-navigable tabs (arrow keys), accessible accordion and form errors.
- Respects `prefers-reduced-motion`.
- No frameworks: one CSS file, one small JS file and Google Fonts (Inter, Inter Tight, Instrument Serif).
