const sudokuContainer = document.getElementById('sudokuViewContainer');

const bodies = Array(3).fill().map(() => document.createElement('tbody'));
const rows = Array(9).fill().map(() => document.createElement('tr'));
const cells = Array(81).fill().map(() => {
  const element = document.createElement('td');

  element.classList = 'sudokuCellContainer';
  return element;
});

const colGroups = Array(3).fill().map(() => document.createElement('colgroup'));
const cols = Array(9).fill().map(() => document.createElement('col'));

cols.forEach((c, i) => colGroups[Math.floor(i / 3)].appendChild(c));
colGroups.forEach((cg) => sudokuContainer.appendChild(cg));


cells.forEach((c, i) => rows[Math.floor(i / 9)].appendChild(c));
rows.forEach((r, i) => bodies[Math.floor(i / 3)].appendChild(r));
bodies.forEach((b) => sudokuContainer.appendChild(b));

cells.forEach(c => {
  const unsolvedContainer = document.createElement('div');
  unsolvedContainer.classList = 'sudokuShadowContainer';

  c.numbers = {};
  Array(9).fill().map((_, i) => {
    const numberHolder = document.createElement('div');
    numberHolder.classList = 'sudokuShadowCell';
    numberHolder.textContent = i + 1;

    c.numbers[i] = numberHolder;
    unsolvedContainer.appendChild(numberHolder);
  });

  c.appendChild(unsolvedContainer);

  const solvedContainer = document.createElement('div');
  solvedContainer.classList = 'sudokuCell';
  c.appendChild(solvedContainer);

  c.solved = (factor) => {
    c.classList = 'sudokuCellContainer solved';
    solvedContainer.textContent = numbers[factor];
  };

  c.unsolved = (factor) => {
    c.classList = 'sudokuCellContainer';
    for (let i = 0; i < 9; i++) {
      if (factor & 1 << i) {
        c.numbers[i].classList = 'sudokuShadowCell';
      } else {
        c.numbers[i].classList = 'sudokuShadowCell hide';
      }
    }
  };
});

const button = document.createElement('button');
button.textContent = 'Next';
const body = document.getElementsByTagName('body')[0];

body.appendChild(button);

const board = new Board();
let modified = board.applySolves(board.applyInitialState(
  ('100000000000007005080903420002040800810020000007000056650000000003000090000000704')
    .split('')
    .map(i => parseInt(i))
    .map(i => i ? i : undefined),
));

const syncBoard = () => {
  board.tiles.forEach((t, i) => {
    if (t.solved()) {
      cells[i].solved(t.getFactors());
    } else {
      cells[i].unsolved(t.getFactors());
    }
  })
};
syncBoard();

const cycle = (cycleState) => {
  const solves = [];

  cycleState.tiles.forEach(tile => solves.push(...board.computeSolves(tile)));
  cycleState.groups.forEach(group => solves.push(...board.computeGroupSolves(group)));
  cycleState.intersections.forEach(intersection => solves.push(...board.computeGroupIntersectSolves(intersection)));

  return board.applySolves(solves);
};

button.addEventListener('click', () => {
  modified = cycle(modified);
  console.log(modified);
  syncBoard();
});
