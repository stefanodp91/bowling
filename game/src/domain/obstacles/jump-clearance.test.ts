import { describe, it } from 'vitest';

/**
 * Jumpable obstacles must be lower than the jump apex of game/src/config/run.ts
 * (wiki/models/obstacles/rental-shoes.md and sweep-bar.md, criterion 2). The apex does not exist
 * until wiki/game/run.md is built: then these become real tests.
 */
describe('jumpable obstacles are below the jump apex', () => {
  it.skip('rental shoes footprint height < JUMP_APEX_M — waits for wiki/game/run.md (config/run.ts)', () => {});
});
