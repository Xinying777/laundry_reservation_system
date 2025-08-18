// Lightweight fetch wrapper with sensible defaults.
// You can swap this to axios easily, but keeping fetch avoids extra deps.

import { API_BASE, WITH_CREDENTIALS } from './config';

const jsonHeaders = { 'Content-Type': 'application/json' };

/** Build an absolute API URL safely */
const url = (path) => {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${p}`;
};

/** Handle HTTP / JSON errors in one place */
async function handle(res) {
  // Non-2xx → throw with details
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    let message = `HTTP ${res.status}`;
    try {
      const parsed = text ? JSON.parse(text) : null;
      if (parsed?.message) message += ` - ${parsed.message}`;
    } catch (_) {
      if (text) message += ` - ${text}`;
    }
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }
  // Try JSON; fall back to text
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) return res.json();
  return res.text();
}

export const api = {
  // Export API_BASE for debugging
  API_BASE,
  
  /** GET /api/... */
  async get(path) {
    const res = await fetch(url(path), {
      method: 'GET',
      credentials: WITH_CREDENTIALS ? 'include' : 'same-origin',
    });
    return handle(res);
  },

  /** POST /api/...  with JSON body */
  async post(path, body) {
    const res = await fetch(url(path), {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify(body ?? {}),
      credentials: WITH_CREDENTIALS ? 'include' : 'same-origin',
    });
    return handle(res);
  },

  /** PUT /api/... */
  async put(path, body) {
    const res = await fetch(url(path), {
      method: 'PUT',
      headers: jsonHeaders,
      body: JSON.stringify(body ?? {}),
      credentials: WITH_CREDENTIALS ? 'include' : 'same-origin',
    });
    return handle(res);
  },

  /** DELETE /api/... */
  async del(path) {
    const res = await fetch(url(path), {
      method: 'DELETE',
      credentials: WITH_CREDENTIALS ? 'include' : 'same-origin',
    });
    return handle(res);
  },
};

export { API_BASE };
