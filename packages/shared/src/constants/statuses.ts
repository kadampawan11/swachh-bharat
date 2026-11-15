export const COMPLAINT_STATUSES = [
  'PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED', 'CLOSED',
] as const;
export type ComplaintStatus = typeof COMPLAINT_STATUSES[number];
export const STATUS_COLORS: Record<ComplaintStatus, string> = {
  PENDING: '#F44336',
  IN_PROGRESS: '#FF9800',
  RESOLVED: '#4CAF50',
  REJECTED: '#424242',
  CLOSED: '#9E9E9E',
};
export const USER_ROLES = ['USER', 'ADMIN', 'SUPER_ADMIN'] as const;
export type UserRole = typeof USER_ROLES[number];
