/**
 * Render budgets checked by the headless gate (wiki/pilot/headless-runs.md, rule 3).
 *
 * Active meshes: the peak measured with `perfect` on the five committed tracks was 174 (lane-02,
 * wiki/records/pilot-vs-blind-20261027.md); the budget leaves ≈ 40 % headroom over it, so a new
 * obstacle model or a leak of lane segments fails the gate while ordinary variation does not.
 */
export const ACTIVE_MESH_BUDGET = 250;
