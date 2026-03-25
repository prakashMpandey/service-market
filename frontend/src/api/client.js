import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const client = axios.create({
  baseURL: BASE_URL,
});

// Track if we're currently refreshing to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Attach access token to every request
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('access');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401, try to refresh the token (only once)
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    // If not a 401 or already retried, reject immediately
    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    // If we're already refreshing, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then(token => {
        original.headers.Authorization = `Bearer ${token}`;
        return client(original);
      }).catch(err => Promise.reject(err));
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const refresh = localStorage.getItem('refresh');
      if (!refresh) {
        throw new Error('No refresh token');
      }

      const { data } = await axios.post(`${BASE_URL}/users/refresh/`, { refresh });
      localStorage.setItem('access', data.access);

      processQueue(null, data.access);

      original.headers.Authorization = `Bearer ${data.access}`;
      return client(original);
    } catch (refreshError) {
      processQueue(refreshError, null);

      // Clear tokens and notify the app about forced logout
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');
      localStorage.removeItem('user');

      // Dispatch custom event to notify AuthContext about logout
      window.dispatchEvent(new CustomEvent('auth:logout'));

      // Redirect to login
      window.location.href = '/login';

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default client;
