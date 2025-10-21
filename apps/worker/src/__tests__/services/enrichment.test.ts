import { describe, it, expect } from '@jest/globals';
import { extractDomain, inferCompanyDomain, extractLinkedInUrls } from '../../services/enrichment';

describe('EnrichmentService', () => {
  describe('extractDomain', () => {
    it('should extract domain from email', () => {
      expect(extractDomain('user@example.com')).toBe('example.com');
      expect(extractDomain('john.doe@company.org')).toBe('company.org');
    });

    it('should return null for invalid email', () => {
      expect(extractDomain('notanemail')).toBeNull();
    });
  });

  describe('inferCompanyDomain', () => {
    it('should extract domain from organizer email', () => {
      const meeting = {
        organizer: { email: 'organizer@acme.com' },
        attendees: [],
      };
      
      expect(inferCompanyDomain(meeting)).toBe('acme.com');
    });

    it('should skip common email domains', () => {
      const meeting = {
        organizer: { email: 'user@gmail.com' },
        attendees: [{ email: 'someone@company.com' }],
      };
      
      expect(inferCompanyDomain(meeting)).toBe('company.com');
    });
  });

  describe('extractLinkedInUrls', () => {
    it('should extract LinkedIn URLs from text', () => {
      const text = 'Connect with me: https://linkedin.com/in/johndoe and https://www.linkedin.com/in/janedoe';
      const urls = extractLinkedInUrls(text);
      
      expect(urls).toHaveLength(2);
      expect(urls[0]).toContain('johndoe');
      expect(urls[1]).toContain('janedoe');
    });

    it('should return empty array for no LinkedIn URLs', () => {
      const text = 'No social media here';
      expect(extractLinkedInUrls(text)).toEqual([]);
    });

    it('should handle undefined text', () => {
      expect(extractLinkedInUrls(undefined)).toEqual([]);
    });
  });
});

