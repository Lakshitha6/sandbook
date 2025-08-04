import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: '/choreo-apis/sandbook-social-media/backend/v1',
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
