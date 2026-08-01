import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { storage } from './utils';
import { loadingBus } from './loadingBus';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

/** Extend axios config so callers can opt individual requests out of the slow-loading overlay. */
declare module 'axios' {
  export interface AxiosRequestConfig {
    /** Set true for silent background polls that shouldn't trigger the full-screen overlay. */
    skipLoadingIndicator?: boolean;
  }
}

/**
 * Only GET requests to these "browse the catalog" endpoints trigger the slow-loading
 * overlay. Everything else (orders, notifications, cart, profile, and every
 * POST/PUT/DELETE) is intentionally excluded — those are either background/secondary
 * data or user-initiated actions that already have their own inline loading state
 * (a button spinner, a skeleton, etc.), so a full-screen takeover would be overkill.
 */
const TRACKABLE_PATH_PREFIXES = ['/api/products', '/api/categories', '/api/search', '/api/brands'];

function isTrackableRequest(config: InternalAxiosRequestConfig): boolean {
  if (config.skipLoadingIndicator) return false;
  if ((config.method || 'get').toLowerCase() !== 'get') return false;
  const url = config.url || '';
  return TRACKABLE_PATH_PREFIXES.some((prefix) => url.startsWith(prefix));
}

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = storage.get('accessToken');
    if (token && config.headers) { config.headers.Authorization = `Bearer ${token}`; }
    if (isTrackableRequest(config)) loadingBus.start();
    return config;
  },
  (error) => {
    loadingBus.end();
    return Promise.reject(error);
  }
);

let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = [];
const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach((p) => { if (error) p.reject(error); else if (token) p.resolve(token); });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => {
    if (isTrackableRequest(response.config as InternalAxiosRequestConfig)) loadingBus.end();
    return response;
  },
  async (error: AxiosError) => {
    if (error.config && isTrackableRequest(error.config as InternalAxiosRequestConfig)) loadingBus.end();
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => { if (originalRequest.headers) originalRequest.headers.Authorization = `Bearer ${token}`; resolve(api(originalRequest)); },
            reject,
          });
        });
      }
      originalRequest._retry = true; isRefreshing = true;
      try {
        const refreshToken = storage.get('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/api/auth/refresh-token`, null, { headers: { Authorization: `Bearer ${refreshToken}` } });
          const { accessToken, refreshToken: newRefreshToken } = response.data.data;
          storage.set('accessToken', accessToken); storage.set('refreshToken', newRefreshToken);
          processQueue(null, accessToken);
          if (originalRequest.headers) originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        storage.remove('accessToken'); storage.remove('refreshToken'); storage.remove('user');
        window.location.href = '/';
        return Promise.reject(refreshError);
      } finally { isRefreshing = false; }
    }
    return Promise.reject(error);
  }
);

export default api;
export { API_BASE_URL };
