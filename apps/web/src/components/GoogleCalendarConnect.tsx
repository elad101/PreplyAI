import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface GoogleCalendarStatus {
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  authUrl?: string;
}

export function GoogleCalendarConnect() {
  const { firebaseUser } = useAuth();
  const [status, setStatus] = useState<GoogleCalendarStatus>({
    isConnected: false,
    isLoading: false,
    error: null,
  });

  // Automatically check connection status when component loads
  useEffect(() => {
    if (firebaseUser) {
      checkConnectionStatus();
    }
  }, [firebaseUser]); // eslint-disable-line react-hooks/exhaustive-deps

  const connectGoogleCalendar = async () => {
    if (!firebaseUser) {
      setStatus(prev => ({ ...prev, error: 'Please sign in first' }));
      return;
    }

    setStatus(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Get Firebase token
      const token = await firebaseUser.getIdToken();
      
      // Get Google OAuth URL from our backend
      const response = await fetch('http://localhost:3001/google/connect', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get Google OAuth URL');
      }

      const data = await response.json();
      
      // Open OAuth URL in popup
      const popup = window.open(
        data.authUrl,
        'google-oauth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );

      if (!popup) {
        throw new Error('Popup blocked. Please allow popups and try again.');
      }

      // Listen for popup completion
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed);
          setStatus(prev => ({ ...prev, isLoading: false }));
          
          // After popup closes, we need to complete the connection
          // The callback URL should have redirected to a page that extracts the code
          // For now, we'll just check the connection status
          setTimeout(checkConnectionStatus, 2000);
        }
      }, 1000);

      setStatus(prev => ({ 
        ...prev, 
        isLoading: false, 
        authUrl: data.authUrl 
      }));

    } catch (error) {
      console.error('Error connecting Google Calendar:', error);
      setStatus(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to connect Google Calendar' 
      }));
    }
  };

  const checkConnectionStatus = async () => {
    if (!firebaseUser) return;

    try {
      const token = await firebaseUser.getIdToken();
      
      // Test if Google Calendar is connected by trying to fetch meetings through our backend
      // Use a small date range for testing
      const now = new Date();
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const from = now.toISOString();
      const to = nextWeek.toISOString();
      
      const response = await fetch(`http://localhost:3001/meetings?from=${from}&to=${to}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        setStatus(prev => ({ 
          ...prev, 
          isConnected: true, 
          error: null 
        }));
        console.log('✅ Google Calendar connection verified!');
      } else if (response.status === 403) {
        setStatus(prev => ({ 
          ...prev, 
          isConnected: false, 
          error: 'Google Calendar not connected' 
        }));
        console.log('⚠️ Google Calendar not connected');
      } else {
        const errorData = await response.json();
        setStatus(prev => ({ 
          ...prev, 
          isConnected: false, 
          error: errorData.message || 'Failed to check connection status' 
        }));
        console.log('❌ Error checking connection:', errorData.message);
      }
    } catch (error) {
      console.error('Error checking connection status:', error);
      setStatus(prev => ({ 
        ...prev, 
        isConnected: false, 
        error: 'Failed to check connection status' 
      }));
    }
  };

  const fetchMeetings = async () => {
    if (!firebaseUser) return;

    try {
      const token = await firebaseUser.getIdToken();
      const from = new Date();
      const to = new Date();
      to.setDate(to.getDate() + 7); // Next 7 days

      // Fetch meetings through our backend (which calls Google Calendar API)
      const response = await fetch(`http://localhost:3001/meetings?from=${from.toISOString()}&to=${to.toISOString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📅 Meetings fetched from backend:', data);
        
        // Display success message
        alert(`Found ${data.meetings.length} meetings for the next 7 days! ${data.cached ? '(cached)' : '(fresh from Google)'}`);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch meetings');
      }
    } catch (error) {
      console.error('Error fetching meetings:', error);
      setStatus(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to fetch meetings' 
      }));
    }
  };

  return (
    <div className="flex flex-col items-end space-y-2">
      {/* Connection Status */}
      <div className="flex items-center gap-2">
        <Badge variant={status.isConnected ? "default" : "secondary"} className="text-xs">
          {status.isConnected ? (
            <>
              <CheckCircle className="h-3 w-3 mr-1" />
              Calendar Connected
            </>
          ) : (
            <>
              <AlertCircle className="h-3 w-3 mr-1" />
              Calendar Not Connected
            </>
          )}
        </Badge>
      </div>

      {/* Connect Button */}
      <div className="flex flex-col items-end space-y-2">

        {status.error && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200">
            <div className="font-medium mb-1">Error:</div>
            <div>{status.error}</div>
            {status.error.includes('verification') && (
              <div className="mt-2 text-xs">
                <strong>For development:</strong> Add your email as a test user in Google Cloud Console → OAuth consent screen → Test users
              </div>
            )}
          </div>
        )}

        {!status.isConnected ? (
          <Button 
            onClick={connectGoogleCalendar} 
            disabled={status.isLoading}
            size="sm"
            variant="outline"
          >
            {status.isLoading ? (
              'Connecting...'
            ) : (
              <>
                <ExternalLink className="h-4 w-4 mr-2" />
                Connect Calendar
              </>
            )}
          </Button>
        ) : (
          <Button 
            onClick={fetchMeetings}
            size="sm"
          >
            Fetch Meetings
          </Button>
        )}

      </div>

      {/* Error Message */}
      {status.error && (
        <div className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200 max-w-xs">
          <div className="font-medium mb-1">Error:</div>
          <div>{status.error}</div>
          {status.error.includes('verification') && (
            <div className="mt-1 text-xs">
              <strong>Fix:</strong> Add your email as a test user in Google Cloud Console
            </div>
          )}
        </div>
      )}

      {/* Debug URL */}
      {status.authUrl && process.env.NODE_ENV === 'development' && (
        <details className="text-xs text-gray-500 max-w-xs">
          <summary className="cursor-pointer">Debug: Show OAuth URL</summary>
          <code className="block mt-1 p-1 bg-gray-100 rounded text-xs break-all">
            {status.authUrl}
          </code>
        </details>
      )}
    </div>
  );
}
