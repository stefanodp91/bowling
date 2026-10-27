import type { Meta, StoryObj } from '@storybook/react-vite';
import { PROP_SCALE } from '@models';
import { createPinDeckScene, type PinDeckSceneOptions } from '../scenes/pin-deck-scene';
import { ModelStage, type ModelStageProps } from '../stage/ModelStage';

/** Lane end and pin deck (wiki/storybook/catalog.md, rule 3: scenes-pin-deck), framed for twice-life-size pins. */
const meta = {
  title: 'Scenes/Pin Deck',
  component: ModelStage<PinDeckSceneOptions>,
  args: { factory: createPinDeckScene, options: {}, frame: { centre: [0, 0.2 * PROP_SCALE, 0.3 * PROP_SCALE], radiusM: 1.3 * PROP_SCALE } },
} satisfies Meta<ModelStageProps<PinDeckSceneOptions>>;

export default meta;

export const Default: StoryObj<typeof meta> = {};
