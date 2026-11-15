import { api } from './api';
export const authService = {
  register: (data: { name: string; email?: string; phone?: string; password: string }) => api.post('/auth/register', data).then(r => r.data),
  login: (identifier: string, password: string) => api.post('/auth/login', { identifier, password }).then(r => r.data),
  adminLogin: (identifier: string, password: string) => api.post('/auth/admin/login', { identifier, password }).then(r => r.data),
  otpSend: (phone: string) => api.post('/auth/otp/send', { phone }).then(r => r.data),
  otpVerify: (phone: string, otp: string, name?: string) => api.post('/auth/otp/verify', { phone, otp, name }).then(r => r.data),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }).then(r => r.data),
  resetPassword: (token: string, password: string) => api.post('/auth/reset-password', { token, password }).then(r => r.data),
};
