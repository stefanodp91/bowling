import { LANE_INDICES } from '@models/measures/lane';
import { describe, expect, it } from 'vitest';
import { APPROACH_START_Z_M, START_CLEAR_M } from '../../config/track';
import { seededRandom } from '../random';
import { extentOf, meetingZ, returningBallStartZ } from './extent';
import { generateTrack } from './generate';
import { parseTrack } from './parse';
import { trackViolations } from './rules';
import type { Track } from './schema';

const base = { schemaVersion: 1, trackId: 'test', seed: 1, lengthM: 500, lanes: 3 } as const;
const generated = (seed: number): Track => generateTrack(`t-${seed}`, seed, seededRandom(seed));

describe('track schema', () => {
  it('accepts the example of the wiki page', () => {
    const result = parseTrack({
      ...base,
      obstacles: [
        { kind: 'stray-pins', lane: 0, z: 42 },
        { kind: 'rental-shoes', lane: 1, z: 61 },
        { kind: 'returning-ball', lane: 2, z: 80, speedMps: 3 },
        { kind: 'sweep-bar', z: 104 },
        { kind: 'widening-gutter', lane: 2, z: 130, lengthM: 18 },
      ],
    });
    expect(result.ok).toBe(true);
  });

  it('rejects a missing field, naming it', () => {
    const result = parseTrack({ ...base, obstacles: [{ kind: 'returning-ball', lane: 2, z: 80 }] });
    expect(result).toMatchObject({ ok: false, error: expect.stringContaining('obstacles.0.speedMps') });
  });

  it('rejects an unknown kind, naming the field', () => {
    const result = parseTrack({ ...base, obstacles: [{ kind: 'bowling-bag', lane: 1, z: 50 }] });
    expect(result).toMatchObject({ ok: false, error: expect.stringContaining('obstacles.0.kind') });
  });
});

describe('track generator', () => {
  it('is deterministic: same seed, same track', () => {
    expect(generated(1001)).toEqual(generated(1001));
    expect(generated(1001)).not.toEqual(generated(1002));
  });

  it('keeps the clear zones on 50 seeds', () => {
    for (let seed = 1; seed <= 50; seed += 1) {
      for (const obstacle of generated(seed).obstacles) {
        const { startZ, endZ } = extentOf(obstacle);
        expect(startZ).toBeGreaterThanOrEqual(START_CLEAR_M);
        expect(endZ).toBeLessThanOrEqual(APPROACH_START_Z_M);
      }
    }
  });

  it('shrinks the gaps along the lane', () => {
    const gaps: Array<[number, number]> = [];
    for (let seed = 1; seed <= 50; seed += 1) {
      const extents = generated(seed).obstacles.map(extentOf);
      extents.slice(1).forEach((e, i) => gaps.push([e.startZ, e.startZ - (extents[i]?.endZ ?? 0)]));
    }
    const mean = (items: Array<[number, number]>) => items.reduce((s, [, g]) => s + g, 0) / items.length;
    const early = mean(gaps.filter(([z]) => z < 150));
    const late = mean(gaps.filter(([z]) => z > 350));
    expect(early).toBeGreaterThan(late + 5);
  });

  it('produces tracks with no rule violation on 200 seeds', () => {
    for (let seed = 1; seed <= 200; seed += 1) expect(trackViolations(generated(seed))).toEqual([]);
  });
});

describe('track rules', () => {
  const at = (obstacles: Track['obstacles']): Track => ({ ...base, obstacles });

  it('rejects an obstacle in the approach zone', () => {
    expect(trackViolations(at([{ kind: 'stray-pins', lane: 0, z: 470 }])).map((v) => v.rule)).toContain('clear-zone');
  });

  it('rejects three lane obstacles at the same z, one per lane', () => {
    const rules = trackViolations(at(LANE_INDICES.map((lane) => ({ kind: 'stray-pins' as const, lane, z: 100 })))).map((v) => v.rule);
    expect(rules).toContain('passable');
  });

  it('rejects a sweep bar 3 m after a stray-pins group', () => {
    const rules = trackViolations(at([{ kind: 'stray-pins', lane: 0, z: 100 }, { kind: 'sweep-bar', z: 103 }])).map((v) => v.rule);
    expect(rules).toContain('sweep-clearance');
  });

  it('places a returning ball where a clean run meets it', () => {
    expect(meetingZ(returningBallStartZ(200, 3), 3)).toBeCloseTo(200, 6);
  });
});
