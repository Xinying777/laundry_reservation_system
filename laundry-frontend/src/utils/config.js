// Centralized app-wide config.
// Prefer REACT_APP_API_URL; otherwise fall back to same-origin at runtime.

const envBase = process.env.REACT_APP_API_URL;
// window is only available in browser runtime
const runtimeBase = (typeof window !== 'undefined' && window.location?.origin) ? window.location.origin : '';

if (!envBase && !runtimeBase) {
  // Optional: fail fast in non-browser build-time if nothing is configured
  // throw new Error('No API base resolved. Set REACT_APP_API_URL or run in a browser.');
}

export const API_BASE = (envBase || runtimeBase).replace(/\/+$/, '');
export const WITH_CREDENTIALS = false; // keep false unless your backend uses cookies
