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
import { CreditCard, Bell, Globe, User, Lock, ShieldAlert } from "lucide-react";

interface Profile {
  name: string;
  email: string;
  plan: string;
  credits: number;
}

const UserSettingsPage = () => {
  const { t, i18n } = useTranslation();
  const { authState, logout } = useAuth();
  const isMobile = useIsMobile();
  
  // User profile state
  const [profile, setProfile] = useState<Profile>({
    name: authState.user?.name || "",
    email: authState.user?.email || "",
    plan: authState.user?.plan || "free",
    credits: authState.user?.credits || 0
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
  
  // Handle saving profile changes
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!authState.user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          name: profile.name
        })
        .eq('id', authState.user.id);
        
      if (error) throw error;
      
      // Update user state - modify to use available methods from useAuth hook
      authState.user.name = profile.name;
      
      toast.success(t('settings.profileUpdated') || "Perfil atualizado com sucesso");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(t('errors.updatingProfile') || "Erro ao atualizar perfil");
    } finally {
      setLoading(false);
    }
  };
  
  // Handle password change
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmNewPassword) {
      toast.error(t('errors.passwordsDoNotMatch') || "As senhas não coincidem");
      return;
    }
    
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      toast.success(t('settings.passwordUpdated') || "Senha atualizada com sucesso");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error(t('errors.changingPassword') || "Erro ao alterar senha");
    } finally {
      setLoading(false);
    }
  };
  
  // Handle language change
  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    i18n.changeLanguage(newLanguage);
    localStorage.setItem("i18nextLng", newLanguage);
    toast.success(t('settings.languageUpdated') || "Idioma atualizado com sucesso");
  };
  
  // Handle notification settings update
  const handleNotificationSettingsUpdate = () => {
    toast.success(t('settings.notificationsUpdated') || "Configurações de notificações atualizadas");
  };
  
  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (confirm(t('settings.confirmDeleteAccount') || "Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.")) {
      try {
        setLoading(true);
        
        // Delete user account
        const { error } = await supabase.auth.admin.deleteUser(authState.user?.id || "");
        
        if (error) throw error;
        
        await logout();
        toast.success(t('settings.accountDeleted') || "Conta excluída com sucesso");
      } catch (error) {
        console.error("Error deleting account:", error);
        toast.error(t('errors.deletingAccount') || "Erro ao excluir conta");
        setLoading(false);
      }
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          {t('settings.title') || "Configurações"}
        </h1>
        <p className="text-muted-foreground mt-1">
          {t('settings.subtitle') || "Gerencie suas preferências de conta e perfil"}
        </p>
      </div>
      
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="profile">
            <User className="h-4 w-4 mr-2" />
            {t('settings.profile') || "Perfil"}
          </TabsTrigger>
          <TabsTrigger value="account">
            <Lock className="h-4 w-4 mr-2" />
            {t('settings.account') || "Conta"}
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            {t('settings.notifications') || "Notificações"}
          </TabsTrigger>
          <TabsTrigger value="plan">
            <CreditCard className="h-4 w-4 mr-2" />
            {t('settings.plan') || "Plano"}
          </TabsTrigger>
        </TabsList>
        
        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-4">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>{t('settings.personalInfo') || "Informações Pessoais"}</CardTitle>
              <CardDescription>
                {t('settings.personalInfoDesc') || "Atualize suas informações de perfil"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('settings.name') || "Nome"}</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">{t('settings.email') || "Email"}</Label>
                  <Input
                    id="email"
                    value={profile.email}
                    disabled
                    readOnly
                  />
                  <p className="text-xs text-muted-foreground">
                    {t('settings.emailChangeNote') || "O email não pode ser alterado"}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label>{t('settings.language') || "Idioma"}</Label>
                  <Select value={language} onValueChange={handleLanguageChange}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('settings.selectLanguage') || "Selecione um idioma"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt">Português</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="ja">日本語</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button type="submit" disabled={loading}>
                  {loading ? (t('common.saving') || "Salvando...") : (t('common.save') || "Salvar")}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Account Tab */}
        <TabsContent value="account" className="space-y-4">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>{t('settings.security') || "Segurança"}</CardTitle>
              <CardDescription>
                {t('settings.securityDesc') || "Gerencie sua senha e configurações de segurança"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">{t('settings.currentPassword') || "Senha atual"}</Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="new-password">{t('settings.newPassword') || "Nova senha"}</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">{t('settings.confirmPassword') || "Confirmar nova senha"}</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    required
                  />
                </div>
                
                <Button type="submit" disabled={loading}>
                  {loading ? (t('common.updating') || "Atualizando...") : (t('settings.changePassword') || "Alterar senha")}
                </Button>
              </form>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>{t('settings.dangerZone') || "Zona de Perigo"}</CardTitle>
              <CardDescription>
                {t('settings.dangerZoneDesc') || "Ações irreversíveis para sua conta"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-md border border-destructive/50 p-4">
                  <div className="flex flex-col space-y-2">
                    <h3 className="font-medium flex items-center gap-2">
                      <ShieldAlert className="h-4 w-4 text-destructive" />
                      {t('settings.deleteAccount') || "Excluir conta"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {t('settings.deleteAccountDesc') || "Ao excluir sua conta, todos os dados serão permanentemente removidos. Esta ação não pode ser desfeita."}
                    </p>
                    <div className="pt-2">
                      <Button variant="destructive" onClick={handleDeleteAccount} disabled={loading}>
                        {t('settings.deleteAccount') || "Excluir conta"}
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
              <CardTitle>{t('settings.notificationPreferences') || "Preferências de Notificação"}</CardTitle>
              <CardDescription>
                {t('settings.notificationPreferencesDesc') || "Configure como você deseja receber notificações"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-row items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t('settings.emailNotifications') || "Notificações por email"}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t('settings.emailNotificationsDesc') || "Receba notificações por email"}
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
                    <Label>{t('settings.accountAlerts') || "Alertas de conta"}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t('settings.accountAlertsDesc') || "Alertas importantes sobre sua conta"}
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
                    <Label>{t('settings.marketingEmails') || "Emails de marketing"}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t('settings.marketingEmailsDesc') || "Receba ofertas e novidades"}
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
                    <Label>{t('settings.newFeatures') || "Novos recursos"}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t('settings.newFeaturesDesc') || "Receba notificações sobre novos recursos"}
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
                    <Label>{t('settings.tips') || "Dicas e sugestões"}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t('settings.tipsDesc') || "Receba dicas para melhorar suas ideias"}
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
                    {t('common.save') || "Salvar"}
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
              <CardTitle>{t('settings.currentPlan') || "Plano Atual"}</CardTitle>
              <CardDescription>
                {t('settings.currentPlanDesc') || "Detalhes do seu plano e assinatura"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{profile.plan === "free" ? t('settings.freePlan') || "Plano Gratuito" : t('settings.proPlan') || "Plano Pro"}</p>
                    <p className="text-sm text-muted-foreground">
                      {profile.plan === "free"
                        ? (t('settings.freePlanDesc') || "Acesso básico com recursos limitados")
                        : (t('settings.proPlanDesc') || "Acesso completo a todos os recursos")}
                    </p>
                  </div>
                  <Badge variant={profile.plan === "free" ? "outline" : "default"} className={profile.plan === "free" ? "" : "bg-brand-purple"}>
                    {profile.plan === "free" ? t('settings.free') || "Gratuito" : t('settings.premium') || "Premium"}
                  </Badge>
                </div>
                
                <div className="pt-2">
                  <p className="text-sm">
                    {t('settings.currentCredits') || "Créditos disponíveis"}: <span className="font-bold">{profile.credits}</span>
                  </p>
                </div>
                
                <div className="pt-2">
                  {profile.plan === "free" ? (
                    <Button className="bg-brand-purple hover:bg-brand-purple/90">
                      <Link to="/planos">{t('settings.upgradePlan') || "Fazer upgrade"}</Link>
                    </Button>
                  ) : (
                    <Button variant="outline">{t('settings.managePlan') || "Gerenciar assinatura"}</Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserSettingsPage;
