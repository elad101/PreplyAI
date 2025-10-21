import { z } from 'zod';

export const UserSettingsSchema = z.object({
  briefingQuality: z.enum(['compact', 'standard', 'deep']).default('standard'),
  enableLinkedInEnrichment: z.boolean().default(false),
  notificationsEnabled: z.boolean().default(true),
});

export type UserSettings = z.infer<typeof UserSettingsSchema>;

export interface GenerateBriefingJobData {
  uid: string;
  meetingId: string;
  settings: UserSettings;
}

export interface Meeting {
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
  conferenceData?: {
    entryPoints?: Array<{
      entryPointType: string;
      uri: string;
      label?: string;
    }>;
  };
  htmlLink?: string;
  cachedAt: string;
  lastFetchedAt: string;
}

export interface CompanyInfo {
  domain?: string;
  name?: string;
  logo?: string;
  summary?: string;
  confidence?: number;
}

export interface AttendeeInfo {
  email: string;
  displayName?: string;
  linkedInUrl?: string;
  summary?: string;
  confidence?: number;
  name?: string;
  title?: string;
  focusAreas?: string[];
  recentHighlights?: string;
}

export interface TalkingPoint {
  point: string;
  rationale: string;
  confidence?: number;
  sources?: string[];
}

export interface Icebreaker {
  icebreaker: string;
  rationale: string;
  confidence?: number;
  sources?: string[];
}

export interface PromptTemplate {
  system?: string;
  user?: string;
  messages?: Array<{ role: string; content: string }>;
  model?: string;
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
}

export interface AIBriefing {
  status: 'processing' | 'completed' | 'failed';
  jobId?: string;
  lastGeneratedAt: string;
  model?: string;
  company?: CompanyInfo;
  attendees?: AttendeeInfo[];
  talkingPoints?: TalkingPoint[];
  icebreakers?: Icebreaker[];
  error?: string;
}

