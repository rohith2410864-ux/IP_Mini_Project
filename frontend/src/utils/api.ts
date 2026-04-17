import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from "axios";

// ✅ Faculty Service (Login/Auth)
export const facultyApi: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_FACULTY_SERVICE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Student Service
export const studentApi: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_STUDENT_SERVICE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Event Service
export const eventApi: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_EVENT_SERVICE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔐 Common Interceptor (Token)
const attachToken = (api: AxiosInstance) => {
  api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = localStorage.getItem("token");

      if (token) {
        config.headers = config.headers ?? {};
        (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response) {
        console.error("API ERROR:", error.response.status, error.response.data);
      } else {
        console.error("NETWORK ERROR:", error.message);
      }
      return Promise.reject(error);
    }
  );
};

// ✅ Apply interceptor to all services
attachToken(facultyApi);
attachToken(studentApi);
attachToken(eventApi);