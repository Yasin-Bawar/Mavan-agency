/* One signature section per industry: the part of each page that no other industry page has.
   Used by build-industries.mjs. Interactions (slider, tilt) live in assets/js/niche.js, styles in niche.css. */

const icon = (id) => `<svg class="i" aria-hidden="true"><use href="#${id}"/></svg>`;
const img = (base, name, w, h, cls = '') =>
  `<img${cls ? ` class="${cls}"` : ''} src="${base}assets/img/photos/${name}.jpg" alt="" width="${w}" height="${h}" loading="lazy" decoding="async">`;

// Words for the scrolling strip under each hero
export const TICKERS = {
  restaurants: ['Online ordering', 'Pickup', 'Delivery', 'QR menus', 'Reservations', '0% commission', 'Gift cards', 'Loyalty'],
  barbershops: ['Skin fades', 'Line-ups', 'Beard trims', 'Deposits', 'SMS reminders', 'Book 24/7', 'Walk-ins welcome', 'Fresh cuts'],
  'salons-spas': ['Balayage', 'Gel nails', 'Lash fills', 'Facials', 'Gift cards', 'Rebooking', 'Deposits', 'Glow'],
  'dental-clinics': ['Check-ups', 'Cleanings', 'Whitening', 'New patients', 'Recalls', 'Intake forms', 'Book online', 'Reminders'],
  contractors: ['Kitchens', 'Basements', 'Decks', 'Roofing', 'Free quotes', 'Site visits', 'Project gallery', 'Licensed & insured'],
  'fitness-studios': ['HIIT', 'Yoga', 'Boxing', 'Strength', 'Waitlists', 'Memberships', 'Check-in', 'Free trial'],
  'retail-shops': ['Click & collect', 'Same-day delivery', 'Gift cards', 'New arrivals', 'Loyalty', 'Online store', 'Open 24/7', 'Local'],
};

const head = (kicker, title, sub) => `
        <div class="section-head">
          <div>
            <span class="section-label reveal"><b>${icon('i-sparkle')}</b>${kicker}</span>
            <h2 class="h2 reveal">${title}</h2>
          </div>
          <p class="section-sub reveal">${sub}</p>
        </div>`;

