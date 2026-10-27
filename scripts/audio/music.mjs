// The background music (wiki/audio/sounds.md, rule 6): a warm, slow bowling-alley groove written
// as numbers — a I–vi–IV–V progression in C at 100 BPM, four bars, bass, soft chords and light
// percussion. Every note is written with wrap-around, so the loop has no seam.
import { lowPass, noise, normalise } from './synth.mjs';

const BPM = 100;
const BEATS_PER_BAR = 4;
const BARS = 4;
const SECONDS_PER_BEAT = 60 / BPM;
const SEMITONE = 2 ** (1 / 12);
/** MIDI note 69 is A4 at 440 Hz. */
const midiToHz = (note) => 440 * SEMITONE ** (note - 69);

/** One chord per bar: C, Am, F, G — root (bass, MIDI) and the triad played as a pad. */
const PROGRESSION = [
  { bass: 36, chord: [60, 64, 67] },
  { bass: 33, chord: [57, 60, 64] },
  { bass: 29, chord: [57, 60, 65] },
  { bass: 31, chord: [55, 59, 62] },
];
/** Bass plays on beats 1 and 3, with a passing note an octave up on the «and» of 4. */
const BASS_HITS = [{ beat: 0, octave: 0 }, { beat: 2, octave: 0 }, { beat: 3.5, octave: 12 }];
const BASS = { decayS: 0.35, share: 0.55, cutoffHz: 500 };
const PAD = { share: 0.16, attackS: 0.25, cutoffHz: 1400, detune: 1.004 };
const KICK = { startHz: 110, endHz: 45, decayS: 0.12, share: 0.7 };
const SNARE = { decayS: 0.09, cutoffHz: 3200, share: 0.22 };
const HAT = { decayS: 0.025, cutoffHz: 7000, share: 0.08 };
const PEAK = 0.75;

export function musicLoop(random, sampleRate) {
  const length = Math.round(BARS * BEATS_PER_BAR * SECONDS_PER_BEAT * sampleRate);
  const out = new Float64Array(length);
  const add = (startS, durationS, voice) => {
    const start = Math.round(startS * sampleRate);
    const n = Math.round(durationS * sampleRate);
    for (let i = 0; i < n; i += 1) out[(start + i) % length] += voice(i / sampleRate);
  };
  PROGRESSION.forEach(({ bass, chord }, bar) => {
    const barS = bar * BEATS_PER_BAR * SECONDS_PER_BEAT;
    for (const hit of BASS_HITS) {
      const hz = midiToHz(bass + hit.octave);
      add(barS + hit.beat * SECONDS_PER_BEAT, BASS.decayS * 4, (t) => BASS.share * Math.exp(-t / BASS.decayS) * (Math.sin(2 * Math.PI * hz * t) + 0.3 * Math.sin(4 * Math.PI * hz * t)));
    }
    const barLengthS = BEATS_PER_BAR * SECONDS_PER_BEAT;
    for (const note of chord) {
      const hz = midiToHz(note);
      add(barS, barLengthS, (t) => {
        const env = Math.min(1, t / PAD.attackS) * Math.min(1, (barLengthS - t) / PAD.attackS);
        return PAD.share * env * (Math.sin(2 * Math.PI * hz * t) + Math.sin(2 * Math.PI * hz * PAD.detune * t)) / 2;
      });
    }
    for (let beat = 0; beat < BEATS_PER_BAR; beat += 1) {
      const beatS = barS + beat * SECONDS_PER_BEAT;
      if (beat % 2 === 0) {
        let phase = 0;
        add(beatS, KICK.decayS * 4, (t) => {
          phase += (2 * Math.PI * (KICK.endHz + (KICK.startHz - KICK.endHz) * Math.exp(-t / KICK.decayS))) / sampleRate;
          return KICK.share * Math.exp(-t / KICK.decayS) * Math.sin(phase);
        });
      } else {
        const burst = lowPass(noise(random, Math.round(SNARE.decayS * 4 * sampleRate)), SNARE.cutoffHz, sampleRate);
        add(beatS, SNARE.decayS * 4, (t) => SNARE.share * Math.exp(-t / SNARE.decayS) * (burst[Math.round(t * sampleRate)] ?? 0) * 3);
      }
      for (const off of [0, 0.5]) {
        const tick = noise(random, Math.round(HAT.decayS * 4 * sampleRate));
        add(beatS + off * SECONDS_PER_BEAT, HAT.decayS * 4, (t) => HAT.share * Math.exp(-t / HAT.decayS) * (tick[Math.round(t * sampleRate)] ?? 0));
      }
    }
  });
  const smooth = lowPass(Array.from(out), PAD.cutoffHz * 4, sampleRate);
  return normalise(smooth, PEAK);
}
