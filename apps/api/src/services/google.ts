import { google } from 'googleapis';
import { env } from '../config/environment';
import { logger } from '../config/logger';
import { databaseService } from './database';
import type { GoogleConnection, Meeting } from '../types';

export class GoogleService {
  private oauth2Client = new google.auth.OAuth2(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    env.GOOGLE_REDIRECT_URI
  );

  generateAuthUrl(userId?: string): string {
    const params: any = {
      access_type: 'offline',
      scope: env.GOOGLE_CALENDAR_SCOPES.split(','),
      prompt: 'consent', // Force to get refresh token
      include_granted_scopes: true, // Include previously granted scopes
    };
    
    // Add state parameter with user ID if provided
    if (userId) {
      params.state = userId;
    }
    
    return this.oauth2Client.generateAuthUrl(params);
  }

  async exchangeCode(code: string): Promise<GoogleConnection> {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      
      if (!tokens.refresh_token) {
        throw new Error('No refresh token received');
      }

      const now = new Date().toISOString();
      const connection: GoogleConnection = {
        accessToken: tokens.access_token!,
        refreshToken: tokens.refresh_token,
        expiryDate: tokens.expiry_date || Date.now() + 3600 * 1000,
        scopes: tokens.scope?.split(' ') || [],
        createdAt: now,
        updatedAt: now,
      };

      return connection;
    } catch (error) {
      logger.error({ error }, 'Failed to exchange authorization code');
      throw error;
    }
  }

  private async getValidatedClient(uid: string) {
    const connection = await databaseService.getGoogleConnection(uid);
    
    if (!connection) {
      throw new Error('Google account not connected');
    }

    this.oauth2Client.setCredentials({
      access_token: connection.accessToken,
      refresh_token: connection.refreshToken,
      expiry_date: connection.expiryDate,
    });

    // Refresh if needed
    if (Date.now() >= connection.expiryDate) {
      logger.debug({ uid }, 'Refreshing access token');
      const { credentials } = await this.oauth2Client.refreshAccessToken();
      
      connection.accessToken = credentials.access_token!;
      connection.expiryDate = credentials.expiry_date!;
      connection.updatedAt = new Date().toISOString();
      
      await databaseService.saveGoogleConnection(uid, connection);
      
      this.oauth2Client.setCredentials(credentials);
    }

    return this.oauth2Client;
  }

  async listCalendarEvents(
    uid: string,
    timeMin: string,
    timeMax: string
  ): Promise<Meeting[]> {
    try {
      const client = await this.getValidatedClient(uid);
      const calendar = google.calendar({ version: 'v3', auth: client });

      const response = await calendar.events.list({
        calendarId: 'primary',
        timeMin,
        timeMax,
        singleEvents: true,
        orderBy: 'startTime',
        maxResults: 100,
      });

      const events = response.data.items || [];
      const now = new Date().toISOString();

      return events.map(event => this.normalizeMeeting(event as unknown as Record<string, unknown>, now));
    } catch (error) {
      logger.error({ 
        error: error instanceof Error ? error.message : error,
        errorStack: error instanceof Error ? error.stack : undefined,
        uid,
        timeMin,
        timeMax
      }, 'Failed to list calendar events');
      throw error;
    }
  }

  async getCalendarEvent(uid: string, eventId: string): Promise<Meeting> {
    try {
      const client = await this.getValidatedClient(uid);
      const calendar = google.calendar({ version: 'v3', auth: client });

      const response = await calendar.events.get({
        calendarId: 'primary',
        eventId,
      });

      const now = new Date().toISOString();
      return this.normalizeMeeting(response.data as unknown as Record<string, unknown>, now);
    } catch (error) {
      logger.error({ error, uid, eventId }, 'Failed to get calendar event');
      throw error;
    }
  }

  private normalizeMeeting(event: Record<string, unknown>, now: string): Meeting {
    const start = event.start as { dateTime?: string; date?: string } | undefined;
    const end = event.end as { dateTime?: string; date?: string } | undefined;
    const organizer = event.organizer as { email?: string; displayName?: string } | undefined;
    const attendees = event.attendees as Array<{ email?: string; displayName?: string; responseStatus?: string }> | undefined;
    const conferenceData = event.conferenceData as { 
      entryPoints?: Array<{ entryPointType: string; uri: string; label?: string }> 
    } | undefined;

    return {
      id: event.id as string,
      summary: event.summary as string | undefined,
      description: event.description as string | undefined,
      location: event.location as string | undefined,
      startTime: start?.dateTime || start?.date || '',
      endTime: end?.dateTime || end?.date || '',
      organizer: organizer ? {
        email: organizer.email,
        displayName: organizer.displayName,
      } : undefined,
      attendees: attendees?.map((a) => ({
        email: a.email,
        displayName: a.displayName,
        responseStatus: a.responseStatus,
      })),
      conferenceData: conferenceData ? {
        entryPoints: conferenceData.entryPoints?.map((ep) => ({
          entryPointType: ep.entryPointType,
          uri: ep.uri,
          label: ep.label,
        })),
      } : undefined,
      htmlLink: event.htmlLink as string | undefined,
      cachedAt: now,
      lastFetchedAt: now,
    };
  }
}

export const googleService = new GoogleService();

