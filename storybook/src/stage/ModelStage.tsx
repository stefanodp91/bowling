import type { Scene as BabylonScene } from '@babylonjs/core/scene';
import type { ModelFactory } from '@models';
import { ReactylonSceneBridge } from 'obsidian-eclipse-graphic-engine/reactylon';
import { useCallback, useState } from 'react';
import { Scene } from 'reactylon';
import { Engine } from 'reactylon/web';
import styles from './ModelStage.module.css';
import { createStageCamera, mountStage, type StageFrame } from './mountStage';
import type { StageAngle } from './stage-config';

export interface ModelStageProps<Options> {
  readonly factory: ModelFactory<Options>;
  readonly options: Options;
  /** Camera pose; the shot tool sets it with `--angle`. */
  readonly angle?: StageAngle;
  /** Part of the model to frame, when it is larger than what the story shows. */
  readonly frame?: StageFrame;
}

/**
 * Renders one model factory from `@models` under fixed light and camera
 * (wiki/storybook/catalog.md). Sets data-ready="true" once the scene has rendered two frames.
 */
export function ModelStage<Options>({ factory, options, angle = 'default', frame }: ModelStageProps<Options>) {
  const [ready, setReady] = useState(false);
  const mount = useCallback(
    (scene: BabylonScene) =>
      mountStage(scene, { factory, options, angle, onReady: () => setReady(true), ...(frame === undefined ? {} : { frame }) }),
    [factory, options, angle, frame],
  );
  // WebGL, never WebGPU: see AGENTS.md traps (the board-hole material plugin is GLSL only).
  return (
    <div className={styles.stage} data-ready={ready ? 'true' : 'false'}>
      <Engine forceWebGL>
        <Scene onSceneReady={createStageCamera}>
          <ReactylonSceneBridge mount={mount} />
        </Scene>
      </Engine>
    </div>
  );
}
