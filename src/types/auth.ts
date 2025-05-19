export interface User {
  id: string;
  email: string;
  name: string;
  plan: 'free' | 'basic' | 'pro' | 'enterprise';
  credits: number;
  createdAt: string;
  first_analysis_done?: boolean;
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
  email: string;
  password: string;
};
