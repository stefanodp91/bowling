---
title: Model conventions — what every model factory obeys
type: concept
verified: 2026-10-27
---

# Model conventions

> Boundary: the contract shared by every model in `models/`. NOT covered: each model's shape and
> measures (its own page), how the catalogue shows it ([catalogue](../storybook/catalog.md)).

## Measures are one source, and pure

Physical measures (ball diameter, pin height, lane width, obstacle footprints and heights) are
needed by the meshes **and** by the game logic (collisions, scoring). They live in
`models/src/measures/`, one file per model, as documented `as const` values in metres and
kilograms, each with its origin (a regulation, a reference link, a design decision). These files
import nothing: `check-boundaries` allows `game/src/domain/` and `game/src/pilot/` to import them,
and only them, from `@models`.

## Props are twice life size

The ball, the pins, the obstacles and the pin deck are built at `PROP_SCALE` (2) times their
regulation size, while the lane — boards, gutters, markings, its 200 m — stays at regulation size (a
human's decision of 2026-10-27: at true size the props looked tiny on a three-lane, 300 m lane seen
from the chase camera). `models/src/measures/scale.ts` holds the factor. Each measures file keeps
the regulation number with its source and exports the in-game measure, regulation × `PROP_SCALE`;
masses grow with the volume, × `PROP_SCALE`³, so densities and the ball-to-pin mass ratio stay
real. Every length inside a prop's model that is not a measure (a lace, a stripe, a rim) grows by
the same factor, so a prop looks exactly like its regulation self, only bigger.

## The factory contract

```ts
export interface ModelHandle {
  /** Parent of every mesh of the model; origin at the model's ground contact point, +z forward. */
  readonly root: TransformNode;
  /** Per-frame animation, if the model has one; pure function of elapsed seconds. */
  readonly animate?: (elapsedS: number) => void;
  /** Releases meshes, materials and textures the factory created. */
  dispose(): void;
}

export type ModelFactory<Options> = (scene: Scene, options: Options) => ModelHandle;
```

- Units are metres; `y` is up; the lane surface is `y = 0`.
- Geometry is built from code (Babylon builders, lathe, extrusion, `VertexData`). Textures, when
  needed, are generated procedurally at runtime (`DynamicTexture`, noise from a seeded source).
  Nothing is downloaded or committed as a binary.
- Materials are PBR, created once per scene and shared between instances (a per-scene material cache
  in the model module, disposed with the scene).
- A model that appears many times (lane segments, pins) exposes a way to instance it, not to clone
  it.
- Every factory has a story `models-<name>` in the catalogue, which is where it is judged.

## How a model is judged (prompt 1, step 5)

At least three shots: the catalogue's default pose, a close-up (`--angle close`), and the model in
the game at the distance the player sees it (`game:` target, once the game pages are built). The
page's «Rounds» entry says what each shot showed, compared with the references.
