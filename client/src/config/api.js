/**
 * Central API configuration
 * Automatically detects whether we are in local development or production.
 * In production (e.g. on Vercel), requests to /api/* default to the same origin (relative URL),
 * avoiding mixed content, localhost connection failures on mobile devices, and CORS issues.
 * Can also be overridden explicitly via the VITE_API_BASE_URL environment variable.
 */
const isBrowser = typeof window !== 'undefined';
const isLocalhost = isBrowser && (
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1' ||
  window.location.hostname === '0.0.0.0'
);

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL !== undefined && import.meta.env.VITE_API_BASE_URL !== ''
    ? import.meta.env.VITE_API_BASE_URL
    : (isLocalhost ? 'http://localhost:5000' : '');
