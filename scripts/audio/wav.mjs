// Minimal WAV encoding: 16-bit PCM, mono. The bytes depend only on the samples, so a regenerated
// file is byte-identical to the committed one.
const BITS_PER_SAMPLE = 16;
const BYTES_PER_SAMPLE = BITS_PER_SAMPLE / 8;
const HEADER_BYTES = 44;
const PCM_FORMAT = 1;
const MONO = 1;
const FMT_CHUNK_BYTES = 16;
const INT16_MAX = 32767;

export function encodeWav(samples, sampleRate) {
  const dataBytes = samples.length * BYTES_PER_SAMPLE;
  const buffer = Buffer.alloc(HEADER_BYTES + dataBytes);
  buffer.write('RIFF', 0, 'ascii');
  buffer.writeUInt32LE(HEADER_BYTES - 8 + dataBytes, 4);
  buffer.write('WAVE', 8, 'ascii');
  buffer.write('fmt ', 12, 'ascii');
  buffer.writeUInt32LE(FMT_CHUNK_BYTES, 16);
  buffer.writeUInt16LE(PCM_FORMAT, 20);
  buffer.writeUInt16LE(MONO, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * BYTES_PER_SAMPLE, 28);
  buffer.writeUInt16LE(BYTES_PER_SAMPLE, 32);
  buffer.writeUInt16LE(BITS_PER_SAMPLE, 34);
  buffer.write('data', 36, 'ascii');
  buffer.writeUInt32LE(dataBytes, 40);
  samples.forEach((s, i) => buffer.writeInt16LE(Math.round(Math.max(-1, Math.min(1, s)) * INT16_MAX), HEADER_BYTES + i * BYTES_PER_SAMPLE));
  return buffer;
}
