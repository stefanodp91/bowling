import type { AudioEngine } from 'obsidian-eclipse-audio-engine';
import { describe, expect, it, vi } from 'vitest';
import { MUSIC_ID } from '../config/audio';
import { createSoundPlayer } from './sound-player';

/** A fake engine that records what the player asks of it. */
function fakeEngine() {
  const calls: string[] = [];
  const engine: AudioEngine = {
    music: {
      warm: vi.fn(async () => {}),
      play: vi.fn(async (id: string) => {
        calls.push(`music.play ${id}`);
      }),
      stop: vi.fn(async () => {
        calls.push('music.stop');
      }),
      setLevel: vi.fn(),
      duck: vi.fn(),
      release: vi.fn(async () => {}),
    },
    cues: {
      warm: vi.fn(async () => {}),
      play: vi.fn((id: string) => {
        calls.push(`cue ${id}`);
      }),
      hold: vi.fn(),
      releaseHolds: vi.fn(),
      setLevel: vi.fn(),
      release: vi.fn(),
    },
    status: () => ({ running: true, muted: false, musicTransport: 'web-audio', playing: null }),
    unlock: vi.fn(() => {
      calls.push('unlock');
    }),
    tryAutoStart: vi.fn(async () => false),
    setMuted: vi.fn((muted: boolean) => {
      calls.push(`muted ${muted}`);
    }),
    suspend: vi.fn(async () => {}),
    resume: vi.fn(async () => {}),
    dispose: vi.fn(async () => {}),
  };
  return { engine, calls };
}

const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('sound player', () => {
  it('the first press anywhere unlocks, turns sound on and starts the music', async () => {
    const { engine, calls } = fakeEngine();
    const player = createSoundPlayer(engine);
    player.unlock();
    await settle();
    expect(player.isOn()).toBe(true);
    expect(calls).toEqual(['unlock', 'muted false', 'music.stop', `music.play ${MUSIC_ID}`]);
  });

  it('the first press on the toggle turns sound on too, not off', () => {
    const player = createSoundPlayer(fakeEngine().engine);
    expect(player.toggle()).toBe(true);
  });

  it('turning sound back on restarts the music, which the engine does not do by itself', async () => {
    const { engine, calls } = fakeEngine();
    const player = createSoundPlayer(engine);
    player.unlock();
    expect(player.toggle()).toBe(false);
    await settle();
    calls.length = 0;
    expect(player.toggle()).toBe(true);
    await settle();
    expect(calls).toEqual(['muted false', 'music.stop', `music.play ${MUSIC_ID}`]);
  });

  it('a later press on the page does not undo the toggle, and muted cues stay silent', async () => {
    const { engine, calls } = fakeEngine();
    const player = createSoundPlayer(engine);
    player.unlock();
    player.toggle();
    player.unlock();
    expect(player.isOn()).toBe(false);
    await settle();
    calls.length = 0;
    player.play({ id: 'impact', volume: 1 });
    expect(calls).toEqual([]);
  });
});
