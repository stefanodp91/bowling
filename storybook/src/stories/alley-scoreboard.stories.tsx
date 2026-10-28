import type { Meta, StoryObj } from '@storybook/react-vite';
import { ALLEY_HALF_WIDTH_M, createScoreboard, SCOREBOARD_BOTTOM_M, SCOREBOARD_HEIGHT_M, type ScoreboardOptions } from '@models';
import { ModelStage, type ModelStageProps } from '../stage/ModelStage';

/** Seen from the lanes, square on, as the bowler sees it at the end of a run. */
const FROM_THE_LANES = { alpha: -Math.PI / 2, beta: Math.PI / 2 - 0.02, distanceM: 2 * ALLEY_HALF_WIDTH_M };
/** A run on lane-01 at its end, as the game would show it (the catalogue has no i18n layer: sample text). */
const SAMPLE = { title: 'Lane 3 · lane-01', subtitle: 'Autopilot: Dummy', detail: 'Impacts: 3', score: '6 / 10', pinsDown: [1, 2, 3, 5, 8, 9] } as const;

/**
 * The scoreboard over the pins (wiki/models/lane.md, rule 6): the live screen in the middle, the
 * neighbours' screens waiting for players. One story per theme.
 */
const meta = {
  title: 'Models/Alley Scoreboard',
  component: ModelStage<ScoreboardOptions>,
  args: {
    factory: createScoreboard,
    options: { scenery: 'retro', content: SAMPLE },
    frame: { centre: [0, SCOREBOARD_BOTTOM_M + SCOREBOARD_HEIGHT_M / 2, 0], radiusM: ALLEY_HALF_WIDTH_M, inside: FROM_THE_LANES },
  },
} satisfies Meta<ModelStageProps<ScoreboardOptions>>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Retro, the room of lane-01. */
export const Default: Story = {};
/** Neon, lane-02. */
export const Neon: Story = { args: { options: { scenery: 'neon', content: SAMPLE } } };
/** Space, lane-03. */
export const Space: Story = { args: { options: { scenery: 'space', content: SAMPLE } } };
/** Tropical, lane-04. */
export const Tropical: Story = { args: { options: { scenery: 'tropical', content: SAMPLE } } };
/** Diner, lane-05, after a strike. */
export const Diner: Story = { args: { options: { scenery: 'diner', content: { ...SAMPLE, score: 'STRIKE!', pinsDown: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] } } } };
