import { fetchApi } from '@/lib/api-client';
import { RegisterPayload, LoginPayload } from '@richup/shared-types';

export const authApi = {
  login: (data: LoginPayload) => fetchApi<{ access_token: string; user: any }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  register: (data: RegisterPayload) => fetchApi<{ access_token: string; user: any }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  guestLogin: (username: string) => fetchApi<{ access_token: string; user: any }>('/auth/guest', {
    method: 'POST',
    body: JSON.stringify({ username }),
  }),

  getProfile: () => fetchApi<any>('/auth/me'),
};
