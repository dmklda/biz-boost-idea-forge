export interface User {
  id: string;
  email: string;
  name: string;
  surname?: string;
  display_name?: string;
  plan: 'free' | 'entrepreneur' | 'business';
  credits: number;
  createdAt: string;
  first_analysis_done?: boolean;
  photo_url?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export type LoginCredentials = {
  email: string;
  password: string;
};

export type RegisterCredentials = {
  name: string;
  surname?: string;
  display_name?: string;
  email: string;
  password: string;
};
