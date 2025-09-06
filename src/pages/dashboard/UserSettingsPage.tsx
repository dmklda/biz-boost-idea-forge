import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "@/hooks/use-mobile";
import { Bell, CreditCard, Globe, Lock, ShieldAlert, User, Camera } from "lucide-react";
import { AvailableCreditsCard } from "@/components/dashboard/AvailableCreditsCard";
import { BuyCreditsCard } from "@/components/dashboard/BuyCreditsCard";
import { TransactionsCard } from "@/components/dashboard/TransactionsCard";
import { useGamification } from '@/hooks/useGamification';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface Profile {
  name: string;
  surname?: string; // Novo campo
  display_name?: string; // Novo campo para nome curto
  email: string;
  plan: string;
  credits: number;
  photo_url?: string;
  bio?: string;
  linkedin?: string;
  phone?: string;
  city?: string;
  area?: string;
  company?: string;
  birthdate?: string;
  contact_pref?: string;
}

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

const UserSettingsPage = () => {
  const { t, i18n } = useTranslation();
  const { authState, logout, updateUserPhoto } = useAuth();
  const isMobile = useIsMobile();
  const { addPoints, checkAndAwardAchievements } = useGamification();
  
  // User profile state
  const [profile, setProfile] = useState<Profile>({
    name: authState.user?.name || "",
    surname: authState.user?.surname || "",
    display_name: authState.user?.display_name || "",
    email: authState.user?.email || "",
    plan: authState.user?.plan || "free",
    credits: authState.user?.credits || 0,
    photo_url: "",
    bio: "",
    linkedin: "",
    phone: "",
    city: "",
    area: "",
    company: "",
    birthdate: "",
    contact_pref: ""
  });
  
  // Form states
  const [loading, setLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    accountAlerts: true,
    marketingEmails: false,
    newFeatures: true,
    tips: true
  });
  
  // Language settings
  const [language, setLanguage] = useState(i18n.language);

  // Get initial tab from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const initialTab = urlParams.get('tab') || 'profile';
  
  // Função para checar se o perfil está completo
  const checkProfileComplete = async () => {
    if (!authState.user) return false;
    const hasName = !!profile.name;
    const hasSurname = !!profile.surname;
    const hasLanguage = !!language;
    const hasPassword = passwordChanged;
    const hasNotifications = notificationsSaved;
    const hasPhoto = !!profile.photo_url;
    const hasBio = !!profile.bio;
    const hasLinkedin = !!profile.linkedin;
    const hasPhone = !!profile.phone;
    const hasCity = !!profile.city;
    const hasArea = !!profile.area;
    const hasCompany = !!profile.company;
    const hasBirthdate = !!profile.birthdate;
    const hasContactPref = !!profile.contact_pref;
    return (
      hasName && hasSurname && hasLanguage && hasPassword && hasNotifications &&
      hasPhoto && hasBio && hasLinkedin && hasPhone && hasCity &&
      hasArea && hasCompany && hasBirthdate && hasContactPref
    );
  };

  // Estados auxiliares para rastrear ações
  const [passwordChanged, setPasswordChanged] = useState(false);
  const [notificationsSaved, setNotificationsSaved] = useState(false);
  
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authState.user) return;
    if (!profile.name.trim() || !profile.surname.trim()) {
      toast.error('Nome e sobrenome são obrigatórios.');
      return;
    }
    setLoading(true);
    try {
      const wasIncomplete = !authState.user.name;
      let photo_url = profile.photo_url;
      if (profile.photo_url && profile.photo_url.startsWith('data:')) {
        photo_url = profile.photo_url;
      }
      // Corrigir payload para não enviar string vazia em campos do tipo date
      const payload = {
        name: profile.name,
        surname: profile.surname,
        display_name: profile.display_name,
        photo_url,
        bio: profile.bio || null,
        linkedin: profile.linkedin || null,
        phone: profile.phone || null,
        city: profile.city || null,
        area: profile.area || null,
        company: profile.company || null,
        birthdate: profile.birthdate ? profile.birthdate : null,
        contact_pref: profile.contact_pref || null
      };
      const { error } = await supabase
        .from('profiles')
        .update(payload)
        .eq('id', authState.user.id);
      if (error) throw error;
      // Atualizar contexto global
      authState.user.name = profile.name;
      authState.user.surname = profile.surname;
      authState.user.display_name = profile.display_name;
      authState.user.photo_url = profile.photo_url;
      updateUserPhoto(profile.photo_url || "");
      toast.success(t('settings.profileUpdated'));
      if (wasIncomplete && profile.name) {
        addPoints(50, 'Completar perfil');
      }
      if (await checkProfileComplete()) {
        checkAndAwardAchievements('complete_profile');
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(t('errors.updatingProfile') || "Error updating profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authState.user) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .auth
        .updateUser({
          password: newPassword,
        });
      if (error) throw error;
      setPasswordChanged(true);
      toast.success(t('settings.passwordUpdated'));
      addPoints(100, 'Mudar senha');
      if (await checkProfileComplete()) {
        checkAndAwardAchievements('change_password');
      }
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error(t('errors.changingPassword') || "Error changing password");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!authState.user) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .auth
        .signOut();
      if (error) throw error;
      toast.success(t('settings.accountDeleted'));
      logout();
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error(t('errors.deletingAccount') || "Error deleting account");
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationSettingsUpdate = async () => {
    if (!authState.user) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          email_notifications: notificationSettings.emailNotifications,
          account_alerts: notificationSettings.accountAlerts,
          marketing_emails: notificationSettings.marketingEmails,
          new_features: notificationSettings.newFeatures,
          tips: notificationSettings.tips
        })
        .eq('id', authState.user.id);
      if (error) throw error;
      setNotificationsSaved(true);
      toast.success(t('settings.notificationPreferencesUpdated'));
      addPoints(50, 'Atualizar preferências de notificação');
      if (await checkProfileComplete()) {
        checkAndAwardAchievements('update_notification_preferences');
      }
    } catch (error) {
      console.error("Error updating notification preferences:", error);
      toast.error(t('errors.updatingNotificationPreferences') || "Error updating notification preferences");
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = async (value: string) => {
    setLanguage(value);
    i18n.changeLanguage(value);
    toast.success(t('settings.languageUpdated'));
    addPoints(50, 'Mudar idioma');
    if (await checkProfileComplete()) {
      checkAndAwardAchievements('change_language');
    }
  };

  // Adicionar estados para upload/preview
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

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

  useEffect(() => {
    if (!authState.user?.id) return;
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authState.user.id)
        .single();
      if (error && error.code !== 'PGRST116') {
        throw error;
      } else if (data) {
        setProfile({
          name: data.name || '',
          surname: (data as any).surname || '',
          display_name: (data as any).display_name || '',
          email: data.email || '',
          plan: data.plan || 'free',
          credits: data.credits || 0,
          photo_url: data.photo_url || '',
          bio: data.bio || '',
          linkedin: data.linkedin || '',
          phone: data.phone || '',
          city: data.city || '',
          area: data.area || '',
          company: data.company || '',
          birthdate: data.birthdate || '',
          contact_pref: data.contact_pref || ''
        } as Profile);
        // Não atualize o contexto global aqui!
      }
    };
    fetchProfile();
    // Só rode quando o id do usuário mudar
  }, [authState.user?.id]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          {t('settings.title')}
        </h1>
        <p className="text-muted-foreground mt-1">
          {t('settings.subtitle')}
        </p>
      </div>
      
      <div className="w-full">
        <Tabs defaultValue={initialTab} className="w-full space-y-6">
          <Card className="shadow-sm border-0 bg-muted/50">
            <CardContent className="p-1 sm:p-2">
              <TabsList className="w-full grid grid-cols-2 md:grid-cols-5 gap-1">
                <TabsTrigger value="profile">
                  <User className="h-3 w-3 mr-1 sm:h-4 sm:w-4 sm:mr-2" />
                  <span className="truncate">{t('settings.profile')}</span>
                </TabsTrigger>
                <TabsTrigger value="account">
                  <Lock className="h-3 w-3 mr-1 sm:h-4 sm:w-4 sm:mr-2" />
                  <span className="truncate">{t('settings.account')}</span>
                </TabsTrigger>
                <TabsTrigger value="notifications">
                  <Bell className="h-3 w-3 mr-1 sm:h-4 sm:w-4 sm:mr-2" />
                  <span className="truncate">{t('settings.notifications')}</span>
                </TabsTrigger>
                <TabsTrigger value="plan">
                  <CreditCard className="h-3 w-3 mr-1 sm:h-4 sm:w-4 sm:mr-2" />
                  <span className="truncate">{t('settings.plan')}</span>
                </TabsTrigger>
                <TabsTrigger value="credits">
                  <CreditCard className="h-3 w-3 mr-1 sm:h-4 sm:w-4 sm:mr-2" />
                  <span className="truncate">{t('settings.credits', 'Créditos')}</span>
                </TabsTrigger>
              </TabsList>
            </CardContent>
          </Card>
          
          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4">
            <Card className="shadow-sm">
              <CardHeader className="flex flex-col items-center">
                {/* Avatar no topo do Card */}
                <label htmlFor="avatar-upload" className="relative cursor-pointer group mb-2">
                  <Avatar className="w-20 h-20 md:w-24 md:h-24 shadow-md border-4 border-white bg-gradient-to-br from-[#00BFFF] to-[#8F00FF]">
                    {avatarPreview ? (
                      <AvatarImage src={avatarPreview} alt="Preview do avatar" />
                    ) : profile.photo_url ? (
                      <AvatarImage src={profile.photo_url} alt="Foto de perfil" />
                    ) : null}
                    <AvatarFallback className="text-3xl text-white font-bold">
                      {(profile.display_name || profile.name || "").charAt(0) || "?"}
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
                    disabled={loading}
                  />
                </label>
                <span className="text-xs text-muted-foreground mb-2">Foto de perfil (clique para alterar)</span>
                <CardTitle>{t('settings.personalInfo')}</CardTitle>
                <CardDescription>{t('settings.personalInfoDesc')}</CardDescription>
                {avatarFile && (
                  <Button
                    size="sm"
                    className="mt-2"
                    disabled={loading}
                    onClick={async () => {
                      if (avatarFile && authState.user) {
                        setLoading(true);
                        try {
                          // Upload padronizado para o bucket avatars
                          const publicUrl = await uploadAvatar(avatarFile, authState.user.id);
                          // Atualizar no banco
                          const { error: dbError } = await supabase.from('profiles').update({ photo_url: publicUrl }).eq('id', authState.user.id);
                          if (dbError) throw dbError;
                          // Atualizar estado local e contexto global
                          setProfile({ ...profile, photo_url: publicUrl });
                          updateUserPhoto(publicUrl);
                          setAvatarFile(null);
                          setAvatarPreview(null);
                          toast.success('Foto de perfil atualizada com sucesso!');
                        } catch (err) {
                          console.error('Erro ao fazer upload da foto de perfil:', err);
                          toast.error('Erro ao fazer upload da foto de perfil: ' + (err instanceof Error ? err.message : String(err)));
                        } finally {
                          setLoading(false);
                        }
                      }
                    }}
                  >Salvar nova foto</Button>
                )}
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  {/* Nome */}
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome</Label>
                    <Input
                      id="name"
                      value={profile.name || ''}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      required
                      placeholder="Seu nome"
                      maxLength={30}
                    />
                  </div>
                  {/* Sobrenome */}
                  <div className="space-y-2">
                    <Label htmlFor="surname">Sobrenome</Label>
                    <Input
                      id="surname"
                      value={profile.surname || ''}
                      onChange={(e) => setProfile({ ...profile, surname: e.target.value })}
                      required
                      placeholder="Seu sobrenome"
                      maxLength={40}
                    />
                  </div>
                  {/* Nome de usuário */}
                  <div className="space-y-2">
                    <Label htmlFor="display_name">Nome de usuário</Label>
                    <Input
                      id="display_name"
                      value={profile.display_name || ''}
                      onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                      placeholder="Ex: joaosilva, maria123, ana.p"
                      maxLength={18}
                    />
                  </div>
                  {/* Bio */}
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Input
                      id="bio"
                      value={profile.bio || ''}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      maxLength={160}
                      placeholder="Conte um pouco sobre você..."
                    />
                  </div>
                  {/* LinkedIn */}
                  <div className="space-y-2">
                    <Label htmlFor="linkedin">LinkedIn</Label>
                    <Input
                      id="linkedin"
                      value={profile.linkedin || ''}
                      onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })}
                      placeholder="https://linkedin.com/in/seuusuario"
                    />
                  </div>
                  {/* Telefone */}
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={profile.phone || ''}
                      onChange={(e) => {
                        // Permitir apenas +, números, espaço, parênteses, hífen
                        const val = e.target.value.replace(/[^\d+\-() ]/g, '');
                        setProfile({ ...profile, phone: val });
                      }}
                      placeholder="+55 (11) 91234-5678"
                      maxLength={25}
                    />
                  </div>
                  {/* Cidade */}
                  <div className="space-y-2">
                    <Label htmlFor="city">Cidade</Label>
                    <Input
                      id="city"
                      value={profile.city || ''}
                      onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                      placeholder="Sua cidade"
                    />
                  </div>
                  {/* Área de atuação */}
                  <div className="space-y-2">
                    <Label htmlFor="area">Área de atuação</Label>
                    <Input
                      id="area"
                      value={profile.area || ''}
                      onChange={(e) => setProfile({ ...profile, area: e.target.value })}
                      placeholder="Ex: Tecnologia, Saúde, Educação..."
                    />
                  </div>
                  {/* Empresa */}
                  <div className="space-y-2">
                    <Label htmlFor="company">Empresa</Label>
                    <Input
                      id="company"
                      value={profile.company || ''}
                      onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                      placeholder="Onde trabalha atualmente"
                    />
                  </div>
                  {/* Data de nascimento */}
                  <div className="space-y-2">
                    <Label htmlFor="birthdate">Data de nascimento</Label>
                    <Input
                      id="birthdate"
                      type="date"
                      value={profile.birthdate || ''}
                      onChange={(e) => setProfile({ ...profile, birthdate: e.target.value })}
                    />
                  </div>
                  {/* Preferência de contato */}
                  <div className="space-y-2">
                    <Label htmlFor="contact_pref">Preferência de contato</Label>
                    <Select
                      value={profile.contact_pref || ''}
                      onValueChange={(val) => setProfile({ ...profile, contact_pref: val })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="telefone">Telefone</SelectItem>
                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                        <SelectItem value="linkedin">LinkedIn</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button type="submit" disabled={loading}>
                    {loading ? (t('common.saving') || "Saving...") : (t('common.save'))}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Account Tab */}
          <TabsContent value="account" className="space-y-4">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>{t('settings.security')}</CardTitle>
                <CardDescription>
                  {t('settings.securityDesc')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">{t('settings.currentPassword')}</Label>
                    <Input
                      id="current-password"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="new-password">{t('settings.newPassword')}</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">{t('settings.confirmPassword')}</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      required
                    />
                  </div>
                  
                  <Button type="submit" disabled={loading}>
                    {loading ? (t('common.updating') || "Updating...") : (t('settings.changePassword'))}
                  </Button>
                </form>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>{t('settings.dangerZone')}</CardTitle>
                <CardDescription>
                  {t('settings.dangerZoneDesc')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-md border border-destructive/50 p-4">
                    <div className="flex flex-col space-y-2">
                      <h3 className="font-medium flex items-center gap-2">
                        <ShieldAlert className="h-4 w-4 text-destructive" />
                        {t('settings.deleteAccount')}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {t('settings.deleteAccountDesc')}
                      </p>
                      <div className="pt-2">
                        <Button variant="destructive" onClick={handleDeleteAccount} disabled={loading}>
                          {t('settings.deleteAccount')}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-4">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>{t('settings.notificationPreferences')}</CardTitle>
                <CardDescription>
                  {t('settings.notificationPreferencesDesc')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-row items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>{t('settings.emailNotifications')}</Label>
                      <p className="text-sm text-muted-foreground">
                        {t('settings.emailNotificationsDesc')}
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.emailNotifications}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          emailNotifications: checked
                        })
                      }
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex flex-row items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>{t('settings.accountAlerts')}</Label>
                      <p className="text-sm text-muted-foreground">
                        {t('settings.accountAlertsDesc')}
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.accountAlerts}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          accountAlerts: checked
                        })
                      }
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex flex-row items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>{t('settings.marketingEmails')}</Label>
                      <p className="text-sm text-muted-foreground">
                        {t('settings.marketingEmailsDesc')}
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.marketingEmails}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          marketingEmails: checked
                        })
                      }
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex flex-row items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>{t('settings.newFeatures')}</Label>
                      <p className="text-sm text-muted-foreground">
                        {t('settings.newFeaturesDesc')}
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.newFeatures}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          newFeatures: checked
                        })
                      }
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex flex-row items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>{t('settings.tips')}</Label>
                      <p className="text-sm text-muted-foreground">
                        {t('settings.tipsDesc')}
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.tips}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          tips: checked
                        })
                      }
                    />
                  </div>
                  
                  <div className="pt-2">
                    <Button onClick={handleNotificationSettingsUpdate}>
                      {t('common.save')}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Plan Tab */}
          <TabsContent value="plan" className="space-y-4">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>{t('settings.currentPlan')}</CardTitle>
                <CardDescription>
                  {t('settings.currentPlanDesc')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{profile.plan === "free" ? t('settings.freePlan') : t('settings.proPlan')}</p>
                      <p className="text-sm text-muted-foreground">
                        {profile.plan === "free"
                          ? t('settings.freePlanDesc')
                          : t('settings.proPlanDesc')}
                      </p>
                    </div>
                    <Badge variant={profile.plan === "free" ? "outline" : "default"} className={profile.plan === "free" ? "" : "bg-brand-purple"}>
                      {profile.plan === "free" ? t('settings.free') : t('settings.premium')}
                    </Badge>
                  </div>
                  
                  <div className="pt-2">
                    <p className="text-sm">
                      {t('settings.currentCredits')}: <span className="font-bold">{profile.credits}</span>
                    </p>
                  </div>
                  
                  <div className="pt-2">
                    {profile.plan === "free" ? (
                      <Button className="bg-brand-purple hover:bg-brand-purple/90" onClick={() => toast.info("Faça upgrade para um plano pago e desbloqueie todos os recursos!")}>
                        <Link to="/planos">{t('settings.upgradePlan')}</Link>
                      </Button>
                    ) : (
                      <Button variant="outline">{t('settings.managePlan')}</Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Credits Tab - New */}
          <TabsContent value="credits" className="space-y-4">
            <div className="grid gap-4 md:gap-6">
              <AvailableCreditsCard />
              <BuyCreditsCard />
              <TransactionsCard />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UserSettingsPage;
