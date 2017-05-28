import React from 'react';
import { render } from 'react-dom';
import App from './app.jsx';

document.addEventListener('DOMContentLoaded', () => {
  render(<App height={20} width={20} />, document.getElementById('snake'));
});
