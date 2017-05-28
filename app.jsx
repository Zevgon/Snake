import React from 'react';

const DIRECTION_MAP = {
  37: 'w',
  38: 'n',
  39: 'e',
  40: 's',
}

const VALID_CHANGES = {
  'n': ['w', 'e'],
  's': ['w', 'e'],
  'w': ['n', 's'],
  'e': ['n', 's'],
}

const DIFFICULTIES = [
  {
    name: 'Easy',
    value: 80
  },
  {
    name: 'Medium',
    value: '120',
  },
  {
    name: 'Hard',
    value: '200',
  },
  {
    name: 'Insane',
    value: '300',
  },
]

const Row = ({i, set, width, target}) => {
  let row = [];
  for (let j = 0; j < width; j++) {
    if (set.has([i, j].toString())) {
      row.push((<div className="snake box"></div>));
    } else if ([i, j].toString() === target.toString()) {
      row.push((<div className="target box"></div>));
    } else {
      row.push((<div className="empty box"></div>));
    }
  }
  return (
    <div className="row">
      {row}
    </div>
  );
};

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.setUp = this.setUp.bind(this);
    this.setUp(true);

    this.createGrid = this.createGrid.bind(this);
    this.createRow = this.createRow.bind(this);
    this.move = this.move.bind(this);
    this.validPos = this.validPos.bind(this);
    this.getNewTarget = this.getNewTarget.bind(this);
    this.handleStart = this.handleStart.bind(this);
    this.getSpeed = this.getSpeed.bind(this);
    this.handleDifficultyChange = this.handleDifficultyChange.bind(this);
    this.startMoving = this.startMoving.bind(this);
    this.changeDifficulty = this.changeDifficulty.bind(this);
    this.difficultyToScore = this.difficultyToScore.bind(this);
  }

  setUp(firstTime) {
    this.direction = 'n';
    document.addEventListener('keydown', e => {
      const dir = DIRECTION_MAP[e.which];
      if (this.validDirection(dir)) {
        e.preventDefault();
        this.direction = dir;
      }
    });
    this.queue = [[this.props.height - 1, parseInt(this.props.width / 2, 10)]];
    this.set = new Set([this.queue[0].toString()]);
    this.score = 0;
    if (firstTime) {
      this.state = {
        height: this.props.height,
        width: this.props.width,
        difficulty: '100',
      }
    } else {
      this.setState({
        height: this.props.height,
        width: this.props.width,
        difficulty: this.state.difficulty,
      })
    }
    this.allPositions = this.getAllPositions.bind(this)();
    this.target = this.getNewTarget();
  }

  getSpeed() {
    if (this.state.difficulty !== '') {
      const percent = parseInt(this.state.difficulty) / 100;
      return 200 / percent;
    }
  }

  startMoving() {
    this.interval = setInterval(this.move, this.getSpeed());
  }

  handleStart(e) {
    e.preventDefault();
    e.currentTarget.style.display = 'none';
    this.startMoving();
  }

  getAllPositions() {
    let all = [];
    for (let i = 0; i < this.state.height; i++) {
      for (let j = 0; j < this.state.width; j++) {
        all.push([i, j]);
      }
    }
    return all;
  }

  getValidPoses() {
    let valids = [];
    this.allPositions.forEach(pos => {
      if (!this.set.has(pos.toString())) {
        valids.push(pos);
      }
    });
    return valids;
  }

  getNewTarget() {
    const validPoses = this.getValidPoses();
    const randIdx = parseInt(Math.random() * validPoses.length);
    return validPoses[randIdx];
  }

  getNewPos(head) {
    switch (this.direction) {
      case 'n':
        return [head[0] - 1, head[1]];
      case 's':
        return [head[0] + 1, head[1]];
      case 'e':
        return [head[0], head[1] + 1];
      case 'w':
        return [head[0], head[1] - 1];
      default:
        throw 'Invalid direction!';
    }
  }

  validPos(head) {
    if (head[0] < 0 || head[0] >= this.state.height || head[1] < 0 || head[1] >= this.state.width) {
      return false;
    }
    if (this.set.has(head.toString())) {
      return false;
    }
    return true;
  }

  difficultyToScore() {
    return parseInt(this.state.difficulty / 10);
  }

  move() {
    const head = this.queue[this.queue.length - 1];
    if (head.toString() === this.target.toString()) {
      this.target = this.getNewTarget();
      this.score += this.difficultyToScore();
    } else {
      const tail = this.queue.shift();
      if (!this.set.delete(tail.toString())) {
        throw 'oops! set does not match queue';
      }
    }
    const newHead = this.getNewPos(head);
    if (!this.validPos(newHead)) {
      clearInterval(this.interval);
      this.interval = null;
      alert('Game over');
      this.setUp(false);
      document.getElementById('start').style.display = '';
      this.forceUpdate();
    } else {
      this.queue.push(newHead);
      this.set.add(newHead.toString());
      this.forceUpdate();
    }
  }

  validDirection(newDir) {
    return VALID_CHANGES[this.direction].includes(newDir);
  }

  createRow(i) {
    return (
      <Row
        i={i}
        set={this.set}
        width={this.state.width}
        target={this.target}
      />
    );
  }

  createGrid() {
    let rows = [];
    for (let i = 0; i < this.state.height; i++) {
      rows.push(this.createRow(i))
    }
    return rows;
  }

  handleDifficultyChange(e) {
    e.preventDefault();
    this.changeDifficulty(e.target.value);
  }

  changeDifficulty(newNum) {
    const oldDifficultyInt = parseInt(this.state.difficulty);
    this.setState({difficulty: newNum}, () => {
      if (this.interval) {
        clearInterval(this.interval);
        this.interval = null;
        if (parseInt(this.state.difficulty) < oldDifficultyInt) {
          this.score *= this.state.difficulty / oldDifficultyInt;
          this.score = parseInt(this.score);
        }
        this.startMoving();
      }
    });
  }

  getDifficultyButtons() {
    return DIFFICULTIES.map(diff => (
      <button
        className="difficulty-button"
        onClick={this.handleDifficultyChange}
        value={diff.value}
      >{diff.name}</button>
    ));
  }

  render() {
    return(
      <div className="container">
        <div className="grid">
          {this.createGrid()}
          <button id="start" onClick={e => this.handleStart(e)}>Start</button>
        </div>
        <div className="sidebar">
          <div className="select-difficulty">Select Difficulty:
            {this.getDifficultyButtons()}
            <input
              id="difficulty"
              type="number"
              onChange={this.handleDifficultyChange}
              value={this.state.difficulty}
              >
            </input>
          </div>
          <div className="score-container">Score:
            <div className="score">{this.score}</div>
          </div>
        </div>
      </div>
    );
  }
}
