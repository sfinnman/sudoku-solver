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

module.exports = {
  factors,
  numbers,
  allFactor,
  noneFactor,
};
