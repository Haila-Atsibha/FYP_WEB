import axios from "axios";

// central axios instance for communicating with external backend
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
  headers: {
    Accept: "application/json",
  },
  withCredentials: false,
  timeout: 20000,
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

export default api;

