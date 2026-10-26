import HavokPhysics from '@babylonjs/havok';

/** The Havok WASM instance type, as its factory returns it. */
export type HavokInstance = Awaited<ReturnType<typeof HavokPhysics>>;

/**
 * The WASM file inside the published @babylonjs/havok package. The package exports only its JS
 * entry, so the file is reached by path; Vite serves and bundles it as an asset.
 */
const WASM_URL = new URL('../../../../node_modules/@babylonjs/havok/lib/esm/HavokPhysics.wasm', import.meta.url).href;

/** Loads Havok in the browser. */
export function loadHavok(): Promise<HavokInstance> {
  return HavokPhysics({ locateFile: () => WASM_URL });
}
