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

const LoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const { getSavedIdeaData } = useIdeaForm();
  const [isLoading, setIsLoading] = useState(false);

  // Form validation schema
  const formSchema = z.object({
    email: z.string().email(t('auth.errors.invalidEmail') || "Email inválido"),
    password: z.string().min(6, t('auth.errors.passwordLength') || "A senha deve ter pelo menos 6 caracteres")
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const onSubmit = async (data: LoginCredentials) => {
    try {
      setIsLoading(true);
      await login(data);
      toast.success(t('auth.loginSuccess') || "Login realizado com sucesso!");
      
      // Check if there's saved form data
      const savedData = getSavedIdeaData();
      
      if (savedData) {
        // Redirect to results if there's saved data
        navigate("/resultados");
      } else {
        // Otherwise go to dashboard
        navigate("/dashboard");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : (t('auth.loginFailed') || "Falha ao fazer login"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-background/95 p-4">
      <div className="absolute inset-0 bg-mesh-pattern opacity-10 pointer-events-none"></div>
      <div className="w-full max-w-md space-y-8 z-10">
        <Card className="border-0 shadow-xl">
          <CardHeader className="space-y-2 text-center bg-gradient-to-r from-brand-blue to-brand-purple rounded-t-lg">
            <CardTitle className="text-2xl font-bold text-white">
              {t('auth.login') || "Entrar"}
            </CardTitle>
            <CardDescription className="text-white/80">
              {t('auth.loginSubtitle') || "Acesse sua conta para ver suas análises"}
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
                      <FormLabel>{t('auth.email') || "Email"}</FormLabel>
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
                      <FormLabel>{t('auth.password') || "Senha"}</FormLabel>
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
                    ? t('auth.loggingIn') || "Entrando..." 
                    : t('auth.login') || "Entrar"
                  }
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex-col space-y-4 text-center">
            <div className="text-sm text-muted-foreground">
              {t('auth.noAccount') || "Ainda não tem uma conta?"}{" "}
              <Link to="/registro" className="text-brand-purple hover:underline">
                {t('auth.register') || "Registre-se"}
              </Link>
            </div>
            <div className="text-xs text-muted-foreground">
              <Link to="/" className="hover:underline">
                {t('nav.backToHome') || "Voltar para a página inicial"}
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
