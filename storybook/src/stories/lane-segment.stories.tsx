import type { Meta, StoryObj } from '@storybook/react-vite';
import { createLaneSegment, type LaneSegmentOptions } from '@models';
import { ModelStage, type ModelStageProps } from '../stage/ModelStage';

/** The first segment, with the foul line, dots and arrows. */
const meta = {
  title: 'Models/Lane Segment',
  component: ModelStage<LaneSegmentOptions>,
  args: { factory: createLaneSegment, options: { foulLineZ: 0 }, frame: { centre: [0, 0, 4], radiusM: 2.6 } },
} satisfies Meta<ModelStageProps<LaneSegmentOptions>>;

export default meta;

export const Default: StoryObj<typeof meta> = {};
