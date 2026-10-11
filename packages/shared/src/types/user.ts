import { UserRole } from '../constants/roles';

export interface IUser {
  id: string;
  role: UserRole;
  name: string;
  email?: string;
  phone?: string;
  username?: string;
  status: 'active' | 'inactive' | 'locked';
  approved?: boolean;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  subscriptionStart?: string | Date;
  subscriptionEnd?: string | Date;
  lastLoginAt?: string;
  failedLogins: number;
  lockedUntil?: string;
  locale: 'ar' | 'en';
  createdAt: string;
  updatedAt: string;
}

export interface IStudentProfile {
  id: string;
  userId: string;
  parentId: string;
  displayName: string;
  birthYear: number;
  avatar: string;
  level: number;
  xp: number;
  badges: string[];
  subscriptionStart?: string | Date;
  subscriptionEnd?: string | Date;
}

export interface IParentProfile {
  id: string;
  userId: string;
  phone: string;
  whatsapp?: string;
  children: string[];
}
