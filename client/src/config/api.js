/**
 * Central API configuration
 * Defaults to http://localhost:5000 in local development if VITE_API_BASE_URL is not set.
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
