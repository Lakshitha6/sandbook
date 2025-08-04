import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://2d8042b8-0a21-4a70-a1e4-332303ca9cde-dev.e1-us-east-azure.choreoapis.dev/sandbook-social-media/backend/v1.0',
});

axiosInstance.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

export default axiosInstance;
