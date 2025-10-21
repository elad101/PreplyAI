import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { ArrowLeft, Crown, Bell, Shield, Calendar, Sparkles, CreditCard, User } from "lucide-react";

interface SettingsProps {
  onBack: () => void;
  onLogout: () => void;
}

export function Settings({ onBack, onLogout }: SettingsProps) {
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
          <Button variant="ghost" size="sm" onClick={onBack} className="rounded-full">
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
                <AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face" alt="John Doe" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-medium text-lg">John Doe</h3>
                <p className="text-gray-600">john.doe@company.com</p>
                <p className="text-sm text-gray-500">Sales Manager at Acme Corp</p>
              </div>
              <Button variant="outline" size="sm" className="rounded-xl border-2">Edit</Button>
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
                  <h3 className="font-medium text-lg">Pro Plan</h3>
                  <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 rounded-full">
                    <Crown className="w-3 h-3 mr-1" />
                    Active
                  </Badge>
                </div>
                <p className="text-gray-600">$29/month • Renews Dec 15, 2024</p>
              </div>
              <Button variant="outline" size="sm" className="rounded-xl border-2">
                <CreditCard className="w-4 h-4 mr-2" />
                Manage
              </Button>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-4">
              <h4 className="font-medium mb-3 text-lg">Plan Features</h4>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                  </div>
                  <span>Unlimited AI briefings</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-purple-600" />
                  </div>
                  <span>Google Calendar sync</span>
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
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-base">Meeting Reminders</h4>
                <p className="text-sm text-gray-600">Get notified 30 minutes before meetings</p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-base">AI Briefing Ready</h4>
                <p className="text-sm text-gray-600">Notification when briefing is generated</p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-base">Weekly Summary</h4>
                <p className="text-sm text-gray-600">Get weekly insights and stats</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* Integrations */}
        <Card className="border-0 shadow-xl rounded-3xl bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-xl">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              Integrations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-md">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-medium text-base">Google Calendar</h4>
                  <p className="text-sm text-gray-600">Connected</p>
                </div>
              </div>
              <Badge variant="outline" className="text-emerald-700 border-emerald-200 bg-emerald-50 rounded-full">
                Active
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#0077b5] rounded-xl flex items-center justify-center shadow-md">
                  <span className="text-white text-xs font-bold">in</span>
                </div>
                <div>
                  <h4 className="font-medium text-base">LinkedIn</h4>
                  <p className="text-sm text-gray-600">For attendee insights</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="rounded-xl border-2">Connect</Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#00a4ef] rounded-xl flex items-center justify-center shadow-md">
                  <span className="text-white text-xs font-bold">SF</span>
                </div>
                <div>
                  <h4 className="font-medium text-base">Salesforce</h4>
                  <p className="text-sm text-gray-600">Sync account data</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="rounded-xl border-2">Connect</Button>
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
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
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-base">Auto-generate briefings</h4>
                <p className="text-sm text-gray-600">Create briefings automatically for new meetings</p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-base">Include company research</h4>
                <p className="text-sm text-gray-600">Deep dive into company background</p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-base">Competitive insights</h4>
                <p className="text-sm text-gray-600">Include competitor analysis</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <div className="space-y-3 pb-6">
          <Button variant="outline" className="w-full h-12 rounded-2xl border-2">
            Export Data
          </Button>
          <Button 
            variant="destructive" 
            className="w-full h-12 rounded-2xl"
            onClick={onLogout}
          >
            Sign Out
          </Button>
        </div>
      </main>
    </div>
  );
}