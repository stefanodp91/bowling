// The sound set (wiki/audio/sounds.md, rule 1): every sound as numbers. Each constant names the
// part of the sound it shapes. Imports the domain's seeded generator, so run under tsx.
import { seededRandom } from '../../game/src/domain/random.ts';
import { musicLoop } from './music.mjs';
import { envelope, highPass, lowPass, noise, normalise, seamless } from './synth.mjs';

/** 22 050 Hz is plenty for rumble, thuds and clacks, and halves the committed bytes. */
export const SAMPLE_RATE = 22050;
const SEED = 2026;
const PEAK = 0.9;

// --- roll: two loops, slow and fast, cross-faded by speed in the game ---
/** Loop length and the cross-fade that hides its seam, seconds. */
const ROLL_LOOP_S = 2;
const ROLL_SEAM_S = 0.25;
/** The rolling noise: how dull it is, and the lane's low rumble under it (Hz, share). */
const ROLL_BANDS = {
  'roll-slow': { noiseCutoffHz: 180, rumbleHz: 38, rumbleShare: 0.45, wobbleHz: 3 },
  'roll-fast': { noiseCutoffHz: 420, rumbleHz: 55, rumbleShare: 0.35, wobbleHz: 7 },
};

function roll({ noiseCutoffHz, rumbleHz, rumbleShare, wobbleHz }, random) {
  const length = Math.round((ROLL_LOOP_S + ROLL_SEAM_S) * SAMPLE_RATE);
  const hiss = lowPass(lowPass(noise(random, length), noiseCutoffHz, SAMPLE_RATE), noiseCutoffHz, SAMPLE_RATE);
  const signal = hiss.map((h, i) => {
    const t = i / SAMPLE_RATE;
    const wobble = 1 + 0.3 * Math.sin(2 * Math.PI * wobbleHz * t);
    return normaliseShare(h, rumbleShare) * wobble + rumbleShare * Math.sin(2 * Math.PI * rumbleHz * t);
  });
  return normalise(seamless(highPass(signal, 20, SAMPLE_RATE), Math.round(ROLL_SEAM_S * SAMPLE_RATE)), PEAK * 0.8);
}
const normaliseShare = (sample, share) => sample * (1 - share) * 8;

// --- impact: a dull thud — a low sine falling in pitch, under a short low-passed burst ---
const IMPACT = { lengthS: 0.45, startHz: 95, endHz: 48, decayS: 0.09, burstCutoffHz: 600, burstShare: 0.5 };

function impact(random) {
  const length = Math.round(IMPACT.lengthS * SAMPLE_RATE);
  const env = envelope(length, SAMPLE_RATE, 0.002, IMPACT.decayS);
  const burst = lowPass(noise(random, length), IMPACT.burstCutoffHz, SAMPLE_RATE);
  let phase = 0;
  const signal = env.map((e, i) => {
    const t = i / length;
    phase += (2 * Math.PI * (IMPACT.startHz + (IMPACT.endHz - IMPACT.startHz) * t)) / SAMPLE_RATE;
    return e * (Math.sin(phase) + IMPACT.burstShare * (burst[i] ?? 0) * 4);
  });
  return normalise(signal, PEAK);
}

// --- pin-clack: hard maple — a click and a few short wooden resonances, four variants ---
const CLACK = { lengthS: 0.16, clickS: 0.003, modeDecayS: 0.025 };
/** Resonant modes of a pin struck on its belly, Hz (design: hollow-wood «tock», not a glassy ring). */
const CLACK_VARIANTS = [
  [820, 1460, 2310],
  [760, 1390, 2150],
  [900, 1580, 2480],
  [700, 1300, 2050],
];

function clack(modes, random) {
  const length = Math.round(CLACK.lengthS * SAMPLE_RATE);
  const click = highPass(noise(random, length), 1500, SAMPLE_RATE).map((n, i) => (i / SAMPLE_RATE < CLACK.clickS ? n : 0));
  const env = envelope(length, SAMPLE_RATE, 0.0005, CLACK.modeDecayS);
  const signal = env.map((e, i) => {
    const t = i / SAMPLE_RATE;
    const body = modes.reduce((sum, hz, k) => sum + Math.sin(2 * Math.PI * hz * t) / (k + 1), 0);
    return e * body + (click[i] ?? 0) * 0.6;
  });
  return normalise(signal, PEAK);
}

// --- strike: a short bright flourish — a rising major arpeggio with a bell-like decay ---
const STRIKE = { noteS: 0.11, tailS: 0.9, decayS: 0.35 };
/** C5, E5, G5, C6 (Hz). */
const STRIKE_NOTES = [523.25, 659.25, 783.99, 1046.5];

function strike() {
  const length = Math.round((STRIKE.noteS * STRIKE_NOTES.length + STRIKE.tailS) * SAMPLE_RATE);
  const signal = Array.from({ length }, (_, i) => {
    const t = i / SAMPLE_RATE;
    return STRIKE_NOTES.reduce((sum, hz, k) => {
      const start = k * STRIKE.noteS;
      if (t < start) return sum;
      const local = t - start;
      const env = Math.min(1, local / 0.005) * Math.exp(-local / STRIKE.decayS);
      return sum + env * (Math.sin(2 * Math.PI * hz * local) + 0.3 * Math.sin(4 * Math.PI * hz * local));
    }, 0);
  });
  return normalise(signal, PEAK * 0.85);
}

/** Every sound file, name → samples. One seeded source, consumed in a fixed order. */
export function soundSet() {
  const random = seededRandom(SEED);
  return {
    'roll-slow': roll(ROLL_BANDS['roll-slow'], random),
    'roll-fast': roll(ROLL_BANDS['roll-fast'], random),
    impact: impact(random),
    ...Object.fromEntries(CLACK_VARIANTS.map((modes, i) => [`pin-clack-${i + 1}`, clack(modes, random)])),
    strike: strike(),
    'music-alley': musicLoop(random, SAMPLE_RATE),
  };
}
