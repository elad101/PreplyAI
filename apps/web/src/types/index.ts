// Meeting types (matching backend API response)
export interface Meeting {
  id: string;
  summary?: string;
  description?: string;
  location?: string;
  startTime: string; // ISO string from Google Calendar
  endTime: string;   // ISO string from Google Calendar
  organizer?: {
    email?: string;
    displayName?: string;
  };
  attendees?: Array<{
    email: string;
    displayName?: string;
    responseStatus?: 'accepted' | 'declined' | 'tentative' | 'needsAction';
  }>;
  conferenceData?: {
    entryPoints?: Array<{
      entryPointType: string;
      uri: string;
      label?: string;
    }>;
  };
  htmlLink?: string;
  cachedAt?: string;
  lastFetchedAt?: string;
  // Computed fields for frontend
  status?: 'upcoming' | 'past' | 'in-progress';
  isPrepped?: boolean;
  briefing?: MeetingBriefing;
}

export interface MeetingBriefing {
  status: 'processing' | 'completed' | 'failed';
  jobId?: string;
  lastGeneratedAt: string;
  model?: string;
  error?: string;
  company?: {
    domain?: string;
    name?: string;
    logo?: string;
    summary?: string;
    confidence?: number;
  };
  attendees?: Array<{
    email: string;
    displayName?: string;
    linkedInUrl?: string;
    summary?: string;
    confidence?: number;
    name?: string;
    title?: string;
    focusAreas?: string[];
    recentHighlights?: string;
  }>;
  talkingPoints?: Array<{
    point: string;
    rationale: string;
    confidence?: number;
    sources?: string[];
  }>;
  icebreakers?: Array<{
    icebreaker: string;
    rationale: string;
    confidence?: number;
    sources?: string[];
  }>;
}

export interface CompanySummary {
  id: string;
  name: string;
  logo?: string;
  description: string;
  industry?: string;
  size?: string;
  revenue?: string;
  website?: string;
}

export interface Attendee {
  id: string;
  name: string;
  title: string;
  company: string;
  email?: string;
  linkedinUrl?: string;
  linkedinPhoto?: string;
  summary: string;
  background?: string;
  interests?: string[];
}

// User types
export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  subscription?: Subscription;
  preferences?: UserPreferences;
  createdAt: Date;
}

export interface Subscription {
  plan: 'free' | 'pro' | 'enterprise';
  status: 'active' | 'cancelled' | 'expired';
  renewalDate?: Date;
  cancelledAt?: Date;
}

export interface UserPreferences {
  tone?: 'professional' | 'casual' | 'friendly';
  briefingLength?: 'short' | 'medium' | 'long';
  industries?: string[];
  timezone?: string;
  notifications?: NotificationSettings;
  aiPreferences?: AIPreferences;
}

export interface NotificationSettings {
  meetingReminders: boolean;
  briefingReady: boolean;
  weeklySummary: boolean;
}

export interface AIPreferences {
  autoGenerate: boolean;
  includeCompanyResearch: boolean;
  includeCompetitiveInsights: boolean;
}

// Auth types
export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

// API types
export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

// Settings types
export interface SettingsFormData {
  displayName?: string;
  email?: string;
  preferences?: Partial<UserPreferences>;
}

// Generate briefing request
export interface GenerateBriefingRequest {
  meetingId: string;
  regenerate?: boolean;
}

