import type { Meta, StoryObj } from '@storybook/react-vite';
import { createReturningBall, type ReturningBallOptions } from '@models';
import { ModelStage, type ModelStageProps } from '../stage/ModelStage';

const meta = {
  title: 'Models/Obstacle Returning Ball',
  component: ModelStage<ReturningBallOptions>,
  args: { factory: createReturningBall, options: { speedMps: 3 } },
} satisfies Meta<ModelStageProps<ReturningBallOptions>>;

export default meta;

export const Default: StoryObj<typeof meta> = {};
