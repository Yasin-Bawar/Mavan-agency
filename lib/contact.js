/* Mavan — contact form logic, shared by the Netlify and Vercel functions.
   Validates an enquiry and sends it to our inbox through Resend.

   Environment variables (set on the host, never in the code):
     RESEND_API_KEY  required. A Resend API key with "Sending access".
     CONTACT_TO      optional. Where enquiries go.  Default: hello@mavan.app
     CONTACT_FROM    optional. Sender on our verified Resend domain.
                     Default: "Mavan Website <website@mavan.app>"
*/

const RESEND_URL = 'https://api.resend.com/emails';

// Sites allowed to post here, besides the deployment's own host (previews, localhost)
const ALLOWED_HOSTS = ['mavan.app', 'www.mavan.app'];

const LIMITS = { name: 100, email: 200, business: 150, type: 60, budget: 60, message: 5000 };
const SERVICES = ['Website', 'Booking system', 'Online ordering', 'Mobile app', 'Branding & SEO', 'Something else'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Drop control characters (keeping newlines and tabs), trim and cap the length
const clean = (value, max) =>
  String(value ?? '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim()
    .slice(0, max);
const oneLine = (value) => value.replace(/\s+/g, ' ');
const escapeHtml = (value) =>
  value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const reply = (status, body, headers) => ({ status, body, headers });

/**
 * @param {{ method: string, origin?: string|null, host?: string|null, body: unknown, env: Record<string, string|undefined> }} req
 * @returns {Promise<{ status: number, body: object, headers?: Record<string, string> }>}
 */
export async function handleContact({ method, origin, host, body, env }) {
  if (method !== 'POST') return reply(405, { ok: false, error: 'Method not allowed.' }, { Allow: 'POST' });

  // Browsers always send Origin on a POST: refuse submissions made from other websites
  if (origin) {
    let originHost = '';
    try {
      originHost = new URL(origin).host;
    } catch {
      /* malformed origin, refused below */
    }
    if (originHost !== host && !ALLOWED_HOSTS.includes(originHost)) return reply(403, { ok: false, error: 'Not allowed.' });
  }

  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = null;
    }
  }
  if (!body || typeof body !== 'object') return reply(400, { ok: false, error: 'Invalid request.' });

  // Spam traps: a hidden field people never see, and a form filled in too fast to be human.
  // Bots get a normal-looking success so they don't learn to adapt.
  if (clean(body.website, 200) || !(Number(body.elapsed) >= 2000)) return reply(200, { ok: true });

  const services = (Array.isArray(body.services) ? body.services : String(body.services ?? '').split(','))
    .map((s) => clean(s, 40))
    .filter((s) => SERVICES.includes(s));
  const data = {
    name: oneLine(clean(body.name, LIMITS.name)),
    email: clean(body.email, LIMITS.email),
    business: oneLine(clean(body.business, LIMITS.business)),
    type: oneLine(clean(body.type, LIMITS.type)),
    budget: oneLine(clean(body.budget, LIMITS.budget)),
    message: clean(body.message, LIMITS.message),
    services,
  };

  if (data.name.length < 2) return reply(400, { ok: false, field: 'name', error: 'Please tell us your name.' });
  if (!EMAIL_RE.test(data.email)) return reply(400, { ok: false, field: 'email', error: 'Please enter a valid email address.' });

  if (!env.RESEND_API_KEY) {
    console.error('Contact form: RESEND_API_KEY is not set');
    return reply(500, { ok: false, error: 'Email is not set up yet.' });
  }

  const rows = [
    ['Name', data.name],
    ['Email', data.email],
    ['Business', data.business],
    ['Business type', data.type],
    ['Looking for', data.services.join(', ')],
    ['Budget', data.budget],
  ];
  const subject = `New enquiry: ${data.business || data.name}${services.length ? ` · ${services.join(', ')}` : ''}`.slice(0, 150);
  const text = [...rows.map(([k, v]) => `${k}: ${v || '-'}`), '', 'Message:', data.message || '(no message)'].join('\n');
  const html = `<div style="font-family:Inter,Arial,sans-serif;color:#0d0d0d;max-width:560px">
  <p style="margin:0 0 16px;font-size:13px;color:#6b6b67">New enquiry from the mavan.app contact form</p>
  <table style="border-collapse:collapse;width:100%;font-size:15px">
    ${rows
      .map(
        ([k, v]) =>
          `<tr><td style="padding:8px 12px 8px 0;color:#6b6b67;white-space:nowrap;vertical-align:top">${k}</td><td style="padding:8px 0;font-weight:600">${escapeHtml(v || '-')}</td></tr>`
      )
      .join('\n    ')}
  </table>
  <p style="margin:20px 0 6px;font-size:13px;color:#6b6b67">Message</p>
  <div style="padding:14px 16px;border-radius:12px;background:#f5f5f3;font-size:15px;line-height:1.55;white-space:pre-wrap">${escapeHtml(data.message || '(no message)')}</div>
  <p style="margin:20px 0 0;font-size:13px;color:#6b6b67">Reply to this email to answer ${escapeHtml(data.name)} directly.</p>
</div>`;

  try {
    const response = await fetch(RESEND_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: env.CONTACT_FROM || 'Mavan Website <website@mavan.app>',
        to: [env.CONTACT_TO || 'hello@mavan.app'],
        reply_to: data.email,
        subject,
        text,
        html,
      }),
    });
    if (!response.ok) {
      console.error('Contact form: Resend responded', response.status, await response.text());
      return reply(502, { ok: false, error: "We couldn't send your message right now." });
    }
    return reply(200, { ok: true });
  } catch (err) {
    console.error('Contact form: request to Resend failed', err);
    return reply(502, { ok: false, error: "We couldn't send your message right now." });
  }
}
