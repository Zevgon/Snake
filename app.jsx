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

const Row = ({i, snakeSet, width}) => {
  let row = [];
  for (let j = 0; j < width; j++) {
    if (snakeSet.has([i, j].toString())) {
      row.push((<div className="snake box"></div>));
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
      if (this.validDirection(DIRECTION_MAP[e.which])) {
        this.direction = DIRECTION_MAP[e.which];
      }
    });
    this.state = {
      curPos: [this.props.height, parseInt(this.props.width / 2, 10)],
      height: this.props.height,
      width: this.props.width,
    }
    this.state['snakeQueue'] = [this.state.curPos];
    this.state['snakeSet'] = new Set(this.state.snakeQueue.toString());
    this.createGrid = this.createGrid.bind(this);
    this.createRow = this.createRow.bind(this);
  }

  validDirection(newDir) {
    return VALID_CHANGES[this.direction].includes(newDir);
  }

  createRow(i) {
    return (
      <Row i={i} snakeSet={this.state.snakeSet} width={this.state.width} />
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
