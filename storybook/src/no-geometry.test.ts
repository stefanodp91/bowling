// wiki/storybook/catalog.md, criterion 3: geometry comes only from @models.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/** Babylon calls that build geometry. A story or the stage must never contain one. */
const MESH_CONSTRUCTION = /\b(MeshBuilder|VertexData|Create(Box|Sphere|Ground|Cylinder|Plane|Disc|Torus|Tube|Lathe|Ribbon|Polygon|Capsule|Lines|TiledGround)\w*)\s*\(|new\s+Mesh\s*\(/;

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.(ts|tsx)$/.test(entry) && !entry.endsWith('.test.ts') ? [path] : [];
  });
}

describe('storybook/src', () => {
  it('contains no Babylon mesh construction call', () => {
    const root = new URL('.', import.meta.url).pathname;
    const offenders = sourceFiles(root).filter((file) => MESH_CONSTRUCTION.test(readFileSync(file, 'utf8')));
    expect(offenders).toEqual([]);
  });

  it('the pattern catches a construction call', () => {
    expect(MESH_CONSTRUCTION.test("const b = CreateBox('x', {}, scene);")).toBe(true);
    expect(MESH_CONSTRUCTION.test('MeshBuilder.CreateSphere(')).toBe(true);
  });
});
