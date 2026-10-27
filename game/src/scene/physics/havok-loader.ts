import HavokPhysics from '@babylonjs/havok';

/** The Havok WASM instance type, as its factory returns it. */
export type HavokInstance = Awaited<ReturnType<typeof HavokPhysics>>;

/**
 * The WASM file inside the published @babylonjs/havok package. The package exports only its JS
 * entry, so the file is reached by path; Vite serves and bundles it as an asset.
 */
const WASM_URL = new URL('../../../../node_modules/@babylonjs/havok/lib/esm/HavokPhysics.wasm', import.meta.url).href;

let loading: Promise<HavokInstance> | null = null;

/** Loads Havok in the browser, once per page: every run of the page shares the WASM instance. */
export function loadHavok(): Promise<HavokInstance> {
  loading ??= HavokPhysics({ locateFile: () => WASM_URL }).catch((error: unknown) => {
    loading = null; // a failed load must not stick: Retry tries again
    throw error;
  });
  return loading;
}
