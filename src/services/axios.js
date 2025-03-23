import axios from 'axios';

const axiosInstance = axios.create({
 baseURL: import.meta.env.VITE_API_URL,
 headers: {
   'Content-Type': 'application/json',
 },
});

// Request interceptor for adding tokens
axiosInstance.interceptors.request.use(
 (config) => {
   let token;
   const path = window.location.pathname;

   if (path.includes('/fcc_admin')) {
     token = localStorage.getItem('adminToken');
   } else if (path.includes('/fcc_staffroom') || path.includes('/fcc_classroom')) {
    token = localStorage.getItem('userToken');
  }

   if (token) {
     config.headers.Authorization = `Bearer ${token}`;
   }
   return config;
 },
 (error) => Promise.reject(error)
);

// Response interceptor for handling common errors
axiosInstance.interceptors.response.use(
 (response) => response,
 (error) => {
   if (error.response) {
     const path = window.location.pathname;
     
     // Handle 401 Unauthorized response
     if (error.response.status === 401) {
      if (path.includes('/fcc_admin')) {
        localStorage.removeItem('adminToken');
        window.location.href = '/admin';
      } else if (path.includes('/fcc_staffroom') || path.includes('/fcc_classroom')) {
        localStorage.removeItem('userToken');
        window.location.href = '/';
      }
    }
     
     // Handle 403 Forbidden response
     if (error.response.status === 403) {
       console.error('Access forbidden:', error.response.data);
     }
     
     // Handle 500 Server error
     if (error.response.status === 500) {
       console.error('Server error:', error.response.data);
     }
   } else if (error.request) {
     console.error('Network error:', error.request);
   } else {
     console.error('Error:', error.message);
   }
   
   return Promise.reject(error);
 }
);

export default axiosInstance;