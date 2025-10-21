import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Crown, Bell, Shield, Calendar, Sparkles, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSettings, updateSettings } from '@/hooks/useApi';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export function Settings() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { settings, isLoading, mutate } = useSettings();
  const [isSaving, setIsSaving] = useState(false);

  const handleBack = () => {
    navigate('/');
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
      toast.error('Failed to sign out');
    }
  };

  const handleToggle = async (key: string, value: boolean) => {
    setIsSaving(true);
    try {
      const updates: any = {};
      
      if (key.startsWith('notification.')) {
        const notificationKey = key.split('.')[1];
        updates.notifications = {
          ...settings?.notifications,
          [notificationKey]: value,
        };
      } else if (key.startsWith('ai.')) {
        const aiKey = key.split('.')[1];
        updates.aiPreferences = {
          ...settings?.aiPreferences,
          [aiKey]: value,
        };
      }
      
      await updateSettings(updates);
      mutate();
      toast.success('Settings updated');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Decorative Shapes */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <svg className="absolute top-10 right-20 w-40 h-40 opacity-25" viewBox="0 0 200 200">
          <path fill="#6366f1" d="M45.3,-57.5C58.6,-49.3,69.3,-34.9,73.7,-18.4C78.1,-1.9,76.3,16.7,68.2,31.6C60.1,46.5,45.8,57.7,29.7,64.3C13.6,70.9,-4.3,72.9,-20.7,68.4C-37.1,63.9,-52,53,-61.7,38.4C-71.4,23.8,-75.9,5.5,-73.3,-11.7C-70.7,-28.9,-60.9,-45,-47.6,-53.5C-34.3,-62,-17.1,-62.9,0.5,-63.5C18.1,-64.1,36.2,-64.4,45.3,-57.5Z" transform="translate(100 100)" />
        </svg>
        
        <svg className="absolute bottom-20 left-10 w-48 h-48 opacity-30" viewBox="0 0 200 200">
          <path fill="#10b981" d="M37.6,-51.4C48.9,-43.2,58.4,-32.2,63.7,-19.1C69,-6,70.1,9.3,65.3,22.7C60.5,36.1,49.8,47.6,37.1,54.9C24.4,62.2,9.7,65.3,-5.3,64.3C-20.3,63.3,-35.6,58.2,-47.3,49.3C-59,40.4,-67.1,27.7,-70.1,13.7C-73.1,-0.3,-71,-15.6,-64.1,-28.8C-57.2,-42,-45.5,-53.1,-32.5,-60.7C-19.5,-68.3,-4.8,-72.4,8.1,-69.9C21,-67.4,26.3,-59.6,37.6,-51.4Z" transform="translate(100 100)" />
        </svg>
      </div>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10">
        <div className="flex items-center gap-4 p-4">
          <Button variant="ghost" size="sm" onClick={handleBack} className="rounded-full">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-xl font-medium">Settings</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 space-y-6 relative z-0">
        {/* Profile Section */}
        <Card className="border-0 shadow-xl rounded-3xl bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-xl">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16 border-2 border-gray-100 shadow-md">
                <AvatarImage src={user?.photoURL} alt={user?.displayName || 'User'} />
                <AvatarFallback>{user?.displayName?.[0] || 'U'}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-medium text-lg">{user?.displayName || 'User'}</h3>
                <p className="text-gray-600">{user?.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscription */}
        <Card className="border-0 shadow-xl rounded-3xl bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-xl">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <Crown className="w-5 h-5 text-white" />
              </div>
              Subscription
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-lg">
                    {user?.subscription?.plan === 'pro' ? 'Pro Plan' : 'Free Plan'}
                  </h3>
                  {user?.subscription?.status === 'active' && (
                    <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 rounded-full">
                      <Crown className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
                  )}
                </div>
                {user?.subscription?.renewalDate && (
                  <p className="text-gray-600">
                    Renews {new Date(user.subscription.renewalDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-4">
              <h4 className="font-medium mb-3 text-lg">Plan Features</h4>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                  </div>
                  <span>AI-powered briefings</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-purple-600" />
                  </div>
                  <span>Calendar integration</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span>Priority support</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="border-0 shadow-xl rounded-3xl bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-xl">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-500 rounded-2xl flex items-center justify-center">
                <Bell className="w-5 h-5 text-white" />
              </div>
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <>
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-base">Meeting Reminders</h4>
                    <p className="text-sm text-gray-600">Get notified 30 minutes before meetings</p>
                  </div>
                  <Switch 
                    checked={settings?.notifications?.meetingReminders ?? true}
                    onCheckedChange={(checked) => handleToggle('notification.meetingReminders', checked)}
                    disabled={isSaving}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-base">AI Briefing Ready</h4>
                    <p className="text-sm text-gray-600">Notification when briefing is generated</p>
                  </div>
                  <Switch 
                    checked={settings?.notifications?.briefingReady ?? true}
                    onCheckedChange={(checked) => handleToggle('notification.briefingReady', checked)}
                    disabled={isSaving}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-base">Weekly Summary</h4>
                    <p className="text-sm text-gray-600">Get weekly insights and stats</p>
                  </div>
                  <Switch 
                    checked={settings?.notifications?.weeklySummary ?? false}
                    onCheckedChange={(checked) => handleToggle('notification.weeklySummary', checked)}
                    disabled={isSaving}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* AI Preferences */}
        <Card className="border-0 shadow-xl rounded-3xl bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-xl">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              AI Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <>
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-base">Auto-generate briefings</h4>
                    <p className="text-sm text-gray-600">Create briefings automatically for new meetings</p>
                  </div>
                  <Switch 
                    checked={settings?.aiPreferences?.autoGenerate ?? true}
                    onCheckedChange={(checked) => handleToggle('ai.autoGenerate', checked)}
                    disabled={isSaving}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-base">Include company research</h4>
                    <p className="text-sm text-gray-600">Deep dive into company background</p>
                  </div>
                  <Switch 
                    checked={settings?.aiPreferences?.includeCompanyResearch ?? true}
                    onCheckedChange={(checked) => handleToggle('ai.includeCompanyResearch', checked)}
                    disabled={isSaving}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-base">Competitive insights</h4>
                    <p className="text-sm text-gray-600">Include competitor analysis</p>
                  </div>
                  <Switch 
                    checked={settings?.aiPreferences?.includeCompetitiveInsights ?? false}
                    onCheckedChange={(checked) => handleToggle('ai.includeCompetitiveInsights', checked)}
                    disabled={isSaving}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Account Actions */}
        <div className="space-y-3 pb-6">
          <Button 
            variant="destructive" 
            className="w-full h-12 rounded-2xl"
            onClick={handleLogout}
          >
            Sign Out
          </Button>
        </div>
      </main>
    </div>
  );
}

