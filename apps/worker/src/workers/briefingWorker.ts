import { Job } from 'bullmq';
import { databaseService } from '../services/database';
import { aiService } from '../services/ai';
import {
  inferCompanyDomain,
  fetchCompanyLogo,
  fetchHomepageSnippet,
  extractLinkedInUrls,
} from '../services/enrichment';
import { logger } from '../config/logger';
import { getModelForQuality } from '../config/openai';
import type {
  GenerateBriefingJobData,
  Meeting,
  CompanyInfo,
  AttendeeInfo,
  AIBriefing,
} from '../types';

export async function processBriefingGeneration(job: Job<GenerateBriefingJobData>): Promise<void> {
  const { uid, meetingId, settings } = job.data;
  
  logger.info({ jobId: job.id, uid, meetingId }, 'Processing briefing generation');

  try {
    // Update status to processing
    await databaseService.saveAIBriefing(uid, meetingId, {
      status: 'processing',
      jobId: job.id,
      lastGeneratedAt: new Date().toISOString(),
    });

    // Fetch meeting data
    const meeting = await databaseService.getMeeting(uid, meetingId);
    
    if (!meeting) {
      throw new Error(`Meeting ${meetingId} not found`);
    }

    // Update progress
    await job.updateProgress(10);

    // Step 1: Company enrichment
    logger.debug({ uid, meetingId }, 'Starting company enrichment');
    const companyInfo = await enrichCompany(meeting, settings);
    
    await job.updateProgress(30);

    // Save partial results
    await databaseService.saveAIBriefing(uid, meetingId, {
      status: 'processing',
      company: companyInfo,
    });

    // Step 2: Attendee enrichment
    logger.debug({ uid, meetingId }, 'Starting attendee enrichment');
    const attendeesInfo = await enrichAttendees(meeting, settings);
    
    await job.updateProgress(60);

    // Save partial results
    await databaseService.saveAIBriefing(uid, meetingId, {
      status: 'processing',
      attendees: attendeesInfo,
    });

    // Step 3: Generate talking points and icebreakers
    logger.debug({ uid, meetingId }, 'Generating talking points and icebreakers');
    const { talkingPoints, icebreakers } = await aiService.generateTalkingPointsAndIcebreakers(
      {
        summary: meeting.summary,
        description: meeting.description,
        company: companyInfo,
        attendees: attendeesInfo,
      },
      settings
    );

    await job.updateProgress(90);

    // Save complete briefing
    const completedBriefing: AIBriefing = {
      status: 'completed',
      jobId: job.id,
      lastGeneratedAt: new Date().toISOString(),
      model: getModelForQuality(settings.briefingQuality),
      company: companyInfo,
      attendees: attendeesInfo,
      talkingPoints,
      icebreakers,
    };

    await databaseService.saveAIBriefing(uid, meetingId, completedBriefing);

    await job.updateProgress(100);

    logger.info({ jobId: job.id, uid, meetingId }, 'Briefing generation completed');
  } catch (error) {
    logger.error({ error, jobId: job.id, uid, meetingId }, 'Briefing generation failed');

    // Save error state
    await databaseService.saveAIBriefing(uid, meetingId, {
      status: 'failed',
      jobId: job.id,
      lastGeneratedAt: new Date().toISOString(),
      error: (error as Error).message,
    });

    throw error;
  }
}

/**
 * Enrich company information
 */
async function enrichCompany(
  meeting: Meeting,
  settings: any
): Promise<CompanyInfo | undefined> {
  try {
    const domain = inferCompanyDomain(meeting);
    
    if (!domain) {
      logger.debug('No company domain found');
      return undefined;
    }

    // Fetch logo
    const logo = await fetchCompanyLogo(domain);

    // Fetch homepage snippet (for context, not raw HTML)
    const homepageSnippet = await fetchHomepageSnippet(domain);

    // Generate company name from domain (capitalize)
    const companyName = domain
      .split('.')[0]
      .replace(/[_-]/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    // Generate AI summary
    const companyInfo = await aiService.generateCompanySummary(
      domain,
      companyName,
      homepageSnippet,
      settings
    );

    if (logo) {
      companyInfo.logo = logo;
    }

    return companyInfo;
  } catch (error) {
    logger.warn({ error }, 'Company enrichment failed, skipping');
    return undefined;
  }
}

/**
 * Enrich attendees information
 */
async function enrichAttendees(
  meeting: Meeting,
  settings: any
): Promise<AttendeeInfo[]> {
  const attendees = meeting.attendees || [];
  
  if (attendees.length === 0) {
    return [];
  }

  // Extract LinkedIn URLs from description
  const linkedInUrls = extractLinkedInUrls(meeting.description);
  const linkedInMap = new Map<string, string>();

  // Try to match LinkedIn URLs to attendees (simple email-based matching)
  linkedInUrls.forEach(url => {
    // Extract username from LinkedIn URL
    const match = url.match(/linkedin\.com\/in\/([\w-]+)/);
    if (match) {
      linkedInMap.set(match[1], url);
    }
  });

  const enrichedAttendees: AttendeeInfo[] = [];

  // Process attendees (with batching for cost efficiency)
  const attendeesToProcess = attendees.slice(0, 5); // Limit to first 5 to control costs

  for (const attendee of attendeesToProcess) {
    if (!attendee.email) continue;

    try {
      // Try to find LinkedIn URL for this attendee
      let linkedInUrl: string | null = null;
      
      if (settings.enableLinkedInEnrichment) {
        // Check if LinkedIn URL matches attendee's name or email
        for (const [username, url] of linkedInMap.entries()) {
          if (
            attendee.email?.toLowerCase().includes(username.toLowerCase()) ||
            attendee.displayName?.toLowerCase().includes(username.toLowerCase())
          ) {
            linkedInUrl = url;
            break;
          }
        }
      }

      // Generate summary
      const attendeeInfo = await aiService.generateAttendeeSummary(
        {
          email: attendee.email,
          displayName: attendee.displayName,
        },
        linkedInUrl,
        settings
      );

      enrichedAttendees.push(attendeeInfo);
    } catch (error) {
      logger.warn({ error, email: attendee.email }, 'Attendee enrichment failed, skipping');
      
      // Add basic info without summary
      enrichedAttendees.push({
        email: attendee.email,
        displayName: attendee.displayName,
        confidence: 0,
      });
    }
  }

  return enrichedAttendees;
}

