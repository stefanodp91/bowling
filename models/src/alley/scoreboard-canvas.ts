import type { ICanvasRenderingContext } from '@babylonjs/core/Engines/ICanvas';
import { PIN_ROWS, type PinNumber } from '../measures/pins';
import type { ScoreboardContent } from './scoreboard-layout';
import type { SceneryTheme } from './scenery-themes';

/** Shares of the screen's height for each part of the drawing (design). */
const ACCENT_SHARE = 0.06;
const MARGIN_SHARE = 0.08;
const TITLE_SHARE = 0.13;
const LINE_SHARE = 0.09;
/** Lines of small text are this many times their own height apart. */
const LINE_SPACING = 1.3;
const SCORE_SHARE = 0.34;
const LANE_NUMBER_SHARE = 0.42;
/** The pin triangle takes the right part of the screen; dots are this share of a pin spacing. */
const TRIANGLE_WIDTH_SHARE = 0.34;
const DOT_SHARE = 0.36;
const SCREEN_HEX = '#07070C';
const TEXT_HEX = '#F5F2EA';
const PIN_DOWN_HEX = '#3A3A44';
const FONT = 'system-ui, sans-serif';
/** Babylon's canvas context has no textBaseline: text sits on its baseline, about 0.8 of the size below its top. */
const ASCENT_SHARE = 0.8;
const BOLD = '700';
const HEAVY = '900';

export interface CanvasSize {
  readonly width: number;
  readonly height: number;
}

function textOnBaseline(ctx: ICanvasRenderingContext, text: string, x: number, baseline: number, sizePx: number, weight: string, colour: string): void {
  ctx.font = `${weight} ${Math.round(sizePx)}px ${FONT}`;
  ctx.fillStyle = colour;
  ctx.fillText(text, x, baseline);
}

/** Text whose top is at `top`. */
function textFromTop(ctx: ICanvasRenderingContext, text: string, x: number, top: number, sizePx: number, weight: string, colour: string): void {
  textOnBaseline(ctx, text, x, top + sizePx * ASCENT_SHARE, sizePx, weight, colour);
}

function background(ctx: ICanvasRenderingContext, { width, height }: CanvasSize, theme: SceneryTheme): void {
  ctx.fillStyle = SCREEN_HEX;
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = theme.surfaces.neon;
  ctx.fillRect(0, 0, width, height * ACCENT_SHARE);
}

/**
 * The ten pins as a scoreboard draws them, back row on top as the bowler sees them: standing
 * solid in the theme's colour, down dark. `down` null: all standing.
 */
function pinTriangle(ctx: ICanvasRenderingContext, { width, height }: CanvasSize, theme: SceneryTheme, down: readonly PinNumber[] | null): void {
  const areaWidth = width * TRIANGLE_WIDTH_SHARE;
  const spacing = Math.min(areaWidth / PIN_ROWS.length, (height * (1 - 2 * MARGIN_SHARE - ACCENT_SHARE)) / PIN_ROWS.length);
  const centreX = width - width * MARGIN_SHARE - areaWidth / 2;
  const bottom = height * (1 - MARGIN_SHARE) - spacing / 2;
  PIN_ROWS.forEach((row, r) => {
    row.forEach((pin, i) => {
      const x = centreX + (i - (row.length - 1) / 2) * spacing;
      const y = bottom - r * spacing;
      ctx.fillStyle = down?.includes(pin) === true ? PIN_DOWN_HEX : theme.surfaces.stripe;
      ctx.beginPath();
      ctx.arc(x, y, spacing * DOT_SHARE, 0, 2 * Math.PI);
      ctx.fill();
    });
  });
}

/** The live screen: who plays where, impacts, the big score, and the pins. */
export function drawLiveScreen(ctx: ICanvasRenderingContext, size: CanvasSize, theme: SceneryTheme, content: ScoreboardContent): void {
  const { height } = size;
  background(ctx, size, theme);
  const left = height * MARGIN_SHARE;
  let y = height * (ACCENT_SHARE + MARGIN_SHARE);
  textFromTop(ctx, content.title, left, y, height * TITLE_SHARE, HEAVY, TEXT_HEX);
  y += height * TITLE_SHARE * LINE_SPACING;
  textFromTop(ctx, content.subtitle, left, y, height * LINE_SHARE, BOLD, theme.surfaces.stripe);
  y += height * LINE_SHARE * LINE_SPACING;
  textFromTop(ctx, content.detail, left, y, height * LINE_SHARE, BOLD, TEXT_HEX);
  textOnBaseline(ctx, content.score, left, height * (1 - MARGIN_SHARE), height * SCORE_SHARE, HEAVY, theme.surfaces.neon);
  pinTriangle(ctx, size, theme, content.pinsDown);
}

/** A neighbour's screen, waiting for players: its lane number and a full rack of pins. */
export function drawWaitingScreen(ctx: ICanvasRenderingContext, size: CanvasSize, theme: SceneryTheme, laneNumber: number): void {
  const { height } = size;
  background(ctx, size, theme);
  textOnBaseline(ctx, String(laneNumber), height * MARGIN_SHARE, height * (1 - MARGIN_SHARE), height * LANE_NUMBER_SHARE, HEAVY, TEXT_HEX);
  pinTriangle(ctx, size, theme, null);
}
