import { z } from 'zod';
import { LANE_INDICES, LANE_LENGTH_M, TRAVEL_LANES } from '@models/measures/lane';
import { TRACK_SCHEMA_VERSION } from '../../config/track';

/** The five obstacle kinds, a closed set (wiki/track/track-format.md, rule 3). */
export const OBSTACLE_KINDS = ['stray-pins', 'rental-shoes', 'returning-ball', 'sweep-bar', 'widening-gutter'] as const;
export type ObstacleKind = (typeof OBSTACLE_KINDS)[number];

const lane = z.union(LANE_INDICES.map((l) => z.literal(l)));
const along = z.number().nonnegative();

export const obstacleSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('stray-pins'), lane, z: along }).strict(),
  z.object({ kind: z.literal('rental-shoes'), lane, z: along }).strict(),
  z.object({ kind: z.literal('returning-ball'), lane, z: along, speedMps: z.number().positive() }).strict(),
  z.object({ kind: z.literal('sweep-bar'), z: along }).strict(),
  z.object({ kind: z.literal('widening-gutter'), lane, z: along, lengthM: z.number().positive() }).strict(),
]);

export const trackSchema = z
  .object({
    schemaVersion: z.literal(TRACK_SCHEMA_VERSION),
    trackId: z.string().regex(/^[a-z0-9-]+$/),
    seed: z.number().int(),
    lengthM: z.literal(LANE_LENGTH_M),
    lanes: z.literal(TRAVEL_LANES),
    obstacles: z.array(obstacleSchema),
  })
  .strict();

export type Track = z.infer<typeof trackSchema>;
export type Obstacle = z.infer<typeof obstacleSchema>;
export type LaneObstacle = Extract<Obstacle, { lane: number }>;

/** The list of committed track ids, in play order (game/public/tracks/index.json). */
export const trackIndexSchema = z.object({ tracks: z.array(z.string()).min(1) }).strict();
export type TrackIndex = z.infer<typeof trackIndexSchema>;
