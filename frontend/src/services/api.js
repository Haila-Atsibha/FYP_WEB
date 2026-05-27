import axios from "axios";
import toast from "react-hot-toast";

// Trigger redeployment with updated root directory settings
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://quickserve-api.onrender.com",
  headers: {
    Accept: "application/json",
  },
  withCredentials: false,
  timeout: 60000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Let the browser set multipart boundaries automatically.
    if (typeof FormData !== "undefined" && config.data instanceof FormData) {
      config.headers = config.headers || {};
      delete config.headers["Content-Type"];
    } else {
      config.headers = config.headers || {};
      config.headers["Content-Type"] = "application/json";
    }

    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if error response exists
    if (error.response) {
      const { data, status } = error.response;
      
      // If backend explicitly provided an error message, use it
      if (data && data.message) {
        toast.error(data.message);
      } 
      // Handle generic 500 errors
      else if (status >= 500) {
        toast.error("Internal Server Error. Please try again later.");
      } 
      // Handle generic 4xx errors if no message provided
      else if (status >= 400) {
        toast.error("An error occurred. Please check your input.");
      }
    } else if (error.request) {
      // The request was made but no response was received
      toast.error("Network error. Please check your connection.");
    } else {
      // Something happened in setting up the request that triggered an Error
      toast.error("An unexpected error occurred.");
    }

    return Promise.reject(error);
  }
);

export default api;

