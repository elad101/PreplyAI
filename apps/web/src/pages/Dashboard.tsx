import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, Settings, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useMeetings } from '@/hooks/useApi';
import { format, parseISO } from 'date-fns';

// Helper function to extract company name from email domain
const getCompanyNameFromEmail = (email: string): string => {
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return 'Unknown Company';
  
  // List of common email providers
  const emailProviders = [
    'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com',
    'aol.com', 'protonmail.com', 'zoho.com', 'yandex.com', 'mail.com'
  ];
  
  if (emailProviders.includes(domain)) {
    return 'Personal';
  }
  
  // Extract company name from domain
  const companyName = domain.split('.')[0];
  return companyName.charAt(0).toUpperCase() + companyName.slice(1);
};

// Helper function to get display name from attendee
const getAttendeeDisplayName = (attendee: any): string => {
  if (attendee.displayName) return attendee.displayName;
  if (attendee.email) {
    const namePart = attendee.email.split('@')[0];
    // Convert dots and underscores to spaces, capitalize
    return namePart.replace(/[._]/g, ' ').split(' ')
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
  return 'Unknown';
};
import { Skeleton } from '@/components/ui/skeleton';
import { GoogleCalendarConnect } from '@/components/GoogleCalendarConnect';

export function Dashboard() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { meetings, isLoading, isError } = useMeetings();

  const handleSelectMeeting = (meetingId: string) => {
    navigate(`/m/${meetingId}`);
  };

  const handleSettings = () => {
    navigate('/settings');
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };


  // Compute meeting status and filter upcoming meetings
  const upcomingMeetings = Array.isArray(meetings) ? meetings.filter(m => {
    try {
      const startTime = parseISO(m.startTime);
      const now = new Date();
      // Check if the date is valid
      if (isNaN(startTime.getTime())) {
        console.warn('Invalid start time:', m.startTime);
        return false;
      }
      return startTime > now; // Upcoming meetings
    } catch (error) {
      console.warn('Error parsing meeting start time:', m.startTime, error);
      return false;
    }
  }) : [];
  
  // Get all meetings for today (including past ones today)
  const todayMeetings = Array.isArray(meetings) ? meetings.filter(m => {
    try {
      const meetingDate = parseISO(m.startTime);
      if (isNaN(meetingDate.getTime())) {
        return false;
      }
      return format(meetingDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
    } catch (error) {
      console.warn('Error parsing meeting date for today filter:', m.startTime, error);
      return false;
    }
  }) : [];

  // Count meetings with completed AI briefings
  const preppedCount = Array.isArray(meetings) ? meetings.filter(m => {
    return m.briefing && (m.briefing as any).status === 'completed';
  }).length : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Decorative Shapes */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <svg className="absolute -top-20 -left-20 w-60 h-60 opacity-40" viewBox="0 0 200 200">
          <path fill="#6366f1" d="M45.3,-57.5C58.6,-49.3,69.3,-34.9,73.7,-18.4C78.1,-1.9,76.3,16.7,68.2,31.6C60.1,46.5,45.8,57.7,29.7,64.3C13.6,70.9,-4.3,72.9,-20.7,68.4C-37.1,63.9,-52,53,-61.7,38.4C-71.4,23.8,-75.9,5.5,-73.3,-11.7C-70.7,-28.9,-60.9,-45,-47.6,-53.5C-34.3,-62,-17.1,-62.9,0.5,-63.5C18.1,-64.1,36.2,-64.4,45.3,-57.5Z" transform="translate(100 100)" />
        </svg>
        
        <svg className="absolute -top-10 right-10 w-40 h-40 opacity-30" viewBox="0 0 200 200">
          <path fill="#f59e0b" d="M41.3,-49.1C53.4,-42.5,62.8,-30.3,67.4,-16.2C72,-2.1,71.8,13.9,65.3,27.3C58.8,40.7,46,51.5,31.8,57.8C17.6,64.1,1.9,65.9,-14.5,64.4C-30.9,62.9,-48,58.1,-59.5,47.5C-71,36.9,-77,20.5,-76.8,4.5C-76.6,-11.5,-70.2,-27.1,-59.3,-38.2C-48.4,-49.3,-33,-55.9,-17.9,-60.8C-2.8,-65.7,11.9,-69,24.9,-64.8C37.9,-60.6,29.2,-55.7,41.3,-49.1Z" transform="translate(100 100)" />
        </svg>
        
        <svg className="absolute bottom-20 -left-10 w-48 h-48 opacity-35" viewBox="0 0 200 200">
          <path fill="#10b981" d="M37.6,-51.4C48.9,-43.2,58.4,-32.2,63.7,-19.1C69,-6,70.1,9.3,65.3,22.7C60.5,36.1,49.8,47.6,37.1,54.9C24.4,62.2,9.7,65.3,-5.3,64.3C-20.3,63.3,-35.6,58.2,-47.3,49.3C-59,40.4,-67.1,27.7,-70.1,13.7C-73.1,-0.3,-71,-15.6,-64.1,-28.8C-57.2,-42,-45.5,-53.1,-32.5,-60.7C-19.5,-68.3,-4.8,-72.4,8.1,-69.9C21,-67.4,26.3,-59.6,37.6,-51.4Z" transform="translate(100 100)" />
        </svg>
        
        <svg className="absolute bottom-10 right-20 w-52 h-52 opacity-25" viewBox="0 0 200 200">
          <path fill="#8b5cf6" d="M43.7,-55.2C56.4,-47.3,66.5,-34.2,71.3,-19.2C76.1,-4.2,75.6,12.7,69.5,27.3C63.4,41.9,51.7,54.2,37.8,61.7C23.9,69.2,7.8,71.9,-8.1,70.3C-24,68.7,-39.7,62.8,-52.4,53.1C-65.1,43.4,-74.8,29.9,-77.2,15C-79.6,0.1,-74.7,-16.2,-66.2,-30.1C-57.7,-44,-45.6,-55.5,-32,-62.9C-18.4,-70.3,-3.8,-73.6,9.6,-71.6C23,-69.6,31,-63,43.7,-55.2Z" transform="translate(100 100)" />
        </svg>
      </div>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <img 
              src="/logo-medium.png" 
              alt="SalesPrep.AI" 
              className="w-10 h-10 object-contain"
              style={{ 
                imageRendering: 'auto' as any
              }}
            />
            <h1 className="text-xl text-gray-900">SalesPrep.AI</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleSettings} className="rounded-full">
              <Settings className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="rounded-full">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 space-y-6 relative z-0">
        {/* Welcome Section */}
        <div className="space-y-2 pt-2">
          <h2 className="text-3xl text-gray-900">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user?.displayName || 'there'}!
          </h2>
          <p className="text-gray-600 text-lg">
            You have {upcomingMeetings.length} upcoming meeting{upcomingMeetings.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-white border-0 shadow-xl rounded-3xl overflow-hidden hover:shadow-2xl transition-shadow">
            <CardContent className="p-6 relative">
              <div className="absolute -top-2 -right-2 w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full opacity-50"></div>
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-3 shadow-lg">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <p className="text-gray-600 text-sm mb-1">Meetings Today</p>
                <p className="text-3xl text-gray-900">{isLoading ? '...' : todayMeetings.length}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-0 shadow-xl rounded-3xl overflow-hidden hover:shadow-2xl transition-shadow">
            <CardContent className="p-6 relative">
              <div className="absolute -top-2 -right-2 w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full opacity-50"></div>
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-3 shadow-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <p className="text-gray-600 text-sm mb-1">AI Briefings</p>
                <p className="text-3xl text-gray-900">{isLoading ? '...' : preppedCount}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Meetings */}
        <div className="space-y-4 pb-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl text-gray-900">Upcoming Meetings</h3>
            <GoogleCalendarConnect />
          </div>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="border-0 shadow-lg rounded-2xl bg-white">
                  <CardContent className="p-5">
                    <Skeleton className="h-6 w-2/3 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-4" />
                    <Skeleton className="h-4 w-3/4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : isError ? (
            <Card className="border-0 shadow-lg rounded-2xl bg-white">
              <CardContent className="p-5 text-center">
                <p className="text-gray-600">Failed to load meetings. Please try again.</p>
              </CardContent>
            </Card>
          ) : upcomingMeetings.length === 0 ? (
            <Card className="border-0 shadow-lg rounded-2xl bg-white">
              <CardContent className="p-5 text-center">
                <p className="text-gray-600">No upcoming meetings. Your calendar is clear!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {upcomingMeetings.map((meeting) => {
                let meetingDate: Date;
                let isToday = false;
                let isTomorrow = false;
                
                try {
                  meetingDate = parseISO(meeting.startTime);
                  if (!isNaN(meetingDate.getTime())) {
                    isToday = format(meetingDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
                    isTomorrow = format(meetingDate, 'yyyy-MM-dd') === format(new Date(Date.now() + 86400000), 'yyyy-MM-dd');
                  } else {
                    console.warn('Invalid meeting date:', meeting.startTime);
                    meetingDate = new Date(); // fallback
                  }
                } catch (error) {
                  console.warn('Error parsing meeting date in display:', meeting.startTime, error);
                  meetingDate = new Date(); // fallback
                }
                
                return (
                  <Card 
                    key={meeting.id} 
                    className="cursor-pointer hover:shadow-xl transition-all border-0 shadow-lg rounded-2xl bg-white"
                    onClick={() => handleSelectMeeting(meeting.id)}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-gray-900 text-lg">{meeting.summary || 'Untitled Meeting'}</h4>
                            {meeting.organizer?.email && (
                              <Badge variant="outline" className="text-xs">
                                {getCompanyNameFromEmail(meeting.organizer.email)}
                              </Badge>
                            )}
                          </div>
                          <p className="text-gray-600">
                            {meeting.organizer ? (
                              <>
                                {getAttendeeDisplayName(meeting.organizer)}
                                {meeting.organizer.email && (
                                  <span className="ml-1 text-gray-400">({getCompanyNameFromEmail(meeting.organizer.email)})</span>
                                )}
                              </>
                            ) : (
                              'Unknown Organizer'
                            )}
                          </p>
                        </div>
                        <Badge 
                          variant={meeting.briefing?.status === 'completed' ? "default" : "secondary"}
                          className={meeting.briefing?.status === 'completed'
                            ? "bg-emerald-100 text-emerald-700 border-0 rounded-full px-3 py-1" 
                            : meeting.briefing?.status === 'processing'
                            ? "bg-blue-100 text-blue-700 border-0 rounded-full px-3 py-1"
                            : "bg-amber-100 text-amber-700 border-0 rounded-full px-3 py-1"
                          }
                        >
                          {meeting.briefing?.status === 'completed' 
                            ? "✓ Ready" 
                            : meeting.briefing?.status === 'processing'
                            ? "🔄 Processing"
                            : "⏱ Prep needed"}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          <span>
                            {isToday ? 'Today' : isTomorrow ? 'Tomorrow' : format(meetingDate, 'MMM d')} at {format(meetingDate, 'h:mm a')}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Users className="w-4 h-4" />
                          <span>{meeting.attendees?.length || 0} attendee{(meeting.attendees?.length || 0) !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

