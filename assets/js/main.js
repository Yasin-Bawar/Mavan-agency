/* Mavan — site interactions (no dependencies) */
(() => {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // The Dari page (/afg/) sets <html lang="fa-AF" dir="rtl" data-base="../">
  const root = document.documentElement;
  const isFa = root.lang.startsWith('fa');
  const isRtl = root.dir === 'rtl';
  const locale = isFa ? 'fa-AF' : 'en-US';
  const base = root.dataset.base || '';
  const icon = (id) => `<svg class="i" aria-hidden="true"><use href="#${id}"/></svg>`;
  const photo = (name, cls, w, h) =>
    `<img class="${cls}" src="${base}assets/img/photos/${name}.jpg" alt="" width="${w}" height="${h}" loading="lazy" decoding="async">`;

  // Language switch: remember the choice, so mavan.app opens the Dari page for people who picked Dari
  $$('[data-lang]').forEach((link) =>
    link.addEventListener('click', () => {
      try {
        localStorage.setItem('mavan-lang', link.dataset.lang);
      } catch {
        /* storage blocked: the link still goes to the other language */
      }
    })
  );

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
  $$('[data-next-month]').forEach((el) => (el.textContent = nextMonth.toLocaleString(locale, { month: 'long', calendar: 'gregory' })));
  $$('[data-year]').forEach((el) => (el.textContent = now.getFullYear().toLocaleString(locale, { useGrouping: false })));

  /* ------------------------------------------------------------------
     Hero: the light streaks drift slowly; pause them while the hero is off screen
     ------------------------------------------------------------------ */
  const hero = $('.hero');
  if (hero) new IntersectionObserver(([entry]) => hero.classList.toggle('is-paused', !entry.isIntersecting)).observe(hero);

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
      // Dari letters join up, so the word slides as one piece instead of letter by letter
      const parts = isFa ? [w.textContent] : [...w.textContent];
      w.innerHTML = parts.map((ch, k) => `<span style="--k:${k}">${ch}</span>`).join('');
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
    value.toLocaleString(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
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
      metric: '0%',
      metricLabel: 'commission on orders through your own site',
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
      metric: '24/7',
      metricLabel: 'booking, even after you close for the day',
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
      metric: '1 min',
      metricLabel: 'for a client to book a treatment online',
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
      metric: '1 app',
      metricLabel: 'for classes, memberships and check-in',
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
      metric: '3 taps',
      metricLabel: 'to book a check-up from any phone',
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
      metric: 'Same day',
      metricLabel: 'local delivery and click & collect',
      cta: 'Get an online store',
      app: {
        color: '#3d5a40', ink: '#ffffff', glow: 'rgba(61, 90, 64, 0.22)',
        pill: ['i-bag', 'Order on its way', 'Peony stems · local delivery'],
      },
    },
  ];

  // On /afg/ the tabs show the businesses we build for in Afghanistan, in everyday Afghan Dari
  const INDUSTRIES_FA = [
    {
      id: 'restaurants',
      name: 'رستورانت و تالار',
      icon: 'i-utensils',
      count: 'فرمایش، ریزرف، منوی QR',
      headline: 'فرمایش بیشتر، میزهای پُر، <em>بدون کمیشن.</em>',
      desc: 'ویب‌سایتی که اشتهای آدم ره باز می‌کنه، با فرمایش آنلاین و ریزرف میز و تالار؛ تا مشتری‌ها مستقیم از خود تان فرمایش بدن، نه از برنامه‌های واسطه.',
      features: ['فرمایش آنلاین و رسانیدن', 'ریزرف میز و تالار', 'منوی QR', 'نظرها و نقشهٔ گوگل'],
      metric: '۰٪',
      metricLabel: 'کمیشن از فرمایش‌های سایت خود تان',
      cta: 'ویب‌سایت رستورانت می‌خوام',
      app: { color: '#1f3a2e', ink: '#f4ecdf', glow: 'rgba(214, 64, 42, 0.22)' },
      pill: ['i-bag', 'فرمایش نو، ۵۲ دالر', 'ساعت ۷:۱۵ شام می‌برن'],
    },
    {
      id: 'hotels',
      name: 'هوتل و مهمانخانه',
      icon: 'i-bed',
      count: 'ریزرف اتاق، پرداخت، مهمان‌ها',
      headline: 'اتاق‌ها پُر، <em>بدون واسطه.</em>',
      desc: 'ویب‌سایت و سیستم ریزرف که مهمان‌ها از داخل و خارج کشور خود شان اتاق ریزرف کنن و پیسه بدن؛ شما هم اتاق‌ها، قیمت‌ها و مهمان‌ها ره از یک جای مدیریت کنین.',
      features: ['ریزرف آنلاین اتاق', 'تقویم اتاق‌ها و قیمت‌ها', 'پرداخت و پیش‌پرداخت', 'ویب‌سایت دو زبانه'],
      metric: '۲۴/۷',
      metricLabel: 'ریزرف اتاق، حتی نیمه‌شب',
      cta: 'ویب‌سایت هوتل می‌خوام',
      app: { color: '#1d2a3a', ink: '#f3e7d3', glow: 'rgba(201, 161, 91, 0.28)' },
      pill: ['i-bed', 'اتاق ریزرف شد', 'سویت فامیلی، ۲ شب، ۲۲۰ دالر'],
    },
    {
      id: 'realestate',
      name: 'رهنمای معاملات',
      icon: 'i-home',
      count: 'لست ملک‌ها، جستجو، بازدید',
      headline: 'ملک تان، <em>جلوی چشم خریدار.</em>',
      desc: 'ویب‌سایت و برنامه با لست حویلی، آپارتمان و زمین برای خرید، کرایه و گروی؛ با عکس، قیمت و نقشه، تا مشتری‌ها خود شان بپالن و وقت بازدید بگیرن.',
      features: ['لست ملک‌ها با عکس و قیمت', 'خرید، کرایه و گروی', 'جستجو با فلتر', 'گرفتن وقت بازدید'],
      metric: '۳ کلیک',
      metricLabel: 'تا مشتری وقت بازدید بگیره',
      cta: 'ویب‌سایت املاک می‌خوام',
      app: { color: '#1f5a43', ink: '#ffffff', glow: 'rgba(31, 111, 74, 0.24)' },
      pill: ['i-home', 'بازدید نو ریزرف شد', 'حویلی کارته پروان، صبا ساعت ۱۰'],
    },
    {
      id: 'hospitals',
      name: 'شفاخانه',
      icon: 'i-hospital',
      count: 'نوبت، بخش‌ها، لابراتوار',
      headline: 'نوبت منظم، <em>مریض راضی.</em>',
      desc: 'سیستم نوبت برای همه بخش‌ها، برنامهٔ مریض‌ها و نتیجهٔ لابراتوار آنلاین؛ تا صف‌ها کوتاه شوه و داکترها وقت بیشتر برای مریض داشته باشن.',
      features: ['نوبت آنلاین برای هر بخش', 'نمبر نوبت زنده روی موبایل', 'نتیجهٔ لابراتوار در برنامه', 'پنل داکترها و کارمندان'],
      metric: '۱ برنامه',
      metricLabel: 'برای نوبت، لابراتوار و راپور',
      cta: 'سیستم شفاخانه می‌خوام',
      app: { color: '#0f6f73', ink: '#ffffff', glow: 'rgba(15, 139, 141, 0.24)' },
      pill: ['i-hospital', 'نتیجهٔ لابراتوار آماده اس', 'آزمایش خون، احمد رحیمی'],
    },
    {
      id: 'clinics',
      name: 'کلینیک‌ها',
      icon: 'i-tooth',
      count: 'دندان، چشم، جلدی و بیشتر',
      headline: 'زنگ کمتر، <em>مریض بیشتر.</em>',
      desc: 'برای کلینیک دندان، چشم، جلدی و کلینیک‌های تخصصی: ویب‌سایتی آرام و قابل اعتماد که مریض‌ها در آن نوبت می‌گیرن، فورم‌ها ره پیش از آمدن پُر می‌کنن و وقت معاینهٔ بعدی به یاد شان داده می‌شه.',
      features: ['نوبت آنلاین', 'فورم‌های دیجیتال', 'یادآوری با مسیج', 'پروفایل داکترها'],
      metric: '۳ کلیک',
      metricLabel: 'تا از هر موبایل نوبت گرفته شوه',
      cta: 'ویب‌سایت کلینیک می‌خوام',
      app: { color: '#1f5eff', ink: '#ffffff', glow: 'rgba(31, 94, 255, 0.2)' },
      pill: ['i-calendar', 'مریض نو نوبت گرفت', 'پنجشنبه ۹:۳۰، داکتر حمید'],
    },
    {
      id: 'companies',
      name: 'شرکت‌ها و تجارت کلان',
      icon: 'i-building',
      count: 'پنل مدیریت، فروش، کارمندان',
      headline: 'همه کار شرکت، <em>در یک پنل.</em>',
      desc: 'ویب‌سایت رسمی شرکت همراه با پنل مدیریت: فروش، فرمایش‌ها، گدام و حاضری کارمندان؛ همه آنلاین و از موبایل هم دیده می‌شه.',
      features: ['ویب‌سایت رسمی شرکت', 'پنل فروش و فرمایش‌ها', 'گدام و موجودی', 'حاضری و راپور کارمندان'],
      metric: 'هر روز',
      metricLabel: 'راپور فروش، خودکار روی موبایل',
      cta: 'سیستم شرکت می‌خوام',
      app: { color: '#101318', ink: '#34d399', glow: 'rgba(52, 211, 153, 0.24)' },
      pill: ['i-building', 'فرمایش عمدهٔ نو', '۴۸۰ کارتن، ۲٬۴۰۰ دالر'],
    },
  ];
  const INDUSTRY_LIST = isFa ? INDUSTRIES_FA : INDUSTRIES;

  const indRoot = $('[data-industries]');
  if (indRoot) {
    const tabList = $('.ind-tabs', indRoot);
    const panel = $('.ind-panel', indRoot);

    tabList.innerHTML = INDUSTRY_LIST.map(
      (d, k) => `
      <button class="ind-tab" type="button" role="tab" id="ind-tab-${d.id}" aria-controls="ind-panel" aria-selected="${k === 0}" tabindex="${k === 0 ? 0 : -1}" data-id="${d.id}">
        <span class="ind-ico">${icon(d.icon)}</span>
        <span>${d.name}<small>${d.count}</small></span>
        <span class="ind-go">${icon('i-arrow')}</span>
      </button>`
    ).join('');

    // Each industry gets its own app, laid out the way that kind of business actually works
    const APP_TEXT = {
      en: {
        clock: '9:41',
        restaurants: {
          deliverTo: 'Deliver to', address: 'Via Roma 21', hello: 'Buonasera, Sara', ask: 'What are you <em>craving</em> tonight?',
          chips: ['Pizza', 'Pasta', 'Antipasti', 'Dolci'], pick: "Chef's pick", photo: 'napoli-pizza', dish: 'Margherita DOP', dishMeta: 'Wood-fired · 12"', rating: '4.9', price: '$14',
          popular: 'Popular', seeAll: 'See all', dishes: [['pizza-diavola', 'Diavola', '$16'], ['pasta-pesto', 'Pesto Genovese', '$15'], ['tiramisu', 'Tiramisù', '$8']],
          cartCount: '2', viewCart: 'View cart', cartTotal: '$30.00',
        },
        barbershops: {
          title: 'Book appointment', step: 'Step 2/3', choose: 'Choose your barber',
          team: [['barber-marco', 'Marco', '4.9'], ['barber-leo', 'Leo', '4.8'], ['barber-andre', 'Andre', '4.9']], any: 'Any', anyNote: 'First free',
          service: 'Skin fade', serviceMeta: '45 min · $35', change: 'Change', month: 'October',
          days: [['Mon', '12'], ['Tue', '13'], ['Wed', '14'], ['Thu', '15'], ['Fri', '16']], dayOn: 2,
          afternoon: 'Afternoon', afternoonFree: '4 free', afternoonTimes: [['1:00'], ['2:15', 'is-off'], ['3:30', 'is-on'], ['4:00'], ['4:45', 'is-off'], ['5:30']],
          evening: 'Evening', eveningFree: '2 free', eveningTimes: [['6:00', 'is-off'], ['6:45'], ['7:30']],
          confirm: 'Confirm · Wed 3:30 PM', confirmNote: '$10 deposit today · free cancellation up to 24h',
        },
        salons: {
          name: 'Glow Studio', meta: 'Skin · Nails · Massage · 0.8 km', rating: '4.9', tabs: ['All', 'Face', 'Nails', 'Body'],
          items: [['salon-facial', 'Signature facial', '60 min · with Mia', '$85'], ['salon-nails', 'Gel manicure', '45 min · with Sofia', '$40', true], ['salon-massage', 'Hot stone massage', '90 min · with Ava', '$120']],
          count: '1 treatment', total: '$40', choose: 'Choose a time',
        },
        fitness: {
          greet: 'Good morning', hi: 'Hi, Alex', ring: '3/4', goal: 'Weekly goal', goalLine: '3 of 4 workouts',
          stats: ['<b>1,840</b> kcal', '<b>3h 20m</b> active'], today: "Today's classes", schedule: 'Schedule',
          when: '7:00 AM', feature: 'HIIT Burn', featureMeta: '45 min · Coach Dana · 4 spots left', join: 'Join',
          rows: [['gym-yoga', 480, 480, 'Power yoga', '12:30 PM · Studio 2', 'Waitlist', 'is-off'], ['gym-boxing', 480, 480, 'Boxing', '6:00 PM · 8 spots', 'Book', ''], ['gym-interior', 1000, 667, 'Open gym', 'Until 11 PM · 32 here now', 'Live', 'is-live']],
        },
        clinics: {
          greet: 'Good morning,', name: 'Emma Wilson', upcoming: 'Upcoming visit', confirmed: 'Confirmed', visit: 'Check-up &amp; clean',
          doc: 'Dr. James Patel', docMeta: 'General dentist · Room 2', date: 'Thu, Oct 15', time: '9:30 AM',
          form: 'Intake form', formMeta: '2 of 3 sections done', finish: 'Finish', book: 'Book a visit', month: 'October',
          week: [['M', '12', 1], ['T', '13', 1], ['W', '14', 0], ['T', '15', 1], ['F', '16', 1], ['S', '17', 0], ['S', '18', 0]], weekOn: 4,
          services: 'Services', seeAll: 'See all',
          items: [['dental-smile', 'Teeth whitening', '60 min · from $199'], ['dental-checkup', 'Hygiene clean', '30 min · insurance accepted']], bookItem: 'Book',
        },
        retail: {
          brand: 'Petal <em>&amp;</em> Stem', search: 'Search bouquets, plants…', promoNote: 'Same-day delivery', promo: 'Fresh flowers, <em>at your door today</em>', promoBy: 'Order by 2 PM',
          chips: ['All', 'Bouquets', 'Plants', 'Dried'],
          items: [['florist-peony', 'Peony stems', '$65', true], ['florist-tulips', 'Pink tulips', '$38'], ['florist-dried', 'Dried posy', '$42'], ['florist-bouquet', 'Spring bouquet', '$45']],
          tabs: ['Shop', 'Search', 'Saved', 'Account'],
        },
      },
      fa: {
        clock: '۹:۴۱',
        restaurants: {
          deliverTo: 'رسانیدن به', address: 'سرک گلبهار ۲۱', hello: 'شام بخیر، مریم', ask: 'امشب دل تان <em>چی</em> می‌خواد؟',
          chips: ['پلو', 'کباب', 'پیتزا', 'شیرینی'], pick: 'انتخاب آشپز', photo: 'afghan-palaw', dish: 'قابلی پلو', dishMeta: 'با گوشت گوسفند', rating: '۴٫۹', price: '۱۶ دالر',
          popular: 'پرطرفدار', seeAll: 'همه', dishes: [['afghan-kabob', 'کباب چوپان', '۱۸ دالر'], ['afghan-feast', 'دسترخوان فامیلی', '۶۵ دالر'], ['pizza-diavola', 'پیتزای مرغ', '۱۲ دالر']],
          cartCount: '۲', viewCart: 'دیدن فرمایش', cartTotal: '۳۰ دالر',
        },
        barbershops: {
          title: 'گرفتن نوبت', step: 'قدم ۲ از ۳', choose: 'سلمانی تانه انتخاب کنین',
          team: [['barber-marco', 'جاوید', '۴٫۹'], ['barber-leo', 'فرید', '۴٫۸'], ['barber-andre', 'نوید', '۴٫۹']], any: 'هر کی', anyNote: 'اولین خالی',
          service: 'فید کوتاه', serviceMeta: '۴۵ دقیقه، ۳۵ دالر', change: 'تغییر', month: 'اکتوبر',
          days: [['د', '۱۲'], ['س', '۱۳'], ['چ', '۱۴'], ['پ', '۱۵'], ['ج', '۱۶']], dayOn: 2,
          afternoon: 'بعد از چاشت', afternoonFree: '۴ وقت خالی', afternoonTimes: [['۱:۰۰'], ['۲:۱۵', 'is-off'], ['۳:۳۰', 'is-on'], ['۴:۰۰'], ['۴:۴۵', 'is-off'], ['۵:۳۰']],
          evening: 'شام', eveningFree: '۲ وقت خالی', eveningTimes: [['۶:۰۰', 'is-off'], ['۶:۴۵'], ['۷:۳۰']],
          confirm: 'تأیید، چهارشنبه ۳:۳۰', confirmNote: '۱۰ دالر پیش‌پرداخت، لغو مفت تا ۲۴ ساعت پیش',
        },
        salons: {
          name: 'سالون نگین', meta: 'پوست، ناخن، مساژ، ۰٫۸ کیلومتر', rating: '۴٫۹', tabs: ['همه', 'روی', 'ناخن', 'بدن'],
          items: [['salon-facial', 'فیشل مخصوص', '۶۰ دقیقه، با مینا', '۸۵ دالر'], ['salon-nails', 'مانیکور جل', '۴۵ دقیقه، با سحر', '۴۰ دالر', true], ['salon-massage', 'مساژ با سنگ گرم', '۹۰ دقیقه، با آرزو', '۱۲۰ دالر']],
          count: '۱ خدمت', total: '۴۰ دالر', choose: 'انتخاب وقت',
        },
        fitness: {
          greet: 'صبح بخیر', hi: 'سلام، احمد', ring: '۳/۴', goal: 'هدف این هفته', goalLine: '۳ از ۴ تمرین',
          stats: ['<b>۱٬۸۴۰</b> کالوری', '<b>۳:۲۰</b> ساعت فعال'], today: 'کلاس‌های امروز', schedule: 'تقسیم اوقات',
          when: '۷:۰۰ صبح', feature: 'کاردیو سخت', featureMeta: '۴۵ دقیقه، استاد سمیع، ۴ جای خالی', join: 'شامل شوین',
          rows: [['gym-yoga', 480, 480, 'یوگا', '۱۲:۳۰، سالون ۲', 'لست انتظار', 'is-off'], ['gym-boxing', 480, 480, 'بوکس', '۶:۰۰ شام، ۸ جای خالی', 'ریزرف', ''], ['gym-interior', 1000, 667, 'جم آزاد', 'تا ۱۱ شب، حالی ۳۲ نفر', 'زنده', 'is-live']],
        },
        clinics: {
          greet: 'صبح بخیر،', name: 'مریم احمدی', upcoming: 'نوبت بعدی', confirmed: 'تأیید شد', visit: 'معاینه و پاک‌کاری',
          doc: 'داکتر حمید', docMeta: 'داکتر دندان، اتاق ۲', date: 'پنجشنبه، ۱۵ اکتوبر', time: '۹:۳۰ صبح',
          form: 'فورم معلومات', formMeta: '۲ از ۳ بخش تکمیل شد', finish: 'تکمیل', book: 'گرفتن نوبت', month: 'اکتوبر',
          week: [['د', '۱۲', 1], ['س', '۱۳', 1], ['چ', '۱۴', 0], ['پ', '۱۵', 1], ['ج', '۱۶', 1], ['ش', '۱۷', 0], ['ی', '۱۸', 0]], weekOn: 4,
          services: 'خدمات', seeAll: 'همه',
          items: [['dental-smile', 'سفید کردن دندان', '۶۰ دقیقه، از ۱۹۹ دالر'], ['dental-checkup', 'پاک‌کاری دندان', '۳۰ دقیقه، بیمه قبول اس']], bookItem: 'نوبت',
        },
        retail: {
          brand: 'گلستان', search: 'پالیدن دسته‌گل، گلدان…', promoNote: 'رسانیدن همو روز', promo: 'گل تازه، <em>امروز دم دروازهٔ تان</em>', promoBy: 'تا ساعت ۲ فرمایش بدین',
          chips: ['همه', 'دسته‌گل', 'گلدان', 'خشک'],
          items: [['florist-peony', 'گل پیونی', '۶۵ دالر', true], ['florist-tulips', 'لالهٔ گلابی', '۳۸ دالر'], ['florist-dried', 'دسته‌گل خشک', '۴۲ دالر'], ['florist-bouquet', 'دسته‌گل بهاری', '۴۵ دالر']],
          tabs: ['دوکان', 'پالیدن', 'پسندها', 'حساب'],
        },
        hotels: {
          name: 'هوتل سیمرغ', place: 'شهر نو، کابل', rating: '۴٫۸',
          dates: [['ورود', 'پنجشنبه ۱۴'], ['خروج', 'شنبه ۱۶'], ['مهمان', '۲ نفر']], rooms: 'اتاق‌ها', nights: '۲ شب',
          items: [['hotel-room', 'اتاق لوکس', '۲ نفر، بالکن و باغ', '۸۵ دالر'], ['hotel-suite', 'سویت فامیلی', '۴ نفر، منظرهٔ شهر', '۱۱۰ دالر', true], ['hotel-bed', 'اتاق دبل', '۲ نفر، با صبحانه', '۶۵ دالر']],
          totalLabel: '۲ شب، مجموع', total: '۲۲۰ دالر', book: 'ریزرف اتاق',
        },
        realestate: {
          kicker: 'رهنمای معاملات', name: 'املاک امید', title: 'خانهٔ دلخواه تانه <em>پیدا کنین</em>', search: 'کارته سه، شهر نو، خیرخانه…',
          seg: ['خرید', 'کرایه', 'گروی'], segOn: 1, tag: 'نو', home: 'حویلی دو منزله', place: 'کارته پروان', price: '۱٬۲۰۰ دالر', per: 'ماهانه',
          meta: ['۵ اتاق', '۴۵۰ متر', 'پارکینگ'],
          rows: [['apartment-living', 'آپارتمان ۳ اتاقه', 'شهر نو، منزل ۵', '۶۵۰ دالر'], ['house-modern', 'حویلی یک منزله', 'خیرخانه، سرک ۴', '۸۰۰ دالر']],
        },
        hospitals: {
          brand: 'شفاخانهٔ شفا', hi: 'سلام، احمد', queue: 'نوبت شما امروز', live: 'زنده', number: '۱۲', doc: 'داکتر فریده احمدی', dep: 'بخش اطفال، اتاق ۳',
          note: 'حالی نوبت ۹ اس؛ تقریباً ۲۰ دقیقه', deps: 'بخش‌ها', seeAll: 'همه',
          depList: [['i-heart', 'داخله'], ['i-users', 'اطفال'], ['i-user', 'نسایی و ولادی'], ['i-hospital', 'جراحی'], ['i-tooth', 'دندان'], ['i-flask', 'لابراتوار']],
          lab: 'نتیجهٔ لابراتوار آماده اس', labMeta: 'آزمایش خون، دیروز', view: 'دیدن',
        },
        companies: {
          kicker: 'پنل مدیریت', name: 'شرکت آریا', initial: 'آ', sales: 'فروش امروز', amount: '۱۲٬۴۸۰ دالر', up: '▲ ۱۸٪',
          bars: [38, 52, 44, 61, 49, 70, 58, 66, 74, 63, 82, 92],
          kpis: [['فرمایش‌ها', '۸۶'], ['مشتری نو', '۱۴'], ['حاضر', '۴۲/۴۵']], latest: 'فرمایش‌های تازه', seeAll: 'همه',
          orders: [['پ', 'شرکت پامیر', '۴۸۰ کارتن، ۲٬۴۰۰ دالر', 'در راه', 'is-way'], ['ک', 'کابل مارکیت', '۱۲۰ کارتن، ۶۵۰ دالر', 'تحویل شد', 'is-done'], ['ه', 'هوتل سیمرغ', '۳۰ کارتن، ۱۸۰ دالر', 'نو', 'is-new']],
        },
      },
    }[isFa ? 'fa' : 'en'];

    const statusBar = (cls = '') =>
      `<div class="ph-status ${cls}"><span>${APP_TEXT.clock}</span><span class="ph-island"></span><span class="ph-sig"><i></i><i></i><i></i></span></div>`;
    const stars = (n) => `${icon('i-star')}${n}`;

    const APP_SCREENS = {
      // Food ordering: location, categories, a featured dish and a live cart
      restaurants: (t = APP_TEXT.restaurants) => `
        ${statusBar()}
        <div class="rest-top">
          <span class="rest-loc"><small>${t.deliverTo}</small><b>${icon('i-pin')}${t.address}${icon('i-chev-d')}</b></span>
          <span class="rest-cart">${icon('i-bag')}<i>${t.cartCount}</i></span>
        </div>
        <p class="rest-hello"><small>${t.hello}</small>${t.ask}</p>
        <div class="rest-chips">${t.chips.map((c, k) => `<span${k ? '' : ' class="is-on"'}>${c}</span>`).join('')}</div>
        <div class="rest-feature">
          <div class="rest-feature-media">${photo(t.photo, '', 900, 900)}<span>${t.pick}</span></div>
          <div class="rest-feature-info">
            <span><b>${t.dish}</b><small>${t.dishMeta}${isFa ? '، ' : ' · '}${stars(t.rating)}</small></span>
            <span class="rest-add">${t.price}<i>${icon('i-plus')}</i></span>
          </div>
        </div>
        <div class="rest-label"><b>${t.popular}</b><small>${t.seeAll}</small></div>
        <div class="rest-row">
          ${t.dishes.map(([img, name, price]) => `<div class="rest-dish">${photo(img, '', 480, 480)}<b>${name}</b><small>${price}</small></div>`).join('')}
        </div>
        <div class="rest-bar"><i>${t.cartCount}</i><span>${t.viewCart}</span><b>${t.cartTotal}</b></div>`,

      // Booking flow: pick a barber, a service, a day and a time
      barbershops: (t = APP_TEXT.barbershops) => `
        ${statusBar()}
        <div class="barb-nav"><span class="barb-back">${icon('i-chev-l')}</span><b>${t.title}</b><small>${t.step}</small></div>
        <div class="barb-steps"><i class="is-on"></i><i class="is-on"></i><i></i></div>
        <div class="barb-label"><b>${t.choose}</b></div>
        <div class="barb-team">
          ${t.team
            .map(([img, name, rating], k) => `<span class="${k ? '' : 'is-on'}"><span class="barb-face">${photo(img, '', 360, 360)}${k ? '' : `<i>${icon('i-check')}</i>`}</span><b>${name}</b><small>${stars(rating)}</small></span>`)
            .join('')}
          <span><span class="barb-face barb-any">${icon('i-users')}</span><b>${t.any}</b><small>${t.anyNote}</small></span>
        </div>
        <div class="barb-service">${photo('barber-fade', '', 480, 480)}<span><b>${t.service}</b><small>${t.serviceMeta}</small></span><em>${t.change}</em></div>
        <div class="barb-label"><b>${t.month}</b><small>${icon('i-chev-l')}${icon('i-chev-r')}</small></div>
        <div class="barb-days">
          ${t.days.map(([day, n], k) => `<span class="${k === t.dayOn ? 'is-on' : ''}"><small>${day}</small><b>${n}</b></span>`).join('')}
        </div>
        <div class="barb-label"><b>${t.afternoon}</b><small>${t.afternoonFree}</small></div>
        <div class="barb-times">${t.afternoonTimes.map(([time, cls]) => `<span${cls ? ` class="${cls}"` : ''}>${time}</span>`).join('')}</div>
        <div class="barb-label"><b>${t.evening}</b><small>${t.eveningFree}</small></div>
        <div class="barb-times">${t.eveningTimes.map(([time, cls]) => `<span${cls ? ` class="${cls}"` : ''}>${time}</span>`).join('')}</div>
        <div class="barb-cta"><b>${t.confirm}</b><small>${t.confirmNote}</small></div>`,

      // Spa menu: full-bleed photo, treatment list, sticky booking bar
      salons: (t = APP_TEXT.salons) => `
        <div class="spa-hero">${photo('salon-facial-hero', '', 1100, 917)}</div>
        ${statusBar('ph-status--over')}
        <div class="spa-actions"><span>${icon('i-chev-l')}</span><span>${icon('i-heart-o')}</span></div>
        <div class="spa-sheet">
          <div class="spa-head">
            <span><strong>${t.name}</strong><small>${t.meta}</small></span>
            <span class="spa-rate">${stars(t.rating)}</span>
          </div>
          <div class="spa-tabs">${t.tabs.map((c, k) => `<span${k ? '' : ' class="is-on"'}>${c}</span>`).join('')}</div>
          <div class="spa-list">
            ${t.items
              .map(([img, name, meta, price, on]) => `
              <div class="spa-item${on ? ' is-on' : ''}">
                ${photo(img, '', 480, 480)}
                <span><b>${name}</b><small>${meta}</small><em>${price}</em></span>
                <i>${icon(on ? 'i-check' : 'i-plus')}</i>
              </div>`)
              .join('')}
          </div>
        </div>
        <div class="spa-bar"><span><small>${t.count}</small><b>${t.total}</b></span><em>${t.choose}${icon('i-arrow')}</em></div>`,

      // Member app: weekly goal, today's classes, scan-to-check-in
      fitness: (t = APP_TEXT.fitness) => `
        ${statusBar()}
        <div class="gym-top">
          <span><small>${t.greet}</small><b>${t.hi}</b></span>
          <span class="gym-bell">${icon('i-bell')}<i></i></span>
        </div>
        <div class="gym-goal">
          <span class="gym-ring">
            <svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="16"/><circle class="on" cx="20" cy="20" r="16" pathLength="100" stroke-dasharray="75 100"/></svg>
            <b>${t.ring}</b>
          </span>
          <span class="gym-goal-txt">
            <small>${t.goal}</small><b>${t.goalLine}</b>
            <span class="gym-stats">${t.stats.map((x) => `<span>${x}</span>`).join('')}</span>
          </span>
        </div>
        <div class="gym-label"><b>${t.today}</b><small>${t.schedule}</small></div>
        <div class="gym-feature">
          ${photo('gym-hiit', '', 480, 480)}
          <span class="gym-when">${icon('i-clock')}${t.when}</span>
          <div class="gym-feature-info"><span><b>${t.feature}</b><small>${t.featureMeta}</small></span><em>${t.join}</em></div>
        </div>
        <div class="gym-list">
          ${t.rows
            .map(([img, w, h, name, meta, action, cls]) => `<div class="gym-row">${photo(img, '', w, h)}<span><b>${name}</b><small>${meta}</small></span><em${cls ? ` class="${cls}"` : ''}>${cls === 'is-live' ? '<i></i>' : ''}${action}</em></div>`)
            .join('')}
        </div>
        <div class="gym-tabbar"><span class="is-on">${icon('i-home')}</span><span>${icon('i-calendar')}</span><span class="gym-scan">${icon('i-qr')}</span><span>${icon('i-trend')}</span><span>${icon('i-user')}</span></div>`,

      // Patient app: confirmed visit with the dentist, availability, services
      clinics: (t = APP_TEXT.clinics) => `
        ${statusBar()}
        <div class="dent-top">
          <span><small>${t.greet}</small><b>${t.name}</b></span>
          <span class="dent-bell">${icon('i-bell')}<i></i></span>
        </div>
        <div class="dent-next">
          <div class="dent-next-head"><small>${t.upcoming}</small><span>${icon('i-check')}${t.confirmed}</span></div>
          <strong>${t.visit}</strong>
          <div class="dent-doc">${photo('dentist-patel', '', 240, 240)}<span><b>${t.doc}</b><small>${t.docMeta}</small></span></div>
          <div class="dent-when"><span>${icon('i-calendar')}${t.date}</span><span>${icon('i-clock')}${t.time}</span></div>
        </div>
        <div class="dent-form">
          <span class="dent-form-ico">${icon('i-pen')}</span>
          <span><b>${t.form}</b><small>${t.formMeta}</small><span class="dent-prog"><i></i></span></span>
          <em>${t.finish}</em>
        </div>
        <div class="dent-label"><b>${t.book}</b><small>${t.month}</small></div>
        <div class="dent-week">
          ${t.week.map(([day, n, open], k) => `<span class="${k === t.weekOn ? 'is-on' : open ? 'is-open' : ''}"><small>${day}</small><b>${n}</b></span>`).join('')}
        </div>
        <div class="dent-label"><b>${t.services}</b><small>${t.seeAll}</small></div>
        <div class="dent-list">
          ${t.items.map(([img, name, meta]) => `<div class="dent-item">${photo(img, '', 480, 480)}<span><b>${name}</b><small>${meta}</small></span><em>${t.bookItem}</em></div>`).join('')}
        </div>
        <div class="dent-tabbar"><span class="is-on">${icon('i-home')}</span><span>${icon('i-calendar')}</span><span>${icon('i-chat')}</span><span>${icon('i-user')}</span></div>`,

      // Online store: search, delivery promo, product grid
      retail: (t = APP_TEXT.retail) => `
        ${statusBar()}
        <div class="shop-top">
          <span class="shop-btn">${icon('i-menu')}</span>
          <strong>${t.brand}</strong>
          <span class="shop-btn">${icon('i-bag')}<i>${isFa ? '۱' : '1'}</i></span>
        </div>
        <div class="shop-search">${icon('i-search')}<span>${t.search}</span><i>${icon('i-sliders')}</i></div>
        <div class="shop-promo">
          <span class="shop-promo-txt"><small>${t.promoNote}</small><strong>${t.promo}</strong><span>${t.promoBy}</span></span>
          ${photo('florist-shop', '', 1000, 667)}
        </div>
        <div class="shop-chips">${t.chips.map((c, k) => `<span${k ? '' : ' class="is-on"'}>${c}</span>`).join('')}</div>
        <div class="shop-grid">
          ${t.items
            .map(([img, name, price, saved]) => `
            <div class="shop-item">
              <span class="shop-media">${photo(img, '', 480, 480)}<i class="${saved ? 'is-on' : ''}">${icon('i-heart-o')}</i></span>
              <b>${name}</b><small>${price}</small>
            </div>`)
            .join('')}
        </div>
        <div class="shop-tabbar">${['i-home', 'i-search', 'i-heart-o', 'i-user'].map((ic, k) => `<span${k ? '' : ' class="is-on"'}>${icon(ic)}${t.tabs[k]}</span>`).join('')}</div>`,

      // Hotel: room photo, dates, room choice and the booking bar (Dari page only)
      hotels: (t = APP_TEXT.hotels) => `
        <div class="hot-hero">${photo('hotel-lobby', '', 1100, 733)}</div>
        ${statusBar('ph-status--over')}
        <div class="hot-actions"><span>${icon('i-chev-r')}</span><span>${icon('i-heart-o')}</span></div>
        <div class="hot-sheet">
          <div class="hot-head">
            <span><strong>${t.name}</strong><small>${icon('i-pin')}${t.place}</small></span>
            <span class="hot-rate">${stars(t.rating)}</span>
          </div>
          <div class="hot-dates">${t.dates.map(([k, v]) => `<span><small>${k}</small><b>${v}</b></span>`).join('')}</div>
          <div class="hot-label"><b>${t.rooms}</b><small>${t.nights}</small></div>
          <div class="hot-rooms">
            ${t.items
              .map(([img, name, meta, price, on]) => `<div class="hot-room${on ? ' is-on' : ''}">${photo(img, '', 480, 320)}<span><b>${name}</b><small>${meta}</small></span><em>${price}</em></div>`)
              .join('')}
          </div>
        </div>
        <div class="hot-bar"><span><small>${t.totalLabel}</small><b>${t.total}</b></span><em>${t.book}${icon('i-arrow')}</em></div>`,

      // Real estate: search, buy / rent / gerawi, a featured home and more listings
      realestate: (t = APP_TEXT.realestate) => `
        ${statusBar()}
        <div class="re-top">
          <span><small>${t.kicker}</small><b>${t.name}</b></span>
          <span class="re-bell">${icon('i-bell')}</span>
        </div>
        <p class="re-title">${t.title}</p>
        <div class="re-search">${icon('i-search')}<span>${t.search}</span><i>${icon('i-sliders')}</i></div>
        <div class="re-seg">${t.seg.map((x, k) => `<span${k === t.segOn ? ' class="is-on"' : ''}>${x}</span>`).join('')}</div>
        <div class="re-card">
          <div class="re-media">${photo('house-villa', '', 1100, 825)}<em class="re-tag">${t.tag}</em><span class="re-fav">${icon('i-heart-o')}</span></div>
          <div class="re-info"><span><b>${t.home}</b><small>${icon('i-pin')}${t.place}</small></span><em>${t.price}<small> ${t.per}</small></em></div>
          <div class="re-meta">${t.meta.map((x) => `<span>${x}</span>`).join('')}</div>
        </div>
        ${t.rows.map((r) => `<div class="re-row">${photo(r[0], '', 720, 480)}<span><b>${r[1]}</b><small>${r[2]}</small></span><em>${r[3]}</em></div>`).join('')}`,

      // Hospital: live queue number, departments and a lab result
      hospitals: (t = APP_TEXT.hospitals) => `
        ${statusBar()}
        <div class="hos-top">
          <span><small>${t.brand}</small><b>${t.hi}</b></span>
          <span class="hos-bell">${icon('i-bell')}<i></i></span>
        </div>
        <div class="hos-queue">
          <div class="hos-q-head"><small>${t.queue}</small><span>${t.live}</span></div>
          <div class="hos-q-main"><strong>${t.number}</strong><span><b>${t.doc}</b><small>${t.dep}</small></span>${photo('doctor-woman', '', 240, 240)}</div>
          <div class="hos-q-bar"><i></i></div>
          <small class="hos-q-note">${t.note}</small>
        </div>
        <div class="hos-label"><b>${t.deps}</b><small>${t.seeAll}</small></div>
        <div class="hos-deps">${t.depList.map(([ic, name]) => `<span><i>${icon(ic)}</i>${name}</span>`).join('')}</div>
        <div class="hos-lab"><span class="hos-lab-ico">${icon('i-flask')}</span><span><b>${t.lab}</b><small>${t.labMeta}</small></span><em>${t.view}</em></div>`,

      // Company: today's sales, key numbers and the latest orders
      companies: (t = APP_TEXT.companies) => `
        ${statusBar()}
        <div class="co-top">
          <span><small>${t.kicker}</small><b>${t.name}</b></span>
          <span class="co-av">${t.initial}</span>
        </div>
        <div class="co-hero">
          <small>${t.sales}</small>
          <div class="co-hero-row"><strong>${t.amount}</strong><span class="co-up">${t.up}</span></div>
          <div class="co-chart">${t.bars.map((h, k) => `<i style="height:${h}%"${k === t.bars.length - 1 ? ' class="is-on"' : ''}></i>`).join('')}</div>
        </div>
        <div class="co-kpis">${t.kpis.map(([k, v]) => `<span><small>${k}</small><b>${v}</b></span>`).join('')}</div>
        <div class="co-label"><b>${t.latest}</b><small>${t.seeAll}</small></div>
        <div class="co-list">
          ${t.orders.map(([ini, name, meta, state, cls]) => `<div class="co-row"><i>${ini}</i><span><b>${name}</b><small>${meta}</small></span><em class="${cls}">${state}</em></div>`).join('')}
        </div>`,
    };

    const appScreen = (d) => `
      <div class="phone">
        <div class="phone-body">
          <div class="phone-screen ap ap--${d.id}">${APP_SCREENS[d.id]()}</div>
        </div>
      </div>`;

    const render = (d) => {
      const a = d.app;
      const pill = d.pill || a.pill;
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
            <span class="fp-ico">${icon(pill[0])}</span>
            <span><b>${pill[1]}</b><small>${pill[2]}</small></span>
          </div>
        </div>`;
      panel.classList.remove('is-switching');
      void panel.offsetWidth; // restart the entrance animation
      panel.classList.add('is-switching');
    };

    const tabs = $$('.ind-tab', tabList);
    const select = (id, { focus = false } = {}) => {
      const d = INDUSTRY_LIST.find((x) => x.id === id);
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
        const keys = { ArrowDown: 1, ArrowRight: isRtl ? -1 : 1, ArrowUp: -1, ArrowLeft: isRtl ? 1 : -1 };
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

    render(INDUSTRY_LIST[0]);
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
     - With data-endpoint set (/api/contact) it POSTs JSON, which api/contact.js emails via Resend.
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
    const submitLabel = submitBtn.firstChild;
    const submitText = submitLabel.textContent;
    const openedAt = performance.now();

    const T = isFa
      ? {
          name: 'لطفاً نام تانه بنویسین.',
          email: 'لطفاً یک ایمیل درست بنویسین.',
          sending: 'روان می‌شه…',
          sent: 'در ۲۴ ساعت با ایده‌ها و قدم‌های بعدی به تان تماس می‌گیریم.',
          mailto: (e) => `برنامهٔ ایمیل تان باید با پیام آماده باز شوه. اگه باز نشد، به ${e} ایمیل روان کنین.`,
          failed: 'پیام تان روان نشد.',
          retry: 'لطفاً دوباره کوشش کنین یا به این آدرس ایمیل روان کنین: ',
        }
      : {
          name: 'Please tell us your name.',
          email: 'Please enter a valid email address.',
          sending: 'Sending…',
          sent: "We'll get back to you within 24 hours with ideas and next steps.",
          mailto: (e) => `Your email app should open with your message ready to send. If it didn't, email us at ${e}.`,
          failed: 'Something went wrong sending your message.',
          retry: 'Please try again, or email us at ',
        };

    const rules = {
      name: [(v) => v.trim().length >= 2, T.name],
      email: [(v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()), T.email],
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

    // Error note with a working email link, so a failed send never loses the lead
    const showSendError = (email, message) => {
      const link = document.createElement('a');
      link.href = `mailto:${email}`;
      link.textContent = email;
      note.replaceChildren(`${message} ${T.retry}`, link, '.');
      note.classList.add('is-error');
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
        services: data.getAll('services'),
        budget: data.get('budget') || '',
        message: (data.get('message') || '').trim(),
      };
      const endpoint = form.dataset.endpoint;
      const email = form.dataset.email;

      submitBtn.disabled = true;
      if (endpoint) submitLabel.textContent = T.sending;
      try {
        if (endpoint) {
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({ ...payload, page: form.dataset.page || '', website: data.get('website') || '', elapsed: Math.round(performance.now() - openedAt) }),
          });
          const result = await res.json().catch(() => ({}));
          if (res.ok && result.ok) {
            showSuccess(T.sent);
          } else if (res.status === 400 && result.field && form.elements[result.field]) {
            setError(form.elements[result.field], isFa ? T[result.field] || result.error : result.error);
            form.elements[result.field].focus();
          } else {
            showSendError(email, (!isFa && result.error) || T.failed);
          }
        } else {
          const subject = `New project enquiry: ${payload.business || payload.name}`;
          const body = [
            `Name: ${payload.name}`,
            `Email: ${payload.email}`,
            `Business: ${payload.business || '-'}`,
            `Business type: ${payload.type || '-'}`,
            `Looking for: ${payload.services.join(', ') || '-'}`,
            `Budget: ${payload.budget || '-'}`,
            '',
            payload.message || '',
          ].join('\n');
          window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
          showSuccess(T.mailto(email));
        }
      } catch (err) {
        showSendError(email, T.failed);
      } finally {
        submitBtn.disabled = false;
        submitLabel.textContent = submitText;
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
