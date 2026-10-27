/**
 * The audio engine's status for headless tools (wiki/audio/sounds.md): the page registers where to
 * read it, window.__bowling.soundStatus() reports it. Nothing in the game reads it back.
 */
export interface SoundStatus {
  readonly running: boolean;
  readonly muted: boolean;
  readonly playing: string | null;
}

let source: (() => SoundStatus) | null = null;

export function registerSoundStatus(read: (() => SoundStatus) | null): void {
  source = read;
}

export function soundStatus(): SoundStatus | null {
  return source?.() ?? null;
}
