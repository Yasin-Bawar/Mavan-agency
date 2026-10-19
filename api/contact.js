/* Mavan — contact form endpoint for Vercel (POST /api/contact).
   All the logic lives in lib/contact.js; Netlify uses netlify/functions/contact.mjs. */

import { handleContact } from '../lib/contact.js';

export default async function handler(req, res) {
  const result = await handleContact({
    method: req.method,
    origin: req.headers.origin,
    host: req.headers.host,
    body: req.body,
    env: process.env,
  });
  for (const [name, value] of Object.entries(result.headers || {})) res.setHeader(name, value);
  return res.status(result.status).json(result.body);
}
