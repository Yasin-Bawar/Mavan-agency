/* Social share images (1200 × 630) for the industry pages: assets/img/og/<slug>.jpg and industries.jpg.
   Needs Playwright (npm i -D playwright && npx playwright install chromium). Run from the repo root:
     node tools/og-images.mjs */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { NICHES } from './niches.mjs';

// Playwright is not a site dependency, so it is loaded the CommonJS way (works with a global install too)
const { chromium } = createRequire(import.meta.url)('playwright');

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'assets/img/og');
fs.mkdirSync(OUT, { recursive: true });

const SPRITE = (() => {
  const s = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const i = s.indexOf('<svg width="0" height="0"');
  return s.slice(i, s.indexOf('</svg>', i) + 6);
})();

const card = ({ title, kicker, color, icon, url }) => `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Inter+Tight:wght@500;600&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0}
body{width:1200px;height:630px;overflow:hidden;font-family:Inter,sans-serif;color:#fff;
  background:radial-gradient(700px 520px at 88% 18%, ${color.glow}, transparent 70%), ${color.deep};}
.grid{position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.05) 1px,transparent 1px);background-size:40px 40px;-webkit-mask-image:radial-gradient(60% 70% at 80% 30%,#000,transparent)}
.wrap{position:relative;display:flex;flex-direction:column;height:100%;padding:64px 72px}
.brand{display:flex;align-items:center;gap:14px;font-family:'Inter Tight';font-weight:600;font-size:34px;letter-spacing:-.03em}
.mark{width:52px;height:52px;border-radius:16px;background:#fff;display:grid;place-items:center;position:relative}
.mark i{position:absolute;right:-6px;top:-6px;width:18px;height:18px;border-radius:50%;background:#ff5a1f;border:3px solid ${color.deep}}
.mark span{font-family:'Inter Tight';font-weight:700;color:#0d0d0d;font-size:30px;margin-top:-4px}
.kicker{display:inline-flex;align-items:center;gap:12px;margin-top:auto;padding:10px 18px 10px 12px;border-radius:99px;background:rgba(255,255,255,.1);font-size:24px;font-weight:500;align-self:flex-start}
.kicker b{display:grid;place-items:center;width:40px;height:40px;border-radius:12px;background:${color.n};color:${color.on}}
.kicker svg{width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
h1{margin-top:26px;font-family:'Inter Tight';font-weight:500;font-size:84px;line-height:1;letter-spacing:-.045em;max-width:15ch}
h1 em{font-family:'Instrument Serif';font-style:italic;font-weight:400;letter-spacing:-.01em;color:${color.n === '#1f5eff' ? '#8fb0ff' : color.n === '#3d5a40' ? '#b9d6a8' : color.n}}
.url{margin-top:34px;font-size:24px;color:rgba(255,255,255,.6)}
</style></head><body>${SPRITE}<div class="grid"></div><div class="wrap">
<div class="brand"><span class="mark"><span>m</span><i></i></span>mavan</div>
<span class="kicker"><b><svg viewBox="0 0 24 24"><use href="#${icon}"/></svg></b>${kicker}</span>
<h1>${title}</h1>
<div class="url">${url}</div>
</div></body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
const shots = [
  ...NICHES.map((n) => ({ file: `${n.slug}.jpg`, title: n.hero.title, kicker: n.name, color: n.color, icon: n.icon, url: `mavan.app/industries/${n.slug}` })),
  {
    file: 'industries.jpg',
    title: 'Built for the way <em>your business works.</em>',
    kicker: 'Websites &amp; apps by industry',
    color: { n: '#ff5a1f', deep: '#0d0d0d', on: '#fff', glow: 'rgba(255, 90, 31, 0.45)' },
    icon: 'i-grid',
    url: 'mavan.app/industries',
  },
];
for (const s of shots) {
  await page.setContent(card(s), { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: path.join(OUT, s.file), type: 'jpeg', quality: 86 });
  console.log('wrote assets/img/og/' + s.file);
}
await browser.close();
