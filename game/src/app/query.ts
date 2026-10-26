import { z } from 'zod';
import { MAX_SPEEDUP } from '../config/loop';
import { SKILLS, type Skill } from '../config/pilot';

/** The query parameters of the game page, parsed in one place (wiki/game/run.md, rule 7). */
export interface GameQuery {
  readonly track?: string;
  readonly skill?: Skill;
  /** Start already rolling at this metre (for shots). */
  readonly at?: number;
  /** Freeze after the first rendered frame (for shots). */
  readonly pause: boolean;
  /** Fixed steps per rendered frame, instead of real time (for headless runs). */
  readonly speedup?: number;
}

const querySchema = z.object({
  track: z.string().regex(/^[a-z0-9-]+$/).optional(),
  skill: z.enum(SKILLS).optional(),
  at: z.coerce.number().min(0).optional(),
  pause: z.enum(['1', '0']).optional(),
  speedup: z.coerce.number().int().min(1).max(MAX_SPEEDUP).optional(),
});

export type QueryResult = { readonly ok: true; readonly query: GameQuery } | { readonly ok: false; readonly field: string };

export function parseQuery(search: string): QueryResult {
  const raw = Object.fromEntries(new URLSearchParams(search));
  const parsed = querySchema.safeParse(raw);
  if (!parsed.success) return { ok: false, field: String(parsed.error.issues[0]?.path[0] ?? 'query') };
  const { track, skill, at, pause, speedup } = parsed.data;
  return {
    ok: true,
    query: {
      pause: pause === '1',
      ...(track === undefined ? {} : { track }),
      ...(skill === undefined ? {} : { skill }),
      ...(at === undefined ? {} : { at }),
      ...(speedup === undefined ? {} : { speedup }),
    },
  };
}
