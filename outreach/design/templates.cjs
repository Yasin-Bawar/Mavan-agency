/* Personalised design mockups for outreach emails.
   Each restaurant gets: a website hero (1024×626), an app overview (1024×666)
   and three single app screens (Today, Tables, Orders). Rendered by render.cjs. */

const fs = require('fs');
const path = require('path');

const PALETTES = {
  aubergine: { bg: '#3B1F2B', bg2: '#4A2836', gold: '#E3A72F' },
  forest: { bg: '#1E3A2F', bg2: '#274A3C', gold: '#E0A93B' },
  navy: { bg: '#1B2638', bg2: '#25334A', gold: '#D9A35B' },
  terracotta: { bg: '#4E2418', bg2: '#5E2E20', gold: '#EDB24A' },
  teal: { bg: '#15302F', bg2: '#1D3D3B', gold: '#E8B04B' },
};

const STYLES = {
  palaw: {
    photo: 'palaw',
    headline: 'Kabuli palaw and slow lamb, just like home.',
    dish: 'Kabuli palaw with lamb shank',
    item: 'Kabuli palaw, lamb shank',
  },
  kabob: {
    photo: 'kabob',
    headline: 'Charcoal kabobs and fresh naan, the Afghan way.',
    dish: 'Chopan kabob with fresh naan',
    item: 'Chopan kabob plate',
  },
  feast: {
    photo: 'feast',
    headline: 'Afghan feasts for family nights and big days.',
    dish: 'Family feast platter',
    item: 'Family feast platter',
  },
};

const photoCache = {};
const photo = (key) =>
  (photoCache[key] ||= `data:image/jpeg;base64,${fs.readFileSync(path.join(__dirname, 'photos', `${key}.jpg`)).toString('base64')}`);

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

// Small deterministic random so every restaurant gets its own believable numbers
const seeded = (seed) => {
  let h = 2166136261;
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return () => ((h = Math.imul(h ^ (h >>> 15), 2246822507) ^ Math.imul(h ^ (h >>> 13), 3266489909)) >>> 0) / 4294967296;
};

// Dates in the app screens: the coming Friday, and a catering party two weeks after it
const DAY = 864e5;
const friday = new Date(Date.now() + (((5 - new Date().getDay() + 7) % 7) || 7) * DAY);
const FRIDAY_LABEL = friday.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
const PARTY_LABEL = new Date(friday.getTime() + 15 * DAY).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

const FONTS = `<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Inter:wght@400;500;600;700&family=Noto+Nastaliq+Urdu:wght@600&display=swap" rel="stylesheet">`;

const icon = {
  star: (c) => `<svg viewBox="0 0 24 24" width="100%" height="100%"><path fill="${c}" d="M12 1.5l2.6 4.2 4.8-1.1-1.1 4.8 4.2 2.6-4.2 2.6 1.1 4.8-4.8-1.1L12 22.5l-2.6-4.2-4.8 1.1 1.1-4.8L1.5 12l4.2-2.6-1.1-4.8 4.8 1.1z"/><circle cx="12" cy="12" r="3.2" fill="${c === '#FBF3E4' ? '#3B1F2B' : 'rgba(0,0,0,.25)'}"/></svg>`,
  cal: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4M16 3v4M3 10h18"/></svg>',
  bag: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 7h12l1 14H5z"/><path d="M9 7a3 3 0 0 1 6 0"/></svg>',
  users: '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M21.5 20a6 6 0 0 0-4-5.6"/></svg>',
  pin: '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>',
  bell: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/></svg>',
  check: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
  chat: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
  gift: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7M7.5 8a2.5 2.5 0 0 1 0-5C10 3 12 8 12 8s2-5 4.5-5a2.5 2.5 0 0 1 0 5"/></svg>',
  phone: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/></svg>',
  clock: '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  search: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>',
  plus: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  home: '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="m3 10 9-7 9 7v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>',
  grid: '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2"><circle cx="7" cy="7" r="3"/><circle cx="17" cy="7" r="3"/><circle cx="7" cy="17" r="3"/><circle cx="17" cy="17" r="3"/></svg>',
  menu: '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>',
};

