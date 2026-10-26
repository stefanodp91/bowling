import type { Meta, StoryObj } from '@storybook/react-vite';
import { createBall, type BallOptions } from '@models';
import { ModelStage, type ModelStageProps } from '../stage/ModelStage';

const meta = {
  title: 'Models/Ball House',
  component: ModelStage<BallOptions>,
  args: { factory: createBall, options: { variant: 'house' } },
} satisfies Meta<ModelStageProps<BallOptions>>;

export default meta;

export const Default: StoryObj<typeof meta> = {};
