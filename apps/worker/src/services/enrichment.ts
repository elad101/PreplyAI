import axios from 'axios';
import { logger } from '../config/logger';

/**
 * Extract domain from email address
 */
export function extractDomain(email: string): string | null {
  const match = email.match(/@(.+)$/);
  return match ? match[1] : null;
}

/**
 * Infer company domain from meeting organizer or attendees
 */
export function inferCompanyDomain(meeting: {
  organizer?: { email?: string };
  attendees?: Array<{ email?: string }>;
}): string | null {
  // Try organizer first
  if (meeting.organizer?.email) {
    const domain = extractDomain(meeting.organizer.email);
    if (domain && !isCommonEmailDomain(domain)) {
      return domain;
    }
  }

  // Try attendees
  if (meeting.attendees) {
    for (const attendee of meeting.attendees) {
      if (attendee.email) {
        const domain = extractDomain(attendee.email);
        if (domain && !isCommonEmailDomain(domain)) {
          return domain;
        }
      }
    }
  }

  return null;
}

/**
 * Check if domain is a common email provider
 */
function isCommonEmailDomain(domain: string): boolean {
  const commonDomains = [
    'gmail.com',
    'yahoo.com',
    'outlook.com',
    'hotmail.com',
    'icloud.com',
    'protonmail.com',
    'aol.com',
  ];
  return commonDomains.includes(domain.toLowerCase());
}

/**
 * Fetch company logo using Clearbit
 */
export async function fetchCompanyLogo(domain: string): Promise<string | null> {
  try {
    const url = `https://logo.clearbit.com/${domain}`;
    
    // Check if logo exists (HEAD request)
    const response = await axios.head(url, {
      timeout: 5000,
      validateStatus: (status) => status === 200,
    });

    if (response.status === 200) {
      logger.debug({ domain }, 'Found company logo');
      return url;
    }

    return null;
  } catch (error) {
    logger.debug({ domain }, 'No company logo found');
    return null;
  }
}

/**
 * Fetch homepage content snippet (for OpenAI context)
 * Returns a brief snippet, NOT full HTML
 */
export async function fetchHomepageSnippet(domain: string): Promise<string | null> {
  try {
    const url = `https://${domain}`;
    const response = await axios.get(url, {
      timeout: 10000,
      maxContentLength: 100000, // Limit to 100KB
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PreplyAI/1.0; +https://preplyai.com/bot)',
      },
    });

    if (response.status === 200 && response.data) {
      // Extract text content from HTML (simple approach)
      const text = response.data
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      // Return first 500 characters as snippet
      const snippet = text.substring(0, 500);
      logger.debug({ domain, snippetLength: snippet.length }, 'Fetched homepage snippet');
      return snippet;
    }

    return null;
  } catch (error) {
    logger.debug({ domain, error: (error as Error).message }, 'Failed to fetch homepage');
    return null;
  }
}

/**
 * Extract LinkedIn URLs from meeting description or notes
 */
export function extractLinkedInUrls(text?: string): string[] {
  if (!text) return [];

  const linkedInPattern = /https?:\/\/(www\.)?linkedin\.com\/in\/[\w-]+/gi;
  const matches = text.match(linkedInPattern);
  
  return matches ? [...new Set(matches)] : [];
}

