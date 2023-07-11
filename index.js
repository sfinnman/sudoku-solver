const Board = require('./src/classes/Board');
const { numbers, factors } = require('./src/constants/enums');
const sudoku = '850000000000130000400000095020908000581000000000000706007001800000809000000000213';
const cells = sudoku.split('').map(i => parseInt(i)).map(i => i ? i : undefined);

const printBoard = (board) => {
  const tiles = [...board.tiles];

  for (let i = 0; i < 9; i += 1) {
    const lol = [];
    for (let k = 0; k < 9; k += 1) {
      lol.push(numbers[tiles[k + i * 9].getFactors()] || '-');
    }
    console.log(lol.join(', '));
  }
};

const printDebug = (board, dn) => {
  const tiles = [...board.tiles];

  for (let i = 0; i < 9; i += 1) {
    const lol = [];
    for (let k = 0; k < 9; k += 1) {
      lol.push(numbers[tiles[k + i * 9].getFactors() & factors[dn]] || '-');
    }
    console.log(lol.join(', '));
  }
};
const board = new Board();

const solve = async (initialBoard) => {
  const read = require("readline").createInterface({
      input: process.stdin,
      output: process.stdout
  });

  let solves = board.applyInitialState(initialBoard);
  while (solves.length) {
    console.log();
    printBoard(board);
    console.log();
    console.log('Solves to be applied', solves.length);
    const response = await new Promise(resolve => read.question('Continue?', resolve));
    if (response !== 'y') { break; }

    const { tiles, groups, intersections } = board.applySolves(solves);

    solves = [];
    tiles.forEach(tile => solves.push(...board.computeSolves(tile)));
    groups.forEach(group => solves.push(...board.computeGroupSolves(group)));
    intersections.forEach(intersection => solves.push(...board.computeGroupIntersectSolves(intersection)));
  }

  const completed = board.tiles.every(tile => tile.solved());

  if (!completed) {
    console.log('Could not complete, saving board shadow state to file');
    const fs = require('fs');

    fs.writeFileSync('./incomplete.txt', board.tiles.map(tile => tile.getFactors()).join(','));
  } else {
    console.log('Complete:')
    console.log()
    printBoard(board);
  }
};

solve(cells);

// printDebug(board, 2);
// printDebug(board, 2);
