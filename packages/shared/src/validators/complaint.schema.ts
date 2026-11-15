import { z } from 'zod';
import { COMPLAINT_CATEGORIES } from '../constants/categories';
export const createComplaintSchema = z.object({
  title: z.string().min(5).max(150),
  description: z.string().min(10).max(1000),
  category: z.enum(COMPLAINT_CATEGORIES),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.string().optional(),
  pincode: z.string().regex(/^\d{6}$/).optional(),
  imageUrls: z.array(z.string()).max(5).optional(),
});
export const updateStatusSchema = z.object({
  status: z.enum(['PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED', 'CLOSED']),
  remarks: z.string().max(500).optional(),
  resolutionImageUrls: z.array(z.string()).max(3).optional(),
});
