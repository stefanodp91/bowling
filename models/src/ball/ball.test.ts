import { VertexBuffer } from '@babylonjs/core/Buffers/buffer';
import { NullEngine } from '@babylonjs/core/Engines/nullEngine';
import type { AbstractMesh } from '@babylonjs/core/Meshes/abstractMesh';
import { Scene } from '@babylonjs/core/scene';
import { describe, expect, it } from 'vitest';
import { BALL_DIAMETER_M, BALL_RADIUS_M, FINGER_HOLES } from '../measures/ball';
import { createBall } from './ball';

const MM = 0.001;

function ballMesh(variant: 'player' | 'house'): { mesh: AbstractMesh; scene: Scene } {
  const scene = new Scene(new NullEngine());
  const handle = createBall(scene, { variant });
  const mesh = handle.root.getChildMeshes()[0];
  if (mesh === undefined) throw new Error('ball has no mesh');
  return { mesh, scene };
}

describe('ball model', () => {
  it.each(['player', 'house'] as const)('%s: bounding box diameter within ±2 mm of the measure', (variant) => {
    const { mesh } = ballMesh(variant);
    const { minimum, maximum } = mesh.getBoundingInfo().boundingBox;
    for (const extent of [maximum.x - minimum.x, maximum.y - minimum.y, maximum.z - minimum.z]) {
      expect(Math.abs(extent - BALL_DIAMETER_M)).toBeLessThanOrEqual(2 * MM);
    }
  });

  it('finger holes are geometry: at least three separate concave recesses', () => {
    const { mesh } = ballMesh('player');
    const positions = mesh.getVerticesData(VertexBuffer.PositionKind) ?? [];
    const recessed: Array<[number, number, number]> = [];
    for (let i = 0; i < positions.length; i += 3) {
      const p: [number, number, number] = [positions[i] ?? 0, positions[i + 1] ?? 0, positions[i + 2] ?? 0];
      if (Math.hypot(...p) < BALL_RADIUS_M - 2 * MM) recessed.push(p);
    }
    // Group recessed vertices: two belong to the same recess when within a finger-hole diameter.
    const minGapM = Math.min(...FINGER_HOLES.map((h) => h.diameterM));
    const groups: Array<[number, number, number]> = [];
    for (const p of recessed) {
      if (!groups.some((g) => Math.hypot(g[0] - p[0], g[1] - p[1], g[2] - p[2]) < minGapM)) groups.push(p);
    }
    expect(groups.length).toBeGreaterThanOrEqual(3);
  });

  it('the root sits on the ground: lowest point at y = 0', () => {
    const scene = new Scene(new NullEngine());
    const handle = createBall(scene, { variant: 'player' });
    expect(handle.root.getHierarchyBoundingVectors().min.y).toBeCloseTo(0, 3);
  });
});
