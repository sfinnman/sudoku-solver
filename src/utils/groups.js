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

module.exports = {
  groups,
  take,
};
