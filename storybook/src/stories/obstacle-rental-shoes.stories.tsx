import type { Meta, StoryObj } from '@storybook/react-vite';
import { createRentalShoes, type RentalShoesOptions } from '@models';
import { ModelStage, type ModelStageProps } from '../stage/ModelStage';

const meta = {
  title: 'Models/Obstacle Rental Shoes',
  component: ModelStage<RentalShoesOptions>,
  args: { factory: createRentalShoes, options: {} },
} satisfies Meta<ModelStageProps<RentalShoesOptions>>;

export default meta;

export const Default: StoryObj<typeof meta> = {};
