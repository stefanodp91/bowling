import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import HavokPhysics from '@babylonjs/havok';
import type { HavokInstance } from './havok-loader';

/** Node only (tests, headless scripts): Havok's WASM read from the package and passed as bytes. */
export async function loadHavokInNode(): Promise<HavokInstance> {
  const require = createRequire(import.meta.url);
  const wasmPath = require.resolve('@babylonjs/havok').replace(/HavokPhysics_(umd|es)\.js$/, 'HavokPhysics.wasm');
  const bytes = readFileSync(wasmPath);
  return HavokPhysics({ wasmBinary: bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) });
}
