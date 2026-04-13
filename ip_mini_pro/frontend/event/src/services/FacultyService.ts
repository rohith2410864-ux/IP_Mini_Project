import { facultyApi } from '../api/axios';
import type { FacultyRegisterPayload, LoginResponse } from '../types/models';

export const FacultyService = {
  login: async (credentials: { email: string; password: string }): Promise<LoginResponse> => {
    const response = await facultyApi.post<string>('/faculty/login', credentials);
    if (response.data !== 'Login Successful') {
      throw new Error('Invalid faculty credentials');
    }
    return {
      token: `faculty:${credentials.email}`,
      user: { role: 'admin' as const, email: credentials.email } // example
    };
  },

  register: async (facultyData: FacultyRegisterPayload) => {
    const response = await facultyApi.post<FacultyRegisterPayload>('/faculty/register', facultyData);
    return response.data;
  }
};
