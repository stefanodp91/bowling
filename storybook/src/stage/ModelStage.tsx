import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import type { Scene as BabylonScene } from '@babylonjs/core/scene';
import type { ModelFactory } from '@models';
import { ReactylonSceneBridge } from 'obsidian-eclipse-graphic-engine/reactylon';
import { useCallback } from 'react';
import { Scene } from 'reactylon';
import { Engine } from 'reactylon/web';
import styles from './ModelStage.module.css';

/** Default orbit of the stage camera: radius in metres, angles in radians. */
const STAGE_CAMERA = { alpha: -Math.PI / 3, beta: Math.PI / 3, radiusM: 4 } as const;

export interface ModelStageProps<Options> {
  readonly factory: ModelFactory<Options>;
  readonly options: Options;
}

/** Renders one model factory from `@models` under a fixed camera and light. */
export function ModelStage<Options>({ factory, options }: ModelStageProps<Options>) {
  const mount = useCallback(
    (scene: BabylonScene) => {
      const light = new HemisphericLight('stage-light', Vector3.Up(), scene);
      const model = factory(scene, options);
      return () => {
        model.dispose();
        light.dispose();
      };
    },
    [factory, options],
  );
  return (
    <div className={styles.stage}>
      <Engine>
        <Scene onSceneReady={createStageCamera}>
          <ReactylonSceneBridge mount={mount} />
        </Scene>
      </Engine>
    </div>
  );
}

function createStageCamera(scene: BabylonScene): void {
  scene.activeCamera = new ArcRotateCamera(
    'stage-camera',
    STAGE_CAMERA.alpha,
    STAGE_CAMERA.beta,
    STAGE_CAMERA.radiusM,
    Vector3.Zero(),
    scene,
  );
}
