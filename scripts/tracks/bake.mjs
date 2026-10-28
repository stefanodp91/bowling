// npm run bake:tracks: regenerates every committed track from its seed (wiki/track/track-format.md,
// rule 5). Re-baking with unchanged code writes byte-identical files.
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { bakedIndex, bakedTracks, INDEX_FILE, toFileText, TRACKS_DIR } from './tracks.mjs';

mkdirSync(TRACKS_DIR, { recursive: true });
for (const track of bakedTracks()) {
  writeFileSync(join(TRACKS_DIR, `${track.trackId}.json`), toFileText(track));
  console.log(`${track.trackId}: ${track.obstacles.length} obstacles`);
}
writeFileSync(join(TRACKS_DIR, INDEX_FILE), toFileText(bakedIndex()));
