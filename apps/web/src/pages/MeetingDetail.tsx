import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Building, Users, MessageCircle, Lightbulb, ExternalLink, Sparkles, Building2, Globe } from 'lucide-react';
import { useMeeting } from '@/hooks/useApi';
import { generateBriefing } from '@/hooks/useApi';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { format } from 'date-fns';

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

export function MeetingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { meeting, isLoading, isError, mutate } = useMeeting(id);
  const [isGenerating, setIsGenerating] = useState(false);


  const handleBack = () => {
    navigate('/');
  };

  const handleGenerateBriefing = async () => {
    if (!id) {
      console.error('❌ No meeting ID available');
      toast.error('No meeting ID available');
      return;
    }
    
    setIsGenerating(true);
    
    try {
      const result = await generateBriefing(id);
      
      if (result.ok) {
        toast.success('Briefing generation started! This may take a few minutes...');
        // Wait a moment then refresh to check for updates
        setTimeout(() => {
          mutate();
        }, 2000);
        
        // Set up polling to check for completion
        const pollInterval = setInterval(async () => {
          mutate();
        }, 5000);
        
        // Stop polling after 2 minutes
        setTimeout(() => {
          clearInterval(pollInterval);
        }, 120000);
      } else {
        toast.error('Failed to start briefing generation');
      }
    } catch (error: any) {
      console.error('Briefing generation failed:', error);
      toast.error(error.message || 'Failed to generate briefing');
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10">
          <div className="flex items-center gap-4 p-4">
            <Button variant="ghost" size="sm" onClick={handleBack} className="rounded-full">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <Skeleton className="h-6 w-48" />
          </div>
        </header>
        <main className="p-4 space-y-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-0 shadow-xl rounded-3xl bg-white">
              <CardContent className="p-6">
                <Skeleton className="h-6 w-2/3 mb-4" />
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </main>
      </div>
    );
  }

      if (isError || !meeting) {
        return (
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
            <Card className="border-0 shadow-xl rounded-3xl bg-white">
              <CardContent className="p-8 text-center">
                <p className="text-gray-600 mb-2">Meeting not found or failed to load.</p>
                <p className="text-sm text-gray-500 mb-4">Meeting ID: {id}</p>
                <div className="space-y-2">
                  <Button onClick={handleBack}>Go Back</Button>
                  <Button variant="outline" onClick={() => window.location.reload()}>
                    Retry
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      }

  const generatedAt = (meeting as any).generatedAt ? new Date((meeting as any).generatedAt) : null;

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
          <Button variant="ghost" size="sm" onClick={handleBack} className="rounded-full">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <h1 className="font-medium text-lg">{meeting.summary || 'Meeting Details'}</h1>
            <div className="text-sm text-gray-600 space-y-1">
              {meeting.organizer && (
                <div>
                  Organized by {getAttendeeDisplayName(meeting.organizer)}
                  {meeting.organizer.email && (
                    <span className="ml-1">({getCompanyNameFromEmail(meeting.organizer.email)})</span>
                  )}
                </div>
              )}
              {meeting.startTime && (
                <div className="text-gray-500">
                  {(() => {
                    try {
                      const start = new Date(meeting.startTime);
                      const end = new Date(meeting.endTime);
                      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
                        return `${format(start, 'MMM d, yyyy • h:mm a')} - ${format(end, 'h:mm a')}`;
                      } else {
                        return `${meeting.startTime} - ${meeting.endTime}`;
                      }
                    } catch (error) {
                      console.warn('Error formatting meeting times in header:', error);
                      return `${meeting.startTime} - ${meeting.endTime}`;
                    }
                  })()}
                </div>
              )}
            </div>
            {generatedAt && (
              <p className="text-sm text-gray-500">Generated {format(generatedAt, 'MMM d, h:mm a')}</p>
            )}
          </div>
          {generatedAt && (
            <Badge className="bg-emerald-100 text-emerald-700 border-0 rounded-full">
              <Sparkles className="w-3 h-3 mr-1" />
              AI Generated
            </Badge>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 space-y-6 relative z-0 pb-24">

        {/* Meeting Description */}
        {meeting.description && (
          <Card className="border-0 shadow-xl rounded-3xl bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-xl">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                  <Building className="w-5 h-5 text-white" />
                </div>
                Meeting Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">{meeting.description}</p>
            </CardContent>
          </Card>
        )}

        {/* Attendees */}
        {meeting.attendees && meeting.attendees.length > 0 && (
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
                  {meeting.attendees.map((attendee, index) => {
                    const displayName = getAttendeeDisplayName(attendee);
                    const companyName = attendee.email ? getCompanyNameFromEmail(attendee.email) : 'Unknown';
                    const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase();
                    
                    return (
                      <div key={index} className="flex items-start gap-4 p-4 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl">
                        <Avatar className="w-14 h-14 border-2 border-white shadow-md">
                          <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-1">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-lg">{displayName}</h4>
                                {companyName !== 'Personal' && companyName !== 'Unknown' && (
                                  <Badge variant="outline" className="text-xs">
                                    {companyName}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <Badge 
                              variant="secondary" 
                              className={`text-xs ${
                                attendee.responseStatus === 'accepted' ? 'bg-green-100 text-green-700' :
                                attendee.responseStatus === 'declined' ? 'bg-red-100 text-red-700' :
                                attendee.responseStatus === 'tentative' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {attendee.responseStatus || 'unknown'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{attendee.email}</p>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
          </Card>
        )}

        {/* AI Briefing Processing */}
        {meeting.briefing && (meeting.briefing as any).status === 'processing' && (
          <Card className="border-0 shadow-xl rounded-3xl bg-gradient-to-br from-blue-50 to-purple-50">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin" />
              </div>
              <h3 className="font-medium text-lg mb-2 text-gray-900">AI Briefing in Progress</h3>
              <p className="text-gray-600 mb-4">Our AI is analyzing the meeting details and generating personalized insights. This usually takes 1-2 minutes.</p>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                <span className="ml-2">Processing...</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* AI Briefing Content - Only show if briefing exists and is completed */}
        {meeting.briefing && (meeting.briefing as any).status !== 'processing' && (
          <>
            {/* Company Summary */}
            {meeting.briefing.company && (
              <Card className="border-0 shadow-xl rounded-3xl bg-white">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-white" />
                    </div>
                    <span>Company Summary</span>
                    <Badge variant="secondary" className="ml-auto bg-green-100 text-green-700">
                      AI-generated
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-4">
                    {meeting.briefing.company.logo && (
                      <img 
                        src={meeting.briefing.company.logo} 
                        alt={meeting.briefing.company.name || 'Company logo'} 
                        className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900 mb-2">
                        {meeting.briefing.company.name || 'Company Name'}
                      </h3>
                      {(meeting.briefing.company as any).summary && (
                        <p className="text-gray-700 leading-relaxed mb-3">
                          {(meeting.briefing.company as any).summary}
                        </p>
                      )}
                      {(meeting.briefing.company as any).domain && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Globe className="w-4 h-4" />
                          <a 
                            href={`https://${(meeting.briefing.company as any).domain}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:text-blue-600 transition-colors"
                          >
                            {(meeting.briefing.company as any).domain}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Attendee Summaries */}
            {meeting.briefing.attendees && meeting.briefing.attendees.length > 0 && (
              <Card className="border-0 shadow-xl rounded-3xl bg-white">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <span>Meeting Attendees ({meeting.briefing.attendees.length})</span>
                    <Badge variant="secondary" className="ml-auto bg-purple-100 text-purple-700">
                      AI-generated
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {meeting.briefing.attendees.map((attendee, index) => {
                    // Parse the attendee data if it's a string
                    let parsedAttendee = attendee;
                    if (typeof attendee === 'string') {
                      try {
                        parsedAttendee = JSON.parse(attendee);
                        
                        // If the parsed result is an array, take the item at the current index
                        if (Array.isArray(parsedAttendee)) {
                          parsedAttendee = parsedAttendee[index] || parsedAttendee[0];
                        }
                      } catch (error) {
                        parsedAttendee = { summary: attendee } as any;
                      }
                    } else if (Array.isArray(attendee)) {
                      parsedAttendee = attendee[index] || attendee[0];
                    }
                    
                    // Parse the summary if it's a JSON string
                    let summaryData = null;
                    if ((parsedAttendee as any).summary && typeof (parsedAttendee as any).summary === 'string') {
                      try {
                        // Remove markdown code blocks if present
                        let summaryText = (parsedAttendee as any).summary;
                        if (summaryText.startsWith('```json\n') && summaryText.endsWith('\n```')) {
                          summaryText = summaryText.slice(7, -4); // Remove ```json\n and \n```
                        }
                        summaryData = JSON.parse(summaryText);
                      } catch (error) {
                        // Fallback to original data if parsing fails
                      }
                    }
                    
                    // Use summaryData if available, otherwise fallback to parsedAttendee
                    const finalAttendeeData = summaryData || parsedAttendee;
                    
                    return (
                    <div key={index} className="flex items-start gap-4 p-4 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl">
                      <Avatar className="w-14 h-14 border-2 border-white shadow-md">
                        <AvatarImage src={(finalAttendeeData as any).linkedinPhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent((finalAttendeeData as any).name || (finalAttendeeData as any).email || '')}&background=8b5cf6&color=fff`} alt={(finalAttendeeData as any).name || (finalAttendeeData as any).email} />
                        <AvatarFallback>{(finalAttendeeData as any).name ? (finalAttendeeData as any).name.split(' ').map((n: string) => n[0]).join('') : ((finalAttendeeData as any).email ? (finalAttendeeData as any).email.split('@')[0].substring(0, 2).toUpperCase() : 'U')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <h4 className="font-medium text-lg">
                            {(() => {
                              const name = (finalAttendeeData as any).name;
                              // If name is an email, extract a better display name
                              if (name && name.includes('@')) {
                                const emailPart = name.split('@')[0];
                                return emailPart.replace(/[._]/g, ' ').split(' ')
                                  .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                                  .join(' ');
                              }
                              return name || (finalAttendeeData as any).email || 'Unknown';
                            })()}
                          </h4>
                          {(finalAttendeeData as any).linkedInUrl && (
                            <Button variant="ghost" size="sm" className="h-auto p-1 rounded-full hover:bg-white" asChild>
                              <a href={(finalAttendeeData as any).linkedInUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            </Button>
                          )}
                        </div>
                        {(finalAttendeeData as any).title && (
                          <p className="text-sm text-gray-600 mb-2">{(finalAttendeeData as any).title}</p>
                        )}
                        {(finalAttendeeData as any).summary && (
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {(finalAttendeeData as any).summary}
                          </p>
                        )}
                        
                        {/* Display focus areas if available */}
                        {(finalAttendeeData as any).focusAreas && (finalAttendeeData as any).focusAreas.length > 0 && (
                          <div className="mt-3">
                            <div className="flex items-center gap-2 mb-2">
                              <Lightbulb className="w-4 h-4 text-orange-500" />
                              <span className="text-xs font-semibold text-orange-700">Focus Areas</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {(finalAttendeeData as any).focusAreas.map((area: string, areaIndex: number) => (
                                <Badge key={areaIndex} variant="secondary" className="bg-orange-100 text-orange-700 text-xs">
                                  {area}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Display recent highlights if available */}
                        {(finalAttendeeData as any).recentHighlights && (
                          <div className="mt-3">
                            <div className="flex items-center gap-2 mb-2">
                              <Sparkles className="w-4 h-4 text-pink-500" />
                              <span className="text-xs font-semibold text-pink-700">Recent Highlights</span>
                            </div>
                            <p className="text-xs text-gray-600 leading-relaxed bg-white p-2 rounded-lg border border-pink-100">
                              {(finalAttendeeData as any).recentHighlights}
                            </p>
                          </div>
                        )}
                        
                        {/* Display confidence score */}
                        {(finalAttendeeData as any).confidence && (
                          <div className="mt-2">
                            <Badge variant="outline" className="text-xs bg-white">
                              {Math.round((finalAttendeeData as any).confidence * 100)}% confidence
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}

            {/* Suggested Talking Points */}
            {meeting.briefing.talkingPoints && meeting.briefing.talkingPoints.length > 0 && (
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
                  {meeting.briefing.talkingPoints.map((point, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-sm font-medium text-blue-700">{index + 1}</span>
                      </div>
                      <p className="text-gray-700 leading-relaxed pt-1">
                        {typeof point === 'string' ? point : (point as any).point || (point as any).bullet || point}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Icebreakers */}
            {meeting.briefing.icebreakers && meeting.briefing.icebreakers.length > 0 && (
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
                  {meeting.briefing.icebreakers
                    .filter((icebreaker) => {
                      // Filter out empty icebreakers
                      return icebreaker.icebreaker && icebreaker.icebreaker.trim().length > 0;
                    })
                    .map((icebreaker, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Lightbulb className="w-4 h-4 text-amber-600" />
                      </div>
                      <p className="text-gray-700 leading-relaxed pt-1">
                        {(() => {
                          // Handle different icebreaker object structures
                          if (typeof icebreaker === 'string') {
                            return icebreaker;
                          } else if ((icebreaker as any).icebreaker && (icebreaker as any).icebreaker.trim()) {
                            return (icebreaker as any).icebreaker;
                          } else if ((icebreaker as any).line && (icebreaker as any).line.trim()) {
                            return (icebreaker as any).line;
                          } else if ((icebreaker as any).text && (icebreaker as any).text.trim()) {
                            return (icebreaker as any).text;
                          }
                          return '';
                        })()}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* No AI Briefing Available */}
        {!meeting.briefing && (
          <Card className="border-0 shadow-xl rounded-3xl bg-white">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="font-medium text-lg mb-2">No AI Briefing Available</h3>
              <p className="text-gray-600 mb-4">Generate an AI-powered briefing to get talking points, icebreakers, and attendee insights for this meeting.</p>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 z-50">
        <Button 
          onClick={handleGenerateBriefing}
          disabled={isGenerating || (meeting.briefing && (meeting.briefing as any).status === 'processing')}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white h-12 rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
        >
          {isGenerating ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Starting Generation...
            </>
          ) : meeting.briefing && (meeting.briefing as any).status === 'processing' ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Processing...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              {generatedAt ? 'Regenerate' : 'Generate'} AI Briefing
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

