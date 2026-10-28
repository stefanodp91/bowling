import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import type { Scene } from '@babylonjs/core/scene';
import type { ModelHandle } from '@models';
import { KNOCK_IMPULSE_PER_MPS, KNOCK_UPWARD_SHARE, KNOCKED_LIFETIME_S, KNOCKED_MASS_KG } from '../../config/impacts';
import type { PlacedBox } from '../../domain/impacts/footprints';
import { createBoxBody } from '../physics/box-body';

/** The impulse hits the box this far above its centre, so it tumbles as well as flies. */
const IMPULSE_LIFT_FRACTION = 0.4;

/** An obstacle flying off after an impact; removed once its lifetime is over. */
export interface Knocked {
  readonly remainingS: number;
  dispose(): void;
}

/**
 * Knocks a hit obstacle away (wiki/game/impacts.md, rule 4): its model rides a mesh-less box body
 * the size of its footprint, pushed along the ball's direction and up in proportion to the ball's
 * speed. For show only: the run never reads it back.
 */
export function knockAway(scene: Scene, model: ModelHandle, box: PlacedBox, ballSpeedMps: number): Knocked {
  const height = Math.max(box.heightM, box.halfDepthM);
  const origin = model.root.getAbsolutePosition();
  const proxy = createBoxBody(scene, {
    name: 'knocked-proxy',
    size: [2 * box.halfWidthM, height, 2 * box.halfDepthM],
    position: [origin.x, height / 2, origin.z],
    massKg: KNOCKED_MASS_KG,
  });
  proxy.node.computeWorldMatrix(true);
  model.root.setParent(proxy.node);
  const strength = ballSpeedMps * KNOCK_IMPULSE_PER_MPS;
  const impulse = new Vector3(0, strength * KNOCK_UPWARD_SHARE, strength);
  proxy.body.applyImpulse(impulse, proxy.node.position.add(new Vector3(0, box.heightM * IMPULSE_LIFT_FRACTION, 0)));
  return {
    remainingS: KNOCKED_LIFETIME_S,
    dispose: () => {
      model.dispose();
      proxy.dispose();
    },
  };
}
