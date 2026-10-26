import type { Meta, StoryObj } from '@storybook/react-vite';
import { createPlaceholder, type PlaceholderOptions } from '@models';
import { ModelStage, type ModelStageProps } from '../stage/ModelStage';

const meta = {
  title: 'Models/Placeholder',
  component: ModelStage<PlaceholderOptions>,
  args: { factory: createPlaceholder, options: {} },
} satisfies Meta<ModelStageProps<PlaceholderOptions>>;

export default meta;

export const Default: StoryObj<typeof meta> = {};
