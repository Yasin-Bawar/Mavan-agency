/* Builds the industry landing pages from tools/niches.mjs:
     industries/index.html          the industries hub
     industries/<slug>/index.html   one landing page per industry
     sitemap.xml                    every page, for Google
   Run from the repo root:  node tools/build-industries.mjs
   The icon sprite, concept designs and contact form are copied from index.html, so they stay in sync with the
   homepage. Re-run the script after editing index.html or niches.mjs. */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { NICHES } from './niches.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://mavan.app';
// Same prices as the homepage pricing section. Change them here and in index.html together.
const PRICES = { starter: '$250', growth: '$500', custom: '$1,000+', care: '$49/mo' };

const INDEX = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

/* ---------- helpers ---------- */
const slice = (s, start, end, from = 0) => {
  const i = s.indexOf(start, from);
  if (i < 0) throw new Error(`Not found in index.html: ${start}`);
  const j = s.indexOf(end, i);
  return s.slice(i, j + end.length);
};
const plain = (h) =>
  String(h)
    .replace(/<[^>]+>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&');
const attr = (t) => String(t).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const icon = (id) => `<svg class="i" aria-hidden="true"><use href="#${id}"/></svg>`;
const arrowBtn = `<span class="btn-icon">${icon('i-arrow')}</span>`;
const lower = (h) => h.charAt(0).toLowerCase() + h.slice(1);

const SPRITE = slice(INDEX, '<svg width="0" height="0"', '</svg>');
const BRAND_SVG = slice(INDEX, '<svg viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="9.5" fill="#0d0d0d"/>', '</svg>');
const BRAND_SVG_LIGHT = slice(INDEX, '<svg viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="9.5" fill="#fff"/>', '</svg>');
const CONTACT = slice(INDEX, '<section class="section contact" id="contact">', '</section>');

// A concept design from the homepage "Example designs", with asset paths fixed for a deeper folder
const conceptFromHome = (name, base) => {
  const k = INDEX.indexOf(`<h3>${name}</h3>`);
  if (k < 0) return null;
  const start = INDEX.lastIndexOf('<article class="case reveal">', k);
  const end = INDEX.indexOf('</article>', k) + '</article>'.length;
  return INDEX.slice(start, end).replace(/(src|href)="assets\//g, `$1="${base}assets/`);
};

// Contractors don't have a homepage concept yet, so this one is built here
const northline = (base) => `<article class="case reveal">
            <div class="case-media case-media--northline" aria-hidden="true">
              <span class="case-badge"><i></i>Concept</span>
              <div class="cm-browser browser">
                <div class="browser-bar"><span class="dots"><i></i><i></i><i></i></span><span class="url">${icon('i-lock')}northlinereno.com</span><span class="bb-spacer"></span></div>
                <div class="nl">
                  <div class="nl-nav"><span class="nl-logo"><i></i>Northline</span><span class="nl-links"><i>Kitchens</i><i>Basements</i><i>Decks</i><i>Projects</i></span><span class="nl-btn">Get a free quote</span></div>
                  <div class="nl-hero">
                    <div class="nl-copy">
                      <small>Licensed &amp; insured · Free estimates</small>
                      <span class="nl-title">Renovations done right, <em>on time.</em></span>
                      <span class="nl-p">Kitchens, basements and decks, with a clear quote in 48 hours.</span>
                      <span class="nl-ticks"><i>${icon('i-check')}Written warranty</i><i>${icon('i-check')}Fixed quotes</i></span>
                    </div>
                    <div class="nl-form">
                      <b>Request a quote</b>
                      <span class="nl-field">Kitchen renovation</span>
                      <span class="nl-field">Oakridge · L5M</span>
                      <span class="nl-photos"><img src="${base}assets/img/photos/furn-dining.jpg" alt="" width="240" height="180" loading="lazy" decoding="async"><img src="${base}assets/img/photos/apartment-living.jpg" alt="" width="240" height="180" loading="lazy" decoding="async"><i>+ Add photos</i></span>
                      <span class="nl-send">Send request</span>
                    </div>
                  </div>
                  <div class="nl-gallery">
                    <img src="${base}assets/img/photos/house-modern.jpg" alt="" width="400" height="260" loading="lazy" decoding="async">
                    <img src="${base}assets/img/photos/house-villa.jpg" alt="" width="400" height="260" loading="lazy" decoding="async">
                    <img src="${base}assets/img/photos/furn-living.jpg" alt="" width="400" height="260" loading="lazy" decoding="async">
                  </div>
                </div>
              </div>
            </div>
            <div class="case-info">
              <div>
                <h3>Northline Renovations</h3>
                <p>Concept website with a project gallery and a quote form that takes photos, for a renovation contractor.</p>
              </div>
              <div class="case-result"><b>from ${PRICES.growth}</b><span>Growth plan</span></div>
            </div>
            <ul class="case-tags"><li>Contractor</li><li>Website</li><li>Quote requests</li></ul>
          </article>`;

/* ---------- shared page parts ---------- */
const head = ({ title, description, url, image, base, extraCss = true, jsonld }) => `<!doctype html>
<html lang="en" data-base="${base}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${attr(title)}</title>
  <meta name="description" content="${attr(description)}" />
  <meta name="theme-color" content="#ffffff" />
  <meta name="color-scheme" content="light" />
  <meta name="robots" content="index, follow, max-image-preview:large" />
  <link rel="icon" href="${base}assets/img/favicon.svg" type="image/svg+xml" />
  <link rel="canonical" href="${url}" />
  <link rel="alternate" hreflang="en" href="${url}" />

  <meta property="og:type" content="website" />
  <meta property="og:url" content="${url}" />
  <meta property="og:site_name" content="Mavan" />
  <meta property="og:title" content="${attr(title)}" />
  <meta property="og:description" content="${attr(description)}" />
  <meta property="og:image" content="${image}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${attr(title)}" />
  <meta name="twitter:description" content="${attr(description)}" />
  <meta name="twitter:image" content="${image}" />

  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&amp;family=Inter+Tight:wght@400;500;600;700;800&amp;family=Instrument+Serif:ital@0;1&amp;display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="${base}assets/css/styles.css" />
  ${extraCss ? `<link rel="stylesheet" href="${base}assets/css/niche.css" />` : ''}

  <script>document.documentElement.classList.add('js');</script>
  <script src="${base}assets/js/main.js" defer></script>
  <script src="${base}assets/js/niche.js" defer></script>
  <script defer src="https://cdn.vercel-insights.com/v1/script.js"></script>
  <script type="application/ld+json">${JSON.stringify(jsonld)}</script>
</head>`;

const NAV_STATUS = `<span class="nav-status"><span class="pulse-dot" aria-hidden="true"></span><span>Booking projects for <span data-next-month>December</span></span></span>`;

const nav = ({ base, links, cta }) => `
  <a class="skip-link" href="#main">Skip to content</a>
  <div class="scroll-progress" aria-hidden="true"></div>

  <header class="nav" id="nav">
    <div class="nav-inner">
      <a href="${base}" class="brand" aria-label="Mavan home">
        <span class="brand-mark">
          ${BRAND_SVG}
        </span>
        <span class="brand-name">mavan</span>
      </a>

      <nav class="nav-links" aria-label="Primary">
        ${links.map(([href, label]) => `<a href="${href}">${label}</a>`).join('\n        ')}
      </nav>

      <div class="nav-right">
        <a class="nav-back" href="${base}industries/">${icon('i-grid')}All industries</a>
        <a href="#contact" class="btn btn-dark btn-sm nav-cta">${cta}${arrowBtn}</a>
        <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="mobile-menu" aria-label="Open menu"><span></span><span></span></button>
      </div>
    </div>
  </header>

  <div class="mobile-menu" id="mobile-menu" aria-hidden="true">
    <nav aria-label="Mobile">
      ${links.map(([href, label], k) => `<a class="mm-link" href="${href}" style="--i:${k}">${label}${icon('i-arrow-ur')}</a>`).join('\n      ')}
      <a class="mm-link" href="${base}industries/" style="--i:${links.length}">All industries${icon('i-arrow-ur')}</a>
      <a class="mm-link" href="${base}" style="--i:${links.length + 1}">Mavan home${icon('i-arrow-ur')}</a>
    </nav>
    <div class="mm-foot">
      ${NAV_STATUS}
      <a href="#contact" class="btn btn-accent btn-block mm-cta">${cta}${arrowBtn}</a>
    </div>
  </div>`;

const footer = (base) => `
  <footer class="footer">
    <div class="footer-card">
      <div class="footer-top">
        <div class="footer-brand">
          <a href="${base}" class="brand brand--light" aria-label="Mavan home">
            <span class="brand-mark">
              ${BRAND_SVG_LIGHT}
            </span>
            <span class="brand-name">mavan</span>
          </a>
          <p>Websites, booking systems and apps for local businesses that want more customers and less admin.</p>
          <div class="footer-contact"><a href="tel:+93798819664">${icon('i-call')}<span dir="ltr">+93 79 881 9664</span></a><a href="mailto:hello@mavan.app">${icon('i-mail')}<span dir="ltr">hello@mavan.app</span></a></div>
          <a href="#contact" class="btn btn-light btn-sm">Start a project${arrowBtn}</a>
        </div>

        <div class="footer-col">
          <h4>Services</h4>
          <a href="${base}#services">Websites</a>
          <a href="${base}#services">Booking systems</a>
          <a href="${base}#services">Online ordering</a>
          <a href="${base}#services">Mobile apps</a>
          <a href="${base}#services">Branding &amp; SEO</a>
        </div>
        <div class="footer-col">
          <h4>Industries</h4>
          ${NICHES.map((n) => `<a href="${base}industries/${n.slug}/">${n.name}</a>`).join('\n          ')}
        </div>
        <div class="footer-col">
          <h4>Studio</h4>
          <a href="${base}industries/">All industries</a>
          <a href="${base}#work">Example designs</a>
          <a href="${base}#process">Process</a>
          <a href="${base}#pricing">Pricing</a>
          <a href="${base}#faq">FAQ</a>
          <a href="${base}afg/" hreflang="fa-AF" lang="fa-AF" dir="rtl" data-lang="fa">دری</a>
        </div>
      </div>

      <div class="footer-bottom">
        <span>© <span data-year>2026</span> Mavan. All rights reserved.</span>
        <div class="socials">
          <a href="#" aria-label="Instagram">${icon('i-instagram')}</a>
          <a href="#" aria-label="X (Twitter)">${icon('i-x')}</a>
          <a href="#" aria-label="LinkedIn">${icon('i-linkedin')}</a>
          <a href="#" aria-label="Dribbble">${icon('i-dribbble')}</a>
        </div>
        <a href="#top" class="to-top">Back to top${icon('i-arrow-up')}</a>
      </div>

      <div class="footer-word" aria-hidden="true">mavan<i></i></div>
    </div>
  </footer>`;

const contactFor = (n, label) => {
  let c = CONTACT.replace(/<span class="section-label reveal"><b>\d+<\/b>Contact<\/span>/, `<span class="section-label reveal"><b>${label}</b>Contact</span>`);
  c = c.replace('<h2 class="h2 reveal">Tell us about <em>your business.</em></h2>', `<h2 class="h2 reveal">Tell us about <em>your ${n.noun}.</em></h2>`);
  if (!c.includes(`<option>${n.formType}</option>`)) throw new Error(`Business type option missing in index.html: ${n.formType}`);
  c = c.replace(`<option>${n.formType}</option>`, `<option selected>${n.formType}</option>`);
  c = c.replace('data-endpoint="/api/contact"', `data-endpoint="/api/contact" data-page="${attr(plain(n.short))} landing page"`);
  return c;
};

const bigCta = (lead, words, sub, pricing = '#pricing') => `
    <section class="big-cta">
      <div class="container">
        <div class="big-cta-card reveal">
          <div class="big-cta-content">
            <h2 class="big-cta-title">
              <span class="big-lead">${lead}</span>
              <span class="big-word-wrap">
                <svg class="sunburst" data-sunburst viewBox="-200 -200 400 400" aria-hidden="true"></svg>
                <span class="big-slot" data-slot aria-hidden="true">${words.map((w, k) => `<span class="big-word${k ? '' : ' is-active'}">${w}</span>`).join('')}</span>
                <span class="sr-only">${words[0]}</span>
              </span>
            </h2>
            <p>${sub}</p>
            <div class="big-cta-actions">
              <a href="#contact" class="btn btn-dark">Book a free call${arrowBtn}</a>
              <a href="${pricing}" class="btn btn-ghost btn-ghost--solid">See pricing</a>
            </div>
          </div>
        </div>
      </div>
    </section>`;

const ORG = {
  '@type': 'Organization',
  '@id': `${SITE}/#organization`,
  name: 'Mavan',
  url: `${SITE}/`,
  logo: `${SITE}/assets/img/favicon.svg`,
  email: 'hello@mavan.app',
  telephone: '+93 79 881 9664',
};

/* ---------- one industry page ---------- */
const nichePage = (n) => {
  const base = '../../';
  const url = `${SITE}/industries/${n.slug}/`;
  const c = n.color;
  const others = NICHES.filter((x) => x.slug !== n.slug);
  const concept = n.slug === 'contractors' ? northline(base) : conceptFromHome(n.concept, base);
  if (!concept) throw new Error(`Concept not found on the homepage: ${n.concept}`);

  const jsonld = {
    '@context': 'https://schema.org',
    '@graph': [
      ORG,
      {
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        url,
        name: n.seo.title,
        description: n.seo.description,
        isPartOf: { '@type': 'WebSite', '@id': `${SITE}/#website`, url: `${SITE}/`, name: 'Mavan' },
        breadcrumb: { '@id': `${url}#breadcrumb` },
        primaryImageOfPage: `${SITE}/assets/img/og/${n.slug}.jpg`,
      },
      {
        '@type': 'Service',
        '@id': `${url}#service`,
        name: `${plain(n.name)} websites, booking and marketing`,
        serviceType: n.seo.serviceType,
        description: n.seo.description,
        url,
        provider: { '@id': `${SITE}/#organization` },
        audience: { '@type': 'BusinessAudience', audienceType: plain(n.name) },
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: `Plans for ${plain(n.name).toLowerCase()}`,
          itemListElement: [
            ['Starter website', n.plans.starter],
            ['Growth: website + online system', n.plans.growth],
            ['Custom app', n.plans.custom],
          ].map(([name, items]) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name, description: items.map(plain).join(', ') } })),
        },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${url}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
          { '@type': 'ListItem', position: 2, name: 'Industries', item: `${SITE}/industries/` },
          { '@type': 'ListItem', position: 3, name: plain(n.short), item: url },
        ],
      },
      {
        '@type': 'FAQPage',
        '@id': `${url}#faq`,
        mainEntity: n.faq.map(([q, a]) => ({ '@type': 'Question', name: plain(q), acceptedAnswer: { '@type': 'Answer', text: plain(a) } })),
      },
    ],
  };

  const links = [['#features', 'Features'], ['#calculator', 'Calculator'], ['#marketing', 'Marketing'], ['#pricing', 'Pricing'], ['#faq', 'FAQ']];
  const planCard = (key, name, price, desc, featured, btn) => `
          <div class="plan${featured ? ' plan--featured' : ''} reveal">
            <div class="plan-name"><span>${name}</span>${featured ? '<span class="plan-badge">Recommended</span>' : ''}</div>
            <p class="plan-price">${price}<small>one-time</small></p>
            <p class="plan-desc">${desc}</p>
            <a href="#contact" class="btn ${featured ? 'btn-accent' : 'btn-ghost'} btn-block">${btn}${featured ? arrowBtn : icon('i-arrow')}</a>
            <ul class="plan-features">
              ${n.plans[key].map((f) => `<li><span>${icon('i-check')}</span>${f}</li>`).join('\n              ')}
            </ul>
          </div>`;

  return `${head({ title: n.seo.title, description: n.seo.description, url, image: `${SITE}/assets/img/og/${n.slug}.jpg`, base, jsonld })}
<body class="niche niche--${n.slug}" style="--n:${c.n};--n-deep:${c.deep};--n-soft:${c.soft};--n-ink:${c.ink};--n-on:${c.on};--n-glow:${c.glow};">
  ${SPRITE}
${nav({ base, links, cta: 'Get a free demo' })}

  <main id="main">
    <!-- ============ HERO ============ -->
    <section class="nh" id="top">
      <div class="container">
        <nav class="crumbs" aria-label="Breadcrumb">
          <ol>
            <li><a href="${base}">Home</a></li>
            <li><a href="${base}industries/">Industries</a></li>
            <li aria-current="page">${n.short}</li>
          </ol>
        </nav>

        <div class="nh-grid">
          <div class="nh-copy">
            <span class="eyebrow reveal" style="--i:0"><span class="eyebrow-tag">${icon(n.icon)}${n.short}</span>${n.hero.eyebrow}</span>
            <h1 class="nh-title reveal" style="--i:1">${n.hero.title}</h1>
            <p class="lead reveal" style="--i:2">${n.hero.lead}</p>
            <div class="hero-ctas reveal" style="--i:3">
              <a href="#contact" class="btn btn-accent">Get a free ${n.noun} demo${arrowBtn}</a>
              <a href="#concept" class="btn btn-ghost">See the concept design</a>
            </div>
            <ul class="hero-promise reveal" style="--i:4">
              ${n.hero.promises.map((p) => `<li><span>${icon('i-check')}</span>${p}</li>`).join('\n              ')}
            </ul>
          </div>

          <div class="nh-visual reveal" style="--i:2" aria-hidden="true">
            <div class="nh-stage">
              <div class="nh-phone" data-app="${n.app}"></div>
              ${n.hero.pills
                .map(
                  ([ic, b, s], k) => `<div class="nh-pill nh-pill--${k ? 'b' : 'a'}"><span class="fp-ico">${icon(ic)}</span><span><b>${b}</b><small>${s}</small></span></div>`
                )
                .join('\n              ')}
              <span class="nh-tag"><i></i>Concept design</span>
            </div>
          </div>
        </div>

        <dl class="nh-stats" data-stagger>
          ${n.stats.map(([dt, dd]) => `<div class="nh-stat reveal"><dt>${dt}</dt><dd>${dd}</dd></div>`).join('\n          ')}
        </dl>
      </div>
    </section>

    <!-- ============ 01 PROBLEMS ============ -->
    <section class="section pains-sec" id="problems">
      <div class="container">
        <div class="section-head">
          <div>
            <span class="section-label reveal"><b>1</b>Sound familiar?</span>
            <h2 class="h2 reveal">Three things every ${n.noun} <em>owner knows.</em></h2>
          </div>
          <p class="section-sub reveal">The same problems come up on almost every call we have with ${n.noun} owners. Here’s how we fix them.</p>
        </div>
        <div class="pains" data-stagger>
          ${n.pains
            .map(
              ([p, f], k) => `<article class="pain reveal">
            <span class="pain-n">0${k + 1}</span>
            <div class="pain-q"><span class="pain-x">${icon('i-x-circle')}</span><h3>${p}</h3></div>
            <div class="pain-a"><span class="pain-ok">${icon('i-check')}</span><p>${f}</p></div>
          </article>`
            )
            .join('\n          ')}
        </div>
      </div>
    </section>

    <!-- ============ 02 FEATURES ============ -->
    <section class="section services nfeat" id="features">
      <div class="container">
        <div class="services-panel">
          <div class="services-head">
            <div>
              <span class="section-label section-label--dark reveal"><b>2</b>What you get</span>
              <h2 class="h2 reveal">Everything a ${n.noun} needs to <em>win online.</em></h2>
            </div>
            <p class="section-sub reveal">Built around the way ${lower(plain(n.short))} actually work, then designed around your brand.</p>
          </div>
          <div class="nfeat-grid" data-stagger>
            ${n.features
              .map(
                ([ic, t, d]) => `<article class="svc reveal" data-glow>
              <div class="svc-top"><span class="svc-ico">${icon(ic)}</span></div>
              <h3>${t}</h3>
              <p>${d}</p>
            </article>`
              )
              .join('\n            ')}
          </div>
        </div>
      </div>
    </section>

    <!-- ============ 03 CALCULATOR ============ -->
    <section class="section calc-sec" id="calculator">
      <div class="container">
        <div class="section-head">
          <div>
            <span class="section-label reveal"><b>3</b>Calculator</span>
            <h2 class="h2 reveal">${n.calc.title}</h2>
          </div>
          <p class="section-sub reveal">${n.calc.sub}</p>
        </div>
        <div class="calc reveal" data-calc="${n.slug}">
          <div class="calc-inputs">
            ${n.calc.inputs
              .map(
                (i) => `<label class="calc-row">
              <span class="calc-lbl"><span>${i.label}</span><output data-show="${i.key}">${i.prefix || ''}${i.value}${i.suffix || ''}</output></span>
              <input type="range" name="${i.key}" data-key="${i.key}" min="${i.min}" max="${i.max}" step="${i.step}" value="${i.value}" data-prefix="${i.prefix || ''}" data-suffix="${i.suffix || ''}" />
            </label>`
              )
              .join('\n            ')}
          </div>
          <div class="calc-out" aria-live="polite">
            <small>Your estimate</small>
            <strong class="calc-big" data-out="big">&nbsp;</strong>
            <span class="calc-big-lbl">${n.calc.big}</span>
            <ul class="calc-lines" data-out="lines"></ul>
            <a href="#contact" class="btn btn-light btn-sm">Get this for your ${n.noun}${arrowBtn}</a>
            <p class="calc-note">An estimate from the numbers you enter, not a promise of results.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ============ 04 MARKETING & SEO ============ -->
    <section class="section mkt" id="marketing">
      <div class="container">
        <div class="section-head">
          <div>
            <span class="section-label reveal"><b>4</b>Marketing &amp; SEO</span>
            <h2 class="h2 reveal">Found on Google. <em>Chosen over the rest.</em></h2>
          </div>
          <p class="section-sub reveal">A website is half the job. We set up the local SEO and marketing that put your ${n.noun} in front of people who are searching right now.</p>
        </div>

        <div class="seo-grid">
          <div class="serp reveal" aria-hidden="true">
            <div class="serp-bar">${icon('i-search')}<span>${n.serp.query}</span></div>
            <div class="serp-map">
              <i class="serp-pin serp-pin--a"></i><i class="serp-pin serp-pin--b"></i><i class="serp-pin serp-pin--you">${icon(n.icon)}</i>
            </div>
            <div class="serp-card">
              <div class="serp-top"><b>${n.serp.name}</b><span class="serp-stars">${icon('i-star')}${icon('i-star')}${icon('i-star')}${icon('i-star')}${icon('i-star')}<small>Google reviews</small></span></div>
              <small>${n.serp.type}</small>
              <small class="serp-open">${n.serp.status}</small>
              <div class="serp-btns">${n.serp.buttons.map((b, k) => `<span class="${k ? '' : 'is-on'}">${b}</span>`).join('')}<span>Website</span></div>
            </div>
            <div class="serp-card serp-card--dim"><b>Another ${n.noun}</b><small>No website · No online booking</small></div>
            <span class="serp-tag">Illustration</span>
          </div>

          <div class="seo-copy">
            <h3 class="reveal">We optimize for the searches that bring customers in</h3>
            <ul class="kw-list reveal">
              ${n.keywords.map((k) => `<li>${icon('i-search')}${k}</li>`).join('\n              ')}
            </ul>
            <ul class="seo-checks" data-stagger>
              <li class="reveal"><span class="tick">${icon('i-check')}</span><span><b>Google Business Profile</b>Set up, verified and filled with photos, services and the right categories.</span></li>
              <li class="reveal"><span class="tick">${icon('i-check')}</span><span><b>Fast, mobile-first pages</b>Under a second to load, because speed is part of how Google ranks you.</span></li>
              <li class="reveal"><span class="tick">${icon('i-check')}</span><span><b>A page for each service</b>So you show up for the exact thing people search for.</span></li>
              <li class="reveal"><span class="tick">${icon('i-check')}</span><span><b>Structured data</b>The code that tells Google your hours, services and reviews.</span></li>
              <li class="reveal"><span class="tick">${icon('i-check')}</span><span><b>Reviews on autopilot</b>Happy customers are asked for a review at the right moment.</span></li>
            </ul>
          </div>
        </div>

        <h3 class="play-head reveal">Your ${n.noun} marketing playbook</h3>
        <div class="play-grid" data-stagger>
          ${n.playbook
            .map(
              ([ic, t, d]) => `<article class="play reveal">
            <span class="play-ico">${icon(ic)}</span>
            <h4>${t}</h4>
            <p>${d}</p>
          </article>`
            )
            .join('\n          ')}
        </div>
      </div>
    </section>

    <!-- ============ 05 FIRST 90 DAYS ============ -->
    <section class="section process" id="plan">
      <div class="container">
        <div class="section-head">
          <div>
            <span class="section-label reveal"><b>5</b>Your first 90 days</span>
            <h2 class="h2 reveal">A clear plan, <em>week by week.</em></h2>
          </div>
          <p class="section-sub reveal">Launch is day one, not the finish line. Here’s how the first three months look for a ${n.noun}.</p>
        </div>
        <div class="process-steps" data-process>
          <div class="process-line" aria-hidden="true"><i></i></div>
          ${n.plan90
            .map(
              ([when, t, d], k) => `<div class="step reveal">
            <span class="step-num">0${k + 1}</span>
            <div class="step-card">
              <span class="step-time">${when}</span>
              <h3>${t}</h3>
              <p>${d}</p>
            </div>
          </div>`
            )
            .join('\n          ')}
        </div>
      </div>
    </section>

    <!-- ============ 06 CONCEPT ============ -->
    <section class="section work" id="concept">
      <div class="container">
        <div class="section-head">
          <div>
            <span class="section-label reveal"><b>6</b>Concept design</span>
            <h2 class="h2 reveal">See what we’d build <em>for your ${n.noun}.</em></h2>
          </div>
          <p class="section-sub reveal">We’re a new studio, so this is a concept we designed to show the quality you can expect. Every detail can be made yours.</p>
        </div>
        <div class="concept-grid">
          ${concept}
          <aside class="concept-side reveal">
            <span class="concept-ico">${icon(n.icon)}</span>
            <h3>In this concept</h3>
            <ul>
              ${n.plans.growth
                .filter((f) => !/^Everything in|^Live in/.test(f))
                .map((f) => `<li><span class="tick">${icon('i-check')}</span>${f}</li>`)
                .join('\n              ')}
            </ul>
            <p>Want to see it with your name, colours and photos? We’ll mock it up on a free call.</p>
            <a href="#contact" class="btn btn-dark btn-sm">See it for my ${n.noun}${arrowBtn}</a>
          </aside>
        </div>
      </div>
    </section>

    <!-- ============ 07 PRICING ============ -->
    <section class="section pricing" id="pricing">
      <div class="container">
        <div class="section-head section-head--center">
          <span class="section-label reveal"><b>7</b>Pricing</span>
          <h2 class="h2 reveal">Simple pricing for <em>${lower(plain(n.short))}.</em></h2>
          <p class="section-sub reveal">Fixed prices, no hidden fees and no commission on your sales. Every plan includes 30 days of free support after launch.</p>
        </div>
        <div class="pricing-grid" data-stagger>
          ${planCard('starter', 'Starter', PRICES.starter, `A fast ${n.noun} website to get found and get the phone ringing.`, false, 'Get started')}
          ${planCard('growth', 'Growth', PRICES.growth, `Your website plus the online system your ${n.noun} runs on.`, true, 'Get started')}
          ${planCard('custom', 'Custom App', PRICES.custom, 'Your own branded iOS &amp; Android app, built around how you work.', false, 'Book a call')}
        </div>
        <div class="care reveal">
          <span class="care-ico">${icon('i-wrench')}</span>
          <p><b>Care plans from ${PRICES.care}.</b> Hosting, security, backups, updates and monthly edits. Marketing (ads, social media and SEO) is quoted on your free call.</p>
          <a href="#contact" class="link-arrow">Ask about marketing${icon('i-arrow')}</a>
        </div>
      </div>
    </section>

    <!-- ============ 08 FAQ ============ -->
    <section class="section faq" id="faq">
      <div class="container faq-wrap">
        <div class="faq-side">
          <span class="section-label reveal"><b>8</b>FAQ</span>
          <h2 class="h2 reveal">${n.noun.charAt(0).toUpperCase() + n.noun.slice(1)} questions, <em>answered.</em></h2>
          <p class="section-sub reveal">What ${n.noun} owners usually ask before we start. Can’t find yours? We’re one message away.</p>
          <div class="faq-help reveal">
            <span class="faq-help-ico">${icon('i-chat')}</span>
            <div>
              <b>Still have questions?</b>
              <small>Talk to a real person, usually within a few hours.</small>
            </div>
            <a href="#contact" class="btn btn-dark btn-sm">Ask us${arrowBtn}</a>
          </div>
        </div>
        <div class="faq-list reveal">
          ${n.faq
            .map(
              ([q, a], k) => `<div class="faq-item">
            <h3><button class="faq-q" type="button" aria-expanded="false" aria-controls="faq-a${k}" id="faq-q${k}">${q}<span class="faq-icon" aria-hidden="true"></span></button></h3>
            <div class="faq-a" id="faq-a${k}" role="region" aria-labelledby="faq-q${k}"><div><p>${a}</p></div></div>
          </div>`
            )
            .join('\n          ')}
        </div>
      </div>
    </section>

    <!-- ============ OTHER INDUSTRIES ============ -->
    <section class="section related" id="industries">
      <div class="container">
        <div class="section-head">
          <div>
            <span class="section-label reveal"><b>9</b>Other industries</span>
            <h2 class="h2 reveal">Not a ${n.noun}? <em>We build for you too.</em></h2>
          </div>
          <p class="section-sub reveal">Every industry gets its own features, app design and marketing plan.</p>
        </div>
        <div class="rel-grid" data-stagger>
          ${others
            .map(
              (o) => `<a class="rel reveal" href="${base}industries/${o.slug}/" style="--rc:${o.color.n};--rd:${o.color.deep};">
            <span class="rel-ico">${icon(o.icon)}</span>
            <span class="rel-txt"><b>${o.name}</b><small>${plain(o.hero.title).replace(/\s+/g, ' ')}</small></span>
            <span class="rel-go">${icon('i-arrow-ur')}</span>
          </a>`
            )
            .join('\n          ')}
        </div>
      </div>
    </section>
${bigCta(`Let’s get your ${n.noun}`, n.ctaWords, 'Free 30-minute strategy call. No pressure, no jargon, just a clear plan for your business.')}

    <!-- ============ CONTACT ============ -->
    ${contactFor(n, 10)}
  </main>
${footer(base)}
</body>
</html>
`;
};

