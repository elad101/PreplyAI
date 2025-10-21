import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, Users, RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface Meeting {
  id: string;
  summary?: string;
  description?: string;
  location?: string;
  startTime: string;
  endTime: string;
  organizer?: {
    email?: string;
    displayName?: string;
  };
  attendees?: Array<{
    email?: string;
    displayName?: string;
    responseStatus?: string;
  }>;
  htmlLink?: string;
}

interface MeetingsResponse {
  meetings: Meeting[];
  cached: boolean;
  cachedAt: string;
}

export function MeetingsList() {
  const { firebaseUser } = useAuth();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<string | null>(null);

  const fetchMeetings = async (days = 7) => {
    if (!firebaseUser) {
      setError('Please sign in first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = await firebaseUser.getIdToken();
      const from = new Date();
      const to = new Date();
      to.setDate(to.getDate() + days);

      // Fetch meetings through our backend (which calls Google Calendar API)
      const response = await fetch(`http://localhost:3001/meetings?from=${from.toISOString()}&to=${to.toISOString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data: MeetingsResponse = await response.json();
        setMeetings(data.meetings);
        setLastFetched(data.cachedAt);
        console.log(`📅 Fetched ${data.meetings.length} meetings from backend ${data.cached ? '(cached)' : '(fresh from Google)'}`);
      } else if (response.status === 403) {
        setError('Google Calendar not connected. Please connect your Google account first.');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to fetch meetings from backend');
      }
    } catch (err) {
      console.error('Error fetching meetings:', err);
      setError('Failed to fetch meetings');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      full: date.toLocaleString(),
    };
  };

  const getAttendeeStatus = (attendees?: Meeting['attendees']) => {
    if (!attendees || attendees.length === 0) return { total: 0, confirmed: 0 };
    
    const confirmed = attendees.filter(a => a.responseStatus === 'accepted').length;
    return { total: attendees.length, confirmed };
  };

  useEffect(() => {
    fetchMeetings();
  }, [firebaseUser]);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Meetings
            </CardTitle>
            <CardDescription>
              Your Google Calendar meetings for the next 7 days
            </CardDescription>
          </div>
          <Button 
            onClick={() => fetchMeetings()} 
            disabled={loading}
            variant="outline"
            size="sm"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        {lastFetched && (
          <Badge variant="secondary" className="w-fit">
            Last updated: {new Date(lastFetched).toLocaleTimeString()}
          </Badge>
        )}
      </CardHeader>
      
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700">
            {error}
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            <span>Loading meetings...</span>
          </div>
        )}

        {!loading && !error && meetings.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No meetings found for the next 7 days
          </div>
        )}

        {!loading && meetings.length > 0 && (
          <div className="space-y-4">
            {meetings.map((meeting) => {
              const startTime = formatDateTime(meeting.startTime);
              const endTime = formatDateTime(meeting.endTime);
              const attendees = getAttendeeStatus(meeting.attendees);

              return (
                <Card key={meeting.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">
                          {meeting.summary || 'Untitled Meeting'}
                        </h3>
                        
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>
                              {startTime.date} • {startTime.time} - {endTime.time}
                            </span>
                          </div>

                          {meeting.location && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              <span>{meeting.location}</span>
                            </div>
                          )}

                          {attendees.total > 0 && (
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              <span>
                                {attendees.confirmed}/{attendees.total} attendees confirmed
                              </span>
                            </div>
                          )}

                          {meeting.description && (
                            <div className="mt-2 text-xs bg-gray-50 p-2 rounded">
                              {meeting.description.substring(0, 200)}
                              {meeting.description.length > 200 && '...'}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 ml-4">
                        {meeting.htmlLink && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => window.open(meeting.htmlLink, '_blank')}
                          >
                            Open in Calendar
                          </Button>
                        )}
                        
                        <Button 
                          size="sm"
                          onClick={() => {
                            // TODO: Navigate to meeting detail page
                            console.log('Navigate to meeting:', meeting.id);
                          }}
                        >
                          Generate Briefing
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
