import React from 'react';
import ReactDOM from 'react-dom';
import Planner from './Planner';

it('It should mount', () => {
  const div = document.createElement('div');
  ReactDOM.render(<Planner />, div);
  ReactDOM.unmountComponentAtNode(div);
});