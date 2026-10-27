import { createAudioEngine, type AudioEngine } from 'obsidian-eclipse-audio-engine';
import { AUDIO_BASE, MUSIC_DUCK_AMOUNT, MUSIC_DUCK_MS, MUSIC_ID, MUSIC_LEVEL, ROLL_FALL_S, ROLL_RISE_S } from '../config/audio';
import { CUE_IDS, ROLL_IDS, type Cue } from './cues';

/** The game's sound, played by the audio engine (wiki/audio/sounds.md, rule 3). */
export interface SoundPlayer {
  play(cue: Cue): void;
  roll(mix: { slow: number; fast: number }): void;
  stopRoll(): void;
  /** Any first gesture unlocks audio (rule 4). */
  unlock(): void;
  setMuted(muted: boolean): void;
  /** Sound is heard: the context runs and it is not muted. */
  isOn(): boolean;
  dispose(): void;
}

const path = (id: string): string => `${AUDIO_BASE}/${id}.wav`;
/** The cue the music makes room for. */
const STRIKE_CUE = 'strike';

export function createSoundPlayer(engine: AudioEngine = createAudioEngine({ onError: (error, context) => console.error('audio engine', context, error) })): SoundPlayer {
  // The engine decodes only once its audio context runs, i.e. after the first gesture; nothing
  // plays before the files are decoded (a held voice that was never warmed is an error).
  let warming: Promise<void> | null = null;
  let warmed = false;
  const warm = (): void => {
    warming ??= engine.cues
      .warm([...CUE_IDS, ...ROLL_IDS].map((id) => ({ id, path: path(id) })))
      .then(() => {
        warmed = true;
      })
      .catch((error: unknown) => console.error('audio warm-up failed', error));
  };
  // The music starts with the first gesture too, and loops until the page goes (rule 6).
  let musicStarted = false;
  const startMusic = (): void => {
    if (musicStarted) return;
    musicStarted = true;
    engine.music.setLevel(MUSIC_LEVEL);
    engine.music.play(MUSIC_ID, path(MUSIC_ID), { crossfadeMs: 0 }).catch((error: unknown) => console.error('music failed to start', error));
  };
  return {
    play: (cue) => {
      if (!warmed) return;
      if (cue.id === STRIKE_CUE) engine.music.duck(MUSIC_DUCK_AMOUNT, MUSIC_DUCK_MS);
      engine.cues.play(cue.id, { volume: cue.volume });
    },
    roll: ({ slow, fast }) => {
      if (!warmed) return;
      engine.cues.hold('roll-slow', { volume: slow, riseS: ROLL_RISE_S, fallS: ROLL_FALL_S });
      engine.cues.hold('roll-fast', { volume: fast, riseS: ROLL_RISE_S, fallS: ROLL_FALL_S });
    },
    stopRoll: () => engine.cues.releaseHolds(),
    unlock: () => {
      engine.unlock();
      warm();
      startMusic();
    },
    setMuted: (muted) => engine.setMuted(muted),
    isOn: () => {
      const status = engine.status();
      return status.running && !status.muted;
    },
    dispose: () => {
      engine.cues.releaseHolds();
      void engine.music.stop();
      void engine.dispose();
    },
  };
}
