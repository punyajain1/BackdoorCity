/**
 * Base URL for the backend API.
 * Set NEXT_PUBLIC_API_URL in .env.local (dev) or your hosting env vars (prod).
 */
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
