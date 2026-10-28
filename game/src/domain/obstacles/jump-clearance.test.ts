import { RENTAL_SHOES_FOOTPRINT, SODA_CANS_FOOTPRINT } from '@models/measures/obstacles';
import { describe, expect, it } from 'vitest';
import { JUMP_APEX_M } from '../../config/run';

/**
 * Jumpable obstacles are lower than the jump apex — the height of the ball's lowest point at the
 * top of the jump (wiki/models/obstacles/rental-shoes.md and soda-cans.md, criterion 2).
 */
describe('jumpable obstacles are below the jump apex', () => {
  it('rental shoes footprint height < JUMP_APEX_M', () => {
    expect(RENTAL_SHOES_FOOTPRINT.heightM).toBeLessThan(JUMP_APEX_M);
  });

  it('soda cans footprint height (a standing can) < JUMP_APEX_M', () => {
    expect(SODA_CANS_FOOTPRINT.heightM).toBeLessThan(JUMP_APEX_M);
  });
});
