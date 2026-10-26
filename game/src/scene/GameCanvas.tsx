import { ReactylonSceneBridge } from 'obsidian-eclipse-graphic-engine/reactylon';
import { Scene } from 'reactylon';
import { Engine } from 'reactylon/web';
import { createGameCamera, mountGame } from './mountGame';

/** Reactylon owns engine, canvas and scene; the bridge mounts the game's imperative scene code. */
export function GameCanvas() {
  return (
    <Engine>
      <Scene onSceneReady={createGameCamera}>
        <ReactylonSceneBridge mount={mountGame} />
      </Scene>
    </Engine>
  );
}
