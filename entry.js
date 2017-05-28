import React from 'react';
import { render } from 'react-dom';
import App from './app.jsx';

document.addEventListener('DOMContentLoaded', () => {
  render(<App height={27} width={27} />, document.getElementById('snake'));
});
