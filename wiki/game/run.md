---
title: Run — the ball's 200 m, from foul line to pin deck
type: spec
status: built
depends_on: [track/track-format.md, models/ball.md, models/lane.md]
canonical: [game/src/config/run.ts, game/src/config/loop.ts, game/src/config/scene.ts, game/src/domain/run/, game/src/app/, game/src/dev/test-hook.ts, game/src/scene/, game/src/ui/App.tsx, game/src/ui/ErrorScreen.tsx, game/src/ui/use-game-session.ts, game/src/i18n/]
verified: 2026-10-28
---

# Run

> Boundary: the run as pure domain logic — its states, speed, lane changes, jumps, determinism —
> and the scene that shows it. NOT covered: collisions and their cost ([impacts](impacts.md)), the
> pin physics ([pins physics](pins.md)), who issues commands ([autopilot](../pilot/autopilot.md)).

## Purpose

The heart of the demo: a ball thrown by itself, rolling for about twenty-five seconds and slowly
losing speed like a real ball, changing lane and jumping when the autopilot says so.

## Rules

1. **States** (a closed union): `ready` → `rolling` → `deck` → `settling` → `result`. `ready` lasts
   `READY_S` (1.5 s, a countdown on screen while the bowler's arm swings the ball, rule 3) and
   starts by itself — there is no player input; on a page opened on the start menu it begins when
   the menu's «Start» is pressed ([HUD](hud.md), rule 2).
   `deck` begins at `DECK_HANDOFF_Z` (2 m before the head pin) where the ball is handed to physics.
2. **Pure step.** `step(state, command, dtS) → state` in `game/src/domain/run/`, with the command
   from the autopilot (`stay | left | right | jump`). The simulation runs at a fixed step
   (`SIM_STEP_S`, 1/120 s); rendering interpolates. No `Date.now`, no `Math.random` in the domain.
3. **Speed: a throw, then the lane's drag** (a human asked on 2026-10-28 for a natural run instead
   of a ball that kept speeding up, the «slow» profile, and for an entrance that shows the throw).
   - **The throw** (scene only, during `ready`): the bowler's arm swings the ball, a pendulum about
     the shoulder (`game/src/config/throw.ts`, `scene/views/swing.ts`): held in front for
     `ADDRESS_S`, a backswing up and towards the camera, then a forward swing that eases in and
     lays the ball on the lane at the foul line exactly when `ready` ends. The backswing's height
     is derived so the arm releases the ball at `RELEASE_SPEED_MPS` (10 m/s, 36 km/h); the run then
     starts `rolling` at that speed. The swing is a pure function of the time into `ready` and
     never moves the run's own state.
   - **The drag:** the ball loses the share `ROLL_DRAG_PER_M` of its speed for every metre it rolls
     (dv/dz = −k·v, so dv/dt = −k·v²: hard on a fast ball, gentle on a slow one). `k` is derived so
     a clean ball reaches the hand-over at `PIN_SPEED_MPS` (6 m/s, 22 km/h).
   - **Target speed** is that clean curve, `v₀·e^(−k·z)`. It never increases with `z`, and the
     actual speed never exceeds it.
   - **Recovery:** a ball an impact slowed ([impacts](impacts.md)) regains `RECOVERY_MPS2`
     (1.5 m/s²) until it is back on the target curve, never past it: a 20 % dip is made up in
     ≈ 1.3 s, so every run lasts about as long (a human's decision of 2026-10-28).
   A clean run lasts ≈ 26 s on the 200 m lane (a human's decision of 2026-10-28; it was 300 m and
   40 s).
4. **Lane change:** to an adjacent travel lane in `LANE_CHANGE_S` (0.25 s), eased. A command for a
   lane that does not exist is ignored. A second change can start only when the first has ended.
5. **Jump:** a parabola lasting `JUMP_AIRTIME_S` (0.6 s) whose apex lifts the ball's lowest point to
   `JUMP_APEX_M` (1.0 m: 0.5 m × `PROP_SCALE`, so the jump clears the props, which are twice life
   size — [conventions](../models/conventions.md)). No lane change while airborne.
6. **Rolling:** the ball's rotation follows its speed (`ω = v / r`, radius from the ball measures).
7. **Query parameters** (parsed and validated in one module): `track`, `skill` (initial skill),
   `at` (start already at that metre, with the speed and clock a clean run has there, for shots), `pause=1` (freeze after the first rendered frame,
   for shots), `speedup` (simulation steps per rendered frame, for headless runs: it multiplies the
   number of fixed steps, never their length).
8. **Test hook** (`game/src/dev/`): `window.__bowling` exposes a read-only snapshot (state, `z`,
   speed, lane, impacts, skill, score when known) and a ready signal, so headless tools read the run
   without scraping the screen.
9. All the values above live in `game/src/config/run.ts`, typed and documented.

## Acceptance criteria

1. [auto] Unit tests: speed never exceeds the target; target speed is monotonic in `z`; the same
   command sequence from the same state gives a bit-identical state sequence; a lane change ends
   exactly in the centre of the adjacent lane after `LANE_CHANGE_S`; a jump returns to `y = 0`
   after `JUMP_AIRTIME_S`.
2. [auto] With the command `stay` only, on an empty track, `rolling` lasts between 24 and 27 s of
   simulated time (≈ 26 s expected: the 0.8 s throw covers 5.3 m, then speed decaying
   exponentially in distance from 10 to 6 m/s over the remaining 192.7 m takes
   `(10 / 6 − 1) / (k · 10)` with `k = ln(10 / 6) / 192.7`, ≈ 25.1 s).
3. [auto] `npm run shot -- game:track=lane-01&at=150&pause=1` shows the ball on the lane (the
   centre region of the image is not background).
4. [human] Watching a run, the ball's acceleration, lane changes and jumps feel smooth and readable.

## References

- Real release speeds: under 17 mph slow, 17–19 mph average, over 19 mph fast (7.6–8.5 m/s
  average); a ball loses about 3–3½ mph before the pins
  (https://www.topendsports.com/sport/tenpin/physics-speed.htm). This run's 10 → 6 m/s
  (22 → 13 mph) is a little faster than a real throw and loses more: it is a 200 m lane.
- Drag proportional to the square of speed, dv/dt = −k·v², whose speed decays exponentially with
  distance (https://en.wikipedia.org/wiki/Drag_(physics)).
- Fixed-step simulation with an accumulator and render interpolation («Fix your timestep»,
  https://gafferongames.com/post/fix_your_timestep/).

## Rounds

- 2026-10-27 · round 1 · Built the pure run (`domain/run/`: state, step, speed), the fixed-step
  clock with `speedup` and time scale (`app/frame-steps.ts`), the session that publishes a
  snapshot to a store, query parsing (zod), track loading through an injected fetch, the
  `window.__bowling` hook, and the scene: recycled lane segments (pool of `SEGMENTS_BEHIND +
  SEGMENTS_AHEAD` instances, first and last segments with markings), the ball (spin node turned by
  the roll angle), obstacles created inside the fog and disposed behind, a chase camera from a pure
  rig, linear fog, the alley environment. Unit tests: speed ≤ target at every step over 70 s;
  target monotonic; bit-identical states for the same commands; lane change ends exactly on the
  adjacent centre after 0.25 s; wrong-lane and second-change commands ignored; jump back to y = 0
  after 0.6 s, no lane change while airborne; «stay» rolls 56.3 s (inside 50–65 s). The
  jump-clearance tests of the rental shoes and sweep bar are now real (0.12 m and ≈ 0.30 m < 0.5 m).
  Shots: 3, plus a full run at `speedup=40` in headless Chromium (deck reached at 56.3 s simulated,
  15.7 s wall, no console error). `game:track=lane-01&at=250&pause=1`: the ball sits on the
  lane, a pair of shoes ahead, the lane fading into the fog; 5 of 5 centre pixels differ from the
  fog colour. Left for the [camera](camera.md) page: the ball reads small at 3 m with a 0.9 rad
  field of view, and the obstacles are small until close.

- 2026-10-27 · round 2 · Reported by the human: after «Run again» the canvas was black while the
  HUD ran (91 m, 1 impact). Reproduced in the app's browser on a real GPU — on any load, not only
  after «Run again» — and never in headless shots. Cause: Reactylon's `<Engine>` chose WebGPU, and
  React's double mount in development crossed two WebGPU devices («TextureView … associated with
  BabylonWebGPUDevice1, cannot be used with BabylonWebGPUDevice0»), so every frame was rejected.
  Fix: `<Engine forceWebGL>` here and in the catalogue's stage; the board-hole plugin is GLSL only
  anyway. Prompt 5: new gate `check-webgl`, trap in AGENTS.md. After the fix the app's browser
  renders lane-02 with the HUD (1 shot).

- 2026-10-27 · round 3 · The human decided a 300 m lane and a 40 s run; criterion 2 was rewritten
  (38–42 s) and re-locked on the human's authorization. `START_SPEED_MPS` 6 → 3.7 m/s keeps 12 m/s at
  the pins, which the deck tests, the impacts criterion and the rumble bands all assume. The
  «stay» test now measures 40.0 s; a test that sampled 469.9 m moved to 269.9 m. Shots: the 250 m
  criterion passes (5/5 centre pixels against the fog). The browser campaign: every run rolls
  40.0–41.2 s ([record](../records/pilot-vs-blind-300m-20261027.md)).
- 2026-10-27 · round 5 · Rule 3: `ACCEL_MPS2` 1.5 → 0.5 m/s², above the 0.38 m/s² a clean run
  asks of it at 12 m/s, so a clean run is unchanged (the «stay» test still measures 40.0 s) while a
  ball slowed by an impact recovers over ≈ 10 s. Rule 5: `JUMP_APEX_M` = 0.5 m × `PROP_SCALE`, so
  the jump clears the twice-life-size shoes (0.24 m) and sweep bar (≈ 0.61 m). The scene draws the
  alley around the lane (`views/alley-view.ts`, `views/segment-window.ts`). Unit tests green;
  shots at 0, 140, 250 and 295 m show the ball, the obstacles, the alley and the deck.
- 2026-10-28 · round 6 · The human asked for a 200 m lane and a natural run: «acceleration in the
  throw, deceleration as the ball rolls», and chose the «slow» profile. Rule 3 rewritten: a 0.8 s
  eased throw from rest to 10 m/s, then a drag of `ROLL_DRAG_PER_M` per metre (dv/dz = −k·v, k
  derived so a clean ball reaches 6 m/s at the hand-over), stopping at 3 m/s. A first try lost a
  fixed m/s per metre: a ball slowed by three impacts crawled at the floor and a beginner's run
  lasted 56 s, so the drag became proportional to speed. `?at=` now starts with the clean run's
  speed and clock (`cleanRunTimeTo`), so returning balls stand where a clean run meets them.
  Criteria 2 and 3 rewritten (24–27 s; shot at 150 m) and re-locked on the human's authorization.
  Unit tests: speed ≤ target at every step (the throw is clamped to the target where the step
  ends: a discrete throw overshot by 1 mm/s); target never increasing; the throw reaches 10 m/s in
  0.8 s and a clean run ends at 6.0 m/s; a slowed ball stops slowing at 3 m/s; «stay» rolls 25.9 s.
  Shots at 3, 150 and 195 m.
- 2026-10-28 · round 7 · The human asked for an entrance that simulates the bowler's throw, and
  for a beginner's run as long as a perfect one. Rule 3: the throw is now the arm's swing during the
  countdown (`config/throw.ts`, `scene/views/swing.ts`, pure and tested): held in front 0.3 s, a
  0.6 s backswing to ≈ 88°, a 0.6 s forward swing easing in as u³; the backswing angle is derived
  so the ball leaves the hand at 10 m/s, and `rolling` starts at that speed (the 0.8 s ramp from
  rest is gone). A slowed ball recovers to the target at 1.5 m/s². Unit tests: rolling starts at
  10 m/s and ends at 6.0 m/s; a ball 1.5 m/s under the target regains 0.75 m/s in 0.5 s and sits on
  the target after 2 s; «stay» rolls 25.8 s; the swing lays the ball on the foul line at 10 m/s.
  A 3 s recording shows the ball held, swung up towards the camera, brought down to the line and
  rolled away. Criterion 2's explanation in parentheses still names the old 0.8 s throw; its
  24–27 s range holds — written in «To judge», not edited.
- 2026-10-28 · round 8 · Reported by the human on Chrome: the HUD and countdown ran over a plain
  purple screen. Not reproduced in a fresh Chrome on the same Mac's GPU; the dev server's log showed
  it had re-bundled Babylon («new dependencies optimized: …dynamicTexture … reloading») under the
  open page, which then mixed two copies of Babylon, so the mount's `camera instanceof FreeCamera`
  was false and the camera was silently never placed — only the haze showed. The mount now throws
  «the game camera is missing» at once instead of drawing nothing; the trap is in AGENTS.md. The dev
  server was restarted with `--force`; a headed Chrome on Metal renders lane-01, 0 console errors.

## Canonical files

- `game/src/app/` is the composition layer (no Babylon, no React): `query.ts`, `load-track.ts`
  (fetch is a port), `frame-steps.ts`, `session.ts` (owns the run state, calls the command source
  each step, publishes `GameSnapshot` to a `Store`), `store.ts`.
- `CommandSource` is the port the [autopilot](../pilot/autopilot.md) plugs into; until then the
  session uses `stayOnly`.
- The scene is `scene/mountGame.ts` plus `scene/views/` (lane, ball, obstacles) and
  `scene/camera/chase-rig.ts`; the frame loop runs in `onBeforeRenderObservable`, the ready signal
  after the first frame rendered with `scene.isReady()`.
- `?at=` starts rolling at that metre at its target speed; `?pause=1` freezes after the first
  frame; `?speedup=k` runs exactly k fixed steps per rendered frame.
- A returning ball's position is `z0 − speedMps · runS`, `runS` counting from the start of
  `rolling`.
