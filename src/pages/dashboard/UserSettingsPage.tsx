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
      
      toast.success(t('settings.profileUpdated'));
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(t('errors.updatingProfile') || "Error updating profile");
    } finally {
      setLoading(false);
    }
  };
  
  // Handle password change
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmNewPassword) {
      toast.error(t('errors.passwordsDoNotMatch') || "Passwords do not match");
      return;
    }
    
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      toast.success(t('settings.passwordUpdated'));
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error(t('errors.changingPassword') || "Error changing password");
    } finally {
      setLoading(false);
    }
  };
  
  // Handle language change
  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    i18n.changeLanguage(newLanguage);
    localStorage.setItem("i18nextLng", newLanguage);
    toast.success(t('settings.languageUpdated'));
  };
  
  // Handle notification settings update
  const handleNotificationSettingsUpdate = () => {
    toast.success(t('settings.notificationsUpdated'));
  };
  
  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (confirm(t('settings.confirmDeleteAccount'))) {
      try {
        setLoading(true);
        
        // Delete user account
        const { error } = await supabase.auth.admin.deleteUser(authState.user?.id || "");
        
        if (error) throw error;
        
        await logout();
        toast.success(t('settings.accountDeleted'));
      } catch (error) {
        console.error("Error deleting account:", error);
        toast.error(t('errors.deletingAccount') || "Error deleting account");
        setLoading(false);
      }
    }
  };
  
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
        <Tabs defaultValue="profile" className="w-full space-y-6">
          <Card className="shadow-sm border-0 bg-muted/50">
            <CardContent className="p-1 sm:p-2">
              <TabsList className="w-full grid grid-cols-2 md:grid-cols-4 gap-1">
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
                  <div className="space-y-2">
                    <Label htmlFor="name">{t('settings.name')}</Label>
                    <Input
                      id="name"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">{t('settings.email')}</Label>
                    <Input
                      id="email"
                      value={profile.email}
                      disabled
                      readOnly
                    />
                    <p className="text-xs text-muted-foreground">
                      {t('settings.emailChangeNote')}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>{t('settings.language')}</Label>
                    <Select value={language} onValueChange={handleLanguageChange}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('settings.selectLanguage')} />
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
                      <Button className="bg-brand-purple hover:bg-brand-purple/90">
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
        </Tabs>
      </div>
    </div>
  );
};

export default UserSettingsPage;
