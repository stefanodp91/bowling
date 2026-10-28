import type { Meta, StoryObj } from '@storybook/react-vite';
import { createPin, type PinOptions } from '@models';
import { ModelStage, type ModelStageProps } from '../stage/ModelStage';

const meta = {
  title: 'Models/Pin',
  component: ModelStage<PinOptions>,
  args: { factory: createPin, options: {} },
} satisfies Meta<ModelStageProps<PinOptions>>;

export default meta;

export const Default: StoryObj<typeof meta> = {};
