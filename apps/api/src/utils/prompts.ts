import { readFileSync } from 'fs';
import { join } from 'path';
import { logger } from '../config/logger';
import type { PromptTemplate } from '../types';

const PROMPTS_DIR = join(__dirname, '../../../../prompts');

export class PromptLoader {
  private cache: Map<string, PromptTemplate> = new Map();

  load(name: string): PromptTemplate {
    if (this.cache.has(name)) {
      return this.cache.get(name)!;
    }

    try {
      const filePath = join(PROMPTS_DIR, `${name}.json`);
      const content = readFileSync(filePath, 'utf-8');
      const prompt = JSON.parse(content) as PromptTemplate;
      
      this.cache.set(name, prompt);
      logger.debug({ name }, 'Loaded prompt template');
      
      return prompt;
    } catch (error) {
      logger.error({ error, name }, 'Failed to load prompt template');
      throw new Error(`Failed to load prompt template: ${name}`);
    }
  }

  interpolate(template: string, variables: Record<string, string>): string {
    let result = template;
    for (const [key, value] of Object.entries(variables)) {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
    return result;
  }
}

export const promptLoader = new PromptLoader();

