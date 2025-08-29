import axios from 'axios';

export function installAxiosAuthInterceptor() {
  try {
    const apiBase = process.env.REACT_APP_API_URL || '';
    if (apiBase) {
      axios.defaults.baseURL = apiBase;
    }
  } catch {}

  // Set default header from existing token on boot
  try {
    const bootToken = localStorage.getItem('authToken');
    if (bootToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${bootToken}`;
      axios.defaults.headers.common['X-Auth-Token'] = bootToken;
    }
  } catch {}

  // Add Authorization header with Bearer token (no-op if JWT disabled)
  axios.interceptors.request.use((config) => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers = config.headers || {};
        config.headers['Authorization'] = `Bearer ${token}`;
        config.headers['X-Auth-Token'] = token;
      }
    } catch {}
    return config;
  });

  // If token expired or unauthorized, redirect to login
  axios.interceptors.response.use(
    (res) => res,
    (err) => {
      const status = err?.response?.status;
      if (status === 401) {
        try {
          localStorage.removeItem('authToken');
        } catch {}
      }
      return Promise.reject(err);
    }
  );
}


