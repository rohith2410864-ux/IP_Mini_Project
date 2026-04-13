import { studentApi } from '../api/axios';
import type { LoginResponse, StudentRegisterPayload } from '../types/models';

export const StudentService = {
  login: async (credentials: { email: string; password: string }): Promise<LoginResponse> => {
    const response = await studentApi.post<string>('/student/login', credentials);
    if (response.data !== 'Login Successful') {
      throw new Error('Invalid student credentials');
    }
    return {
      token: `student:${credentials.email}`,
      user: { role: 'user' as const, email: credentials.email, department: 'CSE' } // Example mapping
    };
  },

  register: async (studentData: StudentRegisterPayload) => {
    const response = await studentApi.post<StudentRegisterPayload>('/student/register', studentData);
    return response.data;
  }
};
