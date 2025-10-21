import { openai, getModelForQuality, getMaxTokensForQuality, getTemperatureForType } from '../config/openai';
import { promptLoader } from '../utils/prompts';
import { logger } from '../config/logger';
import type { UserSettings, CompanyInfo, AttendeeInfo, TalkingPoint, Icebreaker } from '../types';

export class AIService {
  /**
   * Generate company summary
   */
  async generateCompanySummary(
    domain: string,
    companyName: string,
    homepageSnippet: string | null,
    settings: UserSettings
  ): Promise<CompanyInfo> {
    try {
      const template = promptLoader.load('compay_summary'); // Note: typo in original filename
      const model = getModelForQuality(settings.briefingQuality);
      const maxTokens = settings.briefingQuality === 'compact' ? 200 : 400;

      // Extract messages from template
      const messages = template.messages || [
        { role: 'system', content: 'You are a professional business analyst.' },
        { role: 'user', content: 'Analyze the company: {{company.name}} at {{company.domain}}. Context: {{company.aboutText}}' }
      ];

      // Interpolate variables in user message
      const interpolatedMessages = messages.map(msg => ({
        role: msg.role,
        content: promptLoader.interpolate(msg.content, {
          'company.name': companyName,
          'company.domain': domain,
          'company.aboutText': homepageSnippet || 'No additional context available.',
          'company.scrapedSnippets': '[]',
          'meeting.title': '',
          'meeting.description': '',
        }),
      }));

      logger.debug({ domain, model }, 'Generating company summary');

      const response = await openai.chat.completions.create({
        model: template.model || model,
        messages: interpolatedMessages as any,
        max_tokens: template.max_tokens || maxTokens,
        temperature: template.temperature || getTemperatureForType('extraction'),
        n: 1,
      });

      const content = response.choices[0]?.message?.content?.trim() || '';
      
      // Try to parse JSON response
      let summary = content;
      try {
        const parsed = JSON.parse(content);
        summary = parsed.description || parsed.oneLine || content;
      } catch {
        // Not JSON, use as-is
      }

      return {
        domain,
        name: companyName,
        summary,
        confidence: homepageSnippet ? 0.8 : 0.5,
      };
    } catch (error) {
      logger.error({ error, domain }, 'Failed to generate company summary');
      throw error;
    }
  }

  /**
   * Generate attendee summary
   */
  async generateAttendeeSummary(
    attendee: { email: string; displayName?: string },
    linkedInUrl: string | null,
    settings: UserSettings
  ): Promise<AttendeeInfo> {
    try {
      const template = promptLoader.load('attendee_summary_single');
      const model = getModelForQuality(settings.briefingQuality);
      const maxTokens = settings.briefingQuality === 'compact' ? 150 : 300;

      // Extract messages from template
      const messages = template.messages || [
        { role: 'system', content: 'You are a professional researcher.' },
        { role: 'user', content: 'Summarize attendee: {{name}} ({{email}})' }
      ];

      // Interpolate variables
      const interpolatedMessages = messages.map(msg => ({
        role: msg.role,
        content: promptLoader.interpolate(msg.content, {
          'name': attendee.displayName || attendee.email,
          'title': '',
          'email': attendee.email,
          'linkedinUrl': linkedInUrl || '',
          'publicBioText': '',
          'meetingContext': 'Sales meeting briefing preparation',
        }),
      }));

      logger.debug({ email: attendee.email, model }, 'Generating attendee summary');

      const response = await openai.chat.completions.create({
        model: template.model || model,
        messages: interpolatedMessages as any,
        max_tokens: template.max_tokens || maxTokens,
        temperature: template.temperature || getTemperatureForType('extraction'),
        n: 1,
      });

      const content = response.choices[0]?.message?.content?.trim() || '';
      
      // Try to parse JSON response (array format)
      let attendeeData: any = {
        email: attendee.email,
        displayName: attendee.displayName,
        linkedInUrl: linkedInUrl || undefined,
        confidence: linkedInUrl ? 0.7 : 0.3,
      };

      try {
        const parsed = JSON.parse(content);
        // Handle both single object and array responses
        const attendeeInfo = Array.isArray(parsed) ? parsed[0] : parsed;
        if (attendeeInfo) {
          // Extract all properties from the JSON response
          attendeeData = {
            ...attendeeData,
            name: attendeeInfo.name,
            title: attendeeInfo.title,
            summary: attendeeInfo.summary,
            focusAreas: attendeeInfo.focusAreas,
            recentHighlights: attendeeInfo.recentHighlights,
            confidence: attendeeInfo.confidence || attendeeData.confidence,
          };
        }
      } catch {
        // Not JSON, use content as summary
        attendeeData.summary = content;
      }

      return attendeeData;
    } catch (error) {
      logger.error({ error, email: attendee.email }, 'Failed to generate attendee summary');
      throw error;
    }
  }

