export enum UserRole {
  ADMIN = 'ADMIN',
  DOCTOR = 'DOCTOR',
  NURSE = 'NURSE',
  RECEPTIONIST = 'RECEPTIONIST',
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  crm?: string; // Registro profissional
  phone?: string;
  avatar?: string;
  twoFactorEnabled: boolean;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDTO {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  crm?: string;
  phone?: string;
}

export interface UpdateUserDTO {
  name?: string;
  phone?: string;
  avatar?: string;
}

export interface UserProfile extends Omit<User, 'twoFactorEnabled'> {
  permissions: string[];
}
