import { createAudioEngine, inMemoryMutePreference, type AudioEngine, type AudioStatus } from 'obsidian-eclipse-audio-engine';
import { AUDIO_BASE, MUSIC_DUCK_AMOUNT, MUSIC_DUCK_MS, MUSIC_ID, MUSIC_LEVEL, ROLL_FALL_S, ROLL_RISE_S } from '../config/audio';
import { CUE_IDS, ROLL_IDS, type Cue } from './cues';

/** The game's sound, played by the audio engine (wiki/audio/sounds.md, rules 3, 4 and 6). */
export interface SoundPlayer {
  play(cue: Cue): void;
  roll(mix: { slow: number; fast: number }): void;
  stopRoll(): void;
  /** A gesture anywhere on the page: the first one unlocks audio and turns sound on (rule 4). */
  unlock(): void;
  /** The sound toggle: on ↔ off; the first press also unlocks. Returns whether sound is now on. */
  toggle(): boolean;
  /** Sound is on: unlocked and not muted. */
  isOn(): boolean;
  /** What the engine reports: running, muted, the music playing. */
  status(): AudioStatus;
  dispose(): void;
}

const path = (id: string): string => `${AUDIO_BASE}/${id}.wav`;
/** The cue the music makes room for. */
const STRIKE_CUE = 'strike';

/** The engine as the game builds it: mute lives in memory, so a reload never starts silently muted. */
export const createGameAudioEngine = (): AudioEngine =>
  createAudioEngine({ mutePreference: inMemoryMutePreference(false), onError: (error, context) => console.error('audio engine', context, error) });

export function createSoundPlayer(engine: AudioEngine = createGameAudioEngine()): SoundPlayer {
  let unlocked = false;
  let muted = false;
  // The engine decodes only once its audio context runs, i.e. after the first gesture; nothing
  // plays before the files are decoded (a held voice that was never warmed is an error).
  let warmed = false;
  const warm = (): void => {
    void engine.cues
      .warm([...CUE_IDS, ...ROLL_IDS].map((id) => ({ id, path: path(id) })))
      .then(() => {
        warmed = true;
      })
      .catch((error: unknown) => console.error('audio warm-up failed', error));
  };
  // The engine starts music only if it is audible when the file is ready, and on Web Audio it does
  // not restart it on unmute: so the music is (re)started every time sound becomes audible (rule 6).
  const startMusic = (): void => {
    engine.music.setLevel(MUSIC_LEVEL);
    void engine.music
      .stop()
      .then(() => engine.music.play(MUSIC_ID, path(MUSIC_ID), { crossfadeMs: 0 }))
      .catch((error: unknown) => console.error('music failed to start', error));
  };
  const turnOn = (): void => {
    if (!unlocked) {
      unlocked = true;
      engine.unlock();
      warm();
    }
    muted = false;
    engine.setMuted(false);
    startMusic();
  };
  return {
    play: (cue) => {
      if (!warmed || muted) return;
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
      if (!unlocked) turnOn();
    },
    toggle: () => {
      if (unlocked && !muted) {
        muted = true;
        engine.setMuted(true);
      } else {
        turnOn();
      }
      return unlocked && !muted;
    },
    isOn: () => unlocked && !muted,
    status: () => engine.status(),
    dispose: () => {
      engine.cues.releaseHolds();
      void engine.music.stop();
      void engine.dispose();
    },
  };
}
