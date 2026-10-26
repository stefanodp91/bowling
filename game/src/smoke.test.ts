import { describe, expect, it } from 'vitest';
import { createPlaceholder } from '@models';

describe('game workspace', () => {
  it('resolves @models to the models workspace', () => {
    expect(typeof createPlaceholder).toBe('function');
  });
});
