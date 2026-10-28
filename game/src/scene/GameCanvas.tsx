import type { Scene as BabylonScene } from '@babylonjs/core/scene';
import type { TFunction } from 'i18next';
import { ReactylonSceneBridge } from 'obsidian-eclipse-graphic-engine/reactylon';
import { useCallback } from 'react';
import { Scene } from 'reactylon';
import { Engine } from 'reactylon/web';
import type { Session } from '../app/session';
import { createGameCamera, mountGame } from './mountGame';
import type { HavokInstance } from './physics/havok-loader';

export interface GameCanvasProps {
  readonly session: Session;
  readonly pause: boolean;
  readonly havok: HavokInstance;
  readonly t: TFunction;
}

/** Reactylon owns engine, canvas and scene; the bridge mounts the game's imperative scene code. */
export function GameCanvas({ session, pause, havok, t }: GameCanvasProps) {
  const mount = useCallback((scene: BabylonScene) => mountGame(scene, session, { pause, havok, t }), [session, pause, havok, t]);
  // WebGL, never WebGPU: see AGENTS.md traps (the board-hole material plugin is GLSL only).
  return (
    <Engine forceWebGL>
      <Scene onSceneReady={createGameCamera}>
        <ReactylonSceneBridge mount={mount} />
      </Scene>
    </Engine>
  );
}
