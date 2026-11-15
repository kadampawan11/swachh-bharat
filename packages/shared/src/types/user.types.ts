import { UserRole } from '../constants/statuses';
export interface User {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: UserRole;
  avatarUrl: string | null;
  isActive: boolean;
  createdAt: string;
}
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}
