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
    if (!id) {
      console.error("Missing event ID for update");
      return;
    }
    const response = await eventApi.put<string>(`/events/${id}`, eventData);
    return response.data;
  },

  // ✅ FIXED DELETE (ONLY ID)
  deleteEvent: async (id: string) => {
    if (!id) {
      console.error("❌ Event ID is missing");
      return;
    }

    console.log("🗑️ Deleting event:", id);

    const response = await eventApi.delete<string>(`/events/${id}`);
    return response.data;
  },

  getMyRegistrations: async () => {
    const response = await eventApi.get<Registration[]>('/events/my-registrations');
    return response.data;
  },

  registerForEvent: async (eventId: string, payload: any) => {
    if (!eventId) {
      console.error("Missing eventId for registration");
      return;
    }

    const response = await eventApi.post(`/events/${eventId}/register`, payload);
    return response.data;
  },

  withdrawRegistration: async (eventId: string) => {
    if (!eventId) {
      console.error("Missing eventId for withdraw");
      return;
    }

    const response = await eventApi.delete(`/events/${eventId}/withdraw`);
    return response.data;
  }
};