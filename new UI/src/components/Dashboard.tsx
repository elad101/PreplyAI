import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Calendar, Clock, Users, Settings, LogOut, Sparkles } from "lucide-react";

interface Meeting {
  id: string;
  title: string;
  company: string;
  time: string;
  date: string;
  attendees: number;
  isPrepped: boolean;
}

interface DashboardProps {
  onSelectMeeting: (meetingId: string) => void;
  onSettings: () => void;
  onLogout: () => void;
}

const mockMeetings: Meeting[] = [
  {
    id: "1",
    title: "Product Demo",
    company: "TechCorp Inc.",
    time: "10:00 AM",
    date: "Today",
    attendees: 3,
    isPrepped: true,
  },
  {
    id: "2",
    title: "Discovery Call",
    company: "StartupXYZ",
    time: "2:00 PM",
    date: "Today",
    attendees: 2,
    isPrepped: false,
  },
  {
    id: "3",
    title: "Follow-up Meeting",
    company: "Enterprise Solutions",
    time: "9:00 AM",
    date: "Tomorrow",
    attendees: 5,
    isPrepped: false,
  },
  {
    id: "4",
    title: "Proposal Review",
    company: "Global Industries",
    time: "3:30 PM",
    date: "Tomorrow",
    attendees: 4,
    isPrepped: true,
  },
];

export function Dashboard({ onSelectMeeting, onSettings, onLogout }: DashboardProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Decorative Shapes */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Top Left Shape */}
        <svg className="absolute -top-20 -left-20 w-60 h-60 opacity-40" viewBox="0 0 200 200">
          <path fill="#6366f1" d="M45.3,-57.5C58.6,-49.3,69.3,-34.9,73.7,-18.4C78.1,-1.9,76.3,16.7,68.2,31.6C60.1,46.5,45.8,57.7,29.7,64.3C13.6,70.9,-4.3,72.9,-20.7,68.4C-37.1,63.9,-52,53,-61.7,38.4C-71.4,23.8,-75.9,5.5,-73.3,-11.7C-70.7,-28.9,-60.9,-45,-47.6,-53.5C-34.3,-62,-17.1,-62.9,0.5,-63.5C18.1,-64.1,36.2,-64.4,45.3,-57.5Z" transform="translate(100 100)" />
        </svg>
        
        {/* Top Right Shape */}
        <svg className="absolute -top-10 right-10 w-40 h-40 opacity-30" viewBox="0 0 200 200">
          <path fill="#f59e0b" d="M41.3,-49.1C53.4,-42.5,62.8,-30.3,67.4,-16.2C72,-2.1,71.8,13.9,65.3,27.3C58.8,40.7,46,51.5,31.8,57.8C17.6,64.1,1.9,65.9,-14.5,64.4C-30.9,62.9,-48,58.1,-59.5,47.5C-71,36.9,-77,20.5,-76.8,4.5C-76.6,-11.5,-70.2,-27.1,-59.3,-38.2C-48.4,-49.3,-33,-55.9,-17.9,-60.8C-2.8,-65.7,11.9,-69,24.9,-64.8C37.9,-60.6,29.2,-55.7,41.3,-49.1Z" transform="translate(100 100)" />
        </svg>
        
        {/* Bottom Left Shape */}
        <svg className="absolute bottom-20 -left-10 w-48 h-48 opacity-35" viewBox="0 0 200 200">
          <path fill="#10b981" d="M37.6,-51.4C48.9,-43.2,58.4,-32.2,63.7,-19.1C69,-6,70.1,9.3,65.3,22.7C60.5,36.1,49.8,47.6,37.1,54.9C24.4,62.2,9.7,65.3,-5.3,64.3C-20.3,63.3,-35.6,58.2,-47.3,49.3C-59,40.4,-67.1,27.7,-70.1,13.7C-73.1,-0.3,-71,-15.6,-64.1,-28.8C-57.2,-42,-45.5,-53.1,-32.5,-60.7C-19.5,-68.3,-4.8,-72.4,8.1,-69.9C21,-67.4,26.3,-59.6,37.6,-51.4Z" transform="translate(100 100)" />
        </svg>
        
        {/* Bottom Right Shape */}
        <svg className="absolute bottom-10 right-20 w-52 h-52 opacity-25" viewBox="0 0 200 200">
          <path fill="#8b5cf6" d="M43.7,-55.2C56.4,-47.3,66.5,-34.2,71.3,-19.2C76.1,-4.2,75.6,12.7,69.5,27.3C63.4,41.9,51.7,54.2,37.8,61.7C23.9,69.2,7.8,71.9,-8.1,70.3C-24,68.7,-39.7,62.8,-52.4,53.1C-65.1,43.4,-74.8,29.9,-77.2,15C-79.6,0.1,-74.7,-16.2,-66.2,-30.1C-57.7,-44,-45.6,-55.5,-32,-62.9C-18.4,-70.3,-3.8,-73.6,9.6,-71.6C23,-69.6,31,-63,43.7,-55.2Z" transform="translate(100 100)" />
        </svg>
      </div>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <h1 className="text-xl text-gray-900">SalesPrep.AI</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onSettings} className="rounded-full">
              <Settings className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onLogout} className="rounded-full">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 space-y-6 relative z-0">
        {/* Welcome Section */}
        <div className="space-y-2 pt-2">
          <h2 className="text-3xl text-gray-900">Good morning, John!</h2>
          <p className="text-gray-600 text-lg">You have {mockMeetings.length} upcoming meetings</p>
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
                <p className="text-3xl text-gray-900">2</p>
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
                <p className="text-3xl text-gray-900">2</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Meetings */}
        <div className="space-y-4 pb-6">
          <h3 className="text-xl text-gray-900">Upcoming Meetings</h3>
          <div className="space-y-3">
            {mockMeetings.map((meeting) => (
              <Card 
                key={meeting.id} 
                className="cursor-pointer hover:shadow-xl transition-all border-0 shadow-lg rounded-2xl bg-white"
                onClick={() => onSelectMeeting(meeting.id)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1 text-lg">{meeting.title}</h4>
                      <p className="text-gray-600">{meeting.company}</p>
                    </div>
                    <Badge 
                      variant={meeting.isPrepped ? "default" : "secondary"}
                      className={meeting.isPrepped 
                        ? "bg-emerald-100 text-emerald-700 border-0 rounded-full px-3 py-1" 
                        : "bg-amber-100 text-amber-700 border-0 rounded-full px-3 py-1"
                      }
                    >
                      {meeting.isPrepped ? "✓ Ready" : "⏱ Prep needed"}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      <span>{meeting.date} at {meeting.time}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-4 h-4" />
                      <span>{meeting.attendees} attendees</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}