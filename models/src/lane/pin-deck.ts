import { SpotLight } from '@babylonjs/core/Lights/spotLight';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { PBRMaterial } from '@babylonjs/core/Materials/PBR/pbrMaterial';
import { CreateDisc } from '@babylonjs/core/Meshes/Builders/discBuilder';
import { CreateGround } from '@babylonjs/core/Meshes/Builders/groundBuilder';
import { CreatePlane } from '@babylonjs/core/Meshes/Builders/planeBuilder';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import type { Scene } from '@babylonjs/core/scene';
import { perScene } from '../materials/scene-cache';
import { BOARDS_SURFACE_WIDTH_M, GUTTER_DEPTH_M, GUTTER_WIDTH_M, PLAYING_SURFACE_WIDTH_M } from '../measures/lane';
import { gutterMaterial } from './lane-materials';
import { createTroughMesh } from './trough-geometry';
import { PIN_ROW_DEPTH_M, PIN_SPOT_DIAMETER_M, pinSpots } from '../measures/pins';
import type { ModelFactory, ModelHandle } from '../model-handle';

/**
 * The pin deck (wiki/models/lane.md, rule 3): a deck plate across the three travel lanes, the ten
 * spots at the end of the centre one, the gutters running on to the pit, a dark masking wall, under
 * a soft spotlight. Root at the head pin spot.
 */

/** The deck starts 0.3 m before the head pin and ends 0.3 m past the back row (design margins). */
const DECK_FRONT_M = 0.3;
const DECK_BACK_MARGIN_M = 0.3;
const DECK_LENGTH_M = DECK_FRONT_M + 3 * PIN_ROW_DEPTH_M + DECK_BACK_MARGIN_M;
/** The deck is a light synthetic plate, a hair above the lane boards to avoid z-fighting. */
const DECK_LIFT_M = 0.0015;
const SPOT_LIFT_M = 0.002;
const DECK_HEX = '#E9E4D8';
const DECK_ROUGHNESS = 0.3;
const SPOT_HEX = '#2B1A12';
/** Pit behind the deck, and the masking wall at its back. */
const PIT_DEPTH_M = 0.8;
const PIT_DROP_M = 0.25;
const WALL_HEIGHT_M = 1.6;
const WALL_MARGIN_M = 0.4;
const DARK_HEX = '#08080B';
/** The spotlight: above and in front of the deck, aimed at its centre, soft-edged. */
const SPOT_POSITION = { y: 2.2, z: -1.2 } as const;
const SPOT_ANGLE_RAD = 0.9;
const SPOT_EXPONENT = 2;
const SPOT_INTENSITY = 6;
const SPOT_HEX_LIGHT = '#FFF1DC';
const SPOT_SEGMENTS = 24;

const material = (name: string, hex: string, roughness: number) =>
  perScene((scene: Scene) => {
    const pbr = new PBRMaterial(name, scene);
    pbr.albedoColor = Color3.FromHexString(hex);
    pbr.metallic = 0;
    pbr.roughness = roughness;
    return pbr;
  });

const deckMaterial = material('pin-deck', DECK_HEX, DECK_ROUGHNESS);
const spotMaterial = material('pin-deck-spot', SPOT_HEX, DECK_ROUGHNESS);
const darkMaterial = material('pin-deck-dark', DARK_HEX, 1);

export type PinDeckOptions = Readonly<Record<string, never>>;

export const createPinDeck: ModelFactory<PinDeckOptions> = (scene: Scene): ModelHandle => {
  const root = new TransformNode('pin-deck', scene);
  const deck = CreateGround('pin-deck-plate', { width: BOARDS_SURFACE_WIDTH_M, height: DECK_LENGTH_M }, scene);
  deck.position.set(0, DECK_LIFT_M, DECK_LENGTH_M / 2 - DECK_FRONT_M);
  deck.material = deckMaterial(scene);

  const spots = Mesh.MergeMeshes(
    pinSpots().map(({ pin, x, z }) => {
      const disc = CreateDisc(`pin-spot-${pin}`, { radius: PIN_SPOT_DIAMETER_M / 2, tessellation: SPOT_SEGMENTS }, scene);
      disc.rotation.x = Math.PI / 2;
      disc.position.set(x, SPOT_LIFT_M, z);
      return disc;
    }),
    true,
  );
  if (spots === null) throw new Error('pin spots could not be merged');
  spots.name = 'pin-deck-spots';
  spots.material = spotMaterial(scene);

  const deckEnd = DECK_LENGTH_M - DECK_FRONT_M;
  const gutters = [-1, 1].map((side) => {
    const gutter = createTroughMesh(`pin-deck-gutter-${side}`, scene, {
      widthM: GUTTER_WIDTH_M,
      depthM: GUTTER_DEPTH_M,
      startZ: -DECK_FRONT_M,
      lengthM: DECK_LENGTH_M,
      centreX: side * (BOARDS_SURFACE_WIDTH_M / 2 + GUTTER_WIDTH_M / 2),
    });
    gutter.material = gutterMaterial(scene);
    return gutter;
  });
  const pit = CreateGround('pin-deck-pit', { width: PLAYING_SURFACE_WIDTH_M + WALL_MARGIN_M, height: PIT_DEPTH_M }, scene);
  pit.position.set(0, -PIT_DROP_M, deckEnd + PIT_DEPTH_M / 2);
  pit.material = darkMaterial(scene);
  const wall = CreatePlane('pin-deck-wall', { width: PLAYING_SURFACE_WIDTH_M + WALL_MARGIN_M, height: WALL_HEIGHT_M }, scene);
  wall.position.set(0, WALL_HEIGHT_M / 2 - PIT_DROP_M, deckEnd + PIT_DEPTH_M);
  wall.material = darkMaterial(scene);

  const light = new SpotLight(
    'pin-deck-spotlight',
    new Vector3(0, SPOT_POSITION.y, SPOT_POSITION.z),
    new Vector3(0, -SPOT_POSITION.y, deckEnd / 2 - SPOT_POSITION.z).normalize(),
    SPOT_ANGLE_RAD,
    SPOT_EXPONENT,
    scene,
  );
  light.intensity = SPOT_INTENSITY;
  light.diffuse = Color3.FromHexString(SPOT_HEX_LIGHT);

  for (const node of [deck, spots, ...gutters, pit, wall, light]) node.parent = root;
  return { root, dispose: () => root.dispose(false, false) };
};
