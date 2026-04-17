import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';

const requireEnv = (key: string): string => {
  const value = (import.meta.env as Record<string, string | undefined>)[key];
  if (!value) {
    throw new Error(`Missing required env variable: ${key}`);
  }
  return value.replace(/\/$/, '');
};

const FACULTY_BASE_URL = requireEnv('VITE_FACULTY_SERVICE_URL');
const STUDENT_BASE_URL = requireEnv('VITE_STUDENT_SERVICE_URL');
const EVENT_BASE_URL = requireEnv('VITE_EVENT_SERVICE_URL');

const attachInterceptors = (instance: AxiosInstance, serviceName: string): AxiosInstance => {
  instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers ?? {};
      (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
    }
    const fullUrl = `${config.baseURL ?? ''}${config.url ?? ''}`;
    console.log(`[${serviceName}] Request`, config.method?.toUpperCase(), fullUrl);
    return config;
  });

  instance.interceptors.response.use(
    (response) => {
      console.log(`[${serviceName}] Response`, response.status, response.config.url);
      return response;
    },
    (error: AxiosError<{ message?: string }>) => {
      const status = error.response?.status;
      const message =
        error.response?.data?.message ||
        error.message ||
        'Unknown API error';
      console.error(`[${serviceName}] Error`, { status, message, url: error.config?.url });
      return Promise.reject(error);
    },
  );

  return instance;
};

export const facultyApi = attachInterceptors(
  axios.create({
    baseURL: FACULTY_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
  }),
  'faculty',
);

export const studentApi = attachInterceptors(
  axios.create({
    baseURL: STUDENT_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
  }),
  'student',
);

export const eventApi = attachInterceptors(
  axios.create({
    baseURL: EVENT_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
  }),
  'event',
);

export const api = eventApi;
