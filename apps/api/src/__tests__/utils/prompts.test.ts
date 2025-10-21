import { describe, it, expect } from '@jest/globals';
import { promptLoader } from '../../utils/prompts';

describe('PromptLoader', () => {
  describe('interpolate', () => {
    it('should replace template variables', () => {
      const template = 'Hello {{name}}, welcome to {{place}}!';
      const result = promptLoader.interpolate(template, {
        name: 'Alice',
        place: 'Wonderland',
      });
      
      expect(result).toBe('Hello Alice, welcome to Wonderland!');
    });

    it('should handle multiple occurrences of the same variable', () => {
      const template = '{{name}} is {{name}}';
      const result = promptLoader.interpolate(template, {
        name: 'Bob',
      });
      
      expect(result).toBe('Bob is Bob');
    });

    it('should leave unmatched variables unchanged', () => {
      const template = 'Hello {{name}}, {{age}}';
      const result = promptLoader.interpolate(template, {
        name: 'Charlie',
      });
      
      expect(result).toBe('Hello Charlie, {{age}}');
    });
  });
});

