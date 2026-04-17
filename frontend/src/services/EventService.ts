import { eventApi } from '../api/axios';
import type { Event, Registration } from '../types/models';

export const EventService = {
  getEventById: async (id: string) => {
    const response = await eventApi.get<Event>(`/events/${id}`);
    return response.data;
  },

  getAllEvents: async () => {
    const response = await eventApi.get<Event[]>('/events');
    return response.data;
  },

  addEvent: async (eventData: Partial<Event>) => {
    const response = await eventApi.post<Event>('/events', eventData);
    return response.data;
  },

  updateEvent: async (id: string, eventData: Partial<Event>) => {
    const response = await eventApi.put<string>(`/events/${id}`, eventData);
    return response.data;
  },

  deleteEvent: async (id: string, facultyId: string) => {
    const response = await eventApi.delete<string>(`/events/${id}/${facultyId}`);
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
