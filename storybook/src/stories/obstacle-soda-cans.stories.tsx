import type { Meta, StoryObj } from '@storybook/react-vite';
import { createSodaCans, type SodaCansOptions } from '@models';
import { ModelStage, type ModelStageProps } from '../stage/ModelStage';

const meta = {
  title: 'Models/Obstacle Soda Cans',
  component: ModelStage<SodaCansOptions>,
  args: { factory: createSodaCans, options: { seed: 1 } },
} satisfies Meta<ModelStageProps<SodaCansOptions>>;

export default meta;

export const Default: StoryObj<typeof meta> = {};
