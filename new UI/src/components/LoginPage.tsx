import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

interface LoginPageProps {
  onLogin: () => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const handleGoogleLogin = () => {
    // Mock Google login - in real app would use Firebase Auth
    console.log("Initiating Google Sign-in...");
    setTimeout(() => {
      onLogin();
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Shapes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <svg className="absolute top-10 left-10 w-40 h-40 opacity-30" viewBox="0 0 200 200">
          <path fill="#6366f1" d="M45.3,-57.5C58.6,-49.3,69.3,-34.9,73.7,-18.4C78.1,-1.9,76.3,16.7,68.2,31.6C60.1,46.5,45.8,57.7,29.7,64.3C13.6,70.9,-4.3,72.9,-20.7,68.4C-37.1,63.9,-52,53,-61.7,38.4C-71.4,23.8,-75.9,5.5,-73.3,-11.7C-70.7,-28.9,-60.9,-45,-47.6,-53.5C-34.3,-62,-17.1,-62.9,0.5,-63.5C18.1,-64.1,36.2,-64.4,45.3,-57.5Z" transform="translate(100 100)" />
        </svg>
        
        <svg className="absolute bottom-20 right-10 w-48 h-48 opacity-25" viewBox="0 0 200 200">
          <path fill="#8b5cf6" d="M43.7,-55.2C56.4,-47.3,66.5,-34.2,71.3,-19.2C76.1,-4.2,75.6,12.7,69.5,27.3C63.4,41.9,51.7,54.2,37.8,61.7C23.9,69.2,7.8,71.9,-8.1,70.3C-24,68.7,-39.7,62.8,-52.4,53.1C-65.1,43.4,-74.8,29.9,-77.2,15C-79.6,0.1,-74.7,-16.2,-66.2,-30.1C-57.7,-44,-45.6,-55.5,-32,-62.9C-18.4,-70.3,-3.8,-73.6,9.6,-71.6C23,-69.6,31,-63,43.7,-55.2Z" transform="translate(100 100)" />
        </svg>
        
        <svg className="absolute top-1/2 right-20 w-32 h-32 opacity-35" viewBox="0 0 200 200">
          <path fill="#f59e0b" d="M41.3,-49.1C53.4,-42.5,62.8,-30.3,67.4,-16.2C72,-2.1,71.8,13.9,65.3,27.3C58.8,40.7,46,51.5,31.8,57.8C17.6,64.1,1.9,65.9,-14.5,64.4C-30.9,62.9,-48,58.1,-59.5,47.5C-71,36.9,-77,20.5,-76.8,4.5C-76.6,-11.5,-70.2,-27.1,-59.3,-38.2C-48.4,-49.3,-33,-55.9,-17.9,-60.8C-2.8,-65.7,11.9,-69,24.9,-64.8C37.9,-60.6,29.2,-55.7,41.3,-49.1Z" transform="translate(100 100)" />
        </svg>
      </div>

      <Card className="w-full max-w-md mx-auto shadow-2xl border-0 rounded-3xl bg-white relative z-10">
        <CardHeader className="text-center space-y-4 pt-8">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-xl">
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <CardTitle className="text-3xl">Welcome to SalesPrep.AI</CardTitle>
          <CardDescription className="text-base">
            AI-powered briefing generator for sales meetings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pb-8">
          <Button 
            onClick={handleGoogleLogin}
            className="w-full bg-white text-gray-700 border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 flex items-center justify-center gap-3 h-12 rounded-xl shadow-sm"
            variant="outline"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </Button>
          
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}