
import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { AuthState, User, LoginCredentials, RegisterCredentials } from "@/types/auth";

// Keys for localStorage
const AUTH_USER_KEY = 'auth_user';

// Initial state
const initialAuthState: AuthState = {
  user: null,
  isAuthenticated: false
};

// Create Auth Context
const AuthContext = createContext<{
  authState: AuthState;
  login: (credentials: LoginCredentials) => Promise<User>;
  register: (credentials: RegisterCredentials) => Promise<User>;
  logout: () => void;
  updateUserCredits: (newCredits: number) => void;
  updateUserPlan: (newPlan: User['plan']) => void;
}>({
  authState: initialAuthState,
  login: () => Promise.reject("AuthProvider not initialized"),
  register: () => Promise.reject("AuthProvider not initialized"),
  logout: () => {},
  updateUserCredits: () => {},
  updateUserPlan: () => {}
});

// Mock database of users (in localStorage)
const USERS_DB_KEY = 'users_db';

// Generate mock users or get existing ones
const getOrCreateUsers = () => {
  const existingUsers = localStorage.getItem(USERS_DB_KEY);
  if (existingUsers) {
    return JSON.parse(existingUsers);
  }
  
  // Create some sample users
  const initialUsers = [
    {
      id: '1',
      email: 'demo@example.com',
      password: 'password123', // Never store plain passwords in production!
      name: 'Demo User',
      plan: 'free',
      credits: 3,
      createdAt: new Date().toISOString()
    }
  ];
  
  localStorage.setItem(USERS_DB_KEY, JSON.stringify(initialUsers));
  return initialUsers;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>(() => {
    // Check if user is already logged in
    const savedUser = localStorage.getItem(AUTH_USER_KEY);
    if (savedUser) {
      const user = JSON.parse(savedUser) as User;
      return {
        user,
        isAuthenticated: true
      };
    }
    return initialAuthState;
  });

  // Save auth state to localStorage when it changes
  useEffect(() => {
    if (authState.user) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(authState.user));
    } else {
      localStorage.removeItem(AUTH_USER_KEY);
    }
  }, [authState]);

  const login = async (credentials: LoginCredentials): Promise<User> => {
    // Simulate API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const users = getOrCreateUsers();
        const user = users.find((u: any) => u.email === credentials.email);
        
        if (user && user.password === credentials.password) {
          // Don't include password in the auth state
          const { password, ...userWithoutPassword } = user;
          
          setAuthState({
            user: userWithoutPassword as User,
            isAuthenticated: true
          });
          
          resolve(userWithoutPassword as User);
        } else {
          reject(new Error("Invalid email or password"));
        }
      }, 500);
    });
  };

  const register = async (credentials: RegisterCredentials): Promise<User> => {
    // Simulate API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const users = getOrCreateUsers();
        
        // Check if email is already in use
        if (users.some((u: any) => u.email === credentials.email)) {
          reject(new Error("Email already in use"));
          return;
        }
        
        // Create new user
        const newUser = {
          id: Date.now().toString(),
          email: credentials.email,
          password: credentials.password, // Never store plain passwords in production!
          name: credentials.name,
          plan: 'free',
          credits: 3, // Give 3 free credits to new users
          createdAt: new Date().toISOString()
        };
        
        // Add user to "database"
        users.push(newUser);
        localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
        
        // Log user in
        const { password, ...userWithoutPassword } = newUser;
        
        setAuthState({
          user: userWithoutPassword as User,
          isAuthenticated: true
        });
        
        resolve(userWithoutPassword as User);
      }, 500);
    });
  };

  const logout = () => {
    setAuthState(initialAuthState);
  };

  const updateUserCredits = (newCredits: number) => {
    if (!authState.user) return;

    // Update user in state
    setAuthState(prev => ({
      ...prev,
      user: {
        ...prev.user!,
        credits: newCredits
      }
    }));

    // Update user in "database"
    const users = getOrCreateUsers();
    const updatedUsers = users.map((u: any) => {
      if (u.id === authState.user!.id) {
        return { ...u, credits: newCredits };
      }
      return u;
    });
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(updatedUsers));
  };

  const updateUserPlan = (newPlan: User['plan']) => {
    if (!authState.user) return;

    // Update user in state
    setAuthState(prev => ({
      ...prev,
      user: {
        ...prev.user!,
        plan: newPlan
      }
    }));

    // Update user in "database"
    const users = getOrCreateUsers();
    const updatedUsers = users.map((u: any) => {
      if (u.id === authState.user!.id) {
        return { ...u, plan: newPlan };
      }
      return u;
    });
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(updatedUsers));
  };

  return (
    <AuthContext.Provider value={{ 
      authState, 
      login, 
      register, 
      logout,
      updateUserCredits,
      updateUserPlan
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
