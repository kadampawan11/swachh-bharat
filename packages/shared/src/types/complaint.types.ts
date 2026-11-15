import { ComplaintCategory } from '../constants/categories';
import { ComplaintStatus } from '../constants/statuses';
import { User } from './user.types';
export interface ComplaintImage {
  id: string;
  imageUrl: string;
  type: 'COMPLAINT' | 'RESOLUTION';
  sortOrder: number;
}
export interface Comment {
  id: string;
  content: string;
  authorRole: 'USER' | 'ADMIN';
  createdAt: string;
  author: Pick<User, 'id' | 'name'>;
}
export interface StatusHistory {
  id: string;
  fromStatus: ComplaintStatus | null;
  toStatus: ComplaintStatus;
  remarks: string | null;
  changedAt: string;
}
export interface Complaint {
  id: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  status: ComplaintStatus;
  latitude: number;
  longitude: number;
  address: string | null;
  pincode: string | null;
  wardId: string | null;
  createdAt: string;
  updatedAt: string;
  user?: Pick<User, 'id' | 'name'>;
  images?: ComplaintImage[];
  comments?: Comment[];
  statusHistory?: StatusHistory[];
}
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
