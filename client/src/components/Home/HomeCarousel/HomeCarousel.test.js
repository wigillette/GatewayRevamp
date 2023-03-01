import React from 'react';
import ReactDOM from 'react-dom';
import HomeCarousel from './HomeCarousel';

it('It should mount', () => {
  const div = document.createElement('div');
  ReactDOM.render(<HomeCarousel />, div);
  ReactDOM.unmountComponentAtNode(div);
});