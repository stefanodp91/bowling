import { LANE_LENGTH_M, laneCentreX } from '@models/measures/lane';
import { describe, expect, it } from 'vitest';
import { DECK_HANDOFF_Z, JUMP_AIRTIME_S, LANE_CHANGE_S, LAUNCH_S, MIN_ROLL_SPEED_MPS, PIN_SPEED_MPS, RELEASE_SPEED_MPS, SIM_STEP_S } from '../../config/run';
import { cleanRunTimeTo, targetSpeed } from './speed';
import type { Command, RunState } from './state';
import { initialRunState, runStateAt, step } from './step';

/** Runs `steps` fixed steps of one command; returns every state. */
function run(from: RunState, command: Command | ((i: number) => Command), steps: number): RunState[] {
  const states = [from];
  for (let i = 0; i < steps; i += 1) {
    const previous = states[states.length - 1] ?? from;
    states.push(step(previous, typeof command === 'function' ? command(i) : command, SIM_STEP_S));
  }
  return states;
}

const stepsFor = (seconds: number): number => Math.round(seconds / SIM_STEP_S);

describe('run step', () => {
  it('never exceeds the target speed', () => {
    for (const s of run(initialRunState(), 'stay', stepsFor(60))) expect(s.speedMps).toBeLessThanOrEqual(targetSpeed(s.z) + 1e-9);
  });

  it('has a target speed monotonic in z: the release speed, then never increasing', () => {
    expect(targetSpeed(0)).toBe(RELEASE_SPEED_MPS);
    for (let z = 0; z < LANE_LENGTH_M; z += 0.5) expect(targetSpeed(z + 0.5)).toBeLessThanOrEqual(targetSpeed(z));
  });

  it('throws the ball: from rest to the release speed in LAUNCH_S, then slows to the pin speed', () => {
    const states = run(initialRunState(), 'stay', stepsFor(60)).filter((s) => s.phase === 'rolling');
    const thrown = states.find((s) => s.runS >= LAUNCH_S);
    expect(states[0]?.speedMps).toBeLessThan(RELEASE_SPEED_MPS / 10);
    expect(thrown?.speedMps).toBeCloseTo(RELEASE_SPEED_MPS, 1);
    const speeds = states.filter((s) => s.runS >= LAUNCH_S).map((s) => s.speedMps);
    expect(speeds.every((v, i) => i === 0 || v <= (speeds[i - 1] ?? v))).toBe(true);
    expect(states[states.length - 1]?.speedMps).toBeCloseTo(PIN_SPEED_MPS, 1);
  });

  it('never lets the drag of the lane take a slowed ball below MIN_ROLL_SPEED_MPS', () => {
    const slowed = { ...runStateAt(60), speedMps: MIN_ROLL_SPEED_MPS + 0.1 };
    const states = run(slowed, 'stay', stepsFor(60));
    expect(Math.min(...states.map((s) => s.speedMps))).toBeCloseTo(MIN_ROLL_SPEED_MPS, 9);
    expect(states[states.length - 1]?.phase).toBe('deck');
  });

  it('starts a run at z where a clean run would be: its clock and its speed', () => {
    const states = run(initialRunState(), 'stay', stepsFor(60)).filter((s) => s.phase === 'rolling');
    const at100 = states.find((s) => s.z >= 100);
    expect(runStateAt(100).runS).toBeCloseTo(at100?.runS ?? 0, 1);
    expect(runStateAt(100).speedMps).toBeCloseTo(at100?.speedMps ?? 0, 1);
    expect(cleanRunTimeTo(DECK_HANDOFF_Z)).toBeCloseTo(states[states.length - 1]?.runS ?? 0, 1);
  });

  it('is deterministic: the same commands from the same state give bit-identical states', () => {
    const commands = (i: number): Command => (['stay', 'left', 'stay', 'jump', 'right'] as const)[Math.floor(i / 97) % 5] ?? 'stay';
    expect(run(runStateAt(40), commands, stepsFor(20))).toEqual(run(runStateAt(40), commands, stepsFor(20)));
  });

  it('ends a lane change exactly in the centre of the adjacent lane after LANE_CHANGE_S', () => {
    const states = run(runStateAt(100), (i) => (i === 0 ? 'left' : 'stay'), stepsFor(LANE_CHANGE_S) + 1);
    const last = states[states.length - 1];
    expect(last?.x).toBe(laneCentreX(0));
    expect(last?.laneChange).toBeNull();
  });

  it('ignores a command for a lane that does not exist, and a second change during the first', () => {
    const atLeft = { ...runStateAt(100), lane: 0 as const, x: laneCentreX(0) };
    expect(step(atLeft, 'left', SIM_STEP_S).laneChange).toBeNull();
    const changing = step(runStateAt(100), 'left', SIM_STEP_S);
    expect(step(changing, 'right', SIM_STEP_S).laneChange?.to).toBe(0);
  });

  it('returns a jump to y = 0 after JUMP_AIRTIME_S, and refuses a lane change while airborne', () => {
    const states = run(runStateAt(100), (i) => (i === 0 ? 'jump' : 'left'), stepsFor(JUMP_AIRTIME_S) + 1);
    expect(Math.max(...states.map((s) => s.y))).toBeGreaterThan(0);
    const landed = states[states.length - 1];
    expect(landed?.y).toBe(0);
    expect(landed?.jump).toBeNull();
    expect(states.slice(1, -1).every((s) => s.laneChange === null)).toBe(true);
  });

  it('rolls for 24–27 s on an empty track with «stay» only (≈ 25.4 s expected)', () => {
    const states = run(initialRunState(), 'stay', stepsFor(60));
    const rollingS = states.filter((s) => s.phase === 'rolling').length * SIM_STEP_S;
    expect(rollingS).toBeGreaterThan(24);
    expect(rollingS).toBeLessThan(27);
  });
});
