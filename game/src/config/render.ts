/**
 * Render budgets checked by the headless gate (wiki/pilot/headless-runs.md, rule 3).
 *
 * Active meshes: the peak measured on the five committed tracks was 174 (500 m lane,
 * wiki/records/pilot-vs-blind-20261027.md; 300 m lane, wiki/records/pilot-vs-blind-300m-20261027.md),
 * 190 with the alley drawn (wiki/records/skills-20261027.md); the budget leaves ≈ 30 % headroom
 * over it, so a new
 * obstacle model or a leak of lane segments fails the gate while ordinary variation does not.
 */
export const ACTIVE_MESH_BUDGET = 250;
