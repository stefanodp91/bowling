import type { Meta, StoryObj } from '@storybook/react-vite';
import type { WideningGutterOptions } from '@models';
import { createWideningGutterScene } from '../scenes/widening-gutter-scene';
import { ModelStage, type ModelStageProps } from '../stage/ModelStage';

/** Length 18 m, centre lane (wiki/models/obstacles/widening-gutter.md, criterion 1). */
const meta = {
  title: 'Models/Obstacle Widening Gutter',
  component: ModelStage<WideningGutterOptions>,
  args: { factory: createWideningGutterScene, options: { lengthM: 18, lane: 1 }, frame: { centre: [0, 0, 6], radiusM: 3 } },
} satisfies Meta<ModelStageProps<WideningGutterOptions>>;

export default meta;

export const Default: StoryObj<typeof meta> = {};
