---
title: Lane — 200 m of maple, three travel lanes, gutters and pin deck
type: spec
status: approved
approved_on: 2026-10-28
depends_on: [storybook/catalog.md, tools/shot.md]
canonical: [models/src/measures/lane.ts, models/src/measures/alley.ts, game/src/config/scenery.ts, game/src/config/scenery.test.ts, models/src/lane/, models/src/alley/, storybook/src/stories/alley-segment.stories.tsx, storybook/src/stories/alley-end-wall.stories.tsx, storybook/src/stories/alley-scoreboard.stories.tsx, storybook/src/stories/alley-ball-return.stories.tsx, storybook/src/stories/lane-segment.stories.tsx, storybook/src/stories/pin-deck.stories.tsx, storybook/src/scenes/pin-deck-scene.ts]
verified: 2026-10-28
---

# Lane

> Boundary: the lane surface model — boards, markings, outer gutters, pin deck and back wall — its
> measures, and the alley around it (rule 6). NOT covered: the widening gutter obstacle ([widening gutter](obstacles/widening-gutter.md)),
> the pins ([pins](pins.md)).

## Purpose

The stage of the whole run. It must look like a real bowling lane stretched to 200 m, and stay cheap
to render for its whole length.

## Rules

1. Measures (`models/src/measures/lane.ts`): one travel lane is 1.054 m wide (the regulation lane
   width, 41.5 in) made of 39 boards; the playing surface is three travel lanes side by side, centred
   on `x = 0` (travel-lane centres at −1.054, 0, +1.054 m), 200 m long (a human's decision of
   2026-10-28; it was 500 m, then 300 m). Gutters 0.235 m wide run
   along the two outer edges only, so the ball can move between travel lanes.
2. Look: light maple boards with visible grain and seams, glossy oil sheen near the camera;
   the three travel lanes separated by a subtle darker board line. Regulation markings repeated
   along the lane where they make sense: foul line at `z = 0`, dots and targeting arrows near the
   start, and again in the last 20 m before the pin deck.
3. Pin deck at the end of the centre travel lane, with the ten pin spots marked; a dark masking
   wall behind it with a soft spotlight on the deck. The deck's margins, pit and wall are sized for
   the pins, so they grow with them ([conventions](conventions.md), twice life size); the masking
   wall runs the whole width of the alley.
4. Built in segments (`SEGMENT_LENGTH_M`, 20 m) that the scene instances and recycles: the factory
   creates one segment, not 200 m of geometry. The pin deck is a separate factory.
5. Fog or a fade hides where the lane ends in the distance (the distance is a tunable owned by
   [camera](../game/camera.md)). The fog is the colour of the alley's own haze, so the far end
   fades into the room, never into black.