export const SIGNATURES = {
  /* Two receipts for the same order: delivery app vs your own site */
  restaurants: (base) => `${head('Same order, two ways', 'One $50 order. <em>Two very different receipts.</em>', 'Here’s what lands in your pocket when a regular orders through a delivery app, and when they order from your own site.')}
        <div class="rcpt-wrap reveal">
          <div class="rcpt rcpt--app">
            <span class="rcpt-tag">Delivery app</span>
            <b class="rcpt-title">Order #2041</b>
            <span class="rcpt-row"><span>2× Margherita</span><span>$28.00</span></span>
            <span class="rcpt-row"><span>1× Diavola</span><span>$16.00</span></span>
            <span class="rcpt-row"><span>1× Tiramisù</span><span>$6.00</span></span>
            <span class="rcpt-row rcpt-sum"><span>Order total</span><span>$50.00</span></span>
            <span class="rcpt-row rcpt-minus"><span>Commission (25%)</span><span>−$12.50</span></span>
            <span class="rcpt-keep"><small>You keep</small><b>$37.50</b><i style="--w:75%"></i></span>
          </div>
          <div class="rcpt-vs" aria-hidden="true">vs</div>
          <div class="rcpt rcpt--you">
            <span class="rcpt-tag">Your own site</span>
            <b class="rcpt-title">Order #2041</b>
            <span class="rcpt-row"><span>2× Margherita</span><span>$28.00</span></span>
            <span class="rcpt-row"><span>1× Diavola</span><span>$16.00</span></span>
            <span class="rcpt-row"><span>1× Tiramisù</span><span>$6.00</span></span>
            <span class="rcpt-row rcpt-sum"><span>Order total</span><span>$50.00</span></span>
            <span class="rcpt-row rcpt-minus"><span>Card fee (about 3%)</span><span>−$1.75</span></span>
            <span class="rcpt-keep"><small>You keep</small><b>$48.25</b><i style="--w:96.5%"></i></span>
          </div>
          <div class="rcpt-diff">
            <span class="rcpt-diff-ico">${icon('i-trend')}</span>
            <b>+$10.75</b>
            <span>more on every $50 order. Commission rates vary by app and plan; 25% is a common example.</span>
          </div>
        </div>`,

  /* A live chair board that fills up */
  barbershops: (base) => {
    const times = ['10', '11', '12', '1', '2', '3', '4', '5', '6'];
    const rows = [
      ['barber-marco', 'Marco', 'Fades', [1, 1, 0, 1, 1, 1, 0, 1, 1]],
      ['barber-leo', 'Leo', 'Beards', [1, 0, 1, 1, 0, 1, 1, 1, 0]],
      ['barber-andre', 'Andre', 'Classic cuts', [0, 1, 1, 1, 1, 0, 1, 1, 1]],
    ];
    const booked = rows.reduce((n, r) => n + r[3].filter(Boolean).length, 0);
    const initials = 'JMKADRSTLBNOPCEW';
    let k = 0;
    return `${head('Chair board', 'Watch your chairs <em>fill themselves.</em>', 'Every booking from Instagram, Google or your site lands here, live. You cut, the board fills up.')}
        <div class="board reveal">
          <div class="board-top">
            <span class="board-live"><i></i>Live · Today</span>
            <b>${booked}/${rows.length * times.length} chairs booked</b>
            <span class="board-dep">${icon('i-card')}$${booked * 10} in deposits</span>
          </div>
          <div class="board-grid" style="--cols:${times.length}">
            <span></span>${times.map((t) => `<span class="board-time">${t}:00</span>`).join('')}
            ${rows
              .map(
                ([ph, name, spec, slots]) => `<span class="board-barber">${img(base, ph, 96, 96)}<span><b>${name}</b><small>${spec}</small></span></span>${slots
                  .map((s, j) => (s ? `<span class="board-slot is-on" style="--d:${(k++ % 12) * 0.07}s">${initials[(j * 3 + name.length) % initials.length]}</span>` : '<span class="board-slot"><i>Open</i></span>'))
                  .join('')}`
              )
              .join('')}
          </div>
        </div>`;
  },

  /* An elegant treatment menu and a gift card you can tilt */
  'salons-spas': (base) => `${head('Menu & gift cards', 'A menu that <em>sells itself.</em>', 'Your treatments laid out like a beautiful printed menu, plus gift cards that sell while you sleep. Tilt the card.')}
        <div class="spa-sig">
          <div class="menu-card reveal">
            <span class="menu-kicker">The menu</span>
            <b class="menu-title">Glow Studio</b>
            ${[
              ['Signature facial', '60 min', '$85'],
              ['Balayage &amp; gloss', '2.5 hrs', '$180'],
              ['Gel manicure', '45 min', '$40'],
              ['Classic lash set', '2 hrs', '$120'],
              ['Hot stone massage', '90 min', '$120'],
            ]
              .map(([t, m, p]) => `<span class="menu-row"><span><b>${t}</b><small>${m}</small></span><i></i><em>${p}</em></span>`)
              .join('')}
            <span class="menu-note">Sample menu. Your own treatments and prices go here.</span>
          </div>
          <div class="gift-wrap reveal">
            <div class="gift" data-tilt-card>
              <span class="gift-shine"></span>
              <span class="gift-top"><b>Glow Studio</b><small>Gift card</small></span>
              <span class="gift-amt">$150</span>
              <span class="gift-bot"><span>Signature package</span><span>•••• 4821</span></span>
            </div>
            <ul class="gift-points">
              <li>${icon('i-gift')}Sold online 24/7, sent by email in seconds</li>
              <li>${icon('i-calendar')}Ready for Mother’s Day, birthdays and the holidays</li>
              <li>${icon('i-card')}Paid upfront, straight to your account</li>
            </ul>
          </div>
        </div>`,

  /* The patient journey, step by step */
  'dental-clinics': (base) => `${head('Patient journey', 'From Google search <em>to the dental chair.</em>', 'Five steps, no phone tag. Here’s the path a new patient takes, with your clinic at every step.')}
        <ol class="journey" data-stagger>
          ${[
            ['i-search', 'Search', '“dentist near me”', 'Your clinic shows up on Google with hours, reviews and a Book button.'],
            ['i-calendar', 'Book', 'Thu 9:30 AM', 'They pick a service, a dentist and a time in three taps.'],
            ['i-pen', 'Fill in forms', 'Medical history', 'Intake forms done at home, so check-in takes seconds.'],
            ['i-bell', 'Reminder', '24 h before', 'An SMS and email the day before, with one-tap reschedule.'],
            ['i-repeat', 'Recall', '6 months later', 'An automatic reminder brings them back for the next check-up.'],
          ]
            .map(
              ([ic, t, chip, d], k) => `<li class="jstep reveal">
            <span class="jstep-n">${k + 1}</span>
            <span class="jstep-ico">${icon(ic)}</span>
            <b>${t}</b>
            <span class="jstep-chip">${chip}</span>
            <p>${d}</p>
          </li>`
            )
            .join('')}
        </ol>`,

  /* Drag between the plan and the finished build */
  contractors: (base) => `${head('Plan → built', 'Show the finished job, <em>not just the plan.</em>', 'Before-and-afters sell renovation work better than any sales pitch. Drag the handle to see how your gallery shows a project.')}
        <div class="ba-wrap">
          <div class="ba reveal" data-ba style="--pos:50%">
            ${img(base, 'house-modern', 1400, 900, 'ba-img ba-after')}
            <div class="ba-before">${img(base, 'house-modern', 1400, 900, 'ba-img')}<span class="ba-grid"></span></div>
            <span class="ba-label ba-label--l">The plan</span>
            <span class="ba-label ba-label--r">Built</span>
            <span class="ba-handle" aria-hidden="true">${icon('i-chev-l')}${icon('i-chev-r')}</span>
            <input class="ba-range" type="range" min="0" max="100" value="50" aria-label="Compare the plan and the finished build" />
          </div>
          <div class="ba-side reveal">
            <span class="ba-kicker">${icon('i-ruler')}Project spotlight</span>
            <b>Modern infill home</b>
            <dl>
              <div><dt>Scope</dt><dd>Full build</dd></div>
              <div><dt>Timeline</dt><dd>On schedule</dd></div>
              <div><dt>Area</dt><dd>Oakridge</dd></div>
            </dl>
            <p>Each project gets a page like this, with photos, scope and the client’s review, organised by service and town.</p>
            <span class="ba-note">Illustration with a stock photo. Your own projects go here.</span>
          </div>
        </div>`,

  /* A week of classes with live spots */
  'fitness-studios': (base) => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const classes = [
      ['6:30', 'HIIT Burn', [18, 20, 20, 14, 20, 12]],
      ['9:00', 'Power yoga', [9, 12, 15, 15, 7, 15]],
      ['12:15', 'Boxing', [10, 6, 12, 12, 11, 0]],
      ['18:00', 'Strength', [16, 16, 13, 16, 9, 16]],
    ];
    const cap = [20, 15, 12, 16];
    return `${head('Class timetable', 'A timetable that <em>fills itself.</em>', 'Members see live spots, book in a tap and join the waitlist when a class is full. Full classes free up automatically.')}
        <div class="tt reveal">
          <div class="tt-grid" style="--cols:${days.length}">
            <span></span>${days.map((d) => `<span class="tt-day">${d}</span>`).join('')}
            ${classes
              .map(
                ([time, name, spots], r) =>
                  `<span class="tt-class"><b>${name}</b><small>${time}</small></span>${spots
                    .map((n, j) => {
                      if (!n) return '<span class="tt-cell tt-cell--off"><small>No class</small></span>';
                      const full = n >= cap[r];
                      return `<span class="tt-cell${full ? ' is-full' : ''}" style="--f:${Math.round((n / cap[r]) * 100)}%;--d:${(r * 6 + j) * 0.04}s"><b>${full ? 'Full' : `${cap[r] - n} left`}</b><small>${full ? 'Join waitlist' : `${n}/${cap[r]} booked`}</small><i></i></span>`;
                    })
                    .join('')}`
              )
              .join('')}
          </div>
        </div>`;
  },

  /* Delivery zones around the shop, plus pickup-ready products */
  'retail-shops': (base) => `${head('Delivery zones', 'Your shop, <em>delivered across town.</em>', 'Draw your delivery zones once. Customers inside get same-day delivery, everyone else picks up in store.')}
        <div class="zones-wrap">
          <div class="zones reveal" aria-hidden="true">
            <span class="zone zone--3"><i>Pickup in store</i></span>
            <span class="zone zone--2"><i>Next day · $8</i></span>
            <span class="zone zone--1"><i>Same day · $5</i></span>
            <span class="zone-shop">${icon('i-store')}</span>
            <span class="zone-van zone-van--a">${icon('i-bag')}</span>
            <span class="zone-van zone-van--b">${icon('i-bag')}</span>
          </div>
          <div class="zones-shop reveal">
            ${[
              ['florist-peony', 'Peony stems', '$65', 'Same-day delivery'],
              ['florist-tulips', 'Pink tulips', '$38', 'Pickup today'],
              ['florist-dried', 'Dried posy', '$42', 'Pickup today'],
              ['florist-bouquet', 'Spring bouquet', '$45', 'Same-day delivery'],
            ]
              .map(([ph, n, p, badge]) => `<span class="zp">${img(base, ph, 480, 480)}<em>${badge}</em><b>${n}</b><small>${p}</small></span>`)
              .join('')}
            <span class="menu-note">Sample products from the Petal &amp; Stem concept.</span>
          </div>
        </div>`,
};
