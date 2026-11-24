/* Industry landing pages: the savings calculators.
   Each page has <div data-calc="<slug>"> with range inputs (data-key) and outputs (data-out="big", data-out="lines").
   The maths for each industry lives in FORMULAS below. Everything runs on the visitor's numbers only. */
(() => {
  'use strict';

  const money = (n) => `$${Math.round(n).toLocaleString('en-US')}`;
  const count = (n) => Math.round(n).toLocaleString('en-US');

  // v = the slider values by data-key. Returns the big number and the lines under it.
  const FORMULAS = {
    restaurants: (v) => {
      const commission = (v.sales * v.rate) / 100;
      const kept = (commission * v.shift) / 100;
      return {
        big: money(kept * 12),
        lines: [
          `You pay about ${money(commission)} a month in app commission today.`,
          `Move ${v.shift}% of those orders to your own site and keep about ${money(kept)} a month.`,
        ],
      };
    },
    barbershops: (v) => {
      const lostYear = v.noshows * v.price * 52;
      return {
        big: money((lostYear * v.saved) / 100),
        lines: [
          `No-shows cost your shop about ${money(lostYear / 12)} a month today.`,
          `That’s about ${count(v.noshows * 52)} empty chairs a year.`,
        ],
      };
    },
    'salons-spas': (v) => {
      const extraVisits = (v.clients * 52 * v.lift) / 100;
      return {
        big: money(extraVisits * v.ticket),
        lines: [
          `You book about ${money((v.clients * v.ticket * 52) / 12)} a month today.`,
          `${v.lift}% more visits is about ${count(extraVisits)} extra appointments a year.`,
        ],
      };
    },
    'dental-clinics': (v) => {
      const patients = (v.calls * 52 * v.book) / 100;
      return {
        big: money(patients * v.value),
        lines: [
          `About ${count(patients)} patients a year who might otherwise call another clinic.`,
          `Based on ${v.calls} missed or after-hours calls a week.`,
        ],
      };
    },
    contractors: (v) => {
      const jobs = (v.leads * v.close * 12) / 100;
      return {
        big: money(jobs * v.job),
        lines: [
          `About ${count(jobs)} won jobs a year from website quote requests.`,
          `Each extra job is worth about ${money(v.job)} on average.`,
        ],
      };
    },
    'fitness-studios': (v) => ({
      big: money(v.kept * 12 * v.fee),
      lines: [
        `Your memberships bring in about ${money(v.members * v.fee)} a month today.`,
        `Keeping ${v.kept} more members a month adds up to ${count(v.kept * 12)} more members by month 12.`,
      ],
    }),
    'retail-shops': (v) => {
      const sales = v.orders * 52 * v.basket;
      return {
        big: money(sales),
        lines: [
          `About ${money(sales / 12)} a month in online sales.`,
          v.fee
            ? `On a marketplace charging ${v.fee}%, you’d pay about ${money((sales * v.fee) / 100)} a year in fees. With your own store, you keep it.`
            : 'No marketplace fees: every sale is yours.',
        ],
      };
    },
  };

  document.querySelectorAll('[data-calc]').forEach((calc) => {
    const formula = FORMULAS[calc.dataset.calc];
    if (!formula) return;
    const inputs = Array.from(calc.querySelectorAll('input[type="range"]'));
    const big = calc.querySelector('[data-out="big"]');
    const lines = calc.querySelector('[data-out="lines"]');

    const show = (input) => {
      const { prefix = '', suffix = '' } = input.dataset;
      const value = Number(input.value);
      const out = calc.querySelector(`[data-show="${input.dataset.key}"]`);
      if (out) out.textContent = `${prefix}${value.toLocaleString('en-US')}${suffix}`;
      const min = Number(input.min);
      const max = Number(input.max);
      input.style.setProperty('--fill', `${((value - min) / (max - min)) * 100}%`);
    };

    const update = () => {
      const v = {};
      inputs.forEach((input) => {
        v[input.dataset.key] = Number(input.value);
        show(input);
      });
      const result = formula(v);
      big.textContent = result.big;
      lines.innerHTML = result.lines.map((l) => `<li>${l}</li>`).join('');
    };

    inputs.forEach((input) => input.addEventListener('input', update));
    update();
  });
})();
