import type { Meta, StoryObj } from '@storybook/react-vite';
import { createSweepBar, type SweepBarOptions } from '@models';
import { ModelStage, type ModelStageProps } from '../stage/ModelStage';

const meta = {
  title: 'Models/Obstacle Sweep Bar',
  component: ModelStage<SweepBarOptions>,
  args: { factory: createSweepBar, options: { swingPeriodS: 2.4 } },
} satisfies Meta<ModelStageProps<SweepBarOptions>>;

export default meta;

export const Default: StoryObj<typeof meta> = {};
