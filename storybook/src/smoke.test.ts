import { readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('storybook workspace', () => {
  it('has at least one story', () => {
    const stories = readdirSync(new URL('./stories', import.meta.url)).filter((f) => f.endsWith('.stories.tsx'));
    expect(stories.length).toBeGreaterThan(0);
  });
});
