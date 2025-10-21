import OpenAI from 'openai';
import { env } from './environment';

export const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

// Model selection based on briefing quality
export function getModelForQuality(quality: 'compact' | 'standard' | 'deep'): string {
  switch (quality) {
    case 'compact':
      return 'gpt-4o-mini';
    case 'standard':
      return 'gpt-4o-mini';
    case 'deep':
      return 'gpt-4o';
    default:
      return 'gpt-4o-mini';
  }
}

// Token limits based on quality
export function getMaxTokensForQuality(quality: 'compact' | 'standard' | 'deep'): number {
  switch (quality) {
    case 'compact':
      return 500;
    case 'standard':
      return 1000;
    case 'deep':
      return 2000;
    default:
      return 1000;
  }
}

// Temperature settings
export function getTemperatureForType(type: 'extraction' | 'creative'): number {
  return type === 'extraction' ? 0.2 : 0.6;
}