6. **The alley around the lane** (a human's request of 2026-10-27: the game showed a black void
   around the lane). On each side, beyond the outer gutter: a raised capping, then two neighbouring
   regulation lanes with their gutters, separated by cappings; then a side wall: a darker wainscot,
   a stripe, a mural band with a pattern generated from numbers, a neon line and a top band. A
   ceiling closes the room, with rows of light strips along the lanes and cross beams every few
   metres, so the sense of speed comes from the room too.
   **Themes:** each track is played in a room of its own (a human's request of 2026-10-28):
   `retro` (teal and cream, coloured discs), `neon` (a dark room, pink and cyan zigzags), `space`
   (night blue, planets and stars), `tropical` (green and coral, sea waves), `diner` (red, cream,
   a black and white checkerboard). A theme sets every colour of the room, the mural's pattern and
   the haze the far end fades into (`models/src/alley/scenery-themes.ts`, plain hex data that tools
   read too); `game/src/config/scenery.ts` gives each committed track its theme.
   Built like the lane: `createAlleySegment(scene, { scenery })` makes one `SEGMENT_LENGTH_M`
   segment that the scene recycles with the lane segments, in two meshes (the vertex-coloured
   decor, the neighbouring boards), so the draw budget of
   [headless runs](../pilot/headless-runs.md) holds. Measures in `models/src/measures/alley.ts`.
   Story `models-alley-segment`, one story per theme, seen from inside down the lanes.
   **The end of the room** (a human's report of 2026-10-28: every room ended in a big grey
   rectangle): `createAlleyEndWall(scene, { scenery })`, one mesh across the whole width, floor to
   ceiling, standing just in front of the deck's dark wall: near-black pinsetter openings up to
   `MASKING_UNIT_BOTTOM_M` (above the pins), then the masking unit in the room's theme — a neon
   line, a trim, the mural's pattern centred on the panel, the top band. Story
   `models-alley-end-wall`, one story per theme, seen square on from the lanes.
   **The scoreboard** (a human's request of 2026-10-28, after a photo of a real alley with a screen
   over each lane): `createScoreboard(scene, { scenery, content })` hangs a screen over every lane
   in front of the masking unit — lanes numbered 1 to 5 from the left wall, the playing surface is
   lane 3. Its screen is live: the lane and track, the autopilot's skill, the impacts, the distance
   and then the score or «STRIKE!», and the ten pins, down ones dark; the game words it through the
   i18n layer and redraws it only when it changes (`scene/views/scoreboard-*.ts`). The neighbours'
   screens wait for players: their lane number and a full rack. Pictures are drawn on canvases at
   runtime; screens are unlit, as screens shine. Story `models-alley-scoreboard`, one per theme.
   **The ball return** (same request): `createBallReturn(scene, { scenery })` stands just left of
   the playing surface at the start of the lanes — a hood painted in the room's colours with the
   dark opening the balls come out of, a rack of two rails with the theme's neon strip under it,
   and six coloured house balls waiting, × `PROP_SCALE`. Story `models-alley-ball-return`, one per
   theme. The scene draws one lane and alley segment before the foul line too — the approach — so
   the start of a run never looks into the void.

## Acceptance criteria

1. [auto] Stories `models-lane-segment` and `scenes-pin-deck` exist and reach ready.
2. [auto] A unit test checks the segment's width (three travel lanes + two gutters) within ±5 mm
   and its length equals `SEGMENT_LENGTH_M`.
3. [human] Seen from the chase camera, it reads as a polished bowling lane, not a wooden floor.

## References

- Lane 41.5 in (1.054 m) wide, 39 boards; 60 ft (18.29 m) from the foul line to the head pin
  centre; targeting arrows about 15 ft past the foul line; dots about 7 ft past it
  (https://en.wikipedia.org/wiki/Tenpin_bowling; https://www2.hawaii.edu/~ericsk/me/targeting_aids.htm).
- Gutter 9.25 in (0.235 m) wide and 1.875 in (47.6 mm) deep (https://www.dimensions.com/element/bowling-lane).
- Foul line 3/8 in wide; pin spots 2.25 in across, 12 in apart (USBC lane and pin specifications,
  as summarised in the sources above).
- Photos of lanes under alley lighting: honey-coloured maple, a bright glossy streak where the
  ceiling lights reflect on the oil, dark gutters, a light synthetic pin deck under a spot, black
  masking units behind (looked at, not downloaded).

## Rounds

- 2026-10-26 · round 1 · Built measures, a generated maple texture (39 boards per lane, grain
  that wraps along z, darker seam between travel lanes), lacquer as a clear coat, trough gutters,
  markings as flat geometry (foul line, ten dots and seven arrows per travel lane), the pin deck
  factory and two stories. 6 shots. Wrong: (a) gutters and pit invisible — the stage floor sat at
  the lane surface and covered everything below y = 0 → the stage floor now goes under the
  model's lowest point; (b) the side travel lanes stopped at the head pin, leaving holes beside
  the deck → the deck plate spans the three travel lanes and the gutters run on to the pit;
  (c) `Mesh.createInstance` threw «InstancedMesh needs to be imported» (the tree-shaking trap of
  AGENTS.md) → side-effect import in `lane-segment.ts`. Now: close-up shows boards with seams, a
  glossy streak, the darker lane separators, arrows and dots; the deck scene shows pin 1's spot
  nearest the foul line, gutters, pit and masking wall. Unit tests: width 3.632 m (±5 mm),
  length 20 m, lane centres −1.054/0/+1.054, instancing adds no geometry. Rule 5 (fog) belongs to
  the scene: the [camera](../game/camera.md) page sets it.

- 2026-10-27 · round 2 · The human shortened the lane to 300 m. `LANE_LENGTH_M` is the one place
  that says it; the scene now draws 15 segments, the last with the regulation markings ending at the
  head pin. Unit tests unchanged and green; the 300 m campaign
  ([record](../records/pilot-vs-blind-300m-20261027.md)) ran on it.
- 2026-10-27 · round 4 · Props twice life size: the deck's margins, pit, wall and spotlight are
  sized for the pins, × `PROP_SCALE`; the lane itself is unchanged. Rule 6, the alley:
  `createAlleySegment` (`models/src/alley/`, measures in `measures/alley.ts`) builds a 20 m segment
  in two meshes — the four neighbouring lanes' boards with the lane's material (one lane's third of
  the board texture each), and a single unlit vertex-coloured mesh for cappings, neighbouring
  gutters, purple carpet, teal-and-cream walls with orange, pink, teal and mustard discs, a pink
  neon line, the ceiling with a beam every 5 m and a warm light strip over every lane. The scene
  recycles it with the lane segments (`segment-window.ts`, shared by both views), one segment past
  the head pin; the masking wall now spans the room and reaches the ceiling. Shots: at 140 m the
  first try showed the neighbouring boards black — their quads faced down; winding flipped. At 0 m,
  140 m and 295 m the frame has no black left: walls, ceiling, the far end fades into purple haze.
  Story `models-alley-segment` reaches ready; unit tests: wall to wall, floor to ceiling, two
  meshes, instancing shares geometry. Rule 6 has no acceptance criterion yet: a proposal is in
  [review](../review.md) «To judge».
- 2026-10-28 · round 5 · `LANE_LENGTH_M` 300 → 200 (a human's decision): ten 20 m segments; the
  alley, the deck and the HUD follow from the constant. Unit tests unchanged and green; shots at
  150 m and 195 m show the lane, the alley and the deck.
- 2026-10-28 · round 6 · The human asked that the scenery change with the track and that the
  decorative models be in the catalogue. Rule 6: five themes, one per committed track; the palette
  is built from a theme, the mural from one of five pattern painters (`alley-murals.ts`: discs,
  zigzags, planets and diamond stars, three wave bands layered off the wall, a three-row
  checkerboard), each repeating exactly within a segment so recycled segments join. The game's fog
  and clear colour come from the theme's haze. Unit tests: every theme builds with colours of its
  own; every committed track has a room of its own. Stories: `Default` (retro), `Neon`, `Space`,
  `Tropical`, `Diner`, seen from inside (a stage `inside` view); 5 story shots and the game at 40 m
  on lane-02…05 show five different rooms, the obstacles still readable against each.
- 2026-10-28 · round 7 · Reported by the human on a real Chrome: every room ended in a big grey
  rectangle — the deck's plain masking wall, which ran to the ceiling. Rule 6: an end wall per
  theme (`alley-end-wall.ts`), built in a side wall's plane with the same painters and turned a
  quarter round; the painters take a band length and centre whole repeats, so a 13.3 m panel shows
  a full pattern. `MASKING_WALL_Z_M` names where the deck's wall stands; the end wall sits 2 cm in
  front of it. Unit tests: for every theme the end wall spans the room wall to wall and floor to
  ceiling, every layer on the ball's side within 10 cm, and the masking unit clears the pins.
  Shots: the five end-wall stories, and every track at 160 m — each room now ends in its own
  painted masking unit over the dark openings and the pins.
- 2026-10-28 · round 8 · The human, with a photo of a real alley: a scoreboard over the pins and
  the ball return at the start. Built `scoreboard-layout.ts` (pure: five screens, the live one over
  the playing surface), `scoreboard-canvas.ts` (the pictures, on Babylon's canvas context, which has
  no `textBaseline`: text is placed from its baseline) and `scoreboard.ts` (bezels, unlit faces with
  dynamic textures); `ball-return.ts` (hood with a rounded top, rails, leg, glowing strip, six
  glossy balls resting on both rails). The game feeds the live screen from the store, redrawing only
  when a shown field changes (`scoreboardContent`, `sameContent`, unit-tested with the real i18n
  strings), and draws segment −1 before the foul line: the first shot showed the foul-line segment
  gone — `start` was enabled only when the window began at 0 — fixed. Unit tests: five screens,
  none touching, the live one over the playing surface, all between the masking unit and the
  ceiling; the ball return carries six balls and stands on the floor. Shots: scoreboard and ball
  return stories, the start of lane-02 (the rack and hood at the left, the lane from the foul
  line), lane-01 at 190 m (the five screens over the pins, «191 m» live).

## Canonical files

- `createLaneSegment(scene, { foulLineZ? })` returns a `LaneSegmentHandle` whose `instantiate`
  places a copy that shares geometry and materials; the first segment uses `foulLineZ: 0`, the last
  `FINAL_FOUL_LINE_Z_M − 480` (the markings of a regulation lane ending at the head pin).
- `createTroughMesh` is the one gutter section, reused by the
  [widening gutter](obstacles/widening-gutter.md).
- `measures/pins.ts` already holds the pin-spot layout (the deck needs it); the
  [pins](pins.md) page owns it.
- Scene stories pass `frame` to `ModelStage` to frame part of a large model.
