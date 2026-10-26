import { trackSchema, type Track } from './schema';

export type ParseResult<T> = { readonly ok: true; readonly value: T } | { readonly ok: false; readonly error: string };

/**
 * Validates an unknown value as a track. On failure the message names the field, e.g.
 * «obstacles.3.kind: Invalid input» (wiki/track/track-format.md, rule 4).
 */
export function parseTrack(value: unknown): ParseResult<Track> {
  const result = trackSchema.safeParse(value);
  if (result.success) return { ok: true, value: result.data };
  const issue = result.error.issues[0];
  const path = issue?.path.join('.') ?? '';
  return { ok: false, error: `${path.length > 0 ? path : '(track)'}: ${issue?.message ?? 'invalid track'}` };
}
