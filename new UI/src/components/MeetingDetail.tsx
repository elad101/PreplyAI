import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { ArrowLeft, Building, Users, MessageCircle, Lightbulb, ExternalLink, Sparkles } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface Attendee {
  id: string;
  name: string;
  title: string;
  company: string;
  linkedinPhoto: string;
  summary: string;
}

interface MeetingDetailProps {
  meetingId: string;
  onBack: () => void;
}

const mockMeetingData = {
  "1": {
    title: "Product Demo",
    company: {
      name: "TechCorp Inc.",
      logo: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=64&h=64&fit=crop&crop=face",
      description: "TechCorp is a leading software company specializing in enterprise solutions for Fortune 500 companies. Founded in 2015, they have grown to 500+ employees and $50M ARR.",
    },
    attendees: [
      {
        id: "1",
        name: "Sarah Johnson",
        title: "VP of Engineering",
        company: "TechCorp Inc.",
        linkedinPhoto: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=64&h=64&fit=crop&crop=face",
        summary: "Sarah leads a team of 50+ engineers and has been instrumental in scaling TechCorp's platform architecture. Previously worked at Google and Microsoft.",
      },
      {
        id: "2",
        name: "Michael Chen",
        title: "CTO",
        company: "TechCorp Inc.",
        linkedinPhoto: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face",
        summary: "Michael is the technical visionary behind TechCorp's products. He's particularly interested in AI/ML integrations and developer tooling solutions.",
      },
      {
        id: "3",
        name: "Lisa Wang",
        title: "Product Manager",
        company: "TechCorp Inc.",
        linkedinPhoto: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face",
        summary: "Lisa manages the core product roadmap and has been pushing for better analytics and reporting capabilities in their current stack.",
      },
    ],
    talkingPoints: [
      "Highlight our real-time analytics dashboard and how it compares to their current solution",
      "Discuss scalability - they're planning to 3x their user base in the next 18 months",
      "Address their concerns about data security and compliance (they mentioned SOC2 requirements)",
      "Show integration capabilities with their existing tech stack (Salesforce, HubSpot)",
      "Present case study from similar enterprise client who saw 40% productivity gain",
    ],
    icebreakers: [
      "Ask Sarah about her recent conference talk on 'Scaling Engineering Teams' at TechCrunch Disrupt",
      "Mention Michael's open-source contributions to the React ecosystem - our platform is also React-based",
      "Congratulate Lisa on TechCorp's recent Series C funding announcement",
      "Reference their recent partnership with Microsoft Azure - discuss our cloud-native architecture",
    ],
  },
};

export function MeetingDetail({ meetingId, onBack }: MeetingDetailProps) {
  const meeting = mockMeetingData[meetingId as keyof typeof mockMeetingData];

  if (!meeting) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Meeting not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Decorative Shapes */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <svg className="absolute top-20 -right-10 w-40 h-40 opacity-25" viewBox="0 0 200 200">
          <path fill="#8b5cf6" d="M43.7,-55.2C56.4,-47.3,66.5,-34.2,71.3,-19.2C76.1,-4.2,75.6,12.7,69.5,27.3C63.4,41.9,51.7,54.2,37.8,61.7C23.9,69.2,7.8,71.9,-8.1,70.3C-24,68.7,-39.7,62.8,-52.4,53.1C-65.1,43.4,-74.8,29.9,-77.2,15C-79.6,0.1,-74.7,-16.2,-66.2,-30.1C-57.7,-44,-45.6,-55.5,-32,-62.9C-18.4,-70.3,-3.8,-73.6,9.6,-71.6C23,-69.6,31,-63,43.7,-55.2Z" transform="translate(100 100)" />
        </svg>
        
        <svg className="absolute bottom-40 -left-10 w-48 h-48 opacity-30" viewBox="0 0 200 200">
          <path fill="#6366f1" d="M45.3,-57.5C58.6,-49.3,69.3,-34.9,73.7,-18.4C78.1,-1.9,76.3,16.7,68.2,31.6C60.1,46.5,45.8,57.7,29.7,64.3C13.6,70.9,-4.3,72.9,-20.7,68.4C-37.1,63.9,-52,53,-61.7,38.4C-71.4,23.8,-75.9,5.5,-73.3,-11.7C-70.7,-28.9,-60.9,-45,-47.6,-53.5C-34.3,-62,-17.1,-62.9,0.5,-63.5C18.1,-64.1,36.2,-64.4,45.3,-57.5Z" transform="translate(100 100)" />
        </svg>
      </div>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10">
        <div className="flex items-center gap-4 p-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="rounded-full">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <h1 className="font-medium text-lg">{meeting.title}</h1>
            <p className="text-sm text-gray-600">{meeting.company.name}</p>
          </div>
          <Badge className="bg-emerald-100 text-emerald-700 border-0 rounded-full">
            <Sparkles className="w-3 h-3 mr-1" />
            AI Generated
          </Badge>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 space-y-6 relative z-0">
        {/* Company Summary */}
        <Card className="border-0 shadow-xl rounded-3xl bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-xl">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                <Building className="w-5 h-5 text-white" />
              </div>
              Company Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-4">
              <ImageWithFallback
                src={meeting.company.logo}
                alt={meeting.company.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-gray-100"
              />
              <div className="flex-1">
                <h3 className="font-medium mb-1 text-lg">{meeting.company.name}</h3>
                <p className="text-gray-600 leading-relaxed">{meeting.company.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Attendees */}
        <Card className="border-0 shadow-xl rounded-3xl bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-xl">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              Meeting Attendees ({meeting.attendees.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {meeting.attendees.map((attendee) => (
              <div key={attendee.id} className="flex items-start gap-4 p-4 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl">
                <Avatar className="w-14 h-14 border-2 border-white shadow-md">
                  <AvatarImage src={attendee.linkedinPhoto} alt={attendee.name} />
                  <AvatarFallback>{attendee.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <h4 className="font-medium text-lg">{attendee.name}</h4>
                    <Button variant="ghost" size="sm" className="h-auto p-1 rounded-full hover:bg-white">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{attendee.title}</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{attendee.summary}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Suggested Talking Points */}
        <Card className="border-0 shadow-xl rounded-3xl bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-xl">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              Suggested Talking Points
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {meeting.talkingPoints.map((point, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-medium text-blue-700">{index + 1}</span>
                </div>
                <p className="text-gray-700 leading-relaxed pt-1">{point}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Icebreakers */}
        <Card className="border-0 shadow-xl rounded-3xl bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-xl">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-500 rounded-2xl flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-white" />
              </div>
              Conversation Icebreakers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {meeting.icebreakers.map((icebreaker, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Lightbulb className="w-4 h-4 text-amber-600" />
                </div>
                <p className="text-gray-700 leading-relaxed pt-1">{icebreaker}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Action Button */}
        <div className="pb-6">
          <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white h-12 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <Sparkles className="w-5 h-5 mr-2" />
            Regenerate AI Briefing
          </Button>
        </div>
      </main>
    </div>
  );
}