import { Quaternion, Vector3 } from '@babylonjs/core/Maths/math.vector';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import { PhysicsMotionType } from '@babylonjs/core/Physics/v2/IPhysicsEnginePlugin';
import { PhysicsBody } from '@babylonjs/core/Physics/v2/physicsBody';
import { PhysicsShapeBox } from '@babylonjs/core/Physics/v2/physicsShape';
import type { Scene } from '@babylonjs/core/scene';

/** A box body on a bare TransformNode: physics needs no mesh, so nothing is drawn (or needs a material). */
export interface BoxBody {
  readonly node: TransformNode;
  readonly body: PhysicsBody;
  dispose(): void;
}

export interface BoxBodyOptions {
  readonly name: string;
  readonly size: readonly [number, number, number];
  readonly position: readonly [number, number, number];
  /** kg; 0 makes the body static. */
  readonly massKg: number;
}

export function createBoxBody(scene: Scene, { name, size, position, massKg }: BoxBodyOptions): BoxBody {
  const node = new TransformNode(name, scene);
  node.position.set(...position);
  node.rotationQuaternion = Quaternion.Identity();
  const body = new PhysicsBody(node, massKg > 0 ? PhysicsMotionType.DYNAMIC : PhysicsMotionType.STATIC, false, scene);
  const shape = new PhysicsShapeBox(Vector3.Zero(), Quaternion.Identity(), new Vector3(...size), scene);
  body.shape = shape;
  if (massKg > 0) body.setMassProperties({ mass: massKg });
  return {
    node,
    body,
    dispose: () => {
      body.dispose();
      shape.dispose();
      node.dispose();
    },
  };
}
