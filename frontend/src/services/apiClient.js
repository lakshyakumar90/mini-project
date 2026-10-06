import axios from 'axios';

const TOKEN_KEY = 'devconnect_token';
export const AUTH_EXPIRED_EVENT = 'devconnect:unauthorized';

export const getStoredToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setStoredToken = (token) => {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignore (private mode etc.)
  }
};

/**
 * Shared axios factory — every API service must use this so auth works
 * cross-site (Vercel <-> Render) where third-party cookies get blocked.
 * - Attaches `Authorization: Bearer <token>` from localStorage
 * - 30s timeout so Render cold starts fail fast instead of hanging
 * - On 401 with a token present: clears the stale token and fires
 *   AUTH_EXPIRED_EVENT so the app can log out + redirect to /login
 */
export const createApi = (baseURL, defaultHeaders = {}) => {
  const api = axios.create({
    baseURL,
    withCredentials: true,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
      ...defaultHeaders,
    },
  });

  api.interceptors.request.use((config) => {
    const token = getStoredToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error?.response?.status === 401 && getStoredToken()) {
        setStoredToken(null);
        try {
          window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
        } catch {
          // ignore
        }
      }
      return Promise.reject(error);
    }
  );

  return api;
};
