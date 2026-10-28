// Small synthesis blocks: noise, one-pole filters, envelopes. Pure functions of their inputs.

/** One-pole low-pass: smooths noise into rumble. `cutoffHz` sets how dull it is. */
export function lowPass(samples, cutoffHz, sampleRate) {
  const a = Math.exp((-2 * Math.PI * cutoffHz) / sampleRate);
  let y = 0;
  return samples.map((x) => (y = (1 - a) * x + a * y));
}

/** One-pole high-pass: removes the DC and the lowest drone from a signal. */
export function highPass(samples, cutoffHz, sampleRate) {
  const low = lowPass(samples, cutoffHz, sampleRate);
  return samples.map((x, i) => x - (low[i] ?? 0));
}

export const noise = (random, length) => Array.from({ length }, () => random() * 2 - 1);

/** Exponential decay envelope with a short linear attack, seconds. */
export function envelope(length, sampleRate, attackS, decayS) {
  return Array.from({ length }, (_, i) => {
    const t = i / sampleRate;
    return t < attackS ? t / attackS : Math.exp(-(t - attackS) / decayS);
  });
}

/** Scales a signal so its loudest sample reaches `peak`. */
export function normalise(samples, peak) {
  // A loop, not Math.max(...): a music-length buffer would overflow the call stack.
  const max = samples.reduce((m, s) => Math.max(m, Math.abs(s)), 0);
  return max === 0 ? samples : samples.map((s) => (s / max) * peak);
}

/** Makes a loop seamless: the last `fade` samples are cross-faded into the first ones. */
export function seamless(samples, fade) {
  const body = samples.slice(0, samples.length - fade);
  for (let i = 0; i < fade; i += 1) {
    const w = i / fade;
    body[i] = (body[i] ?? 0) * w + (samples[samples.length - fade + i] ?? 0) * (1 - w);
  }
  return body;
}
