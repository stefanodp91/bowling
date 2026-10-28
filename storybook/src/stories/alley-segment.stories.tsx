import type { Meta, StoryObj } from '@storybook/react-vite';
import { ALLEY_HALF_WIDTH_M, createAlleySegment, SEGMENT_LENGTH_M, type AlleySegmentOptions } from '@models';
import { ModelStage, type ModelStageProps } from '../stage/ModelStage';

/** The bowler's eye height in the room, metres (design: about where the game's camera rides). */
const EYE_HEIGHT_M = 1.6;
/** Looking straight down the lanes, a touch downwards, from the near end of the segment. */
const DOWN_THE_LANES = { alpha: -Math.PI / 2, beta: Math.PI / 2 - 0.08, distanceM: SEGMENT_LENGTH_M };

/**
 * One segment of the room around the lane (wiki/models/lane.md, rule 6), seen from inside, down the
 * lanes, so the walls and their pattern show: one story per theme, each the room of one track.
 */
const meta = {
  title: 'Models/Alley Segment',
  component: ModelStage<AlleySegmentOptions>,
  args: {
    factory: createAlleySegment,
    options: { scenery: 'retro' },
    frame: { centre: [0, EYE_HEIGHT_M, SEGMENT_LENGTH_M], radiusM: Math.max(ALLEY_HALF_WIDTH_M, SEGMENT_LENGTH_M / 2), inside: DOWN_THE_LANES },
  },
} satisfies Meta<ModelStageProps<AlleySegmentOptions>>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Retro, the room of lane-01: teal and cream walls with coloured discs. */
export const Default: Story = {};
/** Neon, lane-02: a dark room with pink and cyan zigzags. */
export const Neon: Story = { args: { options: { scenery: 'neon' } } };
/** Space, lane-03: night blue walls with planets and stars. */
export const Space: Story = { args: { options: { scenery: 'space' } } };
/** Tropical, lane-04: green and coral, with sea waves. */
export const Tropical: Story = { args: { options: { scenery: 'tropical' } } };
/** Diner, lane-05: red, cream and a black and white checkerboard. */
export const Diner: Story = { args: { options: { scenery: 'diner' } } };
