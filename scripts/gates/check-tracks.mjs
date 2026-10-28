// check-tracks: every committed track is valid and solvable (wiki/track/track-format.md, rule 6):
// the index lists exactly the files, each file passes the schema and every rule, and equals what
// its seed bakes (a stale file means the generator changed without npm run bake:tracks).
// Thresholds come from game/src/config/, imported through the domain's own rules.
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { finding, runGate, withTempDir } from '../lib/gate.mjs';
import { LANE_LENGTH_M } from '../../models/src/measures/lane.ts';
import { APPROACH_START_Z_M } from '../../game/src/config/track.ts';
import { parseTrack } from '../../game/src/domain/track/parse.ts';
import { trackViolations } from '../../game/src/domain/track/rules.ts';
import { trackIndexSchema } from '../../game/src/domain/track/schema.ts';
import { bakedTracks, INDEX_FILE, toFileText, TRACKS_DIR } from '../tracks/tracks.mjs';

const REL = 'game/public/tracks';

export function checkTracks(dir, { compareWithBake = true } = {}) {
  const indexPath = join(dir, INDEX_FILE);
  if (!existsSync(indexPath)) return [finding(`${REL}/${INDEX_FILE}`, undefined, 'missing: run npm run bake:tracks')];
  const index = trackIndexSchema.safeParse(JSON.parse(readFileSync(indexPath, 'utf8')));
  if (!index.success) return [finding(`${REL}/${INDEX_FILE}`, undefined, 'not a valid track index')];
  const files = readdirSync(dir).filter((f) => f.endsWith('.json') && f !== INDEX_FILE).map((f) => f.replace(/\.json$/, ''));
  const problems = [
    ...files.filter((id) => !index.data.tracks.includes(id)).map((id) => finding(`${REL}/${id}.json`, undefined, 'not listed in index.json')),
    ...index.data.tracks.filter((id) => !files.includes(id)).map((id) => finding(`${REL}/${INDEX_FILE}`, undefined, `lists «${id}», which has no file`)),
  ];
  const baked = new Map(bakedTracks().map((t) => [t.trackId, toFileText(t)]));
  for (const id of index.data.tracks.filter((t) => files.includes(t))) {
    const where = `${REL}/${id}.json`;
    const text = readFileSync(join(dir, `${id}.json`), 'utf8');
    const parsed = parseTrack(JSON.parse(text));
    if (!parsed.ok) {
      problems.push(finding(where, undefined, `schema: ${parsed.error}`));
      continue;
    }
    if (parsed.value.trackId !== id) problems.push(finding(where, undefined, `trackId «${parsed.value.trackId}» differs from the file name`));
    for (const v of trackViolations(parsed.value)) problems.push(finding(where, undefined, `obstacle ${v.index}: ${v.rule}: ${v.message}`));
    if (compareWithBake && baked.has(id) && baked.get(id) !== text) problems.push(finding(where, undefined, 'differs from its seed: run npm run bake:tracks'));
  }
  return problems;
}

/** The four wrong cases of criterion 3, each in its own file. */
const WRONG_CASES = {
  'approach-zone': [{ kind: 'wet-floor-sign', lane: 0, z: APPROACH_START_Z_M + 10 }],
  'three-lanes-same-z': [0, 1, 2].map((lane) => ({ kind: 'wet-floor-sign', lane, z: 100 })),
  'cans-after-sign': [{ kind: 'wet-floor-sign', lane: 0, z: 100 }, { kind: 'soda-cans', z: 103 }],
  'unknown-kind': [{ kind: 'bowling-bag', lane: 1, z: 100 }],
};

function selftest() {
  return withTempDir((dir) => {
    mkdirSync(dir, { recursive: true });
    const ids = Object.keys(WRONG_CASES);
    for (const [id, obstacles] of Object.entries(WRONG_CASES)) {
      writeFileSync(join(dir, `${id}.json`), toFileText({ schemaVersion: 1, trackId: id, seed: 0, lengthM: LANE_LENGTH_M, lanes: 3, obstacles }));
    }
    writeFileSync(join(dir, INDEX_FILE), toFileText({ tracks: ids }));
    const found = checkTracks(dir, { compareWithBake: false });
    const rejectedEach = ids.every((id) => found.some((f) => f.file.endsWith(`/${id}.json`)));
    return rejectedEach ? found : [];
  });
}

runGate('check-tracks', { check: () => checkTracks(TRACKS_DIR), selftest });
