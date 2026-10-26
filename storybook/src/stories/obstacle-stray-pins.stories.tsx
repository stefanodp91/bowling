import type { Meta, StoryObj } from '@storybook/react-vite';
import { createStrayPins, type StrayPinsOptions } from '@models';
import { ModelStage, type ModelStageProps } from '../stage/ModelStage';

const meta = {
  title: 'Models/Obstacle Stray Pins',
  component: ModelStage<StrayPinsOptions>,
  args: { factory: createStrayPins, options: { seed: 1 } },
} satisfies Meta<ModelStageProps<StrayPinsOptions>>;

export default meta;

export const Default: StoryObj<typeof meta> = {};
