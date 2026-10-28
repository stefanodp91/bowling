import { Constants } from '@babylonjs/core/Engines/constants';
import { RawCubeTexture } from '@babylonjs/core/Materials/Textures/rawCubeTexture';
import type { Scene } from '@babylonjs/core/scene';
import { alleyRadiance } from './alley-radiance';

/** Edge of each cube face, texels: enough for soft reflections, cheap to generate. */
const FACE_SIZE = 64;
const CHANNELS = 4;
const BYTE_MAX = 255;

/** Cube faces in GL order (+x, -x, +y, -y, +z, -z): the direction of texel (u, v) in [-1, 1]. */
const FACES: ReadonlyArray<(u: number, v: number) => readonly [number, number, number]> = [
  (u, v) => [1, -v, -u],
  (u, v) => [-1, -v, u],
  (u, v) => [u, 1, v],
  (u, v) => [u, -1, -v],
  (u, v) => [u, -v, 1],
  (u, v) => [-u, -v, -1],
];

function faceData(direction: (u: number, v: number) => readonly [number, number, number]): Uint8Array {
  const data = new Uint8Array(FACE_SIZE * FACE_SIZE * CHANNELS);
  for (let row = 0; row < FACE_SIZE; row += 1) {
    for (let col = 0; col < FACE_SIZE; col += 1) {
      const u = ((col + 0.5) / FACE_SIZE) * 2 - 1;
      const v = ((row + 0.5) / FACE_SIZE) * 2 - 1;
      const [x, y, z] = direction(u, v);
      const length = Math.hypot(x, y, z);
      const rgb = alleyRadiance(x / length, y / length, z / length);
      const offset = (row * FACE_SIZE + col) * CHANNELS;
      data[offset] = Math.round(rgb[0] * BYTE_MAX);
      data[offset + 1] = Math.round(rgb[1] * BYTE_MAX);
      data[offset + 2] = Math.round(rgb[2] * BYTE_MAX);
      data[offset + 3] = BYTE_MAX;
    }
  }
  return data;
}

/**
 * Sets the scene's environment (reflections and image-based light of every PBR material) to the
 * generated alley. Shared by the catalogue and the game, so a model looks the same in both.
 * Returns the texture so the caller can dispose it.
 */
export function applyAlleyEnvironment(scene: Scene): RawCubeTexture {
  const texture = new RawCubeTexture(
    scene,
    FACES.map(faceData),
    FACE_SIZE,
    Constants.TEXTUREFORMAT_RGBA,
    Constants.TEXTURETYPE_UNSIGNED_BYTE,
    true,
  );
  scene.environmentTexture = texture;
  return texture;
}
