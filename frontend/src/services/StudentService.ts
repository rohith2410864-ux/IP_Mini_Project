import { studentApi } from '../api/axios';
import type { LoginResponse, StudentRegisterPayload } from '../types/models';

export const StudentService = {
  login: async (credentials: { email: string; password: string }): Promise<LoginResponse> => {
    const response = await studentApi.post<{ token: string }>('/login', credentials);
    if (!response.data?.token) {
      throw new Error('Invalid login response');
    }
    return {
      token: response.data.token,
      user: { role: 'user' as const, email: credentials.email, department: 'CSE' } // Example mapping
    };
  },

  register: async (studentData: StudentRegisterPayload) => {
    const response = await studentApi.post<StudentRegisterPayload>('/register', studentData);
    return response.data;
  }
};
