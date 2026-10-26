import { RENTAL_SHOES_FOOTPRINT, SWEEP_BAR_FOOTPRINT } from '@models/measures/obstacles';
import { describe, expect, it } from 'vitest';
import { JUMP_APEX_M } from '../../config/run';

/**
 * Jumpable obstacles are lower than the jump apex — the height of the ball's lowest point at the
 * top of the jump (wiki/models/obstacles/rental-shoes.md and sweep-bar.md, criterion 2).
 */
describe('jumpable obstacles are below the jump apex', () => {
  it('rental shoes footprint height < JUMP_APEX_M', () => {
    expect(RENTAL_SHOES_FOOTPRINT.heightM).toBeLessThan(JUMP_APEX_M);
  });

  it('sweep bar footprint height (its whole swing) < JUMP_APEX_M', () => {
    expect(SWEEP_BAR_FOOTPRINT.heightM).toBeLessThan(JUMP_APEX_M);
  });
});
