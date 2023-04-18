import React from 'react';
import ReactDOM from 'react-dom';
import Semester from './Semester';

it('should mount', () => {
  const div = document.createElement('div');
  ReactDOM.render(<Semester />, div);
  ReactDOM.unmountComponentAtNode(div);
});