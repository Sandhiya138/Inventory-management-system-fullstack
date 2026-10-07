// Centralized HTTP API client for Spring Boot backend
// Supports dynamic VITE_API_URL for production cloud deployments (e.g. Render)
// and falls back gracefully to relative '/api' with Vite proxy for local development.

const getBaseApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
    const trimmed = envUrl.trim().replace(/\/+$/, '');
    return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
  }
  return '/api';
};

const BASE_URL = getBaseApiUrl();

const buildUrl = (endpoint, params = {}) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  let baseTarget;
  if (BASE_URL.startsWith('http://') || BASE_URL.startsWith('https://')) {
    baseTarget = new URL(`${BASE_URL}${cleanEndpoint}`);
  } else {
    const baseClean = BASE_URL.startsWith('/') ? BASE_URL : `/${BASE_URL}`;
    baseTarget = new URL(`${baseClean}${cleanEndpoint}`, window.location.origin);
  }

  Object.keys(params).forEach((key) => {
    if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
      baseTarget.searchParams.append(key, params[key]);
    }
  });

  return baseTarget.toString();
};

class ApiClient {
  getToken() {
    return localStorage.getItem('token') || '';
  }

  getHeaders(customHeaders = {}) {
    const token = this.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...customHeaders,
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  async handleResponse(response) {
    let json;
    try {
      json = await response.json();
    } catch {
      json = null;
    }

    if (!response.ok) {
      const errorMessage =
        (json && (json.message || json.error)) ||
        `HTTP Error ${response.status}: ${response.statusText}`;

      // Handle 401 Unauthorized - Token expired
      if (response.status === 401 && !window.location.pathname.includes('/login')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login?expired=true';
      }

      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = json;
      throw error;
    }

    // Backend returns ApiResponse wrapper: { success: true, message: "...", data: ... }
    return json?.data !== undefined ? json.data : json;
  }

  async fetchWithTimeout(url, options = {}, timeoutMs = 12000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeoutId);
      return response;
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        const timeoutError = new Error('Request timed out while connecting to backend server');
        timeoutError.status = 504;
        throw timeoutError;
      }
      throw err;
    }
  }

  async get(endpoint, params = {}) {
    try {
      const url = buildUrl(endpoint, params);
      const response = await this.fetchWithTimeout(url, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      return await this.handleResponse(response);
    } catch (err) {
      if (err.status) throw err;
      throw new Error(err.message || 'Unable to connect to backend server. Please verify backend is running.');
    }
  }

  async post(endpoint, data = {}) {
    try {
      const url = buildUrl(endpoint);
      const response = await this.fetchWithTimeout(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });
      return await this.handleResponse(response);
    } catch (err) {
      if (err.status) throw err;
      throw new Error(err.message || 'Unable to connect to backend server. Please verify backend is running.');
    }
  }

  async put(endpoint, data = {}) {
    try {
      const url = buildUrl(endpoint);
      const response = await this.fetchWithTimeout(url, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });
      return await this.handleResponse(response);
    } catch (err) {
      if (err.status) throw err;
      throw new Error(err.message || 'Unable to connect to backend server. Please verify backend is running.');
    }
  }

  async delete(endpoint) {
    try {
      const url = buildUrl(endpoint);
      const response = await this.fetchWithTimeout(url, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });
      return await this.handleResponse(response);
    } catch (err) {
      if (err.status) throw err;
      throw new Error(err.message || 'Unable to connect to backend server. Please verify backend is running.');
    }
  }
}

export const api = new ApiClient();
