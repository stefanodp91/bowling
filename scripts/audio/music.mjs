// The background music (wiki/audio/sounds.md, rule 6): a cheerful, bouncy bowling-alley groove
// written as numbers — eight bars in C major at 126 BPM (C F C G C F G C), a walking bass, bright
// offbeat chord stabs, a lead hook, four-on-the-floor kick, handclaps and hi-hats. Every note is
// written with wrap-around, so the loop has no seam.
import { lowPass, noise, normalise } from './synth.mjs';

const BPM = 126;
const BEATS_PER_BAR = 4;
const SECONDS_PER_BEAT = 60 / BPM;
const SEMITONE = 2 ** (1 / 12);
/** MIDI note 69 is A4 at 440 Hz. */
const midiToHz = (note) => 440 * SEMITONE ** (note - 69);

/** One chord per bar, as its root in the bass octave (MIDI); every chord is a major triad. */
const BASS_ROOTS = [36, 41, 36, 43, 36, 41, 43, 36];
const MAJOR_TRIAD = [0, 4, 7];
/** The stabs sit an octave and a half above the bass root, so they ring bright but not shrill. */
const STAB_OFFSET = 24;
/** The walking bass climbs root, third, fifth, sixth: one note a beat. */
const WALK = [0, 4, 7, 9];

/**
 * The lead hook: [beat within its bar, MIDI note, length in beats], two bars at a time. Bars 5–6
 * repeat bars 1–2; bars 7–8 turn the phrase round towards the top of the loop.
 */
const HOOK_OPEN = [
  [[0, 76, 0.5], [0.5, 79, 0.5], [1, 81, 0.5], [1.5, 79, 0.5], [2, 76, 1], [3, 72, 0.5], [3.5, 74, 0.5]],
  [[0, 77, 0.5], [0.5, 81, 0.5], [1, 84, 1], [2, 81, 0.5], [2.5, 77, 0.5], [3, 81, 1]],
];
const HOOK = [
  ...HOOK_OPEN,
  [[0, 79, 0.5], [0.5, 76, 0.5], [1, 79, 0.5], [1.5, 84, 0.5], [2, 83, 0.5], [2.5, 81, 0.5], [3, 79, 1]],
  [[0, 74, 0.5], [0.5, 79, 0.5], [1, 83, 1], [2, 81, 0.5], [2.5, 79, 0.5], [3, 77, 0.5], [3.5, 74, 0.5]],
  ...HOOK_OPEN,
  [[0, 83, 0.5], [0.5, 86, 0.5], [1, 83, 0.5], [1.5, 79, 0.5], [2, 81, 0.5], [2.5, 83, 0.5], [3, 86, 1]],
  [[0, 84, 1.5], [1.5, 79, 0.5], [2, 76, 0.5], [2.5, 79, 0.5], [3, 84, 1]],
];

const BASS = { decayS: 0.28, share: 0.5 };
const STAB = { decayS: 0.09, share: 0.11 };
const LEAD = { attackS: 0.008, decayS: 0.35, sustain: 0.55, releaseS: 0.05, share: 0.2, vibratoHz: 5.5, vibratoDepth: 0.004 };
const KICK = { startHz: 120, endHz: 48, decayS: 0.11, share: 0.6 };
const CLAP = { decayS: 0.07, cutoffHz: 2600, share: 0.24, flamS: [0, 0.011, 0.023] };
const HAT = { decayS: 0.022, cutoffHz: 8000, share: 0.07 };
const PEAK = 0.75;
/** A gentle final low-pass that rounds the square tones' top harmonics off. */
const SMOOTH_CUTOFF_HZ = 6000;
/** Odd harmonics with 1/n weights: a soft square, the bright tone of the stabs and the lead. */
const SQUARE_HARMONICS = [1, 3, 5, 7];

const square = (phase) => SQUARE_HARMONICS.reduce((sum, n) => sum + Math.sin(n * phase) / n, 0);

