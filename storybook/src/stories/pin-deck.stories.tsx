import type { Meta, StoryObj } from '@storybook/react-vite';
import { createPinDeckScene, type PinDeckSceneOptions } from '../scenes/pin-deck-scene';
import { ModelStage, type ModelStageProps } from '../stage/ModelStage';

/** Lane end and pin deck (wiki/storybook/catalog.md, rule 3: scenes-pin-deck). */
const meta = {
  title: 'Scenes/Pin Deck',
  component: ModelStage<PinDeckSceneOptions>,
  args: { factory: createPinDeckScene, options: {}, frame: { centre: [0, 0.2, 0.3], radiusM: 1.3 } },
} satisfies Meta<ModelStageProps<PinDeckSceneOptions>>;

export default meta;

export const Default: StoryObj<typeof meta> = {};
