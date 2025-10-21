import { readFileSync } from 'fs';
import { join } from 'path';
import { logger } from '../config/logger';
import type { PromptTemplate } from '../types';

const PROMPTS_DIR = join(__dirname, '../../prompts');

export class PromptLoader {
  private cache: Map<string, PromptTemplate> = new Map();

  load(name: string): PromptTemplate {
    if (this.cache.has(name)) {
      return this.cache.get(name)!;
    }

    try {
      const filePath = join(PROMPTS_DIR, `${name}.json`);
      console.log(`🔍 Loading prompt: ${name} from ${filePath}`);
      console.log(`🔍 PROMPTS_DIR: ${PROMPTS_DIR}`);
      
      const content = readFileSync(filePath, 'utf-8');
      console.log(`📄 File content length: ${content.length}`);
      
      const prompt = JSON.parse(content) as PromptTemplate;
      console.log(`✅ Successfully parsed prompt: ${name}`);
      
      this.cache.set(name, prompt);
      logger.debug({ name }, 'Loaded prompt template');
      
      return prompt;
    } catch (error) {
      console.error(`❌ Failed to load prompt ${name}:`, error);
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

