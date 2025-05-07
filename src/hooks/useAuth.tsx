
import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { AuthState, User, LoginCredentials, RegisterCredentials } from "@/types/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

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
  logout: () => Promise<void>;
  updateUserCredits: (newCredits: number) => void;
  updateUserPlan: (newPlan: User['plan']) => void;
}>({
  authState: initialAuthState,
  login: () => Promise.reject("AuthProvider not initialized"),
  register: () => Promise.reject("AuthProvider not initialized"),
  logout: () => Promise.reject("AuthProvider not initialized"),
  updateUserCredits: () => {},
  updateUserPlan: () => {}
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>(initialAuthState);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for initial session immediately
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        // Get user profile data for initial session
        supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data: profile, error }) => {
            if (profile) {
              setAuthState({
                user: {
                  id: session.user.id,
                  email: session.user.email || '',
                  name: profile.name,
                  plan: profile.plan as User['plan'],
                  credits: profile.credits,
                  createdAt: profile.created_at
                },
                isAuthenticated: true
              });
            } else if (error) {
              console.error("Error fetching initial profile:", error);
            }
            setIsLoading(false);
          });
      } else {
        setIsLoading(false);
      }
    });

    // Set up auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          // If we have a session, get user profile data
          supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
            .then(({ data: profile, error }) => {
              if (profile) {
                setAuthState({
                  user: {
                    id: session.user.id,
                    email: session.user.email || '',
                    name: profile.name,
                    plan: profile.plan as User['plan'],
                    credits: profile.credits,
                    createdAt: profile.created_at
                  },
                  isAuthenticated: true
                });
              } else if (error) {
                console.error("Error fetching profile:", error);
                setAuthState(initialAuthState);
              }
            });
        } else {
          // No session, user is logged out
          setAuthState(initialAuthState);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (credentials: LoginCredentials): Promise<User> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      });

      if (error) throw new Error(error.message);
      
      if (!data.session || !data.user) {
        throw new Error("Login falhou. Tente novamente.");
      }
      
      // Fetch user profile immediately instead of waiting for onAuthStateChange
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
      
      if (!profile) {
        throw new Error("Perfil de usuário não encontrado");
      }
      
      const user: User = {
        id: data.user.id,
        email: data.user.email || '',
        name: profile.name,
        plan: profile.plan as User['plan'],
        credits: profile.credits,
        createdAt: profile.created_at
      };
      
      // Update auth state immediately for faster response
      setAuthState({
        user,
        isAuthenticated: true
      });
      
      return user;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const register = async (credentials: RegisterCredentials): Promise<User> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            name: credentials.name
          }
        }
      });

      if (error) throw new Error(error.message);
      
      if (!data.session || !data.user) {
        throw new Error("Registro falhou. Tente novamente.");
      }
      
      // O trigger no Supabase criará automaticamente o perfil do usuário
      
      // Criar objeto de usuário para retornar
      const user: User = {
        id: data.user.id,
        email: data.user.email || '',
        name: credentials.name,
        plan: 'free',
        credits: 3, // Os créditos iniciais definidos no perfil
        createdAt: new Date().toISOString()
      };
      
      return user;
    } catch (error) {
      console.error("Register error:", error);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // O listener onAuthStateChange vai atualizar o estado
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  const updateUserCredits = (newCredits: number) => {
    if (!authState.user) return;

    // Atualizar créditos no Supabase
    supabase
      .from('profiles')
      .update({ credits: newCredits })
      .eq('id', authState.user.id)
      .then(({ error }) => {
        if (error) {
          console.error("Error updating credits:", error);
          toast.error("Erro ao atualizar créditos");
          return;
        }

        // Atualizar estado local
        setAuthState(prev => ({
          ...prev,
          user: {
            ...prev.user!,
            credits: newCredits
          }
        }));
        
        // Registrar a transação
        supabase
          .from('credit_transactions')
          .insert({
            user_id: authState.user.id,
            amount: newCredits - authState.user.credits,
            description: "Compra de créditos"
          })
          .then(({ error }) => {
            if (error) {
              console.error("Error recording transaction:", error);
            }
          });
      });
  };

  const updateUserPlan = (newPlan: User['plan']) => {
    if (!authState.user) return;

    // Atualizar plano no Supabase
    supabase
      .from('profiles')
      .update({ plan: newPlan })
      .eq('id', authState.user.id)
      .then(({ error }) => {
        if (error) {
          console.error("Error updating plan:", error);
          toast.error("Erro ao atualizar plano");
          return;
        }

        // Atualizar estado local
        setAuthState(prev => ({
          ...prev,
          user: {
            ...prev.user!,
            plan: newPlan
          }
        }));
      });
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
