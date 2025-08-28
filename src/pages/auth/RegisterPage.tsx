
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useTranslation } from "react-i18next";
import { toast } from "@/components/ui/sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Header from "@/components/Header";
import { supabase } from '@/integrations/supabase/client';
import { Camera } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const EXPERTISE_AREAS = [
  'Tecnologia', 'Marketing', 'Design', 'Vendas', 'Finanças', 'Operações',
  'Recursos Humanos', 'Produto', 'Estratégia', 'Dados', 'UX/UI', 'Desenvolvimento'
];

const INTERESTS = [
  'SaaS', 'E-commerce', 'FinTech', 'EdTech', 'HealthTech', 'Sustentabilidade',
  'IA/ML', 'Blockchain', 'IoT', 'Mobile', 'Web', 'B2B', 'B2C', 'Marketplace'
];

const RegisterPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register, authState, updateUserPhoto } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Atualizar schema de validação
  const formSchema = z.object({
    name: z.string().min(2, t('auth.errors.nameLength')),
    surname: z.string().min(2, 'Sobrenome obrigatório'),
    display_name: z.string().min(2, 'Nome de usuário obrigatório').max(16, 'Máximo 16 caracteres'),
    email: z.string().email(t('auth.errors.invalidEmail')),
    password: z.string().min(6, t('auth.errors.passwordLength')),
    confirmPassword: z.string().min(6, t('auth.errors.passwordLength')),
    terms: z.literal(true, { errorMap: () => ({ message: 'Você deve aceitar os termos.' }) }),
    wantEarlyAdopter: z.boolean().default(false),
    bio: z.string().optional(),
    expertise_areas: z.array(z.string()).optional(),
    interests: z.array(z.string()).optional(),
    hourly_rate: z.number().optional(),
    portfolio_url: z.string().url("URL inválida").optional().or(z.literal("")),
    linkedin_url: z.string().url("URL inválida").optional().or(z.literal("")),
  }).refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  }).refine((data) => {
    if (data.wantEarlyAdopter && !data.bio) {
      return false;
    }
    return true;
  }, {
    message: "Bio é obrigatória para Early Adopters",
    path: ["bio"],
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      surname: '',
      display_name: '',
      email: '',
      password: '',
      confirmPassword: '',
      terms: true,
      wantEarlyAdopter: false,
      bio: "",
      expertise_areas: [],
      interests: [],
      hourly_rate: undefined,
      portfolio_url: "",
      linkedin_url: "",
    }
  });

  const wantEarlyAdopter = form.watch("wantEarlyAdopter");
  const [selectedExpertise, setSelectedExpertise] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  // Check authentication status and redirect if needed
  useEffect(() => {
    if (authState.isAuthenticated && !isRedirecting) {
      console.log("User is authenticated, redirecting to plans");
      setIsRedirecting(true);
      navigate("/planos");
    }
  }, [authState.isAuthenticated, navigate, isRedirecting]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setAvatarFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setAvatarPreview(null);
    }
  };

  // Função utilitária para upload de avatar padronizado
  const uploadAvatar = async (file: File, userId: string) => {
    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}/avatar.${fileExt}`;
    // Remove avatar antigo se houver
    const { data: existingFiles } = await supabase.storage.from('avatars').list(userId);
    if (existingFiles && existingFiles.length > 0) {
      await supabase.storage.from('avatars').remove([`${userId}/${existingFiles[0].name}`]);
    }
    const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });
    if (uploadError) throw uploadError;
    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
    if (!urlData?.publicUrl) throw new Error('URL pública não encontrada');
    return urlData.publicUrl;
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (isLoading || isRedirecting) return;
    try {
      setIsLoading(true);
      // 1. Registrar usuário normalmente
      const user = await register({
        name: data.name,
        surname: data.surname,
        display_name: data.display_name,
        email: data.email,
        password: data.password
      });
      // 2. Se houver avatar, fazer upload padronizado e atualizar perfil
      if (avatarFile && user?.id) {
        try {
          const publicUrl = await uploadAvatar(avatarFile, user.id);
          await supabase.from('profiles').update({ photo_url: publicUrl }).eq('id', user.id);
          // Atualizar contexto global imediatamente
          if (typeof updateUserPhoto === 'function') updateUserPhoto(publicUrl);
        } catch (err) {
          console.error('Erro ao fazer upload do avatar:', err);
          toast.error('Erro ao fazer upload do avatar: ' + (err instanceof Error ? err.message : String(err)));
        }
      }

      // 3. Se quer ser Early Adopter, criar perfil pendente
      if (data.wantEarlyAdopter) {
        const { error: adopterError } = await supabase
          .from('early_adopters')
          .insert({
            user_id: user.id,
            bio: data.bio,
            expertise_areas: selectedExpertise,
            interests: selectedInterests,
            hourly_rate: data.hourly_rate,
            portfolio_url: data.portfolio_url || null,
            linkedin_url: data.linkedin_url || null,
            status: 'pending'
          });

        if (adopterError) {
          console.error('Error creating early adopter profile:', adopterError);
        } else {
          toast.success('Pedido para ser Early Adopter enviado para aprovação!');
        }
      }
      
      toast.success(t('auth.registerSuccess'));
    } catch (error) {
      console.error('Register error:', error);
      toast.error(error instanceof Error ? error.message : t('auth.registerFailed'));
      setIsLoading(false);
    }
  };

  const toggleExpertise = (area: string) => {
    const newExpertise = selectedExpertise.includes(area)
      ? selectedExpertise.filter(e => e !== area)
      : [...selectedExpertise, area];
    setSelectedExpertise(newExpertise);
    form.setValue('expertise_areas', newExpertise);
  };

  const toggleInterest = (interest: string) => {
    const newInterests = selectedInterests.includes(interest)
      ? selectedInterests.filter(i => i !== interest)
      : [...selectedInterests, interest];
    setSelectedInterests(newInterests);
    form.setValue('interests', newInterests);
  };

  // If already redirecting, show loading state
  if (isRedirecting) {
    return (
      <>
        <Header />
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-background/95 p-4 pt-20">
          <div className="text-center">
            <p className="text-lg">{t('auth.redirecting')}</p>
          </div>
        </div>
      </>
    );
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
                {t('auth.register')}
              </CardTitle>
              <CardDescription className="text-white/80">
                {t('auth.registerSubtitle')}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {/* Avatar upload no topo do formulário */}
              <div className="flex flex-col items-center mb-6">
                <label htmlFor="avatar-upload" className="relative cursor-pointer group">
                  <Avatar className="w-20 h-20 md:w-24 md:h-24 shadow-md border-4 border-white bg-gradient-to-br from-[#00BFFF] to-[#8F00FF]">
                    {avatarPreview ? (
                      <AvatarImage src={avatarPreview} alt="Preview do avatar" />
                    ) : null}
                    <AvatarFallback className="text-3xl text-white font-bold">
                      {(form.getValues('display_name') || form.getValues('name') || '').charAt(0) || '?'}
                    </AvatarFallback>
                    <span className="absolute bottom-1 right-1 bg-white rounded-full p-1 shadow group-hover:bg-gray-100 transition">
                      <Camera className="w-5 h-5 text-brand-purple" />
                    </span>
                  </Avatar>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    title="Selecione uma imagem para seu avatar"
                    className="hidden"
                    tabIndex={0}
                  />
                </label>
                <span className="text-xs text-muted-foreground mt-2">Avatar (opcional)</span>
              </div>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('auth.name')}</FormLabel>
                        <FormControl>
                          <Input placeholder="Seu nome" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="surname"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sobrenome</FormLabel>
                        <FormControl>
                          <Input placeholder="Seu sobrenome" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="display_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome de usuário</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome de usuário (até 16 caracteres)" maxLength={16} {...field} />
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
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirmar senha</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Repita a senha" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="terms"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center gap-2">
                          <input 
                            type="checkbox" 
                            id="terms" 
                            name={field.name}
                            checked={field.value}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            ref={field.ref}
                          />
                          <FormLabel htmlFor="terms" className="mb-0 cursor-pointer text-xs">
                            Eu li e aceito os <a href="/company/TermsOfUsePage" target="_blank" rel="noopener noreferrer" className="underline text-brand-purple">Termos de Uso</a> e a <a href="/company/PrivacyPolicyPage" target="_blank" rel="noopener noreferrer" className="underline text-brand-purple">Política de Privacidade</a>.
                          </FormLabel>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Early Adopter Section */}
                  <div className="space-y-4 border-t pt-6">
                    <FormField
                      control={form.control}
                      name="wantEarlyAdopter"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm font-medium">
                              Quero me registrar como Early Adopter
                            </FormLabel>
                            <p className="text-xs text-muted-foreground">
                              Early Adopters ajudam a validar ideias de negócio e ganham pontos por suas contribuições.
                            </p>
                          </div>
                        </FormItem>
                      )}
                    />

                    {wantEarlyAdopter && (
                      <div className="space-y-4 pl-6 border-l-2 border-primary/20">
                        <FormField
                          control={form.control}
                          name="bio"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Bio *</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Descreva sua experiência e o que te motiva a ajudar empreendedores..."
                                  className="min-h-[80px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div>
                          <FormLabel className="text-sm font-medium">Áreas de Expertise</FormLabel>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {EXPERTISE_AREAS.map((area) => (
                              <Badge
                                key={area}
                                variant={selectedExpertise.includes(area) ? "default" : "secondary"}
                                className="cursor-pointer"
                                onClick={() => toggleExpertise(area)}
                              >
                                {area}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <FormLabel className="text-sm font-medium">Interesses</FormLabel>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {INTERESTS.map((interest) => (
                              <Badge
                                key={interest}
                                variant={selectedInterests.includes(interest) ? "default" : "outline"}
                                className="cursor-pointer"
                                onClick={() => toggleInterest(interest)}
                              >
                                {interest}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="hourly_rate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Taxa por Hora (R$)</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="0"
                                    {...field}
                                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="portfolio_url"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>URL do Portfólio</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="https://meuportfolio.com"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="linkedin_url"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>URL do LinkedIn</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="https://linkedin.com/in/seuperfil"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-brand-purple hover:bg-brand-purple/90" 
                    disabled={isLoading}
                  >
                    {isLoading 
                      ? t('auth.registering')
                      : t('auth.register')
                    }
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex-col space-y-4 text-center">
              <div className="text-sm text-muted-foreground">
                {t('auth.alreadyHaveAccount')}{" "}
                <Link to="/login" className="text-brand-purple hover:underline">
                  {t('auth.login')}
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

export default RegisterPage;
