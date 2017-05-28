import React from 'react';
import { render } from 'react-dom';
import App from './app.jsx';

document.addEventListener('DOMContentLoaded', () => {
  render(<App height={21} width={21} />, document.getElementById('snake'));
});