const base = (p, w, h, extra = '') => `<!doctype html><html><head><meta charset="utf-8">${FONTS}<style>
:root{--bg:${p.bg};--bg2:${p.bg2};--gold:${p.gold};--cream:#FBF3E4;--ink:#2A1E22;--muted:#8B7D76;--paper:#FBF6EE;--line:rgba(42,30,34,.08)}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:${w}px;height:${h}px;overflow:hidden}
body{position:relative;background:var(--bg);font-family:Inter,Arial,sans-serif;color:var(--cream);-webkit-font-smoothing:antialiased}
.pattern{position:absolute;inset:0;opacity:.06;background:
 radial-gradient(circle at 50% 50%,transparent 0 15px,var(--cream) 15.5px 16.5px,transparent 17px) 0 0/64px 64px,
 linear-gradient(45deg,transparent 46%,var(--cream) 46% 48%,transparent 48%) 32px 32px/64px 64px}
.serif{font-family:'DM Serif Display',Georgia,serif;font-weight:400}
${extra}
</style></head><body><div class="pattern"></div>`;

/* ---------- Website hero ---------- */
function website(d) {
  const p = PALETTES[d.palette];
  const s = STYLES[d.style];
  return `${base(p, 1024, 626, `
nav{position:absolute;left:68px;right:68px;top:21px;height:44px;display:flex;align-items:center;justify-content:space-between}
.logo{display:flex;align-items:center;gap:10px;font-size:19px}
.logo i{width:22px;height:22px;display:block}
.links{display:flex;align-items:center;gap:28px;font-size:13px;color:rgba(251,243,228,.86)}
.btn{display:inline-flex;align-items:center;gap:8px;height:40px;padding:0 18px;border-radius:99px;font-size:13px;font-weight:600}
.btn-gold{background:var(--gold);color:#2A1E22}
.btn-line{border:1px solid rgba(251,243,228,.35);color:var(--cream)}
nav .btn{height:34px;padding:0 16px;font-weight:500}
.copy{position:absolute;left:68px;top:104px;width:430px}
.kicker{display:flex;align-items:center;gap:12px;font-size:12px;color:rgba(251,243,228,.72)}
.kicker:before{content:"";width:24px;height:1px;background:var(--gold)}
.dari{margin-top:2px;font-family:'Noto Nastaliq Urdu',serif;font-size:34px;line-height:1.9;color:var(--gold);direction:rtl;display:inline-block}
h1{margin-top:-6px;font-size:50px;line-height:1.0;letter-spacing:-.01em}
.sub{margin-top:18px;max-width:340px;font-size:14px;line-height:1.6;color:rgba(251,243,228,.74)}
.ctas{display:flex;gap:10px;margin-top:24px}
.info{position:absolute;left:68px;top:514px;width:420px;display:flex;padding-top:22px;border-top:1px solid rgba(251,243,228,.14)}
.info div{padding-right:22px;margin-right:22px;border-right:1px solid rgba(251,243,228,.14)}
.info div:last-child{border:0}
.info b{display:block;font-family:'DM Serif Display',serif;font-weight:400;font-size:15px}
.info small{display:block;margin-top:2px;font-size:11px;color:rgba(251,243,228,.6)}
.photo{position:absolute;left:490px;top:153px;width:503px;height:359px;border-radius:14px;overflow:hidden;box-shadow:0 30px 60px -20px rgba(0,0,0,.5)}
.photo img{width:100%;height:100%;object-fit:cover;object-position:${d.style === 'palaw' ? '55% 60%' : '50% 50%'}}
.card{position:absolute;background:var(--cream);color:#2A1E22;border-radius:10px;box-shadow:0 16px 34px -12px rgba(0,0,0,.45)}
.sig{left:750px;top:136px;width:206px;padding:12px;display:flex;gap:10px;align-items:center}
.sig i{flex-shrink:0;width:38px;height:38px;border-radius:8px;background:var(--bg);display:grid;place-items:center}
.sig i span{width:18px;height:18px;display:block}
.sig small{display:block;font-size:10px;color:#8B7D76}
.sig b{display:block;font-family:'DM Serif Display',serif;font-weight:400;font-size:14.5px;line-height:1.15}
.tbl{left:508px;top:432px;width:190px;padding:12px 14px}
.tbl .top{display:flex;justify-content:space-between;align-items:center;font-size:10px;color:#8B7D76}
.chip{display:inline-flex;align-items:center;gap:5px;padding:3px 8px;border-radius:99px;background:#E7F3E5;color:#2F7A3A;font-size:9.5px;font-weight:600}
.chip:before{content:"";width:5px;height:5px;border-radius:50%;background:currentColor}
.tbl b{display:block;margin-top:6px;font-family:'DM Serif Display',serif;font-weight:400;font-size:19px}
.tbl .meta{display:flex;gap:14px;margin-top:9px;padding-top:9px;border-top:1px solid rgba(42,30,34,.1);font-size:10px;color:#5C4A44}
.tbl .meta span{display:flex;align-items:center;gap:5px}
`)}
<nav>
  <span class="logo serif"><i>${icon.star(p.gold)}</i>${esc(d.brand || d.name)}</span>
  <span class="links"><span>Menu</span><span>Catering</span><span>Visit us</span><span class="btn btn-gold">Book a table</span></span>
</nav>
<div class="copy">
  <div class="kicker">Afghan kitchen on ${esc(d.streetLong)}</div>
  <div class="dari">نوش جان</div>
  <h1 class="serif">${esc(s.headline)}</h1>
  <p class="sub">Sit down with the whole family, grab dinner on your way home, or let us cater your next big day.</p>
  <div class="ctas"><span class="btn btn-gold">${icon.cal}Book a table</span><span class="btn btn-line">${icon.bag}Order for pickup</span></div>
</div>
<div class="info">
  <div><b>${esc(d.streetShort)}</b><small>${esc(d.streetNo ? `${d.streetNo}, ${d.area}` : d.area)}</small></div>
  <div><b>Dine in</b><small>or order for pickup</small></div>
  <div><b>Catering</b><small>weddings and parties</small></div>
</div>
<div class="photo"><img src="${photo(s.photo)}" alt=""></div>
<div class="card sig"><i><span>${icon.star(p.gold)}</span></i><span><small>House signature</small><b>${esc(s.dish)}</b></span></div>
<div class="card tbl"><div class="top"><span>Your table</span><span class="chip">Confirmed</span></div><b>Friday, 7:30 pm</b><div class="meta"><span>${icon.users}Table for 4</span><span>${icon.pin}Window seat</span></div></div>
</body></html>`;
}

/* ---------- App screens ---------- */
const PHONE_CSS = `
.phone{position:absolute;width:264px;height:560px;border-radius:44px;padding:8px;background:#1a1414;box-shadow:0 30px 60px -18px rgba(0,0,0,.55),inset 0 0 0 2px #3a3030}
.scr{position:relative;width:100%;height:100%;border-radius:36px;overflow:hidden;background:var(--paper);color:var(--ink);font-family:Inter,Arial,sans-serif}
.island{position:absolute;left:50%;top:9px;width:84px;height:24px;margin-left:-42px;border-radius:99px;background:#111}
.sb{display:flex;justify-content:space-between;align-items:center;padding:13px 22px 0;height:40px;font-size:12px;font-weight:600}
.sb .ic{display:flex;gap:4px;align-items:center}
.sb .ic i{display:block;width:14px;height:8px;border-radius:2px;background:var(--ink)}
.sb .ic i:first-child{width:12px;height:8px;clip-path:polygon(0 100%,100% 0,100% 100%)}
.pad{padding:8px 16px 0}
.hd{display:flex;justify-content:space-between;align-items:flex-start}
.hd small{display:block;font-size:10.5px;color:var(--muted)}
.hd h2{font-family:'DM Serif Display',serif;font-weight:400;font-size:24px;line-height:1.05;margin-top:2px}
.roundbtn{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:#fff;box-shadow:0 0 0 1px var(--line)}
.av{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:var(--gold);color:#2A1E22;font-size:11px;font-weight:700}
.tabs{position:absolute;left:0;right:0;bottom:0;height:62px;display:flex;justify-content:space-around;align-items:flex-start;padding-top:10px;background:#fff;border-top:1px solid var(--line);font-size:9.5px;color:#A79A92}
.tabs span{display:flex;flex-direction:column;align-items:center;gap:3px}
.tabs .on{color:var(--ink);font-weight:600}
.pill{display:inline-flex;align-items:center;gap:4px;padding:3px 8px;border-radius:99px;font-size:9.5px;font-weight:600}
.pill.g{background:#E7F3E5;color:#2F7A3A}.pill.a{background:#FCEFD3;color:#9A6A12}
.dot:before{content:"";width:5px;height:5px;border-radius:50%;background:currentColor}
`;

function phoneToday(d, r) {
  const sales = Math.round((1800 + r() * 1400) / 10) * 10;
  const last = Math.round((sales * (0.8 + r() * 0.1)) / 10) * 10;
  const pct = Math.round(((sales - last) / last) * 100);
  const bars = Array.from({ length: 8 }, (_, k) => 20 + k * 7 + Math.round(r() * 14));
  const n = { b: 8 + Math.floor(r() * 9), p: 12 + Math.floor(r() * 12), c: 1 + Math.floor(r() * 3) };
  return `<div class="scr"><div class="island"></div><div class="sb"><span>6:12</span><span class="ic"><i></i><i></i></span></div>
  <div class="pad">
    <div class="hd"><div><small>${FRIDAY_LABEL}</small><h2>Good evening</h2></div><div style="display:flex;gap:8px"><span class="roundbtn">${icon.bell}</span><span class="av">${esc(d.initials)}</span></div></div>
    <div style="margin-top:12px;padding:13px 14px 12px;border-radius:16px;background:var(--bg);color:var(--cream);position:relative;overflow:hidden">
      <div style="display:flex;justify-content:space-between;font-size:10.5px;color:rgba(251,243,228,.7)"><span>Tonight's sales</span><span style="padding:2px 7px;border-radius:99px;background:rgba(251,243,228,.12);color:var(--cream);font-weight:600">+${pct}%</span></div>
      <div class="serif" style="font-size:30px;margin-top:2px">$${sales.toLocaleString('en-US')}</div>
      <div style="font-size:9.5px;color:rgba(251,243,228,.6)">$${last.toLocaleString('en-US')} last Friday at this time</div>
      <div style="display:flex;align-items:flex-end;gap:6px;height:46px;margin-top:10px">${bars.map((h, k) => `<i style="flex:1;height:${h}%;border-radius:3px;background:${k === 7 ? 'var(--gold)' : 'rgba(251,243,228,.22)'}"></i>`).join('')}</div>
      <div style="display:flex;justify-content:space-between;margin-top:5px;font-size:8.5px;color:rgba(251,243,228,.5)"><span>11 am</span><span>2 pm</span><span>5 pm</span><span>Now</span></div>
    </div>
    <div style="display:flex;gap:8px;margin-top:10px">${[
      ['Bookings', n.b, '#F4D9D2', '#9C3D2C', icon.cal],
      ['Pickups', n.p, '#FCEFD3', '#9A6A12', icon.bag],
      ['Catering', n.c, '#DCEBF0', '#1F6A80', icon.gift],
    ].map(([l, v, bg, fg, ic]) => `<div style="flex:1;padding:9px 10px;border-radius:12px;background:#fff;box-shadow:0 0 0 1px var(--line)"><span style="width:24px;height:24px;border-radius:7px;display:grid;place-items:center;background:${bg};color:${fg}">${ic}</span><div class="serif" style="font-size:21px;margin-top:5px">${v}</div><div style="font-size:9.5px;color:var(--muted)">${l}</div></div>`).join('')}</div>
    <div style="display:flex;justify-content:space-between;margin-top:13px;font-size:12px;font-weight:600"><span>Up next</span><span style="font-size:10px;color:#9A6A12">See all</span></div>
    ${[
      ['6:30', 'Ahmadi family', 'Table 7, 6 guests', 'g', 'Booked'],
      ['7:00', 'Pickup, Farid H.', `2 ${d.itemShort}, 1 Mantu`, 'a', 'Cooking'],
    ].map(([t, a, b, c, l]) => `<div style="display:flex;align-items:center;gap:10px;margin-top:7px;padding:8px;border-radius:12px;background:#fff;box-shadow:0 0 0 1px var(--line)"><span style="width:40px;height:40px;border-radius:9px;background:#F5EEE3;display:grid;place-items:center;text-align:center;font-size:12px;font-weight:700;line-height:1">${t}<small style="display:block;font-size:7.5px;font-weight:500;color:var(--muted)">PM</small></span><span style="flex:1;min-width:0"><b style="display:block;font-size:11.5px">${esc(a)}</b><small style="display:block;font-size:9.5px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(b)}</small></span><span class="pill ${c} dot">${l}</span></div>`).join('')}
  </div>
  <div class="tabs"><span class="on">${icon.home}Today</span><span>${icon.grid}Tables</span><span>${icon.bag}Orders</span><span>${icon.menu}Menu</span></div></div>`;
}

function phoneTables(d) {
  const T = (x, y, w, h, n, st, round, extra = '') => {
    const s = { free: 'background:#fff;box-shadow:0 0 0 1.5px #D9CDBE;color:var(--ink)', res: 'background:#F6DFA9;color:#6D4C0E', seat: 'background:var(--bg);color:var(--cream)', sel: 'background:#F6DFA9;box-shadow:0 0 0 2.5px var(--gold),0 10px 20px -8px rgba(0,0,0,.35);color:#6D4C0E' }[st];
    return `<span style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;border-radius:${round ? '50%' : '9px'};display:grid;place-items:center;text-align:center;font-size:11px;font-weight:700;line-height:1.1;${s}">${n}${extra}</span>`;
  };
  return `<div class="scr"><div class="island"></div><div class="sb"><span>6:12</span><span class="ic"><i></i><i></i></span></div>
  <div class="pad">
    <div class="hd"><div><small>Dining room</small><h2>Tables</h2></div><span class="roundbtn">${icon.plus}</span></div>
    <div style="display:flex;gap:12px;margin-top:9px;font-size:9.5px;color:var(--muted)"><span>▢ Free 4</span><span style="color:#9A6A12">■ Reserved 3</span><span style="color:var(--ink)">■ Seated 5</span></div>
    <div style="position:relative;height:250px;margin-top:9px;border-radius:14px;background:#F1E8DA;background-image:linear-gradient(rgba(42,30,34,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(42,30,34,.04) 1px,transparent 1px);background-size:16px 16px">
      <span style="position:absolute;left:12px;top:12px;padding:4px 10px;border-radius:5px;background:#E3D6C3;font-size:8.5px;color:#7B6A5D">Counter and kitchen</span>
      ${T(14, 48, 30, 30, 1, 'seat', 1)}${T(64, 48, 30, 30, 2, 'free', 1)}${T(118, 44, 44, 38, 3, 'seat', 0, '<small style="display:block;font-size:7px;font-weight:500;opacity:.75">52 min</small>')}${T(184, 50, 26, 26, 6, 'free', 1)}
      ${T(14, 106, 30, 30, 4, 'res', 1)}${T(58, 100, 44, 40, 5, 'seat', 0, '<small style="display:block;font-size:7px;font-weight:500;opacity:.75">18 min</small>')}${T(118, 100, 70, 40, 7, 'sel', 0, '<small style="display:block;font-size:7.5px;font-weight:600">6:30 pm</small>')}
      ${T(20, 164, 92, 40, 8, 'seat', 0, '<small style="display:block;font-size:7px;font-weight:500;opacity:.75">Family of 8</small>')}${T(134, 168, 30, 30, 9, 'free', 1)}${T(178, 170, 26, 26, 10, 'res', 1)}
      <span style="position:absolute;right:10px;bottom:10px;padding:4px 8px;border-radius:5px;background:#E3D6C3;font-size:8px;color:#7B6A5D">Door</span>
    </div>
  </div>
  <div style="position:absolute;left:0;right:0;bottom:0;padding:10px 16px 18px;border-radius:22px 22px 0 0;background:#fff;box-shadow:0 -12px 30px -14px rgba(0,0,0,.25)">
    <div style="width:34px;height:4px;margin:0 auto 10px;border-radius:99px;background:#E2D8CC"></div>
    <div style="display:flex;justify-content:space-between;align-items:center"><span class="serif" style="font-size:21px">Table 7</span><span class="pill a dot">Arrives 6:30 pm</span></div>
    <div style="display:flex;gap:14px;margin-top:5px;font-size:10px;color:var(--muted)"><span style="display:flex;gap:4px;align-items:center">${icon.users}Ahmadi family</span><span style="display:flex;gap:4px;align-items:center">${icon.users}6 guests</span></div>
    <div style="display:flex;gap:7px;align-items:center;margin-top:9px;padding:8px 10px;border-radius:9px;background:#FCF2DC;font-size:10px;color:#6D4C0E">${icon.gift}Birthday dinner, needs a high chair</div>
    <div style="display:flex;gap:8px;margin-top:10px"><span style="flex:1.4;display:flex;align-items:center;justify-content:center;gap:6px;height:38px;border-radius:10px;background:var(--bg);color:var(--cream);font-size:11.5px;font-weight:600">${icon.check}Seat now</span><span style="flex:1;display:flex;align-items:center;justify-content:center;gap:6px;height:38px;border-radius:10px;box-shadow:inset 0 0 0 1px #DDD2C6;font-size:11.5px;font-weight:600">${icon.chat}Text</span></div>
  </div></div>`;
}

function phoneOrders(d) {
  return `<div class="scr"><div class="island"></div><div class="sb"><span>6:12</span><span class="ic"><i></i><i></i></span></div>
  <div class="pad">
    <div class="hd"><div><small>Pickup and catering</small><h2>Orders</h2></div><span class="roundbtn">${icon.search}</span></div>
    <div style="display:flex;margin-top:11px;padding:3px;border-radius:11px;background:#EFE6DA;font-size:10.5px;text-align:center"><span style="flex:1;padding:6px 0;color:var(--muted)">New 3</span><span style="flex:1;padding:6px 0;border-radius:8px;background:#fff;font-weight:600;box-shadow:0 1px 3px rgba(0,0,0,.08)">Cooking 4</span><span style="flex:1;padding:6px 0;color:var(--muted)">Ready 2</span></div>
    <div style="margin-top:10px;padding:12px;border-radius:14px;background:#fff;box-shadow:0 0 0 1px var(--line)">
      <div style="display:flex;justify-content:space-between;align-items:flex-start"><span><b style="display:block;font-size:13px">Order 1042</b><small style="font-size:9.5px;color:var(--muted)">Pickup at 7:00 pm</small></span><span class="pill a" style="gap:4px">${icon.clock}12 min</span></div>
      <div style="display:flex;align-items:center;gap:8px;margin-top:9px;padding:7px 8px;border-radius:9px;background:#F7F1E8;font-size:10.5px;font-weight:500"><span style="width:20px;height:20px;border-radius:50%;background:#1F6A80;color:#fff;display:grid;place-items:center;font-size:9px;font-weight:700">F</span>Farid H.<span style="margin-left:auto;width:24px;height:24px;border-radius:50%;background:#fff;display:grid;place-items:center">${icon.phone}</span></div>
      ${[
        ['2×', d.item, 'Extra salad'],
        ['1×', 'Mantu', ''],
        ['2×', 'Green tea with gur', ''],
      ].map(([q, it, note]) => `<div style="display:flex;gap:8px;align-items:center;margin-top:7px;padding-bottom:7px;border-bottom:1px dashed #EADFD2;font-size:10.5px"><b style="color:#9A6A12">${q}</b><span style="flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(it)}</span><small style="font-size:8.5px;color:var(--muted)">${note}</small></div>`).join('')}
      <div style="height:5px;margin-top:9px;border-radius:99px;background:#EFE6DA"><i style="display:block;width:62%;height:100%;border-radius:inherit;background:var(--gold)"></i></div>
      <div style="display:flex;justify-content:space-between;margin-top:5px;font-size:8.5px;color:var(--muted)"><span>Cooking</span><span>Ready by 6:58 pm</span></div>
      <div style="display:flex;align-items:center;justify-content:center;gap:6px;height:36px;margin-top:9px;border-radius:10px;background:var(--bg);color:var(--cream);font-size:11.5px;font-weight:600">${icon.check}Mark ready</div>
    </div>
    <div style="margin-top:9px;padding:11px 12px;border-radius:14px;background:#fff;box-shadow:0 0 0 1px var(--line)">
      <div style="display:flex;justify-content:space-between"><span><b style="display:block;font-size:12.5px">Order 1043</b><small style="font-size:9.5px;color:var(--muted)">Pickup at 7:15 pm, 3 items</small></span><span class="pill" style="background:#F1ECE5;color:#5C4A44;gap:4px">${icon.clock}27 min</span></div>
      <div style="height:5px;margin-top:9px;border-radius:99px;background:#EFE6DA"><i style="display:block;width:28%;height:100%;border-radius:inherit;background:var(--gold)"></i></div>
    </div>
  </div>
  <div class="tabs"><span>${icon.home}Today</span><span>${icon.grid}Tables</span><span class="on">${icon.bag}Orders</span><span>${icon.menu}Menu</span></div></div>`;
}

function enrich(d) {
  const s = STYLES[d.style];
  return { ...d, item: s.item, itemShort: s.item.split(',')[0] };
}

// One phone on its own (460×878 output)
function screen(d, which) {
  const p = PALETTES[d.palette];
  const e = enrich(d);
  const inner = { today: () => phoneToday(e, seeded(d.name)), tables: () => phoneTables(e), orders: () => phoneOrders(e) }[which]();
  return `${base(p, 300, 573, PHONE_CSS)}<div class="phone" style="left:18px;top:6px">${inner}</div></body></html>`;
}

// Three phones + a catering notification (1024×666 output)
function overview(d) {
  const p = PALETTES[d.palette];
  const e = enrich(d);
  const r = seeded(d.name);
  return `${base(p, 1024, 666, PHONE_CSS + `.ph{position:absolute;transform-origin:0 0}`)}
  <div class="ph" style="left:48px;top:40px;transform:scale(1.02)"><div class="phone" style="position:relative">${phoneToday(e, r)}</div></div>
  <div class="ph" style="left:380px;top:30px;transform:scale(1.02)"><div class="phone" style="position:relative">${phoneTables(e)}</div></div>
  <div class="ph" style="left:712px;top:40px;transform:scale(1.02)"><div class="phone" style="position:relative">${phoneOrders(e)}</div></div>
  <div style="position:absolute;left:744px;top:520px;width:250px;display:flex;gap:10px;align-items:center;padding:11px 12px;border-radius:14px;background:#FBF6EE;color:#2A1E22;box-shadow:0 20px 40px -12px rgba(0,0,0,.55)">
    <span style="flex-shrink:0;width:34px;height:34px;border-radius:9px;background:var(--bg);display:grid;place-items:center"><span style="width:18px;height:18px;display:block">${icon.star(p.gold)}</span></span>
    <span style="min-width:0"><small style="display:flex;justify-content:space-between;font-size:9px;color:#8B7D76"><span>${esc(d.brand || d.name)}</span><span>now</span></small><b style="display:block;font-size:11.5px">New catering request</b><small style="display:block;font-size:9.5px;color:#5C4A44">Engagement party, 120 guests on ${PARTY_LABEL}</small></span>
  </div></body></html>`;
}

module.exports = { website, overview, screen, PALETTES, STYLES };
