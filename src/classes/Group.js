/** @class @template T @extends Array<T> */
class Group extends Array {
  static get [Symbol.species]() {
    return Array;
  }

  constructor(...args) {
    super(...args);
    this.set = new Set(this);
  }
}

module.exports = Group;
