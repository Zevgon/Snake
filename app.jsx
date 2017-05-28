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
    this.direction = 'n';
    document.addEventListener('keydown', e => {
      const dir = DIRECTION_MAP[e.which];
      if (this.validDirection(dir)) {
        this.direction = dir;
      }
    });
    this.state = {
      height: this.props.height,
      width: this.props.width,
    }
    this.queue = [[this.props.height - 1, parseInt(this.props.width / 2, 10)]];
    this.set = new Set([this.queue[0].toString()]);
    this.allPositions = this.getAllPositions.bind(this)();
    this.target = this.getTarget();

    this.createGrid = this.createGrid.bind(this);
    this.createRow = this.createRow.bind(this);
    this.move = this.move.bind(this);
    this.validPos = this.validPos.bind(this);
    this.getTarget = this.getTarget.bind(this);
  }

  componentDidMount() {
    this.interval = setInterval(this.move, 200);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
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

  getTarget() {
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

  move() {
    const head = this.queue[this.queue.length - 1];
    const tail = this.queue.shift();
    if (!this.set.delete(tail.toString())) {
      throw 'oops! set does not match queue';
    }
    const newHead = this.getNewPos(head);
    if (!this.validPos(newHead)) {
      clearInterval(this.interval);
      alert('Game over');
    }
    this.queue.push(newHead);
    this.set.add(newHead.toString());
    this.forceUpdate();
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

  render() {
    return(
      <div className="grid">
        {this.createGrid()}
      </div>
    );
  }
}
