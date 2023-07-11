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

module.exports = {
  countSetBits,
  toNumberArray,
};
