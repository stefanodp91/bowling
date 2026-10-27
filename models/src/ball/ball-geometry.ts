import { VertexBuffer } from '@babylonjs/core/Buffers/buffer';
import { CreateSphere } from '@babylonjs/core/Meshes/Builders/sphereBuilder';
import type { Mesh } from '@babylonjs/core/Meshes/mesh';
import { VertexData } from '@babylonjs/core/Meshes/mesh.vertexData';
import type { Scene } from '@babylonjs/core/scene';
import { BALL_DIAMETER_M, BALL_RADIUS_M, FINGER_HOLES, holeDirection } from '../measures/ball';
import { PROP_SCALE } from '../measures/scale';

/** Sphere tessellation: ≈ 3.6 mm between vertices at the equator (× PROP_SCALE), fine enough for a hole. */
const SPHERE_SEGMENTS = 96;
/** Width of the rounded rim around each hole, metres (a drilled hole is bevelled; × PROP_SCALE). */
const RIM_M = 0.0025 * PROP_SCALE;
/** Albedo multiplier inside a hole: the shadowed interior reads almost black. */
const HOLE_SHADE = 0.03;
const CHANNELS_RGBA = 4;

const smoothstep = (edge0: number, edge1: number, x: number): number => {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
};

/**
 * How far below the surface the point in direction (x, y, z) lies, as a fraction of the hole's
 * depth (1 = bottom of a hole, 0 = on the surface), and which hole it belongs to.
 */
function holeInfluence(x: number, y: number, z: number): number {
  let deepest = 0;
  for (const hole of FINGER_HOLES) {
    const [hx, hy, hz] = holeDirection(hole);
    const angle = Math.acos(Math.min(1, x * hx + y * hy + z * hz));
    const distanceM = angle * BALL_RADIUS_M;
    const radiusM = hole.diameterM / 2;
    const influence = (1 - smoothstep(radiusM - RIM_M, radiusM, distanceM)) * (hole.depthM / maxDepth());
    deepest = Math.max(deepest, influence);
  }
  return deepest;
}

const maxDepth = (): number => Math.max(...FINGER_HOLES.map((h) => h.depthM));

/**
 * The ball mesh, centred on its own origin: a sphere of the regulation diameter with the three
 * finger holes pushed into it as real recesses, shaded dark by vertex colour.
 */
export function createBallMesh(name: string, scene: Scene): Mesh {
  const mesh = CreateSphere(name, { diameter: BALL_DIAMETER_M, segments: SPHERE_SEGMENTS, updatable: true }, scene);
  const positions = mesh.getVerticesData(VertexBuffer.PositionKind);
  const indices = mesh.getIndices();
  if (positions === null || indices === null) throw new Error('ball sphere has no positions or indices');
  const colors = new Float32Array((positions.length / 3) * CHANNELS_RGBA);
  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i] ?? 0;
    const y = positions[i + 1] ?? 0;
    const z = positions[i + 2] ?? 0;
    const length = Math.hypot(x, y, z);
    const depthFraction = holeInfluence(x / length, y / length, z / length);
    const radius = BALL_RADIUS_M - depthFraction * maxDepth();
    positions[i] = (x / length) * radius;
    positions[i + 1] = (y / length) * radius;
    positions[i + 2] = (z / length) * radius;
    const shade = 1 - (1 - HOLE_SHADE) * Math.min(1, depthFraction * maxDepth() / RIM_M);
    const c = (i / 3) * CHANNELS_RGBA;
    colors[c] = shade;
    colors[c + 1] = shade;
    colors[c + 2] = shade;
    colors[c + 3] = 1;
  }
  const normals: number[] = [];
  VertexData.ComputeNormals(positions, indices, normals);
  mesh.updateVerticesData(VertexBuffer.PositionKind, positions);
  mesh.updateVerticesData(VertexBuffer.NormalKind, normals);
  mesh.setVerticesData(VertexBuffer.ColorKind, colors);
  mesh.refreshBoundingInfo();
  return mesh;
}
