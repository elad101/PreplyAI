import { z } from 'zod';
import type { Request } from 'express';
import type { DecodedIdToken } from 'firebase-admin/auth';

// Express request with authenticated user
export interface AuthenticatedRequest extends Request {
  user: DecodedIdToken;
  uid: string;
}

// Google OAuth connection
export const GoogleConnectionSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiryDate: z.number(),
  scopes: z.array(z.string()),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type GoogleConnection = z.infer<typeof GoogleConnectionSchema>;

// Meeting from Google Calendar
export const MeetingSchema = z.object({
  id: z.string(),
  summary: z.string().optional(),
  description: z.string().optional(),
  location: z.string().optional(),
  startTime: z.string(),
  endTime: z.string(),
  organizer: z.object({
    email: z.string().optional(),
    displayName: z.string().optional(),
  }).optional(),
  attendees: z.array(z.object({
    email: z.string().optional(),
    displayName: z.string().optional(),
    responseStatus: z.string().optional(),
  })).optional(),
  conferenceData: z.object({
    entryPoints: z.array(z.object({
      entryPointType: z.string(),
      uri: z.string(),
      label: z.string().optional(),
    })).optional(),
  }).optional(),
  htmlLink: z.string().optional(),
  cachedAt: z.string(),
  lastFetchedAt: z.string(),
});

export type Meeting = z.infer<typeof MeetingSchema>;

// AI Briefing
export const AIBriefingSchema = z.object({
  status: z.enum(['processing', 'completed', 'failed']),
  jobId: z.string().optional(),
  lastGeneratedAt: z.string(),
  model: z.string().optional(),
  error: z.string().optional(),
  
  company: z.object({
    domain: z.string().optional(),
    name: z.string().optional(),
    logo: z.string().optional(),
    summary: z.string().optional(),
    confidence: z.number().optional(),
  }).optional(),
  
  attendees: z.array(z.object({
    email: z.string(),
    displayName: z.string().optional(),
    linkedInUrl: z.string().optional(),
    summary: z.string().optional(),
    confidence: z.number().optional(),
    name: z.string().optional(),
    title: z.string().optional(),
    focusAreas: z.array(z.string()).optional(),
    recentHighlights: z.string().optional(),
  })).optional(),
  
  talkingPoints: z.array(z.object({
    point: z.string(),
    rationale: z.string(),
    confidence: z.number().optional(),
    sources: z.array(z.string()).optional(),
  })).optional(),
  
  icebreakers: z.array(z.object({
    icebreaker: z.string(),
    rationale: z.string(),
    confidence: z.number().optional(),
    sources: z.array(z.string()).optional(),
  })).optional(),
});

export type AIBriefing = z.infer<typeof AIBriefingSchema>;

// User settings
export const UserSettingsSchema = z.object({
  briefingQuality: z.enum(['compact', 'standard', 'deep']).default('standard'),
  enableLinkedInEnrichment: z.boolean().default(false),
  notificationsEnabled: z.boolean().default(true),
});

export type UserSettings = z.infer<typeof UserSettingsSchema>;

// Job payload for BullMQ
export interface GenerateBriefingJobData {
  uid: string;
  meetingId: string;
  settings: UserSettings;
}

// Prompt templates
export interface PromptTemplate {
  system: string;
  user: string;
  model?: string;
  max_tokens?: number;
  temperature?: number;
}

