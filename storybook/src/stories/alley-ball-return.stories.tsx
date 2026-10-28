import type { Meta, StoryObj } from '@storybook/react-vite';
import { createBallReturn, type BallReturnOptions } from '@models';
import { ModelStage, type ModelStageProps } from '../stage/ModelStage';

/** The ball return at the start of the lanes (wiki/models/lane.md, rule 6), in each room's colours. */
const meta = {
  title: 'Models/Alley Ball Return',
  component: ModelStage<BallReturnOptions>,
  args: { factory: createBallReturn, options: { scenery: 'retro' } },
} satisfies Meta<ModelStageProps<BallReturnOptions>>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Retro, the room of lane-01. */
export const Default: Story = {};
/** Neon, lane-02. */
export const Neon: Story = { args: { options: { scenery: 'neon' } } };
/** Space, lane-03. */
export const Space: Story = { args: { options: { scenery: 'space' } } };
/** Tropical, lane-04. */
export const Tropical: Story = { args: { options: { scenery: 'tropical' } } };
/** Diner, lane-05. */
export const Diner: Story = { args: { options: { scenery: 'diner' } } };
