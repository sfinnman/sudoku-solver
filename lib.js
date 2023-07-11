const bitArray = [...Array(31)].map((_, i) => i);

const countSetBits = (factor) => {
  let count, value = factor;

  for (count = 0; value !== 0; count += 1) {
    value &= value - 1;
  }
  
  return count;
}

const toNumberArray = (factor) => {
  return bitArray.filter(i => factor & (1 << i));
};
const SIDE_SQRT = 3;
const SIDE = SIDE_SQRT ** 2;

const generateRowIndices = function* (row) {
  for (let i = row * SIDE; i < (row + 1) * SIDE; i += 1) {
    yield i;
  }
}

const generateColIndices = function* (col) {
  for (let i = col; i < SIDE * SIDE; i += SIDE) {
    yield i;
  }
}

const generateBoxIndices = function* (box) {
  const xBasis = (box % SIDE_SQRT);
  const xStart = xBasis * SIDE_SQRT;
  const xEnd = xStart + SIDE_SQRT;

  const yBasis = Math.floor(box / SIDE_SQRT);
  const yStart = yBasis * SIDE_SQRT;
  const yEnd = yStart + SIDE_SQRT;

  for (let y = yStart; y < yEnd; y += 1) {
    for (let x = xStart; x < xEnd; x += 1) {
      yield x + y * SIDE;
    }
  }
}

const BASE = new Array(SIDE).fill().map((_, i) => i);

const groups = {
  rows: BASE.map(v => [...generateRowIndices(v)]),
  cols: BASE.map(v => [...generateColIndices(v)]),
  boxs: BASE.map(v => [...generateBoxIndices(v)]),
};

/**
 * @template T
 * @param {T[]} set 
 * @param {number[]} subsetIndices
 * @returns {T[]}
 */
const take = (set, subsetIndices) => {
  const subsetIndexSet = new Set(subsetIndices)
  return set.filter((_, i) => subsetIndexSet.has(i));
};

/**
 * @param {number} depth
 * @returns {number[]}
 */
const computePermutations = (depth) => {
  return Array.from({ length: 1 << depth }, (_, i) => toNumberArray(i));
};

const permutations = computePermutations(9);

const getPermutationsIterator = function* (depth) {
  const maxDepth = 1 << depth;
  for (let i = 0; i < maxDepth; i += 1) {
    yield permutations[i];
  }
};

const factors = {
  1: 0b1,
  2: 0b10,
  3: 0b100,
  4: 0b1000,
  5: 0b10000,
  6: 0b100000,
  7: 0b1000000,
  8: 0b10000000,
  9: 0b100000000,
};

const numbers = {
  0b1: 1,
  0b10: 2,
  0b100: 3,
  0b1000: 4,
  0b10000: 5,
  0b100000: 6,
  0b1000000: 7,
  0b10000000: 8,
  0b100000000: 9,
};

const allFactor = 0b111111111;
const noneFactor = 0b0;

const enums = {
  factors,
  numbers,
  allFactor,
  noneFactor,
};

class Tile {
  constructor(factors = enums.allFactor) {
    this.factors = factors;
  }
  unmark(factors) {
    const before = this.factors;
    this.factors &= ~factors;
    return before ^ this.factors;
  }
  mark(factors) {
    const before = this.factors;
    this.factors |= factors;
    return before ^ this.factors;
  }

  reset() {
    const before = this.factors;
    this.factors = enums.allFactor;
    return before ^ this.factors;
  }
  resetImpossible() {
    const before = this.factors;
    this.factors = enums.noneFactor;
    return before ^ this.factors;
  }

  solved() {
    return countSetBits(this.factors) === 1;
  }

  unsolveable() {
    return countSetBits(this.factors) === 0;
  }

  none(factors) {
    return (this.factors & factors) === 0;
  }

  any(factors) {
    return (this.factors & factors) !== 0;
  }

  all(factors) {
    return (this.factors & factors) === factors;
  }

  setFactors(factors) {
    const before = this.factors;
    this.factors = factors;
    return before ^ this.factors;
  }

  getFactors() {
    return this.factors;
  }

  getNotFactors() {
    return (~this.factors & enums.allFactor);
  }
}

class Group extends Array {
  static get [Symbol.species]() {
    return Array;
  }

  constructor(...args) {
    super(...args);
    this.set = new Set(this);
  }
}

class Board {
  constructor(tiles = new Array(81).fill()) {
    this.tiles = tiles.map((value) => value ? new Tile(1 << (value - 1)) : new Tile());

    this.tileToIndex = new Map();
    this.tiles.forEach((tile, index) => this.tileToIndex.set(tile, index));

    const takeTiles = (indices) => new Group(...take(this.tiles, indices));
    this.groups = Object.values(groups).reduce((acc, curr) => acc.concat(curr)).map(takeTiles);

    /** @type {Map<Tile, Group[]>} */
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
        .map(group => ({ type: 'reduction', factors: tile.factors, contributors: [tile], group }));
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
    for (const permutation of getPermutationsIterator(totalLength)) {
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

    return solves;
  }

  /**
  * @param {[Group, Group]} intersection
  */
  computeGroupIntersectSolves([source, target]) {
    return Object.values(factors).reduce((acc, factor) => {
      const solution = source.filter(tile => tile.all(factor));

      if (solution.every(tile => target.set.has(tile))) {
        acc.push({ type: 'reduction', factors: factor, contributors: solution, group: target });
      }
      return acc;
    }, []);
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

window.Board = Board;
window.numbers = numbers;
window.factors = factors;
