import type { AbstractEngine } from '@babylonjs/core/Engines/abstractEngine';
import type { Material } from '@babylonjs/core/Materials/material';
import { MaterialPluginBase } from '@babylonjs/core/Materials/materialPluginBase';
import type { UniformBuffer } from '@babylonjs/core/Materials/uniformBuffer';
import type { SubMesh } from '@babylonjs/core/Meshes/subMesh';
import type { Scene } from '@babylonjs/core/scene';
import { boardMaterial } from './lane-materials';

/** A rectangle of the lane, in world x/z, where the boards are not drawn. */
export interface BoardHole {
  readonly minX: number;
  readonly maxX: number;
  readonly minZ: number;
  readonly maxZ: number;
}

/**
 * Most holes open at the same time: the scene keeps obstacle models only near the camera, and
 * widening gutters are at least 15 m apart (wiki/track/track-format.md), so a handful is plenty.
 */
export const MAX_BOARD_HOLES = 8;
const FLOATS_PER_HOLE = 4;
const UNIFORM = 'laneBoardHoles';

/**
 * A PBR material plugin that discards the lane boards' fragments inside the registered holes, so a
 * channel modelled below y = 0 (the widening gutter) shows through the boards.
 */
class BoardHolesPlugin extends MaterialPluginBase {
  private readonly providers = new Set<() => BoardHole>();
  private readonly data = new Float32Array(MAX_BOARD_HOLES * FLOATS_PER_HOLE);

  constructor(material: Material) {
    super(material, 'BoardHoles', 200, undefined, true, false);
    // hardBindForSubMesh (which sets the uniform) is an «extra event»: it must be requested before
    // the plugin is activated, or Babylon never calls it.
    this.registerForExtraEvents = true;
    this._enable(true);
    // The board material may already be compiled: rebuild its shader with this plugin's code.
    this.markAllDefinesAsDirty();
  }

  add(provider: () => BoardHole): () => void {
    this.providers.add(provider);
    return () => this.providers.delete(provider);
  }

  override getClassName(): string {
    return 'BoardHolesPlugin';
  }

  override getUniforms() {
    return { externalUniforms: [UNIFORM] };
  }

  override hardBindForSubMesh(_ubo: UniformBuffer, _scene: Scene, _engine: AbstractEngine, subMesh: SubMesh): void {
    this.data.fill(0);
    let i = 0;
    for (const provider of this.providers) {
      if (i >= MAX_BOARD_HOLES) break;
      const hole = provider();
      this.data.set([hole.minX, hole.minZ, hole.maxX, hole.maxZ], i * FLOATS_PER_HOLE);
      i += 1;
    }
    subMesh.effect?.setArray4(UNIFORM, Array.from(this.data));
  }

  override getCustomCode(shaderType: string) {
    if (shaderType !== 'fragment') return null;
    return {
      CUSTOM_FRAGMENT_DEFINITIONS: `uniform vec4 ${UNIFORM}[${MAX_BOARD_HOLES}];`,
      CUSTOM_FRAGMENT_MAIN_BEGIN: `
for (int i = 0; i < ${MAX_BOARD_HOLES}; i++) {
  vec4 hole = ${UNIFORM}[i];
  if (vPositionW.x > hole.x && vPositionW.x < hole.z && vPositionW.z > hole.y && vPositionW.z < hole.w) discard;
}`,
    };
  }
}

const plugins = new WeakMap<Material, BoardHolesPlugin>();

/** Opens a hole in this scene's lane boards; returns the function that closes it. */
export function openBoardHole(scene: Scene, provider: () => BoardHole): () => void {
  const material = boardMaterial(scene);
  let plugin = plugins.get(material);
  if (plugin === undefined) {
    plugin = new BoardHolesPlugin(material);
    plugins.set(material, plugin);
  }
  return plugin.add(provider);
}
