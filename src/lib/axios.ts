import axios, { AxiosInstance, AxiosRequestConfig } from "axios";

/**
 * Custom Axios instance for API calls
 * Configured with base settings for the application
 */
const axiosInstance: AxiosInstance = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_APP_URL}/api`, // Base URL for all API calls
  timeout: 10000,   // 10 seconds timeout
  withCredentials: true, // Ensures cookies are sent with every request
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
});

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // You can add custom auth headers here if you move away from cookies
    // const token = localStorage.getItem('token');
    // if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    // Return only the data part of the response
    return response.data;
  },
  (error) => {
    // Global error handling
    const message = error.response?.data?.message || "Something went wrong";
    
    if (error.response?.status === 401) {
      // Optional: Handle unauthorized error (e.g., redirect to login)
      console.error("Unauthorized request - redirecting to login...");
    }

    return Promise.reject({
      ...error,
      message,
    });
  }
);

/**
 * Wrapper for API calls to allow easy customization
 */
export const api = {
  get: <T>(url: string, config?: AxiosRequestConfig) => 
    axiosInstance.get<any, T>(url, config),
    
  post: <T>(url: string, data?: any, config?: AxiosRequestConfig) => 
    axiosInstance.post<any, T>(url, data, config),
    
  put: <T>(url: string, data?: any, config?: AxiosRequestConfig) => 
    axiosInstance.put<any, T>(url, data, config),
    
  delete: <T>(url: string, config?: AxiosRequestConfig) => 
    axiosInstance.delete<any, T>(url, config),
    
  patch: <T>(url: string, data?: any, config?: AxiosRequestConfig) => 
    axiosInstance.patch<any, T>(url, data, config),
};

export default axiosInstance;