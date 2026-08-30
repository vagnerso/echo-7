import { describe, expect, it } from 'vitest';

import type { Region } from './region';
import {
  getHazardTiles,
  getRegionObstacles,
  getRegionSize,
} from './worldLoader';

function fixtureRegion(): Region {
  return {
    id: 'test-region',
    name: 'Test Region',
    tileSize: 10,
    tiles: [
      ['wall', 'wall', 'wall'],
      ['wall', 'floor', 'wall'],
      ['wall', 'wall', 'wall'],
    ],
    objects: [],
  };
}

describe('getRegionObstacles', () => {
  it('gera um AABB para cada tile de parede, posicionado pela linha e coluna', () => {
    const obstacles = getRegionObstacles(fixtureRegion());

    // 8 paredes (todas menos o tile central de floor)
    expect(obstacles).toHaveLength(8);
    expect(obstacles).toContainEqual({ x: 0, y: 0, width: 10, height: 10 });
    expect(obstacles).toContainEqual({ x: 20, y: 0, width: 10, height: 10 });
    expect(obstacles).toContainEqual({ x: 0, y: 20, width: 10, height: 10 });
  });

  it('nao gera obstaculo para tiles de floor', () => {
    const obstacles = getRegionObstacles(fixtureRegion());

    const centerTile = obstacles.find((o) => o.x === 10 && o.y === 10);
    expect(centerTile).toBeUndefined();
  });

  it('retorna lista vazia para uma regiao sem paredes', () => {
    const region: Region = {
      id: 'empty',
      name: 'Empty',
      tileSize: 10,
      tiles: [['floor', 'floor']],
      objects: [],
    };

    expect(getRegionObstacles(region)).toEqual([]);
  });
});

describe('getHazardTiles', () => {
  it('gera um AABB para cada tile de hazard, ignorando parede e floor', () => {
    const region: Region = {
      id: 'test-region',
      name: 'Test Region',
      tileSize: 10,
      tiles: [
        ['wall', 'hazard', 'floor'],
        ['floor', 'hazard', 'wall'],
      ],
      objects: [],
    };

    const hazards = getHazardTiles(region);

    expect(hazards).toHaveLength(2);
    expect(hazards).toContainEqual({ x: 10, y: 0, width: 10, height: 10 });
    expect(hazards).toContainEqual({ x: 10, y: 10, width: 10, height: 10 });
  });
});

describe('getRegionSize', () => {
  it('calcula o tamanho total em pixels a partir do grid e do tileSize', () => {
    expect(getRegionSize(fixtureRegion())).toEqual({ width: 30, height: 30 });
  });

  it('retorna tamanho zero para uma regiao sem tiles', () => {
    const region: Region = {
      id: 'empty',
      name: 'Empty',
      tileSize: 10,
      tiles: [],
      objects: [],
    };

    expect(getRegionSize(region)).toEqual({ width: 0, height: 0 });
  });
});
