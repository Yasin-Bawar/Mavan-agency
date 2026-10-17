/* Render the personalised mockups for every prospect.
   Usage: PW_PATH=/path/to/playwright node outreach/design/render.cjs [slug ...]
   Reads outreach/prospects.json, writes outreach/out/<slug>/{website,app,today,tables,orders}.jpg */

const fs = require('fs');
const path = require('path');
const { chromium } = require(process.env.PW_PATH || 'playwright');
const T = require('./templates.cjs');

const ROOT = path.join(__dirname, '..');
const prospects = JSON.parse(fs.readFileSync(path.join(ROOT, 'prospects.json'), 'utf8'));
const only = process.argv.slice(2);

const SHOTS = [
  ['website', (d) => T.website(d), 1024, 626, 1],
  ['app', (d) => T.overview(d), 1024, 666, 1],
  ['today', (d) => T.screen(d, 'today'), 300, 573, 460 / 300],
  ['tables', (d) => T.screen(d, 'tables'), 300, 573, 460 / 300],
  ['orders', (d) => T.screen(d, 'orders'), 300, 573, 460 / 300],
];

(async () => {
  const browser = await chromium.launch();
  for (const d of prospects) {
    if (only.length && !only.includes(d.slug)) continue;
    const dir = path.join(ROOT, 'out', d.slug);
    fs.mkdirSync(dir, { recursive: true });
    for (const [name, html, w, h, scale] of SHOTS) {
      const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: scale });
      await page.setContent(html(d), { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({ path: path.join(dir, `${name}.jpg`), type: 'jpeg', quality: 84 });
      await page.close();
    }
    console.log('rendered', d.slug);
  }
  await browser.close();
})();
