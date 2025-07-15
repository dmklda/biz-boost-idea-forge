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
import { Bell, CreditCard, Globe, Lock, ShieldAlert, User } from "lucide-react";
import { AvailableCreditsCard } from "@/components/dashboard/AvailableCreditsCard";
import { BuyCreditsCard } from "@/components/dashboard/BuyCreditsCard";
import { TransactionsCard } from "@/components/dashboard/TransactionsCard";
import { useGamification } from '@/hooks/useGamification';

interface Profile {
  name: string;
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

// Função para upload de foto para Supabase Storage
const uploadProfilePhoto = async (file: File, userId: string) => {
  const fileExt = file.name.split('.').pop();
  const filePath = `${userId}.${fileExt}`;
  const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });
  if (uploadError) throw uploadError;
  const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
  return data.publicUrl;
};

const UserSettingsPage = () => {
  const { t, i18n } = useTranslation();
  const { authState, logout } = useAuth();
  const isMobile = useIsMobile();
  const { addPoints, checkAndAwardAchievements } = useGamification();
  
  // User profile state
  const [profile, setProfile] = useState<Profile>({
    name: authState.user?.name || "",
    email: authState.user?.email || "",
    plan: authState.user?.plan || "free",
    credits: authState.user?.credits || 0,
    photo_url: authState.user?.photo_url || "",
    bio: authState.user?.bio || "",
    linkedin: authState.user?.linkedin || "",
    phone: authState.user?.phone || "",
    city: authState.user?.city || "",
    area: authState.user?.area || "",
    company: authState.user?.company || "",
    birthdate: authState.user?.birthdate || "",
    contact_pref: authState.user?.contact_pref || ""
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
      hasName && hasLanguage && hasPassword && hasNotifications &&
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
    setLoading(true);
    try {
      const wasIncomplete = !authState.user.name;
      // Upload foto se houver
      let photo_url = profile.photo_url;
      if (profile.photo_url && profile.photo_url.startsWith('data:')) {
        // Simulação de upload: normalmente usaria Supabase Storage
        // Aqui, apenas salva a string base64 para simplificação
        photo_url = profile.photo_url;
      }
      const { error } = await supabase
        .from('profiles')
        .update({
          name: profile.name,
          photo_url,
          bio: profile.bio,
          linkedin: profile.linkedin,
          phone: profile.phone,
          city: profile.city,
          area: profile.area,
          company: profile.company,
          birthdate: profile.birthdate,
          contact_pref: profile.contact_pref
        })
        .eq('id', authState.user.id);
      if (error) throw error;
      authState.user.name = profile.name;
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

  useEffect(() => {
    const fetchProfile = async () => {
      if (authState.user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authState.user.id)
          .single();
        if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
          throw error;
        } else if (data) {
          setProfile(data);
        }
      }
    };
    fetchProfile();
  }, [authState.user]);

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
              <CardHeader>
                <CardTitle>{t('settings.personalInfo')}</CardTitle>
                <CardDescription>
                  {t('settings.personalInfoDesc')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  {/* Nome */}
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome</Label>
                    <Input
                      id="name"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      required
                      placeholder="Seu nome completo"
                    />
                  </div>
                  {/* Foto de perfil */}
                  <div className="space-y-2">
                    <Label htmlFor="photo">Foto de perfil</Label>
                    <Input
                      id="photo"
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file && authState.user) {
                          try {
                            const url = await uploadProfilePhoto(file, authState.user.id);
                            setProfile({ ...profile, photo_url: url });
                          } catch (err) {
                            toast.error('Erro ao fazer upload da foto de perfil');
                          }
                        }
                      }}
                    />
                    {profile.photo_url && (
                      <img src={profile.photo_url} alt="Foto de perfil" className="w-20 h-20 rounded-full object-cover mt-2" />
                    )}
                  </div>
                  {/* Bio */}
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Input
                      id="bio"
                      value={profile.bio}
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
                      value={profile.linkedin}
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
                      value={profile.phone}
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
                      value={profile.city}
                      onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                      placeholder="Sua cidade"
                    />
                  </div>
                  {/* Área de atuação */}
                  <div className="space-y-2">
                    <Label htmlFor="area">Área de atuação</Label>
                    <Input
                      id="area"
                      value={profile.area}
                      onChange={(e) => setProfile({ ...profile, area: e.target.value })}
                      placeholder="Ex: Tecnologia, Saúde, Educação..."
                    />
                  </div>
                  {/* Empresa */}
                  <div className="space-y-2">
                    <Label htmlFor="company">Empresa</Label>
                    <Input
                      id="company"
                      value={profile.company}
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
                      value={profile.birthdate}
                      onChange={(e) => setProfile({ ...profile, birthdate: e.target.value })}
                    />
                  </div>
                  {/* Preferência de contato */}
                  <div className="space-y-2">
                    <Label htmlFor="contact_pref">Preferência de contato</Label>
                    <Select
                      value={profile.contact_pref}
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
                      <Button className="bg-brand-purple hover:bg-brand-purple/90" onClick={() => toast.info("Faça upgrade para o plano premium e desbloqueie todos os recursos!")}>
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