  /**
   * Generate talking points and icebreakers
   */
  async generateTalkingPointsAndIcebreakers(
    meetingContext: {
      summary?: string;
      description?: string;
      company?: CompanyInfo;
      attendees?: AttendeeInfo[];
    },
    settings: UserSettings
  ): Promise<{ talkingPoints: TalkingPoint[]; icebreakers: Icebreaker[] }> {
    try {
      const template = promptLoader.load('talkingpoints_icebreakers');
      const model = getModelForQuality(settings.briefingQuality);
      const maxTokens = getMaxTokensForQuality(settings.briefingQuality);

      const companyBrief = meetingContext.company
        ? JSON.stringify({
            name: meetingContext.company.name,
            domain: meetingContext.company.domain,
            description: meetingContext.company.summary,
          })
        : '{}';

      const attendeesArray = meetingContext.attendees && meetingContext.attendees.length > 0
        ? JSON.stringify(
            meetingContext.attendees.map(a => ({
              name: a.displayName || a.email,
              summary: a.summary,
            }))
          )
        : '[]';

      // Extract messages from template
      const messages = template.messages || [
        { role: 'system', content: 'You are a professional meeting preparation assistant.' },
        { role: 'user', content: 'Generate talking points for meeting about {{meeting.intent}}' }
      ];

      // Interpolate variables
      const interpolatedMessages = messages.map(msg => ({
        role: msg.role,
        content: promptLoader.interpolate(msg.content, {
          companyBriefJson: companyBrief,
          attendeesArray: attendeesArray,
          'meeting.intent': meetingContext.description || 'General meeting',
          productName: 'Our product',
          tone: 'professional',
          length: settings.briefingQuality,
        }),
      }));

      logger.debug({ model }, 'Generating talking points and icebreakers');

      const response = await openai.chat.completions.create({
        model: template.model || model,
        messages: interpolatedMessages as any,
        max_tokens: template.max_tokens || maxTokens,
        temperature: template.temperature || getTemperatureForType('creative'),
        n: 1,
      });

      const content = response.choices[0]?.message?.content?.trim() || '{}';
      const parsed = JSON.parse(content);

      // Map from template format to our format
      const talkingPoints: TalkingPoint[] = (parsed.talkingPoints || []).map((tp: any) => ({
        point: tp.bullet || tp.point || '',
        rationale: tp.rationale || '',
        confidence: 0.7,
        sources: [],
      }));

      const icebreakers: Icebreaker[] = (parsed.icebreakers || []).map((ib: any) => ({
        icebreaker: ib.line || ib.icebreaker || '',
        rationale: ib.whyItWorks || ib.rationale || '',
        confidence: 0.7,
        sources: [],
      }));

      return { talkingPoints, icebreakers };
    } catch (error) {
      logger.error({ error }, 'Failed to generate talking points and icebreakers');
      throw error;
    }
  }
}

export const aiService = new AIService();

