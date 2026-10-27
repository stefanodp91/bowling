import type { Meta, StoryObj } from '@storybook/react-vite';
import { ALLEY_HALF_WIDTH_M, CEILING_HEIGHT_M, createAlleySegment, SEGMENT_LENGTH_M, type AlleySegmentOptions } from '@models';
import { ModelStage, type ModelStageProps } from '../stage/ModelStage';

/** One segment of the room around the lane (wiki/models/lane.md, rule 6), framed whole. */
const meta = {
  title: 'Models/Alley Segment',
  component: ModelStage<AlleySegmentOptions>,
  args: {
    factory: createAlleySegment,
    options: {},
    frame: { centre: [0, CEILING_HEIGHT_M / 2, SEGMENT_LENGTH_M / 2], radiusM: Math.max(ALLEY_HALF_WIDTH_M, SEGMENT_LENGTH_M / 2) },
  },
} satisfies Meta<ModelStageProps<AlleySegmentOptions>>;

export default meta;

export const Default: StoryObj<typeof meta> = {};
