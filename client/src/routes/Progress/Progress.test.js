import React from 'react';
import ReactDOM from 'react-dom';
import Progress from './Progress';

it('should mount', () => {
  const div = document.createElement('div');
  ReactDOM.render(<Progress />, div);
  ReactDOM.unmountComponentAtNode(div);
});