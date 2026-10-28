import type { Meta, StoryObj } from '@storybook/react-vite';
import { ALLEY_HALF_WIDTH_M, CEILING_HEIGHT_M, createAlleyEndWall, type AlleyEndWallOptions } from '@models';
import { ModelStage, type ModelStageProps } from '../stage/ModelStage';

/** Seen from the lanes, square on, as the bowler sees it at the end of a run. */
const FROM_THE_LANES = { alpha: -Math.PI / 2, beta: Math.PI / 2 - 0.05, distanceM: 2.2 * ALLEY_HALF_WIDTH_M };

/**
 * The end wall of the room (wiki/models/lane.md, rule 6): the pinsetter openings and the masking
 * unit painted in the room's theme. One story per theme, each the room of one track.
 */
const meta = {
  title: 'Models/Alley End Wall',
  component: ModelStage<AlleyEndWallOptions>,
  args: {
    factory: createAlleyEndWall,
    options: { scenery: 'retro' },
    frame: { centre: [0, CEILING_HEIGHT_M / 2, 0], radiusM: ALLEY_HALF_WIDTH_M, inside: FROM_THE_LANES },
  },
} satisfies Meta<ModelStageProps<AlleyEndWallOptions>>;

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
