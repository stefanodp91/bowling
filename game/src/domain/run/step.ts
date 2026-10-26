import { CENTRE_LANE, laneCentreX, LANE_INDICES, type LaneIndex } from '@models/measures/lane';
import {
  ACCEL_MPS2,
  BALL_ROLL_RADIUS_M,
  DECK_HANDOFF_Z,
  JUMP_AIRTIME_S,
  JUMP_APEX_M,
  LANE_CHANGE_S,
  READY_S,
  START_SPEED_MPS,
} from '../../config/run';
import { smoothstep } from '../math/ease';
import { targetSpeed } from './speed';
import type { Command, Jump, LaneChange, RunState } from './state';

/** A fresh run on the foul line, counting down (rule 1). */
export function initialRunState(): RunState {
  return {
    phase: 'ready',
    phaseS: 0,
    runS: 0,
    z: 0,
    x: laneCentreX(CENTRE_LANE),
    y: 0,
    speedMps: START_SPEED_MPS,
    lane: CENTRE_LANE,
    laneChange: null,
    lastLaneChange: null,
    jump: null,
    rollRad: 0,
  };
}

/** A run already rolling at `z` in the centre lane at its target speed (the `at` query parameter). */
export function runStateAt(z: number): RunState {
  return { ...initialRunState(), phase: 'rolling', z, speedMps: targetSpeed(z) };
}

/** A lane change starts and stops with zero lateral speed. */
const ease = smoothstep;
/** t(1 − t) peaks at 1/4: times 4 the parabola's peak is exactly the apex. */
const PARABOLA_PEAK_SCALE = 4;

/** Height of the ball's lowest point during a jump: a parabola with its apex at half the airtime. */
export function jumpHeight(elapsedS: number): number {
  const t = Math.min(1, Math.max(0, elapsedS / JUMP_AIRTIME_S));
  return PARABOLA_PEAK_SCALE * JUMP_APEX_M * t * (1 - t);
}

function adjacentLane(lane: LaneIndex, command: Command): LaneIndex | null {
  const delta = command === 'left' ? -1 : command === 'right' ? 1 : 0;
  return LANE_INDICES.find((l) => l === lane + delta && delta !== 0) ?? null;
}

/** Applies a command: lane changes to existing adjacent lanes, one at a time, never airborne. */
function applyCommand(state: RunState, command: Command): Pick<RunState, 'lane' | 'laneChange' | 'jump'> {
  const { lane, laneChange, jump } = state;
  if (command === 'jump' && jump === null) return { lane, laneChange, jump: { elapsedS: 0 } };
  if ((command === 'left' || command === 'right') && laneChange === null && jump === null) {
    const to = adjacentLane(lane, command);
    if (to !== null) return { lane: to, laneChange: { from: lane, to, elapsedS: 0 }, jump };
  }
  return { lane, laneChange, jump };
}

function advanceLaneChange(change: LaneChange | null, lane: LaneIndex, dtS: number): { x: number; laneChange: LaneChange | null } {
  if (change === null) return { x: laneCentreX(lane), laneChange: null };
  const elapsedS = change.elapsedS + dtS;
  if (elapsedS >= LANE_CHANGE_S) return { x: laneCentreX(change.to), laneChange: null };
  const from = laneCentreX(change.from);
  return { x: from + (laneCentreX(change.to) - from) * ease(elapsedS / LANE_CHANGE_S), laneChange: { ...change, elapsedS } };
}

function advanceJump(jump: Jump | null, dtS: number): { y: number; jump: Jump | null } {
  if (jump === null) return { y: 0, jump: null };
  const elapsedS = jump.elapsedS + dtS;
  return elapsedS >= JUMP_AIRTIME_S ? { y: 0, jump: null } : { y: jumpHeight(elapsedS), jump: { elapsedS } };
}

/** Speed moves towards the target by at most ACCEL_MPS2 · dt (rule 3). */
export function nextSpeed(speedMps: number, z: number, dtS: number): number {
  const target = targetSpeed(z);
  const maxChange = ACCEL_MPS2 * dtS;
  return speedMps + Math.max(-maxChange, Math.min(maxChange, target - speedMps));
}

function stepRolling(state: RunState, command: Command, dtS: number): RunState {
  const commanded = applyCommand(state, command);
  const lateral = advanceLaneChange(commanded.laneChange, commanded.lane, dtS);
  const vertical = advanceJump(commanded.jump, dtS);
  const speedMps = nextSpeed(state.speedMps, state.z, dtS);
  const z = state.z + speedMps * dtS;
  const startedChange = commanded.laneChange !== null && state.laneChange === null;
  const lastLaneChange = startedChange
    ? commanded.laneChange
    : state.lastLaneChange === null
      ? null
      : { ...state.lastLaneChange, elapsedS: state.lastLaneChange.elapsedS + dtS };
  const rolling: RunState = {
    ...state,
    ...commanded,
    lastLaneChange,
    ...lateral,
    ...vertical,
    speedMps,
    z,
    phaseS: state.phaseS + dtS,
    runS: state.runS + dtS,
    rollRad: state.rollRad + (speedMps / BALL_ROLL_RADIUS_M) * dtS,
  };
  return z >= DECK_HANDOFF_Z ? { ...rolling, phase: 'deck', phaseS: 0 } : rolling;
}

/**
 * One fixed step of the run (rule 2): pure, deterministic. `ready` counts down and then rolls by
 * itself; `rolling` follows the command; from `deck` on, physics owns the ball
 * (wiki/game/pins.md) and the step only keeps time.
 */
export function step(state: RunState, command: Command, dtS: number): RunState {
  switch (state.phase) {
    case 'ready':
      return state.phaseS + dtS >= READY_S ? { ...state, phase: 'rolling', phaseS: 0 } : { ...state, phaseS: state.phaseS + dtS };
    case 'rolling':
      return stepRolling(state, command, dtS);
    case 'deck':
    case 'settling':
    case 'result':
      return { ...state, phaseS: state.phaseS + dtS };
  }
}
