const enums = require('../constants/enums');
const { countSetBits } = require('../utils/bitwise');

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

module.exports = Tile;
