import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useIdeaForm } from "@/hooks/useIdeaForm";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { toast } from "@/components/ui/sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginCredentials } from "@/types/auth";
import Header from "@/components/Header";

const LoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login, authState } = useAuth();
  const { getSavedIdeaData } = useIdeaForm();
  const [isLoading, setIsLoading] = useState(false);

  // Form validation schema
  const formSchema = z.object({
    email: z.string().email(t('auth.errors.invalidEmail')),
    password: z.string().min(6, t('auth.errors.passwordLength'))
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const onSubmit = async (data: LoginCredentials) => {
    if (isLoading) return; // Prevent multiple submissions
    
    try {
      setIsLoading(true);
      console.log("Login attempt with:", data.email);
      
      await login(data);
      
      console.log("Login successful, checking for saved data");
      toast.success(t('auth.loginSuccess'));
      
      // Check if there's saved form data
      const savedData = getSavedIdeaData();
      
      console.log("Redirecting after login", savedData ? "to results" : "to dashboard");
      
      // Use a small timeout to ensure the auth state is updated before navigation
      setTimeout(() => {
        if (savedData) {
          // Redirect to results if there's saved data
          navigate("/resultados");
        } else {
          // Otherwise go to dashboard
          navigate("/dashboard");
        }
        setIsLoading(false);
      }, 100);
      
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error instanceof Error ? error.message : t('auth.loginFailed'));
      setIsLoading(false);
    }
  };

  // If already authenticated, redirect to dashboard
  if (authState.isAuthenticated) {
    console.log("User is already authenticated, redirecting to dashboard");
    navigate("/dashboard");
    return null;
  }

  return (
    <>
      <Header />
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-background/95 p-4 pt-20">
        <div className="absolute inset-0 bg-mesh-pattern opacity-10 pointer-events-none"></div>
        <div className="w-full max-w-md space-y-8 z-10">
          <Card className="border-0 shadow-xl">
            <CardHeader className="space-y-2 text-center bg-gradient-to-r from-brand-blue to-brand-purple rounded-t-lg">
              <CardTitle className="text-2xl font-bold text-white">
                {t('auth.login')}
              </CardTitle>
              <CardDescription className="text-white/80">
                {t('auth.loginSubtitle')}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('auth.email')}</FormLabel>
                        <FormControl>
                          <Input placeholder="seuemail@exemplo.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('auth.password')}</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="w-full bg-brand-purple hover:bg-brand-purple/90" 
                    disabled={isLoading}
                  >
                    {isLoading 
                      ? t('auth.loggingIn')
                      : t('auth.login')
                    }
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex-col space-y-4 text-center">
              <div className="text-sm text-muted-foreground">
                {t('auth.noAccount')}{" "}
                <Link to="/registro" className="text-brand-purple hover:underline">
                  {t('auth.register')}
                </Link>
              </div>
              <div className="text-xs text-muted-foreground">
                <Link to="/" className="hover:underline">
                  {t('nav.backToHome')}
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
