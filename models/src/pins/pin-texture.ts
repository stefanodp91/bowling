import { Constants } from '@babylonjs/core/Engines/constants';
import { RawTexture } from '@babylonjs/core/Materials/Textures/rawTexture';
import type { Scene } from '@babylonjs/core/scene';
import { PIN_HEIGHT_IN } from '../measures/pins';

/**
 * The pin's printed coat (wiki/models/pins.md, rule 3): glossy white, two red neck stripes and a
 * small crown of this project's own design. u goes around the pin (0.75 faces -z), v is height /
 * pin height.
 */
const WIDTH = 512;
const HEIGHT = 512;
const CHANNELS = 4;

type Rgb = readonly [number, number, number];
const WHITE: Rgb = [246, 245, 240];
const RED: Rgb = [196, 22, 28];

/** Neck stripes: centre heights and width, inches (photos of regulation pins). */
const STRIPE_CENTRES_IN = [9.55, 10.75] as const;
const STRIPE_WIDTH_IN = 0.32;

/** The crown: centre (u, height in inches) and size (u span, height in inches). */
const CROWN = { u: 0.75, hIn: 7.4, uSpan: 0.075, heightIn: 0.75 } as const;
/** Crown geometry in its own unit square: a band, three points, a ball on each point. */
const BAND_TOP = 0.32;
const POINTS = [0.15, 0.5, 0.85] as const;
const POINT_HALF_WIDTH = 0.17;
const BALL_RADIUS = 0.08;

function inCrown(x: number, y: number): boolean {
  if (x < 0 || x > 1 || y < 0 || y > 1) return false;
  if (y <= BAND_TOP) return true;
  const pointTop = 1 - BALL_RADIUS * 2;
  for (const px of POINTS) {
    const halfWidthAtY = POINT_HALF_WIDTH * (1 - (y - BAND_TOP) / (pointTop - BAND_TOP));
    if (y <= pointTop && Math.abs(x - px) <= halfWidthAtY) return true;
    if (Math.hypot(x - px, y - (1 - BALL_RADIUS)) <= BALL_RADIUS) return true;
  }
  return false;
}

export function pinCoatData(): Uint8Array {
  const data = new Uint8Array(WIDTH * HEIGHT * CHANNELS);
  for (let row = 0; row < HEIGHT; row += 1) {
    const hIn = ((row + 0.5) / HEIGHT) * PIN_HEIGHT_IN;
    const isStripe = STRIPE_CENTRES_IN.some((c) => Math.abs(hIn - c) <= STRIPE_WIDTH_IN / 2);
    for (let col = 0; col < WIDTH; col += 1) {
      const u = (col + 0.5) / WIDTH;
      const crownX = (u - CROWN.u) / CROWN.uSpan + 0.5;
      const crownY = (hIn - CROWN.hIn) / CROWN.heightIn + 0.5;
      const [r, g, b] = isStripe || inCrown(crownX, crownY) ? RED : WHITE;
      data.set([r, g, b, 255], (row * WIDTH + col) * CHANNELS);
    }
  }
  return data;
}

export function createPinCoatTexture(scene: Scene): RawTexture {
  const texture = RawTexture.CreateRGBATexture(pinCoatData(), WIDTH, HEIGHT, scene, true, false, Constants.TEXTURE_TRILINEAR_SAMPLINGMODE);
  texture.name = 'pin-coat';
  return texture;
}
