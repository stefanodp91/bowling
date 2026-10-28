import type { Scene } from '@babylonjs/core/scene';

/** Anything a scene can own and release: materials, textures. */
export interface Disposable {
  dispose(): void;
}

/**
 * Turns `create` into a per-scene memo: the first call for a scene creates the resource, later
 * calls return the same one, and the scene disposes it when it is disposed
 * (wiki/models/conventions.md: materials are created once per scene and shared between
 * instances). A model's own dispose() never releases what it got from here.
 */
export function perScene<T extends Disposable>(create: (scene: Scene) => T): (scene: Scene) => T {
  const made = new WeakMap<Scene, T>();
  return (scene) => {
    const existing = made.get(scene);
    if (existing !== undefined) return existing;
    const resource = create(scene);
    made.set(scene, resource);
    scene.onDisposeObservable.addOnce(() => {
      resource.dispose();
      made.delete(scene);
    });
    return resource;
  };
}
