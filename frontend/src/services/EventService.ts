import { eventApi } from '../api/axios';
import type { Event, Registration } from '../types/models';

export const EventService = {
  getEventById: async (id: string) => {
    const response = await eventApi.get<Event>(`/event/${id}`);
    return response.data;
  },

  getAllEvents: async () => {
    // Assuming a generic GET /event endpoint exists, adjust as needed. 
    // Wait, the backend EventController has /event/month/{month} and /event/student/{rollNumber}
    const response = await eventApi.get<Event[]>('/event/all');
    return response.data;
  },

  addEvent: async (eventData: Partial<Event>) => {
    const response = await eventApi.post<Event>('/event/add', eventData);
    return response.data;
  },

  updateEvent: async (id: string, eventData: Partial<Event>) => {
    const response = await eventApi.put<string>(`/event/update/${id}`, eventData);
    return response.data;
  },

  deleteEvent: async (id: string, facultyId: string) => {
    const response = await eventApi.delete<string>(`/event/delete/${id}/${facultyId}`);
    return response.data;
  },

  // Missing endpoints like register or get my registrations from backend were called in EventDetails
  getMyRegistrations: async () => {
    const response = await eventApi.get<Registration[]>('/events/my-registrations');
    return response.data;
  },

  registerForEvent: async (eventId: string, payload: any) => {
    const response = await eventApi.post(`/events/${eventId}/register`, payload);
    return response.data;
  },

  withdrawRegistration: async (eventId: string) => {
    const response = await eventApi.delete(`/events/${eventId}/withdraw`);
    return response.data;
  }
};
