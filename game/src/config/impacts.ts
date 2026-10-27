/** Impact tunables (wiki/game/impacts.md, rule 5). */

/**
 * The obstacles a jump can clear (wiki/models/obstacles/*, «Overcome by»): rental shoes and the
 * sweep bar. Stray pins and a returning ball must be avoided by changing lane, whatever their
 * height; a widening gutter is terrain.
 */
export const JUMPABLE_KINDS: ReadonlySet<string> = new Set(['rental-shoes', 'sweep-bar']);

/** An impact multiplies speed by 1 − 0.25: at 12 m/s the ball drops to 9 m/s (rule 2). */
export const IMPACT_SPEED_LOSS = 0.25;
/** Each impact adds a seeded aim error uniform in ± 0.04 m at the pin deck (rule 2). */
export const IMPACT_AIM_ERROR_M = 0.04;
/**
 * Salt mixed into the track seed for aim-error draws, so they do not repeat the generator's own
 * sequence (any fixed odd number; design).
 */
export const AIM_ERROR_SALT = 0x9e3779b1;
import { BALL_MASS_KG } from '@models/measures/ball';
import { PROP_MASS_SCALE } from '@models/measures/scale';

/** Mass given to a knocked obstacle's body, kg (design: light enough to fly; for show only), × PROP_MASS_SCALE like the ball. */
export const KNOCKED_MASS_KG = 2 * PROP_MASS_SCALE;
/**
 * The knock-away for show (rule 4): a head-on elastic hit sends a light body off at
 * 2M / (M + m) times the ball's speed (≈ 1.57 for 7.26 kg against 2 kg, at any scale), so it flies ahead of the
 * ball instead of being overtaken. Impulse per m/s of ball speed = m · that ratio.
 */
export const KNOCK_IMPULSE_PER_MPS = KNOCKED_MASS_KG * ((2 * BALL_MASS_KG) / (BALL_MASS_KG + KNOCKED_MASS_KG));
/** Share of the impulse sent upwards, so the obstacle visibly leaves the lane (design). */
export const KNOCK_UPWARD_SHARE = 0.6;
/** How long a knocked-away obstacle stays in the scene before it is removed, seconds (design). */
export const KNOCKED_LIFETIME_S = 3;
