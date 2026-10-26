import { VertexBuffer } from '@babylonjs/core/Buffers/buffer';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { PBRMaterial } from '@babylonjs/core/Materials/PBR/pbrMaterial';
import { CreateLathe } from '@babylonjs/core/Meshes/Builders/latheBuilder';
// Side effect: Mesh.createInstance lives in this module (Babylon tree-shaking, AGENTS.md traps).
import '@babylonjs/core/Meshes/instancedMesh';
import type { Mesh } from '@babylonjs/core/Meshes/mesh';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import type { Scene } from '@babylonjs/core/scene';
import { perScene } from '../materials/scene-cache';
import { PIN_HEIGHT_M } from '../measures/pins';
import type { ModelFactory, ModelHandle } from '../model-handle';
import { lathePath } from './pin-profile';
import { createPinCoatTexture } from './pin-texture';

/** Segments around the pin: round at close-up in slow motion. */
const LATHE_TESSELLATION = 48;
/** A pin's coating is a hard, glossy lacquer over plastic. */
const COAT_ROUGHNESS = 0.18;
/** Shifts the texture round the pin so the crown (u = 0.75) faces -z, towards the foul line. */
const U_OFFSET = 0;

const coatMaterial = perScene((scene: Scene) => {
  const material = new PBRMaterial('pin-coat', scene);
  material.albedoTexture = createPinCoatTexture(scene);
  material.albedoColor = Color3.White();
  material.metallic = 0;
  material.roughness = COAT_ROUGHNESS;
  material.clearCoat.isEnabled = true;
  return material;
});

/**
 * UVs: v = height / PIN_HEIGHT_M; u from the lathe column (the lathe stores one rotated copy of the
 * profile per column, the last repeating the first), so u runs 0 → 1 round the pin without the
 * jump an angle-based u has at its seam. The texture wraps, so the offset needs no modulo.
 */
function assignUvs(mesh: Mesh, profilePoints: number): void {
  const positions = mesh.getVerticesData(VertexBuffer.PositionKind) ?? [];
  const vertices = positions.length / 3;
  const columns = vertices / profilePoints;
  const uvs: number[] = [];
  for (let i = 0; i < vertices; i += 1) {
    const column = Math.floor(i / profilePoints);
    uvs.push(column / (columns - 1) + U_OFFSET, (positions[i * 3 + 1] ?? 0) / PIN_HEIGHT_M);
  }
  mesh.setVerticesData(VertexBuffer.UVKind, uvs);
}

/** A pin handle also places instances of the same pin (ten on the deck, three per stray group). */
export interface PinHandle extends ModelHandle {
  instantiate(name: string): TransformNode;
}

export type PinOptions = Readonly<Record<string, never>>;

/** One regulation pin, standing on its base at the root (wiki/models/pins.md). */
export const createPin: ModelFactory<PinOptions, PinHandle> = (scene: Scene): PinHandle => {
  const root = new TransformNode('pin', scene);
  const shape = lathePath().map(([r, h]) => new Vector3(r, h, 0));
  const mesh = CreateLathe('pin-body', { shape, tessellation: LATHE_TESSELLATION, closed: true }, scene);
  assignUvs(mesh, shape.length);
  mesh.material = coatMaterial(scene);
  mesh.parent = root;
  return {
    root,
    instantiate: (name) => {
      const instanceRoot = new TransformNode(name, scene);
      mesh.createInstance(`${name}-body`).parent = instanceRoot;
      return instanceRoot;
    },
    dispose: () => root.dispose(false, false),
  };
};