/* ---------- the industries hub ---------- */
const hubPage = () => {
  const base = '../';
  const url = `${SITE}/industries/`;
  const title = 'Websites, Booking & Ordering Apps by Industry | Mavan';
  const description = 'Pick your industry to see the website, booking or ordering app and marketing plan we build for it: restaurants, barbershops, salons, clinics, contractors, gyms and shops.';
  const jsonld = {
    '@context': 'https://schema.org',
    '@graph': [
      ORG,
      {
        '@type': 'CollectionPage',
        '@id': `${url}#webpage`,
        url,
        name: title,
        description,
        isPartOf: { '@type': 'WebSite', '@id': `${SITE}/#website`, url: `${SITE}/`, name: 'Mavan' },
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: NICHES.map((n, k) => ({ '@type': 'ListItem', position: k + 1, name: plain(n.name), url: `${SITE}/industries/${n.slug}/` })),
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
          { '@type': 'ListItem', position: 2, name: 'Industries', item: url },
        ],
      },
    ],
  };
  const fakeNiche = { short: 'Industries', noun: 'business', formType: 'Other' };
  return `${head({ title, description, url, image: `${SITE}/assets/img/og/industries.jpg`, base, jsonld })}
<body class="niche niche--hub" style="--n:#ff5a1f;--n-deep:#0d0d0d;--n-soft:#fff0e8;--n-ink:#c2410c;--n-on:#ffffff;--n-glow:rgba(255, 90, 31, 0.3);">
  ${SPRITE}
${nav({ base, links: [['#pick', 'Industries'], ['#contact', 'Contact']], cta: 'Book a free call' })}

  <main id="main">
    <section class="nh nh--hub" id="top">
      <div class="container">
        <nav class="crumbs" aria-label="Breadcrumb">
          <ol>
            <li><a href="${base}">Home</a></li>
            <li aria-current="page">Industries</li>
          </ol>
        </nav>
        <div class="hub-head">
          <span class="eyebrow reveal" style="--i:0"><span class="eyebrow-tag">${icon('i-grid')}Industries</span>Pick yours to see what we build</span>
          <h1 class="nh-title reveal" style="--i:1">Built for the way <em>your business works.</em></h1>
          <p class="lead reveal" style="--i:2">A barbershop needs different things from a restaurant or a renovation company. Choose your industry to see its features, app design, savings calculator and marketing plan.</p>
        </div>
        <div class="hub-grid" id="pick" data-stagger>
          ${NICHES.map(
            (n) => `<a class="hub-card reveal" href="${n.slug}/" style="--rc:${n.color.n};--rd:${n.color.deep};--rs:${n.color.soft};--ri:${n.color.ink};">
            <span class="hub-top"><span class="rel-ico">${icon(n.icon)}</span><span class="rel-go">${icon('i-arrow-ur')}</span></span>
            <b>${n.name}</b>
            <span class="hub-h">${n.hero.title}</span>
            <small>${n.seo.description}</small>
            <span class="hub-tags">${n.features.slice(0, 3).map((f) => `<i>${f[1]}</i>`).join('')}</span>
          </a>`
          ).join('\n          ')}
          <a class="hub-card hub-card--other reveal" href="#contact">
            <span class="hub-top"><span class="rel-ico">${icon('i-sparkle')}</span><span class="rel-go">${icon('i-arrow-ur')}</span></span>
            <b>Something else?</b>
            <span class="hub-h">If it runs on bookings or orders, <em>we can build it.</em></span>
            <small>Tell us about your business and we’ll send ideas, a timeline and a fixed quote.</small>
          </a>
        </div>
      </div>
    </section>
${bigCta('Let’s get your business fully', ['booked.', 'online.', 'packed.', 'digital.'], 'Free 30-minute strategy call. No pressure, no jargon, just a clear plan.', `${base}#pricing`)}

    ${contactFor({ ...fakeNiche, formType: 'Other' }, 1).replace('<h2 class="h2 reveal">Tell us about <em>your business.</em></h2>', '<h2 class="h2 reveal">Tell us about <em>your business.</em></h2>')}
  </main>
${footer(base)}
</body>
</html>
`;
};

/* ---------- write everything ---------- */
const write = (rel, html) => {
  const file = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
  console.log('wrote', rel);
};

write('industries/index.html', hubPage());
NICHES.forEach((n) => write(`industries/${n.slug}/index.html`, nichePage(n)));

const today = new Date().toISOString().slice(0, 10);
const urls = [
  [`${SITE}/`, '1.0'],
  [`${SITE}/industries/`, '0.9'],
  ...NICHES.map((n) => [`${SITE}/industries/${n.slug}/`, '0.9']),
  [`${SITE}/afg/`, '0.7'],
];
write(
  'sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(([loc, p]) => `  <url><loc>${loc}</loc><lastmod>${today}</lastmod><priority>${p}</priority></url>`).join('\n')}
</urlset>
`
);
