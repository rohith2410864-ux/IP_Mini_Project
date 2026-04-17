import { facultyApi } from '../api/axios';
import type { FacultyRegisterPayload, LoginResponse } from '../types/models';

export const FacultyService = {
  login: async (credentials: { email: string; password: string }): Promise<LoginResponse> => {
    const response = await facultyApi.post<{ token: string }>('/login', credentials);
    if (!response.data?.token) {
      throw new Error('Invalid login response');
    }
    return {
      token: response.data.token,
      user: { role: 'faculty' as const, email: credentials.email } // match backend role
    };
  },

  register: async (facultyData: FacultyRegisterPayload) => {
    const response = await facultyApi.post<FacultyRegisterPayload>('/register', facultyData);
    return response.data;
  }
};
