import { z } from 'zod';
export const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().optional(),
  phone: z.string().regex(/^[6-9]\d{9}$/).optional(),
  password: z.string().min(6).max(100),
}).refine(d => d.email || d.phone, { message: 'Email or phone required' });
export const loginSchema = z.object({
  identifier: z.string().min(3),
  password: z.string().min(6),
});
export const otpSendSchema = z.object({ phone: z.string().regex(/^[6-9]\d{9}$/) });
export const otpVerifySchema = z.object({
  phone: z.string().regex(/^[6-9]\d{9}$/),
  otp: z.string().length(6),
  name: z.string().min(2).optional(),
});
