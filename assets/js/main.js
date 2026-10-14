/* Mavan — site interactions (no dependencies) */
(() => {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const icon = (id) => `<svg class="i" aria-hidden="true"><use href="#${id}"/></svg>`;
  const photo = (name, cls, w, h) =>
    `<img class="${cls}" src="assets/img/photos/${name}.jpg" alt="" width="${w}" height="${h}" loading="lazy" decoding="async">`;

  /* ------------------------------------------------------------------
     Scroll loop — every scroll-driven effect registers here
     ------------------------------------------------------------------ */
  const scrollHandlers = [];
  let ticking = false;
  const runScroll = () => {
    ticking = false;
    scrollHandlers.forEach((fn) => fn());
  };
  const requestScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(runScroll);
    }
  };
  window.addEventListener('scroll', requestScroll, { passive: true });
  window.addEventListener('resize', requestScroll);

  /* ------------------------------------------------------------------
     Nav: scrolled state, progress bar, active link, mobile menu
     ------------------------------------------------------------------ */
  const nav = $('#nav');
  const progress = $('.scroll-progress');
  scrollHandlers.push(() => {
    const y = window.scrollY;
    nav.classList.toggle('is-scrolled', y > 24);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  });

  const navLinks = $$('.nav-links a');
  const watched = [$('#top'), ...navLinks.map((a) => $(a.getAttribute('href')))].filter(Boolean);
  const navObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = `#${entry.target.id}`;
        navLinks.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === id));
      });
    },
    { rootMargin: '-45% 0px -50% 0px' }
  );
  watched.forEach((s) => navObserver.observe(s));

  const toggle = $('.nav-toggle');
  const menu = $('#mobile-menu');
  const setMenu = (open) => {
    document.body.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.setAttribute('aria-hidden', String(!open));
    document.documentElement.style.overflow = open ? 'hidden' : '';
  };
  toggle.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
  $$('a', menu).forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.body.classList.contains('menu-open')) {
      setMenu(false);
      toggle.focus();
    }
  });
  window.matchMedia('(min-width: 961px)').addEventListener('change', (e) => e.matches && setMenu(false));

  /* ------------------------------------------------------------------
     Small dynamic bits: availability month & year
     ------------------------------------------------------------------ */
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  $$('[data-next-month]').forEach((el) => (el.textContent = nextMonth.toLocaleString('en-US', { month: 'long' })));
  $$('[data-year]').forEach((el) => (el.textContent = String(now.getFullYear())));

  /* ------------------------------------------------------------------
     Hero: orange "curtain" stripes
     ------------------------------------------------------------------ */
  const curtain = $('[data-curtain]');
  if (curtain) {
    let seed = 11;
    const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
    const tones = [
      ['#ff5a1f', '#ff7a45'],
      ['#ff4a0e', '#ff8a5c'],
      ['#ff6a30', '#ffa47c'],
      ['#ff7b47', '#ffbb9c'],
    ];
    const count = window.innerWidth < 760 ? 16 : 30;
    const frag = document.createDocumentFragment();
    for (let k = 0; k < count; k++) {
      const t = k / (count - 1);
      const s = document.createElement('span');
      const [c1, c2] = tones[Math.floor(rand() * tones.length)];
      s.style.setProperty('--k', k);
      s.style.setProperty('--h', `${clamp(30 + t * 60 + (rand() * 26 - 12), 22, 100).toFixed(1)}%`);
      s.style.setProperty('--o', (0.62 + rand() * 0.38).toFixed(2));
      s.style.setProperty('--c1', c1);
      s.style.setProperty('--c2', c2);
      frag.appendChild(s);
    }
    curtain.appendChild(frag);

    const hero = $('.hero');
    new IntersectionObserver(([entry]) => hero.classList.toggle('is-paused', !entry.isIntersecting)).observe(hero);

    // Gentle parallax: the stripes drift a little with the pointer
    if (!reduceMotion && window.matchMedia('(pointer: fine)').matches) {
      hero.addEventListener('pointermove', (e) => {
        const x = e.clientX / window.innerWidth - 0.5;
        const y = e.clientY / window.innerHeight - 0.5;
        curtain.style.transform = `translate3d(${(x * -18).toFixed(1)}px, ${(y * -10).toFixed(1)}px, 0)`;
      });
      hero.addEventListener('pointerleave', () => (curtain.style.transform = ''));
    }
  }

  /* ------------------------------------------------------------------
     Hero: rotating industry word
     ------------------------------------------------------------------ */
  const rotator = $('[data-rotator]');
  if (rotator) {
    const words = $$('.rotator-word', rotator);
    let index = 0;
    rotator.classList.add('is-ready');
    const fit = () => (rotator.style.width = `${words[index].offsetWidth}px`);
    fit();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
    window.addEventListener('resize', fit);

    if (!reduceMotion && words.length > 1) {
      setInterval(() => {
        if (document.hidden) return;
        const current = words[index];
        index = (index + 1) % words.length;
        current.classList.remove('is-active');
        current.classList.add('is-leaving');
        words[index].classList.add('is-active');
        fit();
        setTimeout(() => current.classList.remove('is-leaving'), 750);
      }, 2600);
    }
  }

  /* ------------------------------------------------------------------
     Reveal on scroll
     ------------------------------------------------------------------ */
  $$('[data-stagger]').forEach((parent) => $$('.reveal', parent).forEach((el, k) => el.style.setProperty('--i', k)));
  const revealEls = $$('.reveal');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-in');
          revealObserver.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.06 }
    );
    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-in'));
  }

  /* ------------------------------------------------------------------
     Statement: words light up as you scroll
     ------------------------------------------------------------------ */
  $$('[data-highlight]').forEach((el) => {
    if (reduceMotion) return;
    const words = [];
    const split = (node) => {
      Array.from(node.childNodes).forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) {
              frag.appendChild(document.createTextNode(part));
            } else {
              const span = document.createElement('span');
              span.className = 'w';
              span.textContent = part;
              frag.appendChild(span);
              words.push(span);
            }
          });
          child.replaceWith(frag);
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          split(child);
        }
      });
    };
    split(el);
    el.classList.add('is-split');

    let lit = -1;
    scrollHandlers.push(() => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = clamp((vh * 0.85 - r.top) / (vh * 0.5 + r.height * 0.5), 0, 1);
      const next = Math.round(p * words.length);
      if (next === lit) return;
      lit = next;
      words.forEach((w, k) => w.classList.toggle('is-lit', k < lit));
    });
  });

  /* ------------------------------------------------------------------
     Showcase tilt, process line, big CTA word parallax
     ------------------------------------------------------------------ */
  const tilt = $('[data-tilt] .showcase-inner');
  if (tilt && !reduceMotion) {
    scrollHandlers.push(() => {
      const r = tilt.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = clamp(1 - (r.top - vh * 0.12) / (vh * 0.62), 0, 1);
      tilt.style.setProperty('--p', p.toFixed(3));
    });
  }

  const process = $('[data-process]');
  if (process) {
    const steps = $$('.step', process);
    scrollHandlers.push(() => {
      const r = process.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = clamp((vh * 0.78 - r.top) / (vh * 0.55), 0, 1);
      process.style.setProperty('--lp', p.toFixed(3));
      steps.forEach((step, k) => {
        const stepRect = step.getBoundingClientRect();
        const horizontal = window.innerWidth > 960;
        const lit = horizontal ? p >= (k / (steps.length - 1)) * 0.96 + 0.02 : stepRect.top < vh * 0.8;
        step.classList.toggle('is-lit', lit);
      });
    });
  }

  /* Big CTA: the giant word slides through its endings, forever */
  const slot = $('[data-slot]');
  if (slot && !reduceMotion) {
    const endings = $$('.big-word', slot);
    endings.forEach((w) => {
      w.innerHTML = [...w.textContent].map((ch, k) => `<span style="--k:${k}">${ch}</span>`).join('');
    });
    slot.classList.add('is-ready');
    let index = 0;
    setInterval(() => {
      if (document.hidden) return;
      const current = endings[index];
      index = (index + 1) % endings.length;
      current.classList.replace('is-active', 'is-leaving');
      endings[index].classList.add('is-active');
      setTimeout(() => {
        // jump back below the line without animating through it
        current.classList.add('is-reset');
        current.classList.remove('is-leaving');
        void current.offsetWidth;
        current.classList.remove('is-reset');
      }, 1300);
    }, 2600);
  }

  /* Sunburst lines (big CTA) */
  const sunburst = $('[data-sunburst]');
  if (sunburst) {
    const n = 120;
    let lines = '';
    for (let k = 0; k < n; k++) {
      const a = (k / n) * Math.PI * 2;
      const r1 = 64 + (k % 4) * 7;
      const r2 = k % 2 ? 190 : 176;
      const f = (v) => v.toFixed(2);
      lines += `<line x1="${f(Math.cos(a) * r1)}" y1="${f(Math.sin(a) * r1)}" x2="${f(Math.cos(a) * r2)}" y2="${f(Math.sin(a) * r2)}"/>`;
    }
    sunburst.innerHTML = lines;
  }

  /* ------------------------------------------------------------------
     Animated counters
     ------------------------------------------------------------------ */
  const counters = $$('[data-count]');
  const formatCount = (value, decimals) =>
    value.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  const runCounter = (el) => {
    const target = parseFloat(el.dataset.count);
    const decimals = Number(el.dataset.decimals || 0);
    if (reduceMotion) {
      el.textContent = formatCount(target, decimals);
      return;
    }
    const duration = 1800;
    const start = performance.now();
    const step = (t) => {
      const x = clamp((t - start) / duration, 0, 1);
      const eased = x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
      el.textContent = formatCount(target * eased, decimals);
      if (x < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if (counters.length) {
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          counterObserver.unobserve(entry.target);
          runCounter(entry.target);
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach((el) => {
      if (!reduceMotion) el.textContent = formatCount(0, Number(el.dataset.decimals || 0));
      counterObserver.observe(el);
    });
  }

  /* ------------------------------------------------------------------
     Service cards: cursor glow
     ------------------------------------------------------------------ */
  $$('[data-glow]').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });

  /* ------------------------------------------------------------------
     Industries tabs
     ------------------------------------------------------------------ */
  const INDUSTRIES = [
    {
      id: 'restaurants',
      name: 'Restaurants & cafés',
      short: 'Restaurants',
      icon: 'i-utensils',
      count: 'Ordering, reservations, QR menus',
      headline: 'More orders, full tables, <em>zero commission.</em>',
      desc: 'A mouth-watering website with online ordering and table reservations built in, so customers order direct instead of through marketplaces.',
      features: ['Online ordering & pickup', 'Table reservations', 'QR code menus', 'Google reviews & maps'],
      metric: '+58%',
      metricLabel: 'more direct online orders, on average',
      cta: 'Get a restaurant site',
      app: {
        color: '#1f3a2e', ink: '#f4ecdf', glow: 'rgba(214, 64, 42, 0.22)',
        pill: ['i-bag', 'New order · $52.00', 'Pickup at 7:15 PM'],
      },
    },
    {
      id: 'barbershops',
      name: 'Barbershops',
      short: 'Barbershops',
      icon: 'i-scissors',
      count: 'Booking, deposits, reminders',
      headline: 'A chair that\'s <em>never empty.</em>',
      desc: 'Let clients pick their barber, service and time 24/7. Deposits and automatic reminders mean fewer no-shows and more cuts per day.',
      features: ['24/7 online booking', 'Barber profiles & calendars', 'Deposits that stop no-shows', 'SMS reminders'],
      metric: '−80%',
      metricLabel: 'fewer no-shows with deposits & reminders',
      cta: 'Get a barbershop app',
      app: {
        color: '#0d0d0d', ink: '#e0b25c', glow: 'rgba(196, 150, 70, 0.26)',
        pill: ['i-check', 'Booked · Marco', 'Wed 3:30 PM · $10 paid'],
      },
    },
    {
      id: 'salons',
      name: 'Salons & spas',
      short: 'Salons',
      icon: 'i-flower',
      count: 'Treatments, gift cards, rebooking',
      headline: 'Relaxing for clients, <em>effortless for you.</em>',
      desc: 'An elegant site with your full treatment menu, gift cards and packages, plus booking that remembers every client\'s preferences.',
      features: ['Treatment menus & add-ons', 'Gift cards & packages', 'Client notes & history', 'Automatic rebooking'],
      metric: '3.1×',
      metricLabel: 'more bookings made online',
      cta: 'Get a salon website',
      app: {
        color: '#b65f63', ink: '#ffffff', glow: 'rgba(196, 107, 107, 0.25)',
        pill: ['i-gift', 'Gift card sold', '$150 · Signature package'],
      },
    },
    {
      id: 'fitness',
      name: 'Gyms & studios',
      short: 'Fitness',
      icon: 'i-dumbbell',
      count: 'Classes, memberships, member app',
      headline: 'Classes booked, <em>members for life.</em>',
      desc: 'Class schedules, memberships and payments in one branded app, so members can book, check in and renew without calling the front desk.',
      features: ['Class schedules & waitlists', 'Memberships & passes', 'Branded member app', 'Digital check-in'],
      metric: '+420',
      metricLabel: 'new members in 6 months',
      cta: 'Get a member app',
      app: {
        color: '#111111', ink: '#d7f45b', glow: 'rgba(170, 210, 40, 0.3)',
        pill: ['i-users', 'New member', 'Unlimited plan · $59/mo'],
      },
    },
    {
      id: 'clinics',
      name: 'Clinics & dentists',
      short: 'Clinics',
      icon: 'i-heart',
      count: 'Appointments, forms, recalls',
      headline: 'Fewer phone calls, <em>more patients.</em>',
      desc: 'A calm, trustworthy website where patients book appointments, fill in intake forms ahead of time and get reminded when it\'s time to come back.',
      features: ['Online appointment booking', 'Digital intake forms', 'Recall & reminder emails', 'Secure, privacy-first forms'],
      metric: '+35%',
      metricLabel: 'more new-patient bookings',
      cta: 'Get a clinic website',
      app: {
        color: '#1f5eff', ink: '#ffffff', glow: 'rgba(31, 94, 255, 0.2)',
        pill: ['i-calendar', 'New patient booked', 'Thu 9:30 AM · Dr. Patel'],
      },
    },
    {
      id: 'retail',
      name: 'Retail & boutiques',
      short: 'Retail',
      icon: 'i-store',
      count: 'Online store, pickup, delivery',
      headline: 'Your shop, <em>open 24/7.</em>',
      desc: 'An online store that matches your in-store experience, with click & collect, local delivery and loyalty rewards that bring people back.',
      features: ['Online store & inventory', 'Click & collect', 'Local delivery zones', 'Loyalty & gift cards'],
      metric: '2.7×',
      metricLabel: 'growth in online revenue',
      cta: 'Get an online store',
      app: {
        color: '#3d5a40', ink: '#ffffff', glow: 'rgba(61, 90, 64, 0.22)',
        pill: ['i-bag', 'Order on its way', 'Peony stems · local delivery'],
      },
    },
  ];

  const indRoot = $('[data-industries]');
  if (indRoot) {
    const tabList = $('.ind-tabs', indRoot);
    const panel = $('.ind-panel', indRoot);

    tabList.innerHTML = INDUSTRIES.map(
      (d, k) => `
      <button class="ind-tab" type="button" role="tab" id="ind-tab-${d.id}" aria-controls="ind-panel" aria-selected="${k === 0}" tabindex="${k === 0 ? 0 : -1}" data-id="${d.id}">
        <span class="ind-ico">${icon(d.icon)}</span>
        <span>${d.name}<small>${d.count}</small></span>
        <span class="ind-go">${icon('i-arrow')}</span>
      </button>`
    ).join('');

    // Each industry gets its own app, laid out the way that kind of business actually works
    const statusBar = (cls = '') =>
      `<div class="ph-status ${cls}"><span>9:41</span><span class="ph-island"></span><span class="ph-sig"><i></i><i></i><i></i></span></div>`;
    const stars = (n) => `${icon('i-star')}${n}`;

    const APP_SCREENS = {
      // Food ordering: location, categories, a featured dish and a live cart
      restaurants: () => `
        ${statusBar()}
        <div class="rest-top">
          <span class="rest-loc"><small>Deliver to</small><b>${icon('i-pin')}Via Roma 21${icon('i-chev-d')}</b></span>
          <span class="rest-cart">${icon('i-bag')}<i>2</i></span>
        </div>
        <p class="rest-hello"><small>Buonasera, Sara</small>What are you <em>craving</em> tonight?</p>
        <div class="rest-chips"><span class="is-on">Pizza</span><span>Pasta</span><span>Antipasti</span><span>Dolci</span></div>
        <div class="rest-feature">
          <div class="rest-feature-media">${photo('napoli-pizza', '', 900, 900)}<span>Chef's pick</span></div>
          <div class="rest-feature-info">
            <span><b>Margherita DOP</b><small>Wood-fired · 12" · ${stars('4.9')}</small></span>
            <span class="rest-add">$14<i>${icon('i-plus')}</i></span>
          </div>
        </div>
        <div class="rest-label"><b>Popular</b><small>See all</small></div>
        <div class="rest-row">
          ${[['pizza-diavola', 'Diavola', '$16'], ['pasta-pesto', 'Pesto Genovese', '$15'], ['tiramisu', 'Tiramisù', '$8']]
            .map(([img, name, price]) => `<div class="rest-dish">${photo(img, '', 480, 480)}<b>${name}</b><small>${price}</small></div>`)
            .join('')}
        </div>
        <div class="rest-bar"><i>2</i><span>View cart</span><b>$30.00</b></div>`,

      // Booking flow: pick a barber, a service, a day and a time
      barbershops: () => `
        ${statusBar()}
        <div class="barb-nav"><span class="barb-back">${icon('i-chev-l')}</span><b>Book appointment</b><small>Step 2/3</small></div>
        <div class="barb-steps"><i class="is-on"></i><i class="is-on"></i><i></i></div>
        <div class="barb-label"><b>Choose your barber</b></div>
        <div class="barb-team">
          ${[['barber-marco', 'Marco', '4.9', true], ['barber-leo', 'Leo', '4.8'], ['barber-andre', 'Andre', '4.9']]
            .map(([img, name, rating, on]) => `<span class="${on ? 'is-on' : ''}"><span class="barb-face">${photo(img, '', 360, 360)}${on ? `<i>${icon('i-check')}</i>` : ''}</span><b>${name}</b><small>${stars(rating)}</small></span>`)
            .join('')}
          <span><span class="barb-face barb-any">${icon('i-users')}</span><b>Any</b><small>First free</small></span>
        </div>
        <div class="barb-service">${photo('barber-fade', '', 480, 480)}<span><b>Skin fade</b><small>45 min · $35</small></span><em>Change</em></div>
        <div class="barb-label"><b>October</b><small>${icon('i-chev-l')}${icon('i-chev-r')}</small></div>
        <div class="barb-days">
          ${[['Mon', 12], ['Tue', 13], ['Wed', 14], ['Thu', 15], ['Fri', 16]]
            .map(([day, n]) => `<span class="${n === 14 ? 'is-on' : ''}"><small>${day}</small><b>${n}</b></span>`)
            .join('')}
        </div>
        <div class="barb-label"><b>Afternoon</b><small>4 free</small></div>
        <div class="barb-times"><span>1:00</span><span class="is-off">2:15</span><span class="is-on">3:30</span><span>4:00</span><span class="is-off">4:45</span><span>5:30</span></div>
        <div class="barb-label"><b>Evening</b><small>2 free</small></div>
        <div class="barb-times"><span class="is-off">6:00</span><span>6:45</span><span>7:30</span></div>
        <div class="barb-cta"><b>Confirm · Wed 3:30 PM</b><small>$10 deposit today · free cancellation up to 24h</small></div>`,

      // Spa menu: full-bleed photo, treatment list, sticky booking bar
      salons: () => `
        <div class="spa-hero">${photo('salon-facial-hero', '', 1100, 917)}</div>
        ${statusBar('ph-status--over')}
        <div class="spa-actions"><span>${icon('i-chev-l')}</span><span>${icon('i-heart-o')}</span></div>
        <div class="spa-sheet">
          <div class="spa-head">
            <span><strong>Glow Studio</strong><small>Skin · Nails · Massage · 0.8 km</small></span>
            <span class="spa-rate">${stars('4.9')}</span>
          </div>
          <div class="spa-tabs"><span class="is-on">All</span><span>Face</span><span>Nails</span><span>Body</span></div>
          <div class="spa-list">
            ${[['salon-facial', 'Signature facial', '60 min · with Mia', '$85'], ['salon-nails', 'Gel manicure', '45 min · with Sofia', '$40', true], ['salon-massage', 'Hot stone massage', '90 min · with Ava', '$120']]
              .map(([img, name, meta, price, on]) => `
              <div class="spa-item${on ? ' is-on' : ''}">
                ${photo(img, '', 480, 480)}
                <span><b>${name}</b><small>${meta}</small><em>${price}</em></span>
                <i>${icon(on ? 'i-check' : 'i-plus')}</i>
              </div>`)
              .join('')}
          </div>
        </div>
        <div class="spa-bar"><span><small>1 treatment</small><b>$40</b></span><em>Choose a time${icon('i-arrow')}</em></div>`,

      // Member app: weekly goal, today's classes, scan-to-check-in
      fitness: () => `
        ${statusBar()}
        <div class="gym-top">
          <span><small>Good morning</small><b>Hi, Alex</b></span>
          <span class="gym-bell">${icon('i-bell')}<i></i></span>
        </div>
        <div class="gym-goal">
          <span class="gym-ring">
            <svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="16"/><circle class="on" cx="20" cy="20" r="16" pathLength="100" stroke-dasharray="75 100"/></svg>
            <b>3/4</b>
          </span>
          <span class="gym-goal-txt">
            <small>Weekly goal</small><b>3 of 4 workouts</b>
            <span class="gym-stats"><span><b>1,840</b> kcal</span><span><b>3h 20m</b> active</span></span>
          </span>
        </div>
        <div class="gym-label"><b>Today's classes</b><small>Schedule</small></div>
        <div class="gym-feature">
          ${photo('gym-hiit', '', 480, 480)}
          <span class="gym-when">${icon('i-clock')}7:00 AM</span>
          <div class="gym-feature-info"><span><b>HIIT Burn</b><small>45 min · Coach Dana · 4 spots left</small></span><em>Join</em></div>
        </div>
        <div class="gym-list">
          <div class="gym-row">${photo('gym-yoga', '', 480, 480)}<span><b>Power yoga</b><small>12:30 PM · Studio 2</small></span><em class="is-off">Waitlist</em></div>
          <div class="gym-row">${photo('gym-boxing', '', 480, 480)}<span><b>Boxing</b><small>6:00 PM · 8 spots</small></span><em>Book</em></div>
          <div class="gym-row">${photo('gym-interior', '', 1000, 667)}<span><b>Open gym</b><small>Until 11 PM · 32 here now</small></span><em class="is-live"><i></i>Live</em></div>
        </div>
        <div class="gym-tabbar"><span class="is-on">${icon('i-home')}</span><span>${icon('i-calendar')}</span><span class="gym-scan">${icon('i-qr')}</span><span>${icon('i-trend')}</span><span>${icon('i-user')}</span></div>`,

      // Patient app: confirmed visit with the dentist, availability, services
      clinics: () => `
        ${statusBar()}
        <div class="dent-top">
          <span><small>Good morning,</small><b>Emma Wilson</b></span>
          <span class="dent-bell">${icon('i-bell')}<i></i></span>
        </div>
        <div class="dent-next">
          <div class="dent-next-head"><small>Upcoming visit</small><span>${icon('i-check')}Confirmed</span></div>
          <strong>Check-up &amp; clean</strong>
          <div class="dent-doc">${photo('dentist-patel', '', 240, 240)}<span><b>Dr. James Patel</b><small>General dentist · Room 2</small></span></div>
          <div class="dent-when"><span>${icon('i-calendar')}Thu, Oct 15</span><span>${icon('i-clock')}9:30 AM</span></div>
        </div>
        <div class="dent-form">
          <span class="dent-form-ico">${icon('i-pen')}</span>
          <span><b>Intake form</b><small>2 of 3 sections done</small><span class="dent-prog"><i></i></span></span>
          <em>Finish</em>
        </div>
        <div class="dent-label"><b>Book a visit</b><small>October</small></div>
        <div class="dent-week">
          ${[['M', 12, 1], ['T', 13, 1], ['W', 14, 0], ['T', 15, 1], ['F', 16, 1], ['S', 17, 0], ['S', 18, 0]]
            .map(([day, n, open]) => `<span class="${n === 16 ? 'is-on' : open ? 'is-open' : ''}"><small>${day}</small><b>${n}</b></span>`)
            .join('')}
        </div>
        <div class="dent-label"><b>Services</b><small>See all</small></div>
        <div class="dent-list">
          <div class="dent-item">${photo('dental-smile', '', 480, 480)}<span><b>Teeth whitening</b><small>60 min · from $199</small></span><em>Book</em></div>
          <div class="dent-item">${photo('dental-checkup', '', 480, 480)}<span><b>Hygiene clean</b><small>30 min · insurance accepted</small></span><em>Book</em></div>
        </div>
        <div class="dent-tabbar"><span class="is-on">${icon('i-home')}</span><span>${icon('i-calendar')}</span><span>${icon('i-chat')}</span><span>${icon('i-user')}</span></div>`,

      // Online store: search, delivery promo, product grid
      retail: () => `
        ${statusBar()}
        <div class="shop-top">
          <span class="shop-btn">${icon('i-menu')}</span>
          <strong>Petal <em>&amp;</em> Stem</strong>
          <span class="shop-btn">${icon('i-bag')}<i>1</i></span>
        </div>
        <div class="shop-search">${icon('i-search')}<span>Search bouquets, plants…</span><i>${icon('i-sliders')}</i></div>
        <div class="shop-promo">
          <span class="shop-promo-txt"><small>Same-day delivery</small><strong>Fresh flowers, <em>at your door today</em></strong><span>Order by 2 PM</span></span>
          ${photo('florist-shop', '', 1000, 667)}
        </div>
        <div class="shop-chips"><span class="is-on">All</span><span>Bouquets</span><span>Plants</span><span>Dried</span></div>
        <div class="shop-grid">
          ${[['florist-peony', 'Peony stems', '$65', true], ['florist-tulips', 'Pink tulips', '$38'], ['florist-dried', 'Dried posy', '$42'], ['florist-bouquet', 'Spring bouquet', '$45']]
            .map(([img, name, price, saved]) => `
            <div class="shop-item">
              <span class="shop-media">${photo(img, '', 480, 480)}<i class="${saved ? 'is-on' : ''}">${icon('i-heart-o')}</i></span>
              <b>${name}</b><small>${price}</small>
            </div>`)
            .join('')}
        </div>
        <div class="shop-tabbar"><span class="is-on">${icon('i-home')}Shop</span><span>${icon('i-search')}Search</span><span>${icon('i-heart-o')}Saved</span><span>${icon('i-user')}Account</span></div>`,
    };

    const appScreen = (d) => `
      <div class="phone">
        <div class="phone-body">
          <div class="phone-screen ap ap--${d.id}">${APP_SCREENS[d.id]()}</div>
        </div>
      </div>`;

    const render = (d) => {
      const a = d.app;
      panel.setAttribute('aria-labelledby', `ind-tab-${d.id}`);
      panel.innerHTML = `
        <div class="ind-copy">
          <span class="ind-kicker">${icon(d.icon)}${d.name}</span>
          <h3>${d.headline}</h3>
          <p>${d.desc}</p>
          <ul class="ind-features">
            ${d.features.map((f) => `<li><span class="tick">${icon('i-check')}</span>${f}</li>`).join('')}
          </ul>
          <div class="ind-foot">
            <div class="ind-metric"><b>${d.metric}</b><span>${d.metricLabel}</span></div>
            <a href="#contact" class="btn btn-dark btn-sm">${d.cta}<span class="btn-icon">${icon('i-arrow')}</span></a>
          </div>
        </div>
        <div class="ind-visual" style="--b:${a.color};--bt:${a.ink};--glow:${a.glow};" aria-hidden="true">
          ${appScreen(d)}
          <div class="float-pill">
            <span class="fp-ico">${icon(a.pill[0])}</span>
            <span><b>${a.pill[1]}</b><small>${a.pill[2]}</small></span>
          </div>
        </div>`;
      panel.classList.remove('is-switching');
      void panel.offsetWidth; // restart the entrance animation
      panel.classList.add('is-switching');
    };

    const tabs = $$('.ind-tab', tabList);
    const select = (id, { focus = false } = {}) => {
      const d = INDUSTRIES.find((x) => x.id === id);
      if (!d) return;
      tabs.forEach((t) => {
        const on = t.dataset.id === id;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        if (on) {
          if (focus) t.focus();
          if (window.innerWidth <= 1080) {
            tabList.scrollTo({ left: t.offsetLeft - tabList.clientWidth / 2 + t.offsetWidth / 2, behavior: reduceMotion ? 'auto' : 'smooth' });
          }
        }
      });
      render(d);
    };

    tabs.forEach((tab, k) => {
      tab.addEventListener('click', () => select(tab.dataset.id));
      tab.addEventListener('keydown', (e) => {
        const keys = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
        if (e.key in keys) {
          e.preventDefault();
          const next = tabs[(k + keys[e.key] + tabs.length) % tabs.length];
          select(next.dataset.id, { focus: true });
        } else if (e.key === 'Home' || e.key === 'End') {
          e.preventDefault();
          select(tabs[e.key === 'Home' ? 0 : tabs.length - 1].dataset.id, { focus: true });
        }
      });
    });

    render(INDUSTRIES[0]);
    panel.classList.remove('is-switching');

    // Footer links can jump straight to an industry
    $$('[data-goto-industry]').forEach((link) =>
      link.addEventListener('click', () => select(link.dataset.gotoIndustry))
    );
  }

  /* ------------------------------------------------------------------
     FAQ accordion
     ------------------------------------------------------------------ */
  $$('.faq-item').forEach((item) => {
    const q = $('.faq-q', item);
    q.addEventListener('click', () => {
      const open = !item.classList.contains('is-open');
      $$('.faq-item.is-open').forEach((other) => {
        if (other === item) return;
        other.classList.remove('is-open');
        $('.faq-q', other).setAttribute('aria-expanded', 'false');
      });
      item.classList.toggle('is-open', open);
      q.setAttribute('aria-expanded', String(open));
    });
  });

  /* ------------------------------------------------------------------
     Contact form
     - With data-endpoint set (e.g. a Formspree URL) it POSTs JSON.
     - Otherwise it opens the visitor's email app with everything filled in.
     ------------------------------------------------------------------ */
  const form = $('#contact-form');
  if (form) {
    const card = form.closest('.form-card');
    const success = $('.form-success', card);
    const successText = $('[data-success-text]', card);
    const note = $('[data-form-note]', form);
    const noteDefault = note.textContent;
    const submitBtn = $('button[type="submit"]', form);

    const rules = {
      name: [(v) => v.trim().length >= 2, 'Please tell us your name.'],
      email: [(v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()), 'Please enter a valid email address.'],
    };

    const setError = (input, message) => {
      const field = input.closest('.field');
      let err = $('.field-error', field);
      field.classList.toggle('has-error', Boolean(message));
      if (message) {
        if (!err) {
          err = document.createElement('p');
          err.className = 'field-error';
          err.id = `${input.id}-error`;
          field.appendChild(err);
        }
        err.textContent = message;
        input.setAttribute('aria-invalid', 'true');
        input.setAttribute('aria-describedby', err.id);
      } else {
        if (err) err.remove();
        input.removeAttribute('aria-invalid');
        input.removeAttribute('aria-describedby');
      }
    };

    const validate = () => {
      let firstInvalid = null;
      Object.entries(rules).forEach(([name, [test, message]]) => {
        const input = form.elements[name];
        const ok = test(input.value);
        setError(input, ok ? '' : message);
        if (!ok && !firstInvalid) firstInvalid = input;
      });
      if (firstInvalid) firstInvalid.focus();
      return !firstInvalid;
    };

    Object.keys(rules).forEach((name) => {
      const input = form.elements[name];
      input.addEventListener('input', () => {
        if (input.closest('.field').classList.contains('has-error') && rules[name][0](input.value)) setError(input, '');
      });
    });

    const showSuccess = (message) => {
      successText.textContent = message;
      form.hidden = true;
      success.hidden = false;
      success.focus();
    };

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      note.textContent = noteDefault;
      note.classList.remove('is-error');
      if (!validate()) return;

      const data = new FormData(form);
      const payload = {
        name: data.get('name').trim(),
        email: data.get('email').trim(),
        business: (data.get('business') || '').trim(),
        type: data.get('type') || '',
        services: data.getAll('services').join(', '),
        budget: data.get('budget') || '',
        message: (data.get('message') || '').trim(),
      };
      const endpoint = form.dataset.endpoint;
      const email = form.dataset.email;

      submitBtn.disabled = true;
      try {
        if (endpoint) {
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify(payload),
          });
          if (!res.ok) throw new Error(`Request failed with ${res.status}`);
          showSuccess("We'll get back to you within 24 hours with ideas and next steps.");
        } else {
          const subject = `New project enquiry: ${payload.business || payload.name}`;
          const body = [
            `Name: ${payload.name}`,
            `Email: ${payload.email}`,
            `Business: ${payload.business || '-'}`,
            `Business type: ${payload.type || '-'}`,
            `Looking for: ${payload.services || '-'}`,
            `Budget: ${payload.budget || '-'}`,
            '',
            payload.message || '',
          ].join('\n');
          window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
          showSuccess(`Your email app should open with your message ready to send. If it didn't, email us at ${email}.`);
        }
      } catch (err) {
        note.textContent = `Something went wrong sending your message. Please email us at ${email}.`;
        note.classList.add('is-error');
      } finally {
        submitBtn.disabled = false;
      }
    });

    $('[data-form-reset]', card).addEventListener('click', () => {
      form.reset();
      success.hidden = true;
      form.hidden = false;
      form.elements.name.focus();
    });
  }

  // Initial paint for scroll-driven effects
  runScroll();
})();
