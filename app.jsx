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

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.direction = 'n';
    document.addEventListener('keydown', e => {
      if (this.validDirection(DIRECTION_MAP[e.which])) {
        this.direction = DIRECTION_MAP[e.which];
      }
    });
    this.curPos = (this.props.height, parseInt(this.props.width / 2, 10));
    this.snakeCoords = [];
  }

  validDirection(newDir) {
    return VALID_CHANGES[this.direction].includes(newDir);
  }

  render() {
    return(
      <div className='testing'>HI!</div>
    );
  }
}
