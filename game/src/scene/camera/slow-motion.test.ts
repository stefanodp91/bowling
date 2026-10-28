import { LANE_LENGTH_M } from '@models/measures/lane';
import { NullEngine } from '@babylonjs/core/Engines/nullEngine';
import { Scene } from '@babylonjs/core/scene';
import { createBall } from '@models';
import { beforeAll, describe, expect, it } from 'vitest';
import { createSession } from '../../app/session';
import { DECK_HANDOFF_Z } from '../../config/run';
import type { Track } from '../../domain/track/schema';
import { createDeck } from '../physics/deck';
import type { HavokInstance } from '../physics/havok-loader';
import { loadHavokInNode } from '../physics/havok-node';
import { createPhysicsWorld } from '../physics/physics-world';
import { createPinsView } from '../views/pins-view';
import { timeScaleAt } from './rig';

const EMPTY_TRACK: Track = { schemaVersion: 1, trackId: 'empty', seed: 1, lengthM: LANE_LENGTH_M, lanes: 3, obstacles: [] };
/** A 60 Hz display. */
const FRAME_S = 1 / 60;
const MAX_FRAMES = 2000;
const TEST_TIMEOUT_MS = 60_000;

let havok: HavokInstance;
beforeAll(async () => {
  havok = await loadHavokInNode();
});

/** A whole deck through the session, frame by frame, with or without slow motion. */
function playDeck(slowMotion: boolean): { score: number | null; frames: number } {
  const scene = new Scene(new NullEngine());
  const physics = createPhysicsWorld(scene, havok);
  const pins = createPinsView(scene);
  const ball = createBall(scene, { variant: 'player' });
  const deck = createDeck(scene, { ball: ball.root, pins: pins.pins, pinMesh: pins.pinMesh });
  const session = createSession({ track: EMPTY_TRACK, skill: 'perfect', startAtZ: DECK_HANDOFF_Z - 1 });
  session.attach({ physics, deck });
  let frames = 0;
  while (session.world().run.phase !== 'result' && frames < MAX_FRAMES) {
    const scale = slowMotion ? timeScaleAt(session.world().deck.sinceContactS) : 1;
    session.frame(FRAME_S, scale);
    frames += 1;
  }
  return { score: session.store.get().score, frames };
}

describe('slow motion', () => {
  it('a deck with and without slow motion gives the same pins down (camera criterion 2)', { timeout: TEST_TIMEOUT_MS }, () => {
    const normal = playDeck(false);
    const slow = playDeck(true);
    console.info(`SLOWMO normal ${normal.score} in ${normal.frames} frames, slow ${slow.score} in ${slow.frames} frames`);
    expect(slow.score).not.toBeNull();
    expect(slow.score).toBe(normal.score);
    expect(slow.frames).toBeGreaterThan(normal.frames);
  });
});
