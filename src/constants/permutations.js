const { toNumberArray } = require('../utils/bitwise');

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

module.exports = {
  permutations,
  getPermutationsIterator,
};
