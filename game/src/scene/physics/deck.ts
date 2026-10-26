import { Quaternion, Vector3 } from '@babylonjs/core/Maths/math.vector';
import type { Mesh } from '@babylonjs/core/Meshes/mesh';
import type { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import { PhysicsMotionType } from '@babylonjs/core/Physics/v2/IPhysicsEnginePlugin';
import { PhysicsBody } from '@babylonjs/core/Physics/v2/physicsBody';
import { PhysicsShapeConvexHull, PhysicsShapeSphere } from '@babylonjs/core/Physics/v2/physicsShape';
import type { Scene } from '@babylonjs/core/scene';
import { BALL_MASS_KG, BALL_RADIUS_M } from '@models/measures/ball';
import { LANE_LENGTH_M } from '@models/measures/lane';
import { PIN_MASS_KG, type PinNumber } from '@models/measures/pins';
import type { DeckPort } from '../../app/deck-port';
import { BALL_SURFACE, PIN_CENTRE_OF_MASS_M, PIN_SURFACE } from '../../config/physics';
import { DECK_HANDOFF_Z } from '../../config/run';
import type { PinPose } from '../../domain/scoring/knocked-down';

export interface DeckNodes {
  /** The ball's root (origin at its contact point); physics moves it after the hand-over. */
  readonly ball: TransformNode;
  /** Each pin's root, standing on its spot. */
  readonly pins: ReadonlyMap<PinNumber, TransformNode>;
  /** The pin mesh the collider is derived from (its vertices, relative to a pin root). */
  readonly pinMesh: Mesh;
}

export interface Deck extends DeckPort {
  dispose(): void;
}

/**
 * The pin deck in Havok (wiki/game/pins.md, rules 1–3). Pins are dynamic bodies with one shared
 * convex-hull collider made from the pin's own lathe mesh: a hull fills the neck, which never
 * touches the ball or another pin's belly, and it is one cheap shape where a compound of
 * cylinders would need tuning per segment (rule 2's choice; see Rounds). The ball becomes a
 * dynamic sphere at the hand-over.
 */
export function createDeck(scene: Scene, nodes: DeckNodes): Deck {
  const pinShape = new PhysicsShapeConvexHull(nodes.pinMesh, scene);
  pinShape.material = { friction: PIN_SURFACE.friction, restitution: PIN_SURFACE.restitution };
  const pinBodies = new Map<PinNumber, PhysicsBody>();
  for (const [pin, root] of nodes.pins) {
    root.rotationQuaternion ??= Quaternion.Identity();
    root.computeWorldMatrix(true);
    // Awake from the start: a body created asleep stayed immovable when the ball hit it.
    const body = new PhysicsBody(root, PhysicsMotionType.DYNAMIC, false, scene);
    body.shape = pinShape;
    body.setMassProperties({ mass: PIN_MASS_KG, centerOfMass: new Vector3(0, PIN_CENTRE_OF_MASS_M, 0) });
    pinBodies.set(pin, body);
  }
  const pinBodySet = new Set<PhysicsBody>(pinBodies.values());
  let ballBody: PhysicsBody | null = null;
  let ballShape: PhysicsShapeSphere | null = null;
  let contacted = false;

  return {
    handOff: ({ x, speedMps }) => {
      nodes.ball.position.set(x, 0, DECK_HANDOFF_Z);
      nodes.ball.rotationQuaternion ??= Quaternion.Identity();
      nodes.ball.computeWorldMatrix(true);
      ballShape = new PhysicsShapeSphere(new Vector3(0, BALL_RADIUS_M, 0), BALL_RADIUS_M, scene);
      ballShape.material = { friction: BALL_SURFACE.friction, restitution: BALL_SURFACE.restitution };
      ballBody = new PhysicsBody(nodes.ball, PhysicsMotionType.DYNAMIC, false, scene);
      ballBody.shape = ballShape;
      ballBody.setMassProperties({ mass: BALL_MASS_KG });
      ballBody.setLinearVelocity(new Vector3(0, 0, speedMps));
      // Rolling without slipping along +z: ω = v / r about +x.
      ballBody.setAngularVelocity(new Vector3(speedMps / BALL_RADIUS_M, 0, 0));
      ballBody.setCollisionCallbackEnabled(true);
      ballBody.getCollisionObservable().add((event) => {
        if (pinBodySet.has(event.collidedAgainst)) contacted = true;
      });
    },
    contacted: () => contacted,
    pinPoses: () => {
      const poses = new Map<PinNumber, PinPose>();
      for (const [pin, root] of nodes.pins) {
        // Physics writes position and rotation; the cached world matrix is stale until recomputed.
        root.computeWorldMatrix(true);
        const at = root.getAbsolutePosition();
        const up = root.getDirection(Vector3.Up());
        poses.set(pin, { x: at.x, z: at.z - LANE_LENGTH_M, up: [up.x, up.y, up.z] });
      }
      return poses;
    },
    dispose: () => {
      ballBody?.dispose();
      ballShape?.dispose();
      for (const body of pinBodies.values()) body.dispose();
      pinShape.dispose();
    },
  };
}
