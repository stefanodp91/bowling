import type { Meta, StoryObj } from '@storybook/react-vite';
import { createWetFloorSign, type WetFloorSignOptions } from '@models';
import { ModelStage, type ModelStageProps } from '../stage/ModelStage';

const meta = {
  title: 'Models/Obstacle Wet Floor Sign',
  component: ModelStage<WetFloorSignOptions>,
  args: { factory: createWetFloorSign, options: {} },
} satisfies Meta<ModelStageProps<WetFloorSignOptions>>;

export default meta;

export const Default: StoryObj<typeof meta> = {};
