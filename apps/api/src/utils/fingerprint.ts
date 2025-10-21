import { createHash } from 'crypto';

/**
 * Generate a fingerprint (hash) from input data for cache keys
 */
export function generateFingerprint(data: unknown): string {
  const normalized = JSON.stringify(data, Object.keys(data as object).sort());
  return createHash('sha256').update(normalized).digest('hex').substring(0, 16);
}

/**
 * Build a cache key for AI responses
 */
export function buildAICacheKey(
  uid: string,
  meetingId: string,
  type: string,
  extraData?: unknown
): string {
  const parts = [uid, meetingId, type];
  if (extraData) {
    parts.push(generateFingerprint(extraData));
  }
  return `ai:${parts.join(':')}`;
}

