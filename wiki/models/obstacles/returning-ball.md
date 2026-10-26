---
title: Returning ball — a house ball rolling back up the lane
type: spec
status: planned
depends_on: [models/ball.md]
canonical: []
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

_Filled by the agent (prompt 1, step 2)._

## Rounds

_Filled by the agent (prompt 1, step 5)._
