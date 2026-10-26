---
title: Returning ball — a house ball rolling back up the lane
type: spec
status: built
depends_on: [models/ball.md]
canonical: [models/src/obstacles/returning-ball/, models/src/measures/obstacles.ts, storybook/src/stories/obstacle-returning-ball.stories.tsx]
verified: 2026-10-26
---

# Returning ball

> Boundary: the returning-ball obstacle model and its footprint. NOT covered: the ball model
> ([ball](../ball.md)); its motion along the lane is domain logic ([impacts](../../game/impacts.md)).

## Purpose

The only obstacle that moves towards the player: the pilot must reason on when it will meet it, not
only where it is now.

## Rules

1. The [ball](../ball.md) model in its `house` variant, rolling towards the foul line in one travel
   lane at the track's `speedMps`; the run moves it, the model only spins it consistently with its
   speed.
2. Footprint: the ball's diameter, in its lane, at its current `z`.
3. Overcome by: changing lane. Not jumpable (same reason as stray pins).

## Acceptance criteria

1. [auto] Story `models-obstacle-returning-ball` shows it rolling (animated) and reaches ready.
2. [human] At game distance it is distinguishable from the player's ball at a glance (colour and
   finish).

## References

- Rolling without slipping: angular speed ω = v / r, so a ball of radius 0.109 m at 3 m/s turns
  ≈ 27.5 rad/s, about 4.4 turns per second
  (https://en.wikipedia.org/wiki/Rolling#Rolling_without_slipping).
- The [ball](../ball.md) page's references for the house ball's look.

## Rounds

- 2026-10-26 · round 1 · Built `createReturningBall` on the house ball: `animate(t)` sets the
  spin node's rotation about x to −v·t/r (rolling towards −z). 2 shots plus a frame comparison:
  the story is ready, two frames 0.7 s apart differ, no console error; the close-up shows the
  plain scuffed red ball turning. The unit test checks ω = v / r and that `animate` is a pure
  function of elapsed time. Distinguishable from the player's ball: red, plain, satin-glossy
  against blue-violet marble — the human judges it at game distance (criterion 2).

## Canonical files

- `RETURNING_BALL_FOOTPRINT` (`measures/obstacles.ts`): the ball's diameter square, height = the
  diameter, centred on the ball's current `z` in its lane.
