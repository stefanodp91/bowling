import type { Scene as BabylonScene } from '@babylonjs/core/scene';
import type { ModelFactory } from '@models';
import { ReactylonSceneBridge } from 'obsidian-eclipse-graphic-engine/reactylon';
import { useCallback, useState } from 'react';
import { Scene } from 'reactylon';
import { Engine } from 'reactylon/web';
import styles from './ModelStage.module.css';
import { createStageCamera, mountStage } from './mountStage';
import type { StageAngle } from './stage-config';

export interface ModelStageProps<Options> {
  readonly factory: ModelFactory<Options>;
  readonly options: Options;
  /** Camera pose; the shot tool sets it with `--angle`. */
  readonly angle?: StageAngle;
}

/**
 * Renders one model factory from `@models` under fixed light and camera
 * (wiki/storybook/catalog.md). Sets data-ready="true" once the scene has rendered two frames.
 */
export function ModelStage<Options>({ factory, options, angle = 'default' }: ModelStageProps<Options>) {
  const [ready, setReady] = useState(false);
  const mount = useCallback(
    (scene: BabylonScene) => mountStage(scene, { factory, options, angle, onReady: () => setReady(true) }),
    [factory, options, angle],
  );
  return (
    <div className={styles.stage} data-ready={ready ? 'true' : 'false'}>
      <Engine>
        <Scene onSceneReady={createStageCamera}>
          <ReactylonSceneBridge mount={mount} />
        </Scene>
      </Engine>
    </div>
  );
}
