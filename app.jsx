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
    value: '120',
  },
  {
    name: 'Medium',
    value: '180',
  },
  {
    name: 'Hard',
    value: '250',
  },
  {
    name: 'Insane',
    value: '350',
  },
]

const TARGET_TYPES = [
  {
    probability: 20,
    segments: 4,
    class: 'four-point',
  },
  {
    probability: 10,
    segments: 3,
    class: 'three-point',
  },
  {
    probability: 5,
    segments: 2,
    class: 'two-point',
  },
  {
    probability: 1,
    segments: 1,
    class: 'one-point',
  }
]

const Row = ({i, set, width, target}) => {
  let row = [];
  for (let j = 0; j < width; j++) {
    if (set.has([i, j].toString())) {
      row.push((<div className="snake box"></div>));
    } else if ([i, j].toString() === target.pos.toString()) {
      row.push((<div className={`${target.class} box`}></div>));
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
    const highScore = localStorage.getItem('high score');
    if (highScore) {
      this.highScore = highScore;
    } else {
      localStorage.setItem('high score', 0);
      this.highScore = 0;
    }
    this.score = 0;
    this.segmentsToAdd = 0;
    if (firstTime) {
      this.state = {
        height: this.props.height,
        width: this.props.width,
        difficulty: '150',
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

  getNewTargetType() {
    const randNum = parseInt(Math.random() * 10000);
    let ret;
    for (let i in TARGET_TYPES) {
      const type = TARGET_TYPES[i];
      if (randNum % type.probability === 0) {
        ret = type;
        break;
      }
    }
    if (ret) {
      return ret;
    } else {
      throw 'oops! Something went wrong when getting new target type';
    }
  }

  getNewTarget() {
    const validPoses = this.getValidPoses();
    const randIdx = parseInt(Math.random() * validPoses.length);
    const type = this.getNewTargetType();
    let target = {};
    target.pos = validPoses[randIdx];
    target.segments = type.segments;
    target.class = type.class;
    return target;
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
    if (head.toString() === this.target.pos.toString()) {
      this.segmentsToAdd += this.target.segments;
      this.score += this.difficultyToScore() * this.target.segments;
      this.target = this.getNewTarget();
      if (this.score > this.highScore) {
        this.highScore = this.score;
      }
    }

    this.segmentsToAdd -= 1;
    if (this.segmentsToAdd < 0) {
      this.segmentsToAdd = 0;
      const tail = this.queue.shift();
      if (!this.set.delete(tail.toString())) {
        throw 'oops! set does not match queue';
      }
    }

    const newHead = this.getNewPos(head);
    if (!this.validPos(newHead)) {
      clearInterval(this.interval);
      this.interval = null;
      let message;
      if (this.score > parseInt(localStorage.getItem('high score'))) {
        message = `Congratulations! You just got a new high score of ${this.score}`;
        localStorage.setItem('high score', this.score);
      } else {
        message = 'Game over';
      }
      this.forceUpdate();
      alert(message);
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
        <div className="game-area">
          <div className="grid">
            {this.createGrid()}
            <button id="start" onClick={e => this.handleStart(e)}>Start</button>
          </div>
          <div className="progress-container">
            <div className="score">Length: {this.queue.length}</div>
            <div className="score">Score: {this.score}</div>
          </div>
        </div>
        <div className="sidebar">
          <div className="select-difficulty">Select Difficulty:
            {this.getDifficultyButtons()}
            <div className="custom-difficulty-container">
              <div className="custom-difficulty">Custom Difficulty:</div>
              <input
                id="difficulty"
                type="number"
                onChange={this.handleDifficultyChange}
                value={this.state.difficulty}
                >
              </input>
            </div>
          </div>
          <div className="high-score-container">High Score:
            <div className="high-score">{this.highScore}</div>
          </div>
        </div>
      </div>
    );
  }
}
