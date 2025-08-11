export interface Template {
  id: number;
  slug: string;
  name: string;
  content: string;
  placeholders: string[] | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminUser {
  id: number;
  username: string;
  createdAt: Date;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}