/** A mixing buffer whose notes wrap round its end, so the loop is seamless. */
function loopBuffer(sampleRate) {
  const length = Math.round(BASS_ROOTS.length * BEATS_PER_BAR * SECONDS_PER_BEAT * sampleRate);
  const out = new Float64Array(length);
  const add = (beat, durationBeats, voice) => {
    const start = Math.round(beat * SECONDS_PER_BEAT * sampleRate);
    const n = Math.round(durationBeats * SECONDS_PER_BEAT * sampleRate);
    for (let i = 0; i < n; i += 1) out[(start + i) % length] += voice(i / sampleRate);
  };
  return { out, add };
}

function addHarmony(add) {
  BASS_ROOTS.forEach((root, bar) => {
    const barBeat = bar * BEATS_PER_BAR;
    WALK.forEach((step, beat) => {
      const hz = midiToHz(root + step);
      add(barBeat + beat, 1, (t) => BASS.share * Math.exp(-t / BASS.decayS) * (Math.sin(2 * Math.PI * hz * t) + 0.25 * Math.sin(4 * Math.PI * hz * t)));
    });
    for (let beat = 0; beat < BEATS_PER_BAR; beat += 1) {
      for (const interval of MAJOR_TRIAD) {
        const hz = midiToHz(root + STAB_OFFSET + interval);
        add(barBeat + beat + 0.5, 0.5, (t) => STAB.share * Math.exp(-t / STAB.decayS) * square(2 * Math.PI * hz * t));
      }
    }
  });
}

function addLead(add, sampleRate) {
  HOOK.forEach((notes, bar) => {
    for (const [beat, note, lengthBeats] of notes) {
      const hz = midiToHz(note);
      const lengthS = lengthBeats * SECONDS_PER_BEAT;
      let phase = 0;
      add(bar * BEATS_PER_BAR + beat, lengthBeats, (t) => {
        phase += (2 * Math.PI * hz * (1 + LEAD.vibratoDepth * Math.sin(2 * Math.PI * LEAD.vibratoHz * t))) / sampleRate;
        const attack = Math.min(1, t / LEAD.attackS);
        const body = LEAD.sustain + (1 - LEAD.sustain) * Math.exp(-t / LEAD.decayS);
        const release = Math.min(1, (lengthS - t) / LEAD.releaseS);
        return LEAD.share * attack * body * release * square(phase);
      });
    }
  });
}

function addDrums(add, random, sampleRate) {
  const beats = BASS_ROOTS.length * BEATS_PER_BAR;
  for (let beat = 0; beat < beats; beat += 1) {
    let phase = 0;
    add(beat, 1, (t) => {
      phase += (2 * Math.PI * (KICK.endHz + (KICK.startHz - KICK.endHz) * Math.exp(-t / KICK.decayS))) / sampleRate;
      return KICK.share * Math.exp(-t / KICK.decayS) * Math.sin(phase);
    });
    if (beat % 2 === 1) {
      for (const flamS of CLAP.flamS) {
        const burst = lowPass(noise(random, Math.round(CLAP.decayS * 4 * sampleRate)), CLAP.cutoffHz, sampleRate);
        add(beat + flamS / SECONDS_PER_BEAT, 0.5, (t) => CLAP.share * Math.exp(-t / CLAP.decayS) * (burst[Math.round(t * sampleRate)] ?? 0) * 3);
      }
    }
    for (const off of [0, 0.5]) {
      const tick = noise(random, Math.round(HAT.decayS * 4 * sampleRate));
      add(beat + off, 0.25, (t) => HAT.share * Math.exp(-t / HAT.decayS) * (tick[Math.round(t * sampleRate)] ?? 0));
    }
  }
}

export function musicLoop(random, sampleRate) {
  const { out, add } = loopBuffer(sampleRate);
  addHarmony(add);
  addLead(add, sampleRate);
  addDrums(add, random, sampleRate);
  const smooth = lowPass(Array.from(out), SMOOTH_CUTOFF_HZ, sampleRate);
  return normalise(smooth, PEAK);
}
