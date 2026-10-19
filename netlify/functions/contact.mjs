/* Mavan — contact form endpoint for Netlify (POST /api/contact).
   All the logic lives in lib/contact.js; Vercel uses api/contact.js. */

import { handleContact } from '../../lib/contact.js';

export default async (req) => {
  const result = await handleContact({
    method: req.method,
    origin: req.headers.get('origin'),
    host: req.headers.get('host'),
    body: req.method === 'POST' ? await req.text() : null,
    env: process.env,
  });
  return Response.json(result.body, { status: result.status, headers: result.headers });
};

export const config = { path: '/api/contact' };
