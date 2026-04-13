import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';

// Environment variables fallback to typical local ports if not defined.
const API_GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL;
const EVENT_SERVICE_URL = import.meta.env.VITE_EVENT_SERVICE_URL || 'http://localhost:8083';
const STUDENT_SERVICE_URL = import.meta.env.VITE_STUDENT_SERVICE_URL || 'http://localhost:8082';
const FACULTY_SERVICE_URL = import.meta.env.VITE_FACULTY_SERVICE_URL || 'http://localhost:8081';

// Helper to determine the correct base URL
const getBaseURL = (service: 'event' | 'student' | 'faculty' | 'gateway' = 'gateway') => {
    if (service === 'gateway' && API_GATEWAY_URL) return API_GATEWAY_URL;
    switch (service) {
        case 'event': return EVENT_SERVICE_URL;
        case 'student': return STUDENT_SERVICE_URL;
        case 'faculty': return FACULTY_SERVICE_URL;
        default: return EVENT_SERVICE_URL;
    }
};

const createApiInstance = (service: 'event' | 'student' | 'faculty' | 'gateway'): AxiosInstance => {
    const instance = axios.create({
        baseURL: getBaseURL(service),
        headers: {
            'Content-Type': 'application/json',
        }
    });

    instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers = config.headers ?? {};
            (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
        }
        if (typeof config.url === 'string' && service === 'event') {
            if (config.url === '/events') config.url = '/event/events';
            else if (config.url.startsWith('/events/')) config.url = `/event${config.url}`;
            else if (config.url.startsWith('/admin/')) config.url = `/event${config.url}`;
            else if (config.url === '/registrations') config.url = '/event/registrations';
            else if (config.url.startsWith('/payments/')) config.url = '/event/unsupported-payments';

            const isEventWrite = config.method && ['post', 'put', 'patch'].includes(config.method.toLowerCase());
            if (isEventWrite && typeof config.data === 'object' && config.data) {
                const data = config.data as Record<string, unknown>;
                if ('title' in data || 'venue' in data || 'startDate' in data) {
                    const storedUser = localStorage.getItem('user');
                    let parsedUser: { email?: string } | null = null;
                    if (storedUser) {
                        try {
                            parsedUser = JSON.parse(storedUser) as { email?: string };
                        } catch {
                            parsedUser = null;
                        }
                    }
                    config.data = {
                        ...data,
                        eventName: (data.title as string) ?? data.eventName,
                        location: (data.venue as string) ?? data.location,
                        date: (data.startDate as string) ?? data.date,
                        facultyId: (data.facultyId as string) ?? parsedUser?.email ?? 'admin',
                    };
                }
            }
        }
        return config;
    });

    instance.interceptors.response.use((response) => {
        if (service !== 'event') return response;

        const responseUrl = response.config.url ?? '';

        const mapEvent = (ev: any) => {
            if (!ev || typeof ev !== 'object') return ev;
            return {
                ...ev,
                _id: ev._id ?? ev.id,
                title: ev.title ?? ev.eventName ?? '',
                venue: ev.venue ?? ev.location ?? '',
                startDate: ev.startDate ?? ev.date ?? '',
                category: ev.category ?? 'General',
                type: ev.type ?? 'common',
                status: ev.status ?? 'open',
                isPaid: ev.isPaid ?? false,
                amount: ev.amount ?? 0,
                isTeamEvent: ev.isTeamEvent ?? false,
                minTeamSize: ev.minTeamSize ?? 1,
                maxTeamSize: ev.maxTeamSize ?? 1,
                maxSeats: ev.maxSeats ?? 0,
                time: ev.time ?? '',
            };
        };

        const mapRegistration = (reg: any) => {
            if (!reg || typeof reg !== 'object') return reg;
            return {
                ...reg,
                _id: reg._id ?? reg.id,
                eventId: mapEvent(reg.eventId),
                userId: reg.userId ?? {
                    name: reg.userName ?? reg.userEmail ?? 'Student',
                    email: reg.userEmail ?? '',
                    department: reg.userDepartment ?? 'N/A',
                },
                attendanceStatus: reg.attendanceStatus ?? 'pending',
                responses: reg.responses ?? [],
            };
        };

        const isRegistrationResponse =
            responseUrl.includes('/event/events/my-registrations') ||
            responseUrl.includes('/event/registrations');

        const isEventResponse =
            responseUrl.includes('/event/events') ||
            responseUrl.includes('/event/all') ||
            /\/event\/[^/]+$/.test(responseUrl);

        if (isRegistrationResponse) {
            if (Array.isArray(response.data)) {
                response.data = response.data.map(mapRegistration);
            } else {
                response.data = mapRegistration(response.data);
            }
            return response;
        }

        if (isEventResponse) {
            if (Array.isArray(response.data)) {
                response.data = response.data.map(mapEvent);
            } else {
                response.data = mapEvent(response.data);
            }
        }
        return response;
    });

    return instance;
};

// Export pre-configured instances for different services if an API gateway is not present
export const api = createApiInstance('event'); // Main app currently talks directly to event-service
export const eventApi = createApiInstance('event');
export const studentApi = createApiInstance('student');
export const facultyApi = createApiInstance('faculty');
