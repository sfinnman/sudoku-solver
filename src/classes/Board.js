const Tile = require('./Tile');
const Group = require('./Group');
const { countSetBits } = require('../utils/bitwise');
const { take, groups } = require('../utils/groups');
const { factors } = require('../constants/enums');
const permutations = require('../constants/permutations');

class Board {
  constructor(tiles = new Array(81).fill()) {
    this.tiles = tiles.map((value) => value ? new Tile(1 << (value - 1)) : new Tile());

    this.tileToIndex = new Map();
    this.tiles.forEach((tile, index) => this.tileToIndex.set(tile, index));

    const takeTiles = (indices) => new Group(...take(this.tiles, indices));
    this.groups = Object.values(groups).reduce((acc, curr) => acc.concat(curr)).map(takeTiles);

    /** @type {Map<Tile, Group<Tile>[]>} */
    this.tileToGroups = new Map();
    this.tiles.forEach((tile) => this.tileToGroups.set(tile, this.groups.filter(group => group.set.has(tile))));

    this.groupIntersections = this.groups.map((group) => {
      const intersections = group
        .map(tile => this.tileToGroups.get(tile).filter(intersection => intersection !== group))
        .reduce((acc, curr) => acc.concat(curr));
      
      return [...new Set(intersections)].map(intersection => [group, intersection]);
    }).map(intersections => intersections.filter(
      ([g1, g2]) => g1.filter(tile => g2.set.has(tile)).length > 1,
    )).reduce((acc, curr) => acc.concat(curr));
  }

  /**
   * 
   * @param {number[]} board
   */
  applyInitialState(board) {
    const solves = [];

    this.tiles.forEach(tile => tile.reset());
    board.forEach((value, tileIndex) => {
      if (value) {
        const tile = this.tiles[tileIndex];
        tile.setFactors(1 << (value - 1));
        solves.push(
          ...this.tileToGroups
          .get(tile)
          .map(group => ({ type: 'reduction', factors: tile.factors, contributors: [tile], group }))
        );
      }
    });

    return solves;
  }

  /**
   * @param {Tile} tile 
   */
  computeSolves(tile) {
    if (tile.solved() && this.tileToIndex.get(tile)) {
      return this.tileToGroups
        .get(tile)
        .map(group => ({ type: 'reduction', factors: tile.factors, contributors: [tile], group }))
        .filter(({ factors, contributors, group }) => !group.every(tile => contributors.includes(tile) || tile.none(factors)));
    }
    if (tile.unsolveable()) {
      return [{ type: 'impossible', factors: 0, contributors: [tile], group: [tile] }];
    }
    return [];
  }

  /**
   * @param {Array<Tile>} group
   */
  computeGroupSolves(group) {
    const unsolvedTiles = group.filter(tile => !tile.solved());
    const totalLength = unsolvedTiles.length;

    const solves = [];
    for (const permutation of permutations.getPermutationsIterator(totalLength)) {
      const currLength = permutation.length;
      if (currLength === 0 || currLength === totalLength) continue;

      const factors = permutation.reduce((acc, curr) => acc | unsolvedTiles[curr].factors, 0);
      const setBits = countSetBits(factors);

      if (setBits < currLength) {
        solves.push({ type: 'impossible', factors, contributors: permutation.map(i => unsolvedTiles[i]), group });
      } else if (setBits === currLength) {
        solves.push({ type: 'reduction', factors, contributors: permutation.map(i => unsolvedTiles[i]), group });
      }
    }

    return solves
      .filter(({ factors, contributors, group }) => !group.every(tile => contributors.includes(tile) || tile.none(factors)));
  }

  /**
  * @param {[Group<Tile>, Group<Tile>]} intersection
  */
  computeGroupIntersectSolves([source, target]) {
    return Object.values(factors).reduce((acc, factor) => {
      const solution = source.filter(tile => tile.all(factor));

      if (solution.every(tile => target.set.has(tile))) {
        acc.push({ type: 'reduction', factors: factor, contributors: solution, group: target });
      }
      return acc;
    }, []).filter(({ factors, contributors, group }) => !group.every(tile => contributors.includes(tile) || tile.none(factors)));
  }

  applySolves(solves) {
    const affectedTiles = new Set();

    for (const solve of solves) {
      switch (solve.type) {
        case 'reduction': {
          solve.group
            .filter(tile => !solve.contributors.includes(tile))
            .forEach(tile => {
              const change = tile.unmark(solve.factors);
              if (change) { affectedTiles.add(tile); }
            });
          break;
        }
        case 'impossible': {
          console.error('Impossible solve', solve);
          throw new Error();
        }
        default: {}
      }
    }

    const result = {};
    result.tiles = [...affectedTiles];
    result.groups = this.groups.filter(group => result.tiles.some(tile => group.set.has(tile)));
    result.intersections = this.groupIntersections.filter(([group1, group2]) => result.groups.includes(group1) || result.groups.includes(group2));

    return result;
  }
}

module.exports = Board;
