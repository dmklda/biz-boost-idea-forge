
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { toast } from "@/components/ui/sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const RegisterPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Form validation schema
  const formSchema = z.object({
    name: z.string().min(2, t('auth.errors.nameLength') || "O nome deve ter pelo menos 2 caracteres"),
    email: z.string().email(t('auth.errors.invalidEmail') || "Email inválido"),
    password: z.string().min(6, t('auth.errors.passwordLength') || "A senha deve ter pelo menos 6 caracteres")
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: ""
    }
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      // Make sure we pass all required fields for RegisterCredentials
      await register({
        name: data.name,
        email: data.email,
        password: data.password
      });
      toast.success(t('auth.registerSuccess') || "Registro realizado com sucesso!");
      
      // Redirect to plans page after successful registration
      navigate("/planos");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : (t('auth.registerFailed') || "Falha ao registrar"));
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
              {t('auth.register') || "Criar Conta"}
            </CardTitle>
            <CardDescription className="text-white/80">
              {t('auth.registerSubtitle') || "Registre-se para analisar suas ideias de negócio"}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('auth.name') || "Nome completo"}</FormLabel>
                      <FormControl>
                        <Input placeholder="Seu nome" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                    ? t('auth.registering') || "Registrando..." 
                    : t('auth.register') || "Registrar"
                  }
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex-col space-y-4 text-center">
            <div className="text-sm text-muted-foreground">
              {t('auth.alreadyHaveAccount') || "Já tem uma conta?"}{" "}
              <Link to="/login" className="text-brand-purple hover:underline">
                {t('auth.login') || "Entrar"}
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

export default RegisterPage;